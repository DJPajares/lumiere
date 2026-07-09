"use client";

import { ApiClientError } from "@lumiere/api-client";
import {
  guestGroupMutationRequestSchema,
  type Event,
  type GuestGroup,
  type GuestGroupMutationRequest,
  type GuestGroupStatus,
} from "@lumiere/types";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useDashboardAuth } from "../../../../auth/dashboard-auth-provider";
import { EventTabs } from "../../../placeholder-panels";

type GuestWorkspaceData = {
  event: Event;
  guestGroups: GuestGroup[];
};

type GuestWorkspaceState =
  | {
      data: GuestWorkspaceData;
      error: null;
      inviteLinks: Record<string, string>;
      isRefreshing: boolean;
      status: "ready";
    }
  | {
      data: null;
      error: string | null;
      inviteLinks: Record<string, string>;
      isRefreshing: false;
      status: "error" | "loading";
    };

type FormValues = {
  contactEmail: string;
  contactName: string;
  label: string;
  maxPax: string;
  notes: string;
};

type FormErrors = Partial<Record<keyof FormValues | "_form", string>>;

type PendingAction = {
  groupId: string;
  type: "disable" | "regenerate";
} | null;

const defaultFormValues: FormValues = {
  contactEmail: "",
  contactName: "",
  label: "",
  maxPax: "2",
  notes: "",
};

const guestStatuses: GuestGroupStatus[] = [
  "pending",
  "opened",
  "responded",
  "declined",
  "disabled",
];

export function GuestManagementWorkspace({ eventId }: { eventId: string }) {
  const { apiClient } = useDashboardAuth();
  const [state, setState] = useState<GuestWorkspaceState>({
    data: null,
    error: null,
    inviteLinks: {},
    isRefreshing: false,
    status: "loading",
  });
  const [formValues, setFormValues] = useState<FormValues>(defaultFormValues);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [submitting, setSubmitting] = useState(false);
  const [busyGroupId, setBusyGroupId] = useState<string | null>(null);

  const loadGuests = useCallback(
    async ({ refreshing = false }: { refreshing?: boolean } = {}) => {
      if (!apiClient) {
        setState({
          data: null,
          error: "Dashboard API is not configured.",
          inviteLinks: {},
          isRefreshing: false,
          status: "error",
        });
        return;
      }

      setState((current) =>
        current.status === "ready" && refreshing
          ? {
              ...current,
              isRefreshing: true,
            }
          : {
              data: null,
              error: null,
              inviteLinks: current.inviteLinks,
              isRefreshing: false,
              status: "loading",
            },
      );

      try {
        const [eventResponse, guestGroupResponse] = await Promise.all([
          apiClient.getEvent(eventId),
          apiClient.listGuestGroups(eventId),
        ]);

        setState((current) => ({
          data: {
            event: eventResponse.event,
            guestGroups: guestGroupResponse.guestGroups,
          },
          error: null,
          inviteLinks: current.inviteLinks,
          isRefreshing: false,
          status: "ready",
        }));
      } catch (error) {
        setState({
          data: null,
          error: toFriendlyApiMessage(error),
          inviteLinks: {},
          isRefreshing: false,
          status: "error",
        });
      }
    },
    [apiClient, eventId],
  );

  useEffect(() => {
    void loadGuests();
  }, [loadGuests]);

  const readyState = state.status === "ready" ? state : null;
  const editingGroup = readyState?.data.guestGroups.find((group) => group.id === editingGroupId);

  const startCreate = () => {
    setEditingGroupId(null);
    setFormValues(defaultFormValues);
    setFormErrors({});
    setActionMessage(null);
  };

  const startEdit = (group: GuestGroup) => {
    setEditingGroupId(group.id);
    setFormValues({
      contactEmail: group.contactEmail ?? "",
      contactName: group.contactName ?? "",
      label: group.label,
      maxPax: String(group.maxPax),
      notes: group.notes ?? "",
    });
    setFormErrors({});
    setActionMessage(null);
  };

  const updateField = (field: keyof FormValues, value: string) => {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
    setFormErrors((current) => {
      const nextErrors = { ...current };
      delete nextErrors[field];
      delete nextErrors._form;
      return nextErrors;
    });
  };

  const submitForm = async () => {
    if (!apiClient || state.status !== "ready") {
      return;
    }

    const parsed = parseGuestGroupForm(formValues, editingGroup?.status);

    if (!parsed.ok) {
      setFormErrors(parsed.errors);
      setActionMessage(null);
      return;
    }

    setSubmitting(true);
    setFormErrors({});
    setActionMessage(null);

    try {
      if (editingGroup) {
        const response = await apiClient.updateGuestGroup(eventId, editingGroup.id, parsed.input);
        replaceGuestGroup(response.guestGroup);
        setActionMessage(`${response.guestGroup.label} updated.`);
      } else {
        const response = await apiClient.createGuestGroup(eventId, parsed.input);
        setState((current) =>
          current.status === "ready"
            ? {
                ...current,
                data: {
                  ...current.data,
                  guestGroups: [response.guestGroup, ...current.data.guestGroups],
                },
                inviteLinks: {
                  ...current.inviteLinks,
                  [response.guestGroup.id]: response.inviteLink,
                },
              }
            : current,
        );
        setFormValues(defaultFormValues);
        setActionMessage(`${response.guestGroup.label} created. Invite link ready to copy.`);
      }
    } catch (error) {
      setFormErrors(toFormErrors(error));
    } finally {
      setSubmitting(false);
    }
  };

  const replaceGuestGroup = (guestGroup: GuestGroup, inviteLink?: string) => {
    setState((current) =>
      current.status === "ready"
        ? {
            ...current,
            data: {
              ...current.data,
              guestGroups: current.data.guestGroups.map((item) =>
                item.id === guestGroup.id ? guestGroup : item,
              ),
            },
            inviteLinks: inviteLink
              ? {
                  ...current.inviteLinks,
                  [guestGroup.id]: inviteLink,
                }
              : current.inviteLinks,
          }
        : current,
    );
  };

  const disableGuestGroup = async (group: GuestGroup) => {
    if (!apiClient) {
      return;
    }

    setBusyGroupId(group.id);
    setActionMessage(null);

    try {
      const response = await apiClient.disableGuestGroup(eventId, group.id);
      setState((current) =>
        current.status === "ready"
          ? {
              ...current,
              data: {
                ...current.data,
                guestGroups: current.data.guestGroups.map((item) =>
                  item.id === response.guestGroup.id ? response.guestGroup : item,
                ),
              },
              inviteLinks: withoutInviteLink(current.inviteLinks, response.guestGroup.id),
            }
          : current,
      );
      setPendingAction(null);
      setActionMessage(`${response.guestGroup.label} disabled. Existing invite access is blocked.`);
    } catch (error) {
      setActionMessage(toFriendlyApiMessage(error));
    } finally {
      setBusyGroupId(null);
    }
  };

  const regenerateInvite = async (group: GuestGroup) => {
    if (!apiClient) {
      return;
    }

    setBusyGroupId(group.id);
    setActionMessage(null);

    try {
      const response = await apiClient.regenerateGuestGroupInvite(eventId, group.id);
      replaceGuestGroup(response.guestGroup, response.inviteLink);
      setPendingAction(null);
      setActionMessage(`${response.guestGroup.label} has a new invite link ready to copy.`);
    } catch (error) {
      setActionMessage(toFriendlyApiMessage(error));
    } finally {
      setBusyGroupId(null);
    }
  };

  const copyInviteLink = async (group: GuestGroup) => {
    const inviteLink = state.inviteLinks[group.id];

    if (!inviteLink) {
      setActionMessage("Regenerate this invite link before copying a shareable URL.");
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteLink);
      setActionMessage(`${group.label} invite link copied.`);
    } catch {
      setActionMessage("Clipboard is unavailable. Select the invite URL and copy it manually.");
    }
  };

  if (state.status === "loading") {
    return (
      <div className="grid gap-5">
        <EventTabs active="guests" eventId={eventId} />
        <GuestLoading />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="grid gap-5">
        <EventTabs active="guests" eventId={eventId} />
        <section
          className="grid gap-3 rounded-[var(--radius-lg)] border border-[var(--error)] bg-[color-mix(in_srgb,var(--error)_10%,var(--surface))] p-5 text-[var(--error)]"
          role="alert"
        >
          <h2 className="text-lg font-semibold">Unable to load guest groups</h2>
          <p className="text-sm">{state.error}</p>
          <button
            className="inline-flex min-h-10 w-fit items-center justify-center rounded-[var(--radius-md)] border border-[var(--error)] px-4 text-sm font-semibold transition hover:bg-[color-mix(in_srgb,var(--error)_12%,transparent)] focus:outline-none focus:ring-2 focus:ring-[var(--error)]"
            onClick={() => void loadGuests()}
            type="button"
          >
            Try again
          </button>
        </section>
      </div>
    );
  }

  if (!readyState) {
    return null;
  }

  return (
    <div className="grid gap-5">
      <EventTabs active="guests" eventId={eventId} />

      <section className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
              Guest groups
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Manage invites for {readyState.data.event.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
              Create one private invite per household or group. Full invite URLs only appear when a
              link is created or regenerated.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] px-4 text-sm font-semibold transition hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              disabled={readyState.isRefreshing}
              onClick={() => void loadGuests({ refreshing: true })}
              type="button"
            >
              {readyState.isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
            <button
              className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-contrast)] transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--surface)] active:scale-[0.99]"
              onClick={startCreate}
              type="button"
            >
              New guest group
            </button>
          </div>
        </div>
      </section>

      <GuestSummary guestGroups={readyState.data.guestGroups} />

      {actionMessage ? (
        <div
          className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm"
          role="status"
        >
          {actionMessage}
        </div>
      ) : null}

      <GuestGroupForm
        editingGroup={editingGroup}
        errors={formErrors}
        onCancel={startCreate}
        onSubmit={() => void submitForm()}
        onUpdate={updateField}
        submitting={submitting}
        values={formValues}
      />

      <GuestGroupList
        busyGroupId={busyGroupId}
        guestGroups={readyState.data.guestGroups}
        inviteLinks={readyState.inviteLinks}
        onCopy={(group) => void copyInviteLink(group)}
        onDisable={(group) => setPendingAction({ groupId: group.id, type: "disable" })}
        onEdit={startEdit}
        onRegenerate={(group) => setPendingAction({ groupId: group.id, type: "regenerate" })}
        pendingAction={pendingAction}
        onCancelPendingAction={() => setPendingAction(null)}
        onConfirmDisable={(group) => void disableGuestGroup(group)}
        onConfirmRegenerate={(group) => void regenerateInvite(group)}
      />
    </div>
  );
}

function GuestSummary({ guestGroups }: { guestGroups: GuestGroup[] }) {
  const summary = useMemo(() => {
    const activeGroups = guestGroups.filter((group) => group.status !== "disabled");
    const totalInvitedPax = activeGroups.reduce((sum, group) => sum + group.maxPax, 0);

    return [
      {
        detail: `${totalInvitedPax} max pax across active groups`,
        label: "Active groups",
        value: String(activeGroups.length),
      },
      {
        detail: "Invites opened but not yet responded",
        label: "Opened",
        value: String(guestGroups.filter((group) => group.status === "opened").length),
      },
      {
        detail: "Groups with submitted RSVP state",
        label: "Responded",
        value: String(
          guestGroups.filter((group) => group.status === "responded" || group.status === "declined")
            .length,
        ),
      },
      {
        detail: "Invite access intentionally blocked",
        label: "Disabled",
        value: String(guestGroups.filter((group) => group.status === "disabled").length),
      },
    ];
  }, [guestGroups]);

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Guest group summary">
      {summary.map((item) => (
        <article
          className="grid gap-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4"
          key={item.label}
        >
          <p className="text-sm text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]">
            {item.label}
          </p>
          <p className="text-3xl font-semibold">{item.value}</p>
          <p className="text-sm leading-5 text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
            {item.detail}
          </p>
        </article>
      ))}
    </section>
  );
}

function GuestGroupForm({
  editingGroup,
  errors,
  onCancel,
  onSubmit,
  onUpdate,
  submitting,
  values,
}: {
  editingGroup?: GuestGroup;
  errors: FormErrors;
  onCancel: () => void;
  onSubmit: () => void;
  onUpdate: (field: keyof FormValues, value: string) => void;
  submitting: boolean;
  values: FormValues;
}) {
  return (
    <section className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
      <div>
        <p className="text-sm font-semibold text-[var(--accent-strong)]">
          {editingGroup ? "Edit guest group" : "Create guest group"}
        </p>
        <h2 className="mt-1 text-xl font-semibold">
          {editingGroup ? editingGroup.label : "Add a household or invite group"}
        </h2>
      </div>

      {errors._form ? (
        <p
          className="rounded-[var(--radius-md)] border border-[var(--error)] bg-[color-mix(in_srgb,var(--error)_10%,var(--surface))] px-4 py-3 text-sm text-[var(--error)]"
          role="alert"
        >
          {errors._form}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <TextField
          error={errors.label}
          label="Group label"
          onChange={(value) => onUpdate("label", value)}
          required
          value={values.label}
        />
        <TextField
          error={errors.maxPax}
          inputMode="numeric"
          label="Max pax"
          max="50"
          min="1"
          onChange={(value) => onUpdate("maxPax", value)}
          required
          type="number"
          value={values.maxPax}
        />
        <TextField
          error={errors.contactName}
          label="Contact name"
          onChange={(value) => onUpdate("contactName", value)}
          value={values.contactName}
        />
        <TextField
          error={errors.contactEmail}
          label="Contact email"
          onChange={(value) => onUpdate("contactEmail", value)}
          type="email"
          value={values.contactEmail}
        />
      </div>

      <label className="grid gap-2 text-sm font-medium" htmlFor="guest-notes">
        Notes
        <textarea
          aria-describedby={errors.notes ? "guest-notes-error" : undefined}
          aria-invalid={errors.notes ? true : undefined}
          className="min-h-24 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-normal outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]"
          id="guest-notes"
          onChange={(event) => onUpdate("notes", event.target.value)}
          value={values.notes}
        />
        {errors.notes ? (
          <span className="text-sm text-[var(--error)]" id="guest-notes-error">
            {errors.notes}
          </span>
        ) : null}
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-contrast)] transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting}
          onClick={onSubmit}
          type="button"
        >
          {submitting ? "Saving..." : editingGroup ? "Save guest group" : "Create guest group"}
        </button>
        {editingGroup ? (
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] px-4 text-sm font-semibold transition hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            onClick={onCancel}
            type="button"
          >
            Cancel edit
          </button>
        ) : null}
      </div>
    </section>
  );
}

function GuestGroupList({
  busyGroupId,
  guestGroups,
  inviteLinks,
  onCancelPendingAction,
  onConfirmDisable,
  onConfirmRegenerate,
  onCopy,
  onDisable,
  onEdit,
  onRegenerate,
  pendingAction,
}: {
  busyGroupId: string | null;
  guestGroups: GuestGroup[];
  inviteLinks: Record<string, string>;
  onCancelPendingAction: () => void;
  onConfirmDisable: (group: GuestGroup) => void;
  onConfirmRegenerate: (group: GuestGroup) => void;
  onCopy: (group: GuestGroup) => void;
  onDisable: (group: GuestGroup) => void;
  onEdit: (group: GuestGroup) => void;
  onRegenerate: (group: GuestGroup) => void;
  pendingAction: PendingAction;
}) {
  if (guestGroups.length === 0) {
    return (
      <section className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[color-mix(in_srgb,var(--surface-muted)_52%,var(--surface))] p-5">
        <h2 className="text-xl font-semibold">No guest groups yet</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
          Create the first household or invite group to generate a private RSVP link.
        </p>
      </section>
    );
  }

  return (
    <section className="grid gap-3" aria-label="Guest groups">
      {guestGroups.map((group) => {
        const inviteLink = inviteLinks[group.id];
        const pending = pendingAction?.groupId === group.id ? pendingAction : null;
        const isBusy = busyGroupId === group.id;
        const isDisabled = group.status === "disabled";

        return (
          <article
            className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5"
            key={group.id}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold">{group.label}</h3>
                  <StatusBadge status={group.status} />
                </div>
                <p className="mt-2 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
                  {group.maxPax} max pax
                  {group.contactName ? ` · ${group.contactName}` : ""}
                  {group.contactEmail ? ` · ${group.contactEmail}` : ""}
                </p>
                {group.notes ? (
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
                    {group.notes}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] px-3 text-sm font-semibold transition hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  onClick={() => onEdit(group)}
                  type="button"
                >
                  Edit
                </button>
                <button
                  className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] px-3 text-sm font-semibold transition hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isBusy || isDisabled}
                  onClick={() => onRegenerate(group)}
                  type="button"
                >
                  Regenerate link
                </button>
                <button
                  className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--error)] px-3 text-sm font-semibold text-[var(--error)] transition hover:bg-[color-mix(in_srgb,var(--error)_10%,transparent)] focus:outline-none focus:ring-2 focus:ring-[var(--error)] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isBusy || isDisabled}
                  onClick={() => onDisable(group)}
                  type="button"
                >
                  Disable
                </button>
              </div>
            </div>

            <div className="grid gap-2 rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-3">
              <p className="text-sm font-semibold">Invite link</p>
              {inviteLink ? (
                <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                  <input
                    aria-label={`${group.label} invite link`}
                    className="min-h-10 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
                    readOnly
                    value={inviteLink}
                  />
                  <button
                    className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-contrast)] transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--surface-muted)]"
                    onClick={() => onCopy(group)}
                    type="button"
                  >
                    Copy link
                  </button>
                </div>
              ) : (
                <p className="text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
                  Full URL unavailable after reload. Regenerate this group to copy a fresh shareable
                  link. Invite code:{" "}
                  <span className="font-mono text-[var(--foreground)]">{group.inviteCode}</span>
                </p>
              )}
            </div>

            {pending ? (
              <div
                className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--warning)] bg-[color-mix(in_srgb,var(--warning)_12%,var(--surface))] p-4"
                role="alert"
              >
                <div>
                  <p className="font-semibold">
                    {pending.type === "regenerate"
                      ? "Regenerate this invite link?"
                      : "Disable this guest group?"}
                  </p>
                  <p className="mt-1 text-sm leading-6">
                    {pending.type === "regenerate"
                      ? "The current invite link will stop working and a fresh copyable URL will be created."
                      : "The guest group stays in the list, but private invite access is blocked."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-contrast)] transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isBusy}
                    onClick={() =>
                      pending.type === "regenerate"
                        ? onConfirmRegenerate(group)
                        : onConfirmDisable(group)
                    }
                    type="button"
                  >
                    {isBusy
                      ? "Working..."
                      : pending.type === "regenerate"
                        ? "Confirm regenerate"
                        : "Confirm disable"}
                  </button>
                  <button
                    className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] px-4 text-sm font-semibold transition hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    onClick={onCancelPendingAction}
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
          </article>
        );
      })}
    </section>
  );
}

function TextField({
  error,
  inputMode,
  label,
  max,
  min,
  onChange,
  required = false,
  type = "text",
  value,
}: {
  error?: string;
  inputMode?: "numeric";
  label: string;
  max?: string;
  min?: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: "email" | "number" | "text";
  value: string;
}) {
  const inputId = `guest-${toFieldId(label)}`;
  const errorId = `${inputId}-error`;

  return (
    <label className="grid gap-2 text-sm font-medium" htmlFor={inputId}>
      {label}
      <input
        aria-label={label}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? true : undefined}
        className="min-h-10 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-normal outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]"
        id={inputId}
        inputMode={inputMode}
        max={max}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        type={type}
        value={value}
      />
      {error ? (
        <span className="text-sm text-[var(--error)]" id={errorId}>
          {error}
        </span>
      ) : null}
    </label>
  );
}

function toFieldId(label: string) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function StatusBadge({ status }: { status: GuestGroupStatus }) {
  const label = formatStatus(status);
  const className =
    status === "disabled"
      ? "border-[var(--error)] bg-[color-mix(in_srgb,var(--error)_10%,transparent)] text-[var(--error)]"
      : status === "responded" || status === "declined"
        ? "border-[var(--success)] bg-[color-mix(in_srgb,var(--success)_10%,transparent)] text-[var(--success)]"
        : status === "opened"
          ? "border-[var(--warning)] bg-[color-mix(in_srgb,var(--warning)_12%,transparent)] text-[color-mix(in_srgb,var(--warning)_72%,var(--foreground))]"
          : "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--foreground)]";

  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}

function GuestLoading() {
  return (
    <section
      aria-label="Loading guest groups"
      className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5"
    >
      <div className="h-5 w-40 animate-pulse rounded-full bg-[var(--surface-muted)]" />
      <div className="h-8 w-72 max-w-full animate-pulse rounded-full bg-[var(--surface-muted)]" />
      <div className="grid gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div
            className="h-24 animate-pulse rounded-[var(--radius-md)] bg-[var(--surface-muted)]"
            key={item}
          />
        ))}
      </div>
    </section>
  );
}

function parseGuestGroupForm(
  values: FormValues,
  status?: GuestGroupStatus,
):
  | {
      input: GuestGroupMutationRequest;
      ok: true;
    }
  | {
      errors: FormErrors;
      ok: false;
    } {
  const maxPax = Number(values.maxPax);
  const result = guestGroupMutationRequestSchema.safeParse({
    contactEmail: emptyToUndefined(values.contactEmail),
    contactName: emptyToUndefined(values.contactName),
    label: values.label,
    maxPax,
    notes: values.notes,
    ...(status ? { status } : {}),
  });

  if (result.success) {
    return {
      input: result.data as GuestGroupMutationRequest,
      ok: true,
    };
  }

  const errors: FormErrors = {};

  for (const issue of result.error.issues) {
    const field = issue.path[0];

    if (typeof field === "string" && isFormField(field)) {
      errors[field] = issue.message;
    } else {
      errors._form = issue.message;
    }
  }

  return {
    errors,
    ok: false,
  };
}

function toFormErrors(error: unknown): FormErrors {
  if (error instanceof ApiClientError) {
    const errors: FormErrors = {
      _form: error.apiError.error.message,
    };

    for (const fieldError of error.apiError.error.fields ?? []) {
      const field = fieldError.path[0];

      if (typeof field === "string" && isFormField(field)) {
        errors[field] = fieldError.message;
      }
    }

    return errors;
  }

  return {
    _form: toFriendlyApiMessage(error),
  };
}

function toFriendlyApiMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.apiError.error.message;
  }

  return error instanceof Error ? error.message : "Unable to complete the guest group request.";
}

function withoutInviteLink(links: Record<string, string>, groupId: string) {
  const nextLinks = { ...links };
  delete nextLinks[groupId];
  return nextLinks;
}

function emptyToUndefined(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function isFormField(value: string): value is keyof FormValues {
  return (
    value === "contactEmail" ||
    value === "contactName" ||
    value === "label" ||
    value === "maxPax" ||
    value === "notes"
  );
}

function formatStatus(status: GuestGroupStatus) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
