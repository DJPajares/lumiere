"use client";

import { ApiClientError, type GuestDataExportDownload } from "@lumiere/api-client";
import { Button } from "@lumiere/dashboard-ui/components/button";
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
import { Textarea } from "@lumiere/dashboard-ui/components/textarea";
import { ToggleGroup, ToggleGroupItem } from "@lumiere/dashboard-ui/components/toggle-group";
import { DownloadIcon, LayoutGridIcon, ListIcon } from "@lumiere/dashboard-ui/components/icons";
import {
  guestGroupMutationRequestSchema,
  type Event,
  type GuestDataExportFormat,
  type GuestDataExportScope,
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

type GuestSortKey = "label" | "createdAt" | "updatedAt" | "lastOpenedAt" | "maxPax" | "status";
type GuestSortDirection = "asc" | "desc";
type GuestViewMode = "cards" | "list";

type GuestListFilters = {
  direction: GuestSortDirection;
  query: string;
  sort: GuestSortKey;
  status: GuestGroupStatus | "all";
};

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

const defaultGuestListFilters: GuestListFilters = {
  direction: "desc",
  query: "",
  sort: "createdAt",
  status: "all",
};

const guestSortOptions: Array<{ label: string; value: GuestSortKey }> = [
  { label: "Created date", value: "createdAt" },
  { label: "Updated date", value: "updatedAt" },
  { label: "Last opened", value: "lastOpenedAt" },
  { label: "Group label", value: "label" },
  { label: "Max pax", value: "maxPax" },
  { label: "Status", value: "status" },
];

const guestSortDirectionOptions = [
  { label: "Newest / highest first", value: "desc" },
  { label: "Oldest / lowest first", value: "asc" },
] as const;

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
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<GuestDataExportFormat>("csv");
  const [exportScope, setExportScope] = useState<GuestDataExportScope>("all");
  const [exporting, setExporting] = useState(false);
  const [guestListFilters, setGuestListFilters] = useState<GuestListFilters>(() =>
    readGuestListFilters(),
  );
  const [guestViewMode, setGuestViewMode] = useState<GuestViewMode>(() => readGuestViewMode());

  useEffect(() => {
    const syncViewFromUrl = () => {
      setGuestListFilters(readGuestListFilters());
      setGuestViewMode(readGuestViewMode());
    };

    window.addEventListener("popstate", syncViewFromUrl);
    return () => window.removeEventListener("popstate", syncViewFromUrl);
  }, []);

  const updateGuestListFilters = useCallback((updates: Partial<GuestListFilters>) => {
    setGuestListFilters((current) => {
      const next = { ...current, ...updates };
      writeGuestListFilters(next);
      return next;
    });
  }, []);

  const clearGuestListFilters = useCallback(() => {
    writeGuestListFilters(defaultGuestListFilters);
    setGuestListFilters(defaultGuestListFilters);
  }, []);

  const updateGuestViewMode = useCallback((viewMode: GuestViewMode) => {
    writeGuestViewMode(viewMode);
    setGuestViewMode(viewMode);
  }, []);

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
  const guestGroups = readyState?.data.guestGroups ?? [];
  const filteredGuestGroups = useMemo(
    () => filterAndSortGuestGroups(guestGroups, guestListFilters),
    [guestGroups, guestListFilters],
  );
  const hasGuestListFilters = !areGuestListFiltersDefault(guestListFilters);
  const hasSupportedExportFilters =
    Boolean(guestListFilters.query.trim()) || guestListFilters.status !== "all";

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

  const openInviteLink = (group: GuestGroup) => {
    const inviteLink = state.inviteLinks[group.id];

    if (!inviteLink || group.status === "disabled") {
      const message =
        group.status === "disabled"
          ? "This guest group is disabled. Invite access is unavailable."
          : "Regenerate this invite link before opening a shareable URL.";
      setActionMessage(message);
      toast.warning(message);
      return;
    }

    const openedWindow = window.open(inviteLink, "_blank", "noopener,noreferrer");

    if (!openedWindow) {
      const message = "The invite could not be opened. Allow pop-ups and try again.";
      setActionMessage(message);
      toast.error(message);
      return;
    }

    setActionMessage(group.label + " invite link opened.");
    toast.success(group.label + " invite link opened.");
  };

  const startExport = () => {
    setExportScope(hasSupportedExportFilters ? "filtered" : "all");
    setExportOpen(true);
  };

  const downloadGuestData = async () => {
    if (!apiClient) {
      toast.error("Dashboard API is not configured.");
      return;
    }

    const scope = exportScope === "filtered" && hasSupportedExportFilters ? "filtered" : "all";
    setExporting(true);
    setActionMessage(null);

    try {
      const download = await apiClient.downloadGuestData(eventId, {
        format: exportFormat,
        q: scope === "filtered" ? guestListFilters.query.trim() || undefined : undefined,
        scope,
        status:
          scope === "filtered" && guestListFilters.status !== "all"
            ? guestListFilters.status
            : undefined,
      });
      triggerBrowserDownload(download);
      const message = `${download.filename} is ready.`;
      setActionMessage(message);
      setExportOpen(false);
      toast.success(message);
    } catch (error) {
      toast.error(toFriendlyApiMessage(error));
    } finally {
      setExporting(false);
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
          <Button
            className="w-fit"
            onClick={() => void loadGuests()}
            size="lg"
            type="button"
            variant="outline"
          >
            Try again
          </Button>
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
            <Button onClick={startExport} size="lg" type="button" variant="outline">
              <DownloadIcon data-icon="inline-start" />
              Export
            </Button>
            <Button
              disabled={readyState.isRefreshing}
              onClick={() => void loadGuests({ refreshing: true })}
              size="lg"
              type="button"
              variant="outline"
            >
              {readyState.isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
            {canEdit ? (
              <Button onClick={startCreate} size="lg" type="button">
                New guest group
              </Button>
            ) : (
              <span className="rounded-full border border-[var(--border)] px-3 py-1 text-sm font-medium">
                View-only access
              </span>
            )}
          </div>
        </div>
      </section>

      <GuestSummary guestGroups={readyState.data.guestGroups} />

      <GuestGroupFilters
        filters={guestListFilters}
        hasActiveFilters={hasGuestListFilters}
        onClear={clearGuestListFilters}
        onUpdate={updateGuestListFilters}
      />

      <GuestGroupViewControls onChange={updateGuestViewMode} viewMode={guestViewMode} />

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
          footer={({ requestClose }) => (
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                disabled={
                  submitting || JSON.stringify(formValues) === JSON.stringify(baselineValues)
                }
                onClick={requestClose}
                type="button"
                variant="outline"
              >
                Cancel changes
              </Button>
              <Button disabled={submitting} onClick={() => void submitForm()} type="button">
                {submitting
                  ? "Saving..."
                  : editingGroup
                    ? "Save guest group"
                    : "Create guest group"}
              </Button>
            </div>
          )}
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
              onUpdate={updateField}
              onUpdateMember={updateMember}
              values={formValues}
            />
          )}
        </ResponsiveModal>
      ) : null}

      <ResponsiveModal
        description="Download guest groups and RSVP details without invite credentials or internal IDs."
        footer={({ requestClose }) => (
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button disabled={exporting} onClick={requestClose} type="button" variant="outline">
              Cancel
            </Button>
            <Button disabled={exporting} onClick={() => void downloadGuestData()} type="button">
              <DownloadIcon data-icon="inline-start" />
              {exporting ? "Preparing export..." : `Download ${exportFormat.toUpperCase()}`}
            </Button>
          </div>
        )}
        onOpenChange={(open) => {
          if (!exporting) {
            setExportOpen(open);
          }
        }}
        open={exportOpen}
        title="Export guest data"
      >
        <FieldGroup>
          <FieldSet>
            <FieldLegend>File format</FieldLegend>
            <FieldDescription>
              CSV is lightweight and universal. XLSX adds a frozen header row, filters, wrapping,
              and readable column widths.
            </FieldDescription>
            <ToggleGroup
              aria-label="Export file format"
              onValueChange={(value) => {
                const nextFormat = value[0];
                if (nextFormat === "csv" || nextFormat === "xlsx") {
                  setExportFormat(nextFormat);
                }
              }}
              spacing={0}
              value={[exportFormat]}
              variant="outline"
            >
              <ToggleGroupItem type="button" value="csv">
                CSV
              </ToggleGroupItem>
              <ToggleGroupItem type="button" value="xlsx">
                XLSX
              </ToggleGroupItem>
            </ToggleGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Rows to include</FieldLegend>
            <FieldDescription>
              Exports use a stable server order. Card or compact-list sorting does not change the
              file.
            </FieldDescription>
            <ToggleGroup
              aria-label="Export row scope"
              onValueChange={(value) => {
                const nextScope = value[0];
                if (
                  nextScope === "all" ||
                  (nextScope === "filtered" && hasSupportedExportFilters)
                ) {
                  setExportScope(nextScope);
                }
              }}
              orientation="vertical"
              spacing={2}
              value={[exportScope]}
              variant="outline"
            >
              <ToggleGroupItem type="button" value="all">
                All event rows ({guestGroups.length})
              </ToggleGroupItem>
              <ToggleGroupItem disabled={!hasSupportedExportFilters} type="button" value="filtered">
                Current search and status filters ({filteredGuestGroups.length})
              </ToggleGroupItem>
            </ToggleGroup>
            <FieldDescription>
              {hasSupportedExportFilters
                ? "Current filters include the search text and status shown in this workspace."
                : "Add search text or a status filter to enable a filtered export."}
            </FieldDescription>
          </FieldSet>

          <FieldDescription>
            Each request is limited to 10,000 guest-group rows. Selected attendee names are taken
            from the submitted RSVP.
          </FieldDescription>
        </FieldGroup>
      </ResponsiveModal>

      <GuestGroupList
        busyGroupId={busyGroupId}
        canEdit={canEdit}
        guestGroups={filteredGuestGroups}
        inviteLinks={readyState.inviteLinks}
        onClearFilters={clearGuestListFilters}
        onCopy={(group) => void copyInviteLink(group)}
        onDisable={(group) => setPendingAction({ groupId: group.id, type: "disable" })}
        onEdit={startEdit}
        onOpen={openInviteLink}
        onRegenerate={(group) => setPendingAction({ groupId: group.id, type: "regenerate" })}
        pendingAction={pendingAction}
        onCancelPendingAction={() => setPendingAction(null)}
        onConfirmDisable={(group) => void disableGuestGroup(group)}
        onConfirmRegenerate={(group) => void regenerateInvite(group)}
        totalGuestGroups={readyState.data.guestGroups.length}
        viewMode={guestViewMode}
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

function GuestGroupFilters({
  filters,
  hasActiveFilters,
  onClear,
  onUpdate,
}: {
  filters: GuestListFilters;
  hasActiveFilters: boolean;
  onClear: () => void;
  onUpdate: (updates: Partial<GuestListFilters>) => void;
}) {
  return (
    <section
      aria-label="Guest group filters"
      className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--accent-strong)]">Find guest groups</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">Search and sort invites</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
            Search labels, member names, contact email, or the non-secret invite code. Filters stay
            in the URL so this view can be refreshed or shared.
          </p>
        </div>
        <Button
          disabled={!hasActiveFilters}
          onClick={onClear}
          size="lg"
          type="button"
          variant="outline"
        >
          Clear filters
        </Button>
      </div>

      <FieldGroup className="grid items-start gap-4 lg:grid-cols-[minmax(18rem,2fr)_minmax(10rem,1fr)_minmax(12rem,1fr)_minmax(12rem,1fr)]">
        <Field className="items-start">
          <FieldLabel className="font-semibold leading-normal" htmlFor="guest-group-search">
            Search guest groups
          </FieldLabel>
          <Input
            className="h-11"
            id="guest-group-search"
            onChange={(event) => onUpdate({ query: event.target.value })}
            placeholder="Search by group, member, email, or invite code"
            value={filters.query}
          />
          <FieldDescription>
            Search is case-insensitive and excludes invite tokens.
          </FieldDescription>
        </Field>

        <DashboardSelect
          id="guest-group-status-filter"
          label="Status filter"
          onValueChange={(value) => onUpdate({ status: value as GuestGroupStatus | "all" })}
          options={[
            { label: "All statuses", value: "all" },
            ...guestStatuses.map((status) => ({ label: formatStatus(status), value: status })),
          ]}
          value={filters.status}
        />

        <DashboardSelect
          id="guest-group-sort"
          label="Sort by"
          onValueChange={(value) => onUpdate({ sort: value as GuestSortKey })}
          options={guestSortOptions}
          value={filters.sort}
        />

        <DashboardSelect
          id="guest-group-sort-direction"
          label="Sort direction"
          onValueChange={(value) => onUpdate({ direction: value as GuestSortDirection })}
          options={[...guestSortDirectionOptions]}
          value={filters.direction}
        />
      </FieldGroup>
    </section>
  );
}

function GuestGroupViewControls({
  onChange,
  viewMode,
}: {
  onChange: (viewMode: GuestViewMode) => void;
  viewMode: GuestViewMode;
}) {
  return (
    <section
      aria-label="Guest group view"
      className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p className="text-sm font-semibold">View guest groups</p>
        <p className="mt-1 text-sm text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]">
          Use cards for detail or a compact list for quick scanning.
        </p>
      </div>
      <ToggleGroup
        aria-label="Guest group view"
        className="w-full sm:w-fit"
        onValueChange={(value) => {
          const nextView = value[0];

          if (nextView === "cards" || nextView === "list") {
            onChange(nextView);
          }
        }}
        size="sm"
        spacing={0}
        value={[viewMode]}
        variant="outline"
      >
        <ToggleGroupItem aria-label="Card view" type="button" value="cards">
          <LayoutGridIcon data-icon="inline-start" />
          Cards
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Compact list view" type="button" value="list">
          <ListIcon data-icon="inline-start" />
          Compact list
        </ToggleGroupItem>
      </ToggleGroup>
    </section>
  );
}

function GuestGroupForm({
  editingGroup,
  errors,
  onUpdate,
  onUpdateMember,
  values,
}: {
  editingGroup?: GuestGroup;
  errors: FormErrors;
  onUpdate: (field: TextFormField, value: string) => void;
  onUpdateMember: (index: number, name: string) => void;
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

      <Field data-invalid={Boolean(errors.notes)}>
        <FieldLabel htmlFor="guest-notes">Notes</FieldLabel>
        <Textarea
          aria-describedby={errors.notes ? "guest-notes-error" : undefined}
          aria-invalid={Boolean(errors.notes)}
          className="min-h-24"
          id="guest-notes"
          onChange={(event) => onUpdate("notes", event.target.value)}
          value={values.notes}
        />
        {errors.notes ? <FieldError id="guest-notes-error">{errors.notes}</FieldError> : null}
      </Field>
    </div>
  );
}

function GuestGroupList({
  busyGroupId,
  canEdit,
  guestGroups,
  inviteLinks,
  onCancelPendingAction,
  onClearFilters,
  onConfirmDisable,
  onConfirmRegenerate,
  onCopy,
  onDisable,
  onEdit,
  onOpen,
  onRegenerate,
  pendingAction,
  totalGuestGroups,
  viewMode,
}: {
  busyGroupId: string | null;
  canEdit: boolean;
  guestGroups: GuestGroup[];
  inviteLinks: Record<string, string>;
  onCancelPendingAction: () => void;
  onClearFilters: () => void;
  onConfirmDisable: (group: GuestGroup) => void;
  onConfirmRegenerate: (group: GuestGroup) => void;
  onCopy: (group: GuestGroup) => void;
  onDisable: (group: GuestGroup) => void;
  onEdit: (group: GuestGroup) => void;
  onOpen: (group: GuestGroup) => void;
  onRegenerate: (group: GuestGroup) => void;
  pendingAction: PendingAction;
  totalGuestGroups: number;
  viewMode: GuestViewMode;
}) {
  if (guestGroups.length === 0 && totalGuestGroups > 0) {
    return (
      <section
        aria-label="Guest group results"
        className="grid gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[color-mix(in_srgb,var(--surface-muted)_52%,var(--surface))] p-5"
        role="status"
      >
        <h2 className="text-xl font-semibold">No guest groups match these filters</h2>
        <p className="max-w-2xl text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
          Try a different search or status, or clear the filters to see every guest group again.
        </p>
        <Button className="w-fit" onClick={onClearFilters} size="lg" type="button">
          Clear filters
        </Button>
      </section>
    );
  }

  if (totalGuestGroups === 0) {
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

  if (viewMode === "list") {
    return (
      <GuestGroupCompactList
        busyGroupId={busyGroupId}
        canEdit={canEdit}
        guestGroups={guestGroups}
        inviteLinks={inviteLinks}
        onCancelPendingAction={onCancelPendingAction}
        onConfirmDisable={onConfirmDisable}
        onConfirmRegenerate={onConfirmRegenerate}
        onCopy={onCopy}
        onDisable={onDisable}
        onEdit={onEdit}
        onOpen={onOpen}
        onRegenerate={onRegenerate}
        pendingAction={pendingAction}
        totalGuestGroups={totalGuestGroups}
      />
    );
  }

  return (
    <section className="grid gap-3" aria-label="Guest groups">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Guest groups</h2>
        <p
          className="text-sm text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]"
          role="status"
        >
          Showing {guestGroups.length} of {totalGuestGroups}
        </p>
      </div>
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
                    <Button
                      aria-label={`Edit ${group.label}`}
                      onClick={() => onEdit(group)}
                      size="lg"
                      type="button"
                      variant="outline"
                    >
                      Edit
                    </Button>
                    <Button
                      disabled={isBusy || isDisabled}
                      onClick={() => onRegenerate(group)}
                      size="lg"
                      type="button"
                      variant="outline"
                    >
                      Regenerate link
                    </Button>
                    <Button
                      disabled={isBusy || isDisabled}
                      onClick={() => onDisable(group)}
                      size="lg"
                      type="button"
                      variant="destructive"
                    >
                      Disable
                    </Button>
                  </>
                ) : null}
              </div>
            </div>

            <div className="grid gap-2 rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-3">
              <p className="text-sm font-semibold">Invite link</p>
              {inviteLink && !isDisabled ? (
                <div className="grid gap-2 md:grid-cols-[1fr_auto]">
                  <Input
                    aria-label={`${group.label} invite link`}
                    className="h-10"
                    readOnly
                    value={inviteLink}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => onCopy(group)} size="lg" type="button">
                      Copy link
                    </Button>
                    <Button onClick={() => onOpen(group)} size="lg" type="button" variant="outline">
                      Open link
                    </Button>
                  </div>
                </div>
              ) : (
                <InviteLinkUnavailable group={group} />
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
                  <Button
                    disabled={isBusy}
                    onClick={() =>
                      pending.type === "regenerate"
                        ? onConfirmRegenerate(group)
                        : onConfirmDisable(group)
                    }
                    size="lg"
                    type="button"
                    variant={pending.type === "disable" ? "destructive" : "default"}
                  >
                    {isBusy
                      ? "Working..."
                      : pending.type === "regenerate"
                        ? "Confirm regenerate"
                        : "Confirm disable"}
                  </Button>
                  <Button onClick={onCancelPendingAction} size="lg" type="button" variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : null}
          </article>
        );
      })}
    </section>
  );
}

type GuestGroupCompactListProps = {
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
  onOpen: (group: GuestGroup) => void;
  onRegenerate: (group: GuestGroup) => void;
  pendingAction: PendingAction;
  totalGuestGroups: number;
};

function GuestGroupCompactList({
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
  onOpen,
  onRegenerate,
  pendingAction,
  totalGuestGroups,
}: GuestGroupCompactListProps) {
  return (
    <section className="grid gap-3" aria-label="Guest groups">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Guest groups</h2>
        <p
          className="text-sm text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]"
          role="status"
        >
          Showing {guestGroups.length} of {totalGuestGroups}
        </p>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)]">
        <div className="hidden grid-cols-[1.35fr_0.8fr_1fr_1.25fr_auto] gap-3 border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm font-semibold lg:grid">
          <span>Guest group</span>
          <span>Status</span>
          <span>Last opened</span>
          <span>Invite link</span>
          <span className="sr-only">Actions</span>
        </div>
        <div className="grid divide-y divide-[var(--border)]">
          {guestGroups.map((group) => {
            const inviteLink = inviteLinks[group.id];
            const pending = pendingAction?.groupId === group.id ? pendingAction : null;
            const isBusy = busyGroupId === group.id;
            const isDisabled = group.status === "disabled";
            const contact = group.members?.length
              ? group.members.map((member) => member.name).join(", ")
              : group.contactName || group.contactEmail || "No contact details";

            return (
              <article
                className="grid gap-3 px-4 py-4 text-sm lg:grid-cols-[1.35fr_0.8fr_1fr_1.25fr_auto] lg:items-start"
                key={group.id}
              >
                <div>
                  <p className="font-semibold">{group.label}</p>
                  <p className="mt-1 text-[color-mix(in_srgb,var(--foreground)_68%,transparent)]">
                    {group.maxPax} max pax · {contact}
                  </p>
                </div>

                <div>
                  <CompactMobileLabel>Status</CompactMobileLabel>
                  <StatusBadge status={group.status} />
                </div>

                <div>
                  <CompactMobileLabel>Last opened</CompactMobileLabel>
                  <span>
                    {group.lastOpenedAt ? formatGuestDate(group.lastOpenedAt) : "Not opened"}
                  </span>
                </div>

                <div className="min-w-0">
                  <CompactMobileLabel>Invite link</CompactMobileLabel>
                  {inviteLink && !isDisabled ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="min-w-0 flex-1 truncate font-mono text-xs">
                        {inviteLink}
                      </span>
                      <Button onClick={() => onCopy(group)} size="lg" type="button">
                        Copy link
                      </Button>
                      <Button
                        onClick={() => onOpen(group)}
                        size="lg"
                        type="button"
                        variant="outline"
                      >
                        Open link
                      </Button>
                    </div>
                  ) : (
                    <InviteLinkUnavailable compact group={group} />
                  )}
                </div>

                {canEdit ? (
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <Button
                      aria-label={`Edit ${group.label}`}
                      onClick={() => onEdit(group)}
                      size="lg"
                      type="button"
                      variant="outline"
                    >
                      Edit
                    </Button>
                    <Button
                      disabled={isBusy || isDisabled}
                      onClick={() => onRegenerate(group)}
                      size="lg"
                      type="button"
                      variant="outline"
                    >
                      Regenerate
                    </Button>
                    <Button
                      disabled={isBusy || isDisabled}
                      onClick={() => onDisable(group)}
                      size="lg"
                      type="button"
                      variant="destructive"
                    >
                      Disable
                    </Button>
                  </div>
                ) : null}

                {pending ? (
                  <CompactPendingAction
                    busy={isBusy}
                    onCancel={onCancelPendingAction}
                    onConfirm={() =>
                      pending.type === "regenerate"
                        ? onConfirmRegenerate(group)
                        : onConfirmDisable(group)
                    }
                    type={pending.type}
                  />
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function InviteLinkUnavailable({
  compact = false,
  group,
}: {
  compact?: boolean;
  group: GuestGroup;
}) {
  if (group.status === "disabled") {
    return (
      <p className="text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
        Invite access is disabled for this group.
      </p>
    );
  }

  return (
    <p className="text-sm leading-6 text-[color-mix(in_srgb,var(--foreground)_72%,transparent)]">
      {compact
        ? "Full URL unavailable. Regenerate this group to create a shareable link."
        : "Full URL unavailable for this older invite. Regenerate this group once to create a copyable shareable link."}{" "}
      Invite code: <span className="font-mono text-[var(--foreground)]">{group.inviteCode}</span>
    </p>
  );
}

function CompactPendingAction({
  busy,
  onCancel,
  onConfirm,
  type,
}: {
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  type: "disable" | "regenerate";
}) {
  return (
    <div
      className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--warning)] bg-[color-mix(in_srgb,var(--warning)_12%,var(--surface))] p-3 lg:col-span-5"
      role="alert"
    >
      <p className="font-semibold">
        {type === "regenerate" ? "Regenerate this invite link?" : "Disable this guest group?"}
      </p>
      <p className="text-sm leading-6">
        {type === "regenerate"
          ? "The current invite link will stop working and a fresh copyable URL will be created."
          : "The guest group stays in the list, but private invite access is blocked."}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={busy}
          onClick={onConfirm}
          size="lg"
          type="button"
          variant={type === "disable" ? "destructive" : "default"}
        >
          {busy ? "Working..." : type === "regenerate" ? "Confirm regenerate" : "Confirm disable"}
        </Button>
        <Button onClick={onCancel} size="lg" type="button" variant="outline">
          Cancel
        </Button>
      </div>
    </div>
  );
}

function CompactMobileLabel({ children }: { children: string }) {
  return (
    <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] lg:hidden">
      {children}
    </span>
  );
}

function formatGuestDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
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
      <Input
        aria-label={label}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? true : undefined}
        className="h-10"
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

function triggerBrowserDownload({ blob, filename }: GuestDataExportDownload) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

function readGuestListFilters(): GuestListFilters {
  if (typeof window === "undefined") {
    return defaultGuestListFilters;
  }

  const params = new URLSearchParams(window.location.search);
  const query = params.get("q") ?? "";
  const statusParam = params.get("status");
  const sortParam = params.get("sort");
  const directionParam = params.get("direction");

  return {
    direction: directionParam === "asc" ? "asc" : defaultGuestListFilters.direction,
    query,
    sort: isGuestSortKey(sortParam) ? sortParam : defaultGuestListFilters.sort,
    status: isGuestGroupStatus(statusParam) ? statusParam : defaultGuestListFilters.status,
  };
}

function readGuestViewMode(): GuestViewMode {
  if (typeof window === "undefined") {
    return "cards";
  }

  return new URLSearchParams(window.location.search).get("view") === "list" ? "list" : "cards";
}

function writeGuestViewMode(viewMode: GuestViewMode) {
  if (typeof window === "undefined") {
    return;
  }

  const params = new URLSearchParams(window.location.search);

  if (viewMode === "cards") {
    params.delete("view");
  } else {
    params.set("view", viewMode);
  }

  const queryString = params.toString();
  const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}${window.location.hash}`;
  window.history.replaceState(window.history.state, "", nextUrl);
}

function writeGuestListFilters(filters: GuestListFilters) {
  if (typeof window === "undefined") {
    return;
  }

  const params = new URLSearchParams(window.location.search);

  params.delete("q");
  params.delete("status");
  params.delete("sort");
  params.delete("direction");
  const query = filters.query.trim();

  if (query) {
    params.set("q", query);
  }
  if (filters.status !== defaultGuestListFilters.status) {
    params.set("status", filters.status);
  }
  if (filters.sort !== defaultGuestListFilters.sort) {
    params.set("sort", filters.sort);
  }
  if (filters.direction !== defaultGuestListFilters.direction) {
    params.set("direction", filters.direction);
  }

  const queryString = params.toString();
  const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}${window.location.hash}`;
  window.history.replaceState(window.history.state, "", nextUrl);
}

function areGuestListFiltersDefault(filters: GuestListFilters) {
  return (
    filters.query.trim() === defaultGuestListFilters.query &&
    filters.status === defaultGuestListFilters.status &&
    filters.sort === defaultGuestListFilters.sort &&
    filters.direction === defaultGuestListFilters.direction
  );
}

function filterAndSortGuestGroups(guestGroups: GuestGroup[], filters: GuestListFilters) {
  const query = filters.query.trim().toLocaleLowerCase();
  const filtered = guestGroups.filter((group) => {
    if (filters.status !== "all" && group.status !== filters.status) {
      return false;
    }

    if (!query) {
      return true;
    }

    const searchableText = [
      group.label,
      group.contactName,
      group.contactEmail,
      group.inviteCode,
      ...(group.members?.map((member) => member.name) ?? []),
    ]
      .filter(Boolean)
      .join("\n")
      .toLocaleLowerCase();

    return searchableText.includes(query);
  });

  return [...filtered].sort((left, right) => {
    const primary = compareGuestGroups(left, right, filters.sort);

    if (primary !== 0) {
      return filters.direction === "asc" ? primary : -primary;
    }

    return compareText(left.label, right.label) || compareText(left.id, right.id);
  });
}

function compareGuestGroups(left: GuestGroup, right: GuestGroup, sort: GuestSortKey) {
  switch (sort) {
    case "label":
      return compareText(left.label, right.label);
    case "maxPax":
      return left.maxPax - right.maxPax;
    case "status":
      return guestStatuses.indexOf(left.status) - guestStatuses.indexOf(right.status);
    case "lastOpenedAt":
      return compareNullableDates(left.lastOpenedAt, right.lastOpenedAt);
    case "updatedAt":
      return compareDates(left.updatedAt, right.updatedAt);
    case "createdAt":
    default:
      return compareDates(left.createdAt, right.createdAt);
  }
}

function compareDates(left: string, right: string) {
  return Date.parse(left) - Date.parse(right);
}

function compareNullableDates(left: string | undefined, right: string | undefined) {
  if (!left && !right) {
    return 0;
  }
  if (!left) {
    return 1;
  }
  if (!right) {
    return -1;
  }

  return compareDates(left, right);
}

function compareText(left: string, right: string) {
  return left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" });
}

function isGuestGroupStatus(value: string | null): value is GuestGroupStatus {
  return value !== null && guestStatuses.includes(value as GuestGroupStatus);
}

function isGuestSortKey(value: string | null): value is GuestSortKey {
  return guestSortOptions.some((option) => option.value === value);
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
