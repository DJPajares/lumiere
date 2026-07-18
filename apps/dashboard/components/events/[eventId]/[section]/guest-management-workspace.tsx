"use client";

import { ApiClientError } from "@lumiere/api-client";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@lumiere/dashboard-ui/components/field";
import { Input } from "@lumiere/dashboard-ui/components/input";
import { toast } from "@lumiere/dashboard-ui/components/sonner";
import {
  guestGroupMutationRequestSchema,
  type Event,
  type GuestGroup,
  type GuestGroupMemberMutationInput,
  type GuestGroupMutationRequest,
  type GuestGroupStatus,
  type ManagerRole,
} from "@lumiere/types";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useDashboardAuth } from "../../../../auth/dashboard-auth-provider";
import { EventTabs } from "../../../placeholder-panels";
import { DashboardSelect } from "../../../ui/dashboard-fields";
import { ResponsiveModal } from "../../../ui/responsive-modal";

type GuestWorkspaceData = {
  accessRole: ManagerRole;
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
  members: GuestGroupMemberMutationInput[];
  maxPax: string;
  notes: string;
  status: string;
};

type TextFormField = Exclude<keyof FormValues, "members">;

type FormErrors = Partial<Record<keyof FormValues | "_form", string>> & {
  memberNames?: Record<number, string>;
};

type PendingAction = {
  groupId: string;
  type: "disable" | "regenerate";
} | null;

const defaultFormValues: FormValues = {
  contactEmail: "",
  contactName: "",
  label: "",
  members: createMemberFields([], 2),
  maxPax: "2",
  notes: "",
  status: "pending",
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
  const [baselineValues, setBaselineValues] = useState<FormValues>(defaultFormValues);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [submitting, setSubmitting] = useState(false);
  const [busyGroupId, setBusyGroupId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

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
            accessRole: eventResponse.access.role,
            event: eventResponse.event,
            guestGroups: guestGroupResponse.guestGroups,
          },
          error: null,
          inviteLinks: Object.fromEntries(
            guestGroupResponse.guestGroups
              .filter((group) => group.inviteLink)
              .map((group) => [group.id, group.inviteLink as string]),
          ),
          isRefreshing: false,
          status: "ready",
        }));
      } catch (error) {
        toast.error(toFriendlyApiMessage(error));
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
    setBaselineValues(defaultFormValues);
    setFormErrors({});
    setActionMessage(null);
    setFormOpen(true);
  };

  const startEdit = (group: GuestGroup) => {
    setEditingGroupId(group.id);
    const storedMembers =
      group.members?.map(({ id, name }) => ({ id, name })) ??
      (group.contactName ? [{ name: group.contactName }] : []);
    const values = {
      contactEmail: group.contactEmail ?? "",
      contactName: group.contactName ?? "",
      label: group.label,
      members: createMemberFields(storedMembers, group.maxPax),
      maxPax: String(group.maxPax),
      notes: group.notes ?? "",
      status: group.status,
    };

    setFormValues(values);
    setBaselineValues(values);
    setFormErrors({});
    setActionMessage(null);
    setFormOpen(true);
  };

  const updateField = (field: TextFormField, value: string) => {
    setFormValues((current) => {
      if (field !== "maxPax") {
        return {
          ...current,
          [field]: value,
        };
      }

      const nextMaxPax = Number(value);
      return {
        ...current,
        maxPax: value,
        members:
          Number.isInteger(nextMaxPax) && nextMaxPax >= 1 && nextMaxPax <= 50
            ? createMemberFields(current.members, nextMaxPax)
            : current.members,
      };
    });
    setFormErrors((current) => {
      const nextErrors = { ...current };
      delete nextErrors[field];
      if (field === "maxPax") {
        delete nextErrors.members;
        delete nextErrors.memberNames;
      }
      delete nextErrors._form;
      return nextErrors;
    });
  };

  const updateMember = (index: number, name: string) => {
    setFormValues((current) => ({
      ...current,
      members: current.members.map((member, memberIndex) =>
        memberIndex === index ? { ...member, name } : member,
      ),
    }));
    clearMemberErrors(index);
  };

  const clearMemberErrors = (index: number) => {
    setFormErrors((current) => {
      const nextErrors = { ...current };

      delete nextErrors.members;
      if (nextErrors.memberNames) {
        const memberNames = { ...nextErrors.memberNames };
        delete memberNames[index];
        nextErrors.memberNames = memberNames;
      }
      delete nextErrors._form;
      return nextErrors;
    });
  };

  const submitForm = async () => {
    if (!apiClient) {
      toast.error("Dashboard API is not configured.");
      return;
    }

    if (state.status !== "ready") {
      return;
    }

    const parsed = parseGuestGroupForm(formValues);

    if (!parsed.ok) {
      setFormErrors(parsed.errors);
      setActionMessage(null);
      toast.error(parsed.errors._form ?? "Check the highlighted guest group fields.");
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
        setFormOpen(false);
        toast.success(`${response.guestGroup.label} updated.`);
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
        setFormOpen(false);
        toast.success(`${response.guestGroup.label} created. Invite link ready to copy.`);
      }
    } catch (error) {
      setFormErrors(toFormErrors(error));
      toast.error(toFriendlyApiMessage(error));
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
      toast.error("Dashboard API is not configured.");
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
      toast.success(`${response.guestGroup.label} disabled.`);
    } catch (error) {
      const message = toFriendlyApiMessage(error);
      setActionMessage(message);
      toast.error(message);
    } finally {
      setBusyGroupId(null);
    }
  };

  const regenerateInvite = async (group: GuestGroup) => {
    if (!apiClient) {
      toast.error("Dashboard API is not configured.");
      return;
    }

    setBusyGroupId(group.id);
    setActionMessage(null);

    try {
      const response = await apiClient.regenerateGuestGroupInvite(eventId, group.id);
      replaceGuestGroup(response.guestGroup, response.inviteLink);
      setPendingAction(null);
      setActionMessage(`${response.guestGroup.label} has a new invite link ready to copy.`);
      toast.success(`${response.guestGroup.label} invite link regenerated.`);
    } catch (error) {
      const message = toFriendlyApiMessage(error);
      setActionMessage(message);
      toast.error(message);
    } finally {
      setBusyGroupId(null);
    }
  };

  const copyInviteLink = async (group: GuestGroup) => {
    const inviteLink = state.inviteLinks[group.id];

    if (!inviteLink) {
      const message = "Regenerate this invite link before copying a shareable URL.";
      setActionMessage(message);
      toast.warning(message);
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteLink);
      setActionMessage(`${group.label} invite link copied.`);
      toast.success(`${group.label} invite link copied.`);
    } catch {
      const message = "Clipboard is unavailable. Select the invite URL and copy it manually.";
      setActionMessage(message);
      toast.error(message);
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

  const canEdit = readyState.data.accessRole !== "viewer";

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
              Create one private invite per household or group. Your current invite URL stays ready
              to copy whenever you return to this workspace.
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
            {canEdit ? (
              <button
                className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-contrast)] transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--surface)] active:scale-[0.99]"
                onClick={startCreate}
                type="button"
              >
                New guest group
              </button>
            ) : (
              <span className="rounded-full border border-[var(--border)] px-3 py-1 text-sm font-medium">
                View-only access
              </span>
            )}
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

      {canEdit ? (
        <ResponsiveModal
          description={
            editingGroup
              ? "Update the group identity, capacity, invite status, and private notes."
              : "Create one private invite for a household, table, or guest group."
          }
          dirty={JSON.stringify(formValues) !== JSON.stringify(baselineValues)}
          onDiscard={() => {
            setFormValues(baselineValues);
            setFormErrors({});
          }}
          onOpenChange={setFormOpen}
          open={formOpen}
          title={editingGroup ? `Edit ${editingGroup.label}` : "Create guest group"}
        >
          {({ requestClose }) => (
            <GuestGroupForm
              editingGroup={editingGroup}
              errors={formErrors}
              onCancel={requestClose}
              onSubmit={() => void submitForm()}
              onUpdate={updateField}
              onUpdateMember={updateMember}
              submitting={submitting}
              values={formValues}
            />
          )}
        </ResponsiveModal>
      ) : null}

      <GuestGroupList
        busyGroupId={busyGroupId}
        canEdit={canEdit}
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
  onUpdateMember,
  submitting,
  values,
}: {
  editingGroup?: GuestGroup;
  errors: FormErrors;
  onCancel: () => void;
  onSubmit: () => void;
  onUpdate: (field: TextFormField, value: string) => void;
  onUpdateMember: (index: number, name: string) => void;
  submitting: boolean;
  values: FormValues;
}) {
  return (
    <div className="grid gap-4">
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
          error={errors.contactEmail}
          label="Contact email"
          onChange={(value) => onUpdate("contactEmail", value)}
          type="email"
          value={values.contactEmail}
        />
      </div>

      <FieldSet className="rounded-[var(--radius-md)] border border-border bg-muted/20 p-4">
        <FieldLegend variant="label">Named members</FieldLegend>
        <FieldDescription>
          One field is created for every seat in Max pax. Enter each guest&apos;s full name.
        </FieldDescription>
        <FieldGroup className="grid gap-3 sm:grid-cols-2">
          {values.members.map((member, index) => {
            const error = errors.memberNames?.[index];
            const memberId = `guest-member-${index}`;

            return (
              <Field data-invalid={Boolean(error)} key={member.id ?? memberId}>
                <FieldLabel htmlFor={memberId}>Member {index + 1}</FieldLabel>
                <Input
                  aria-describedby={error ? `${memberId}-error` : undefined}
                  aria-invalid={Boolean(error)}
                  id={memberId}
                  onChange={(event) => onUpdateMember(index, event.target.value)}
                  placeholder="Full name"
                  value={member.name}
                />
                {error ? <FieldError id={`${memberId}-error`}>{error}</FieldError> : null}
              </Field>
            );
          })}
        </FieldGroup>
        {errors.members ? <FieldError>{errors.members}</FieldError> : null}
      </FieldSet>

      {editingGroup ? (
        <DashboardSelect
          error={errors.status}
          id="guest-invite-status"
          label="Invite status"
          onValueChange={(value) => onUpdate("status", value)}
          options={guestStatuses.map((status) => ({
            label: formatStatus(status),
            value: status,
          }))}
          value={values.status}
        />
      ) : null}

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
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] px-4 text-sm font-semibold transition hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function GuestGroupList({
  busyGroupId,
  canEdit,
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
  canEdit: boolean;
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
          {canEdit
            ? "Create the first household or invite group to generate a private RSVP link."
            : "No guest groups are available to review yet."}
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
                  {group.members?.length
                    ? ` · ${group.members.length} named member${group.members.length === 1 ? "" : "s"}`
                    : group.contactName
                      ? ` · ${group.contactName}`
                      : ""}
                  {group.contactEmail ? ` · ${group.contactEmail}` : ""}
                </p>
                {group.members?.length ? (
                  <p className="mt-2 text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
                    {group.members.map((member) => member.name).join(" · ")}
                  </p>
                ) : null}
                {group.notes ? (
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
                    {group.notes}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                {canEdit ? (
                  <>
                    <button
                      aria-label={`Edit ${group.label}`}
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
                  </>
                ) : null}
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
                  Full URL unavailable for this older invite. Regenerate this group once to create a
                  copyable shareable link. Invite code:{" "}
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

function parseGuestGroupForm(values: FormValues):
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
    members: values.members,
    notes: values.notes,
    status: values.status,
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

    if (field === "members") {
      const memberIndex = issue.path[1];

      if (typeof memberIndex === "number" && issue.path[2] === "name") {
        errors.memberNames = {
          ...errors.memberNames,
          [memberIndex]: issue.message,
        };
      } else {
        errors.members = issue.message;
      }
      continue;
    }

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

function createMemberFields(
  members: GuestGroupMemberMutationInput[],
  count: number,
): GuestGroupMemberMutationInput[] {
  return Array.from({ length: count }, (_, index) => members[index] ?? { name: "" });
}

function isFormField(value: string): value is keyof FormValues {
  return (
    value === "contactEmail" ||
    value === "contactName" ||
    value === "label" ||
    value === "members" ||
    value === "maxPax" ||
    value === "notes" ||
    value === "status"
  );
}

function formatStatus(status: GuestGroupStatus) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
