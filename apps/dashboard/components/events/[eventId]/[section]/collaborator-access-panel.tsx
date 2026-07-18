"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@lumiere/dashboard-ui/components/alert-dialog";
import { Badge } from "@lumiere/dashboard-ui/components/badge";
import { Button } from "@lumiere/dashboard-ui/components/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@lumiere/dashboard-ui/components/field";
import { Input } from "@lumiere/dashboard-ui/components/input";
import { Separator } from "@lumiere/dashboard-ui/components/separator";
import { Skeleton } from "@lumiere/dashboard-ui/components/skeleton";
import { toast } from "@lumiere/dashboard-ui/components/sonner";
import type {
  CollaboratorInvitation,
  CollaboratorRole,
  EventCollaborator,
  EventCollaborationResponse,
  ManagerRole,
} from "@lumiere/types";
import { useCallback, useEffect, useState, type FormEvent } from "react";

import { useDashboardAuth } from "../../../../auth/dashboard-auth-provider";
import { DashboardSelect } from "../../../ui/dashboard-fields";
import { ResponsiveModal } from "../../../ui/responsive-modal";
import { toFriendlyApiMessage } from "../../event-basics-form";

type CollaborationState =
  | { data: EventCollaborationResponse; error: null; status: "ready" }
  | { data: null; error: string | null; status: "error" | "loading" };

type PendingAction = { id: string; type: "remove" | "resend" | "revoke" | "role" } | null;

const collaboratorRoleOptions = [
  { label: "Editor", value: "editor" },
  { label: "Viewer", value: "viewer" },
] satisfies Array<{ label: string; value: CollaboratorRole }>;

export function CollaboratorAccessPanel({
  accessRole,
  eventId,
  eventTitle,
}: {
  accessRole: ManagerRole;
  eventId: string;
  eventTitle: string;
}) {
  const { apiClient } = useDashboardAuth();
  const [state, setState] = useState<CollaborationState>({
    data: null,
    error: null,
    status: "loading",
  });
  const [inviteOpen, setInviteOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [pendingRemoval, setPendingRemoval] = useState<EventCollaborator | null>(null);

  const loadCollaboration = useCallback(async () => {
    if (accessRole !== "owner") {
      return;
    }

    if (!apiClient) {
      setState({
        data: null,
        error: "Dashboard API is not configured.",
        status: "error",
      });
      return;
    }

    setState({ data: null, error: null, status: "loading" });

    try {
      const data = await apiClient.listEventCollaboration(eventId);
      setState({ data, error: null, status: "ready" });
    } catch (error) {
      setState({
        data: null,
        error: toFriendlyApiMessage(error),
        status: "error",
      });
    }
  }, [accessRole, apiClient, eventId]);

  useEffect(() => {
    void loadCollaboration();
  }, [loadCollaboration]);

  if (accessRole !== "owner") {
    return (
      <section className="grid gap-3 rounded-[var(--radius-lg)] border border-border bg-card p-5 shadow-sm sm:p-6">
        <div>
          <p className="text-sm font-semibold text-primary">Collaborators & access</p>
          <h2 className="mt-2 text-lg font-semibold">Owner-managed event access</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            Your {formatRole(accessRole).toLowerCase()} access lets you{" "}
            {accessRole === "editor"
              ? "view and update event content, themes, and guests"
              : "review event details, guests, responses, and activity"}
            . Only the event owner can invite people, change roles, or remove collaborators.
          </p>
        </div>
        <Badge className="w-fit" variant="secondary">
          {formatRole(accessRole)} access
        </Badge>
      </section>
    );
  }

  const replaceInvitation = (invitation: CollaboratorInvitation) => {
    setState((current) =>
      current.status === "ready"
        ? {
            ...current,
            data: {
              ...current.data,
              invitations: current.data.invitations.map((item) =>
                item.id === invitation.id ? invitation : item,
              ),
            },
          }
        : current,
    );
  };

  const resendInvitation = async (invitation: CollaboratorInvitation) => {
    if (!apiClient) return;
    setPendingAction({ id: invitation.id, type: "resend" });

    try {
      const response = await apiClient.resendCollaboratorInvitation(eventId, invitation.id);
      replaceInvitation(response.invitation);
      toast.success(`Invitation for ${invitation.email} was refreshed.`);
    } catch (error) {
      toast.error(toFriendlyApiMessage(error));
    } finally {
      setPendingAction(null);
    }
  };

  const revokeInvitation = async (invitation: CollaboratorInvitation) => {
    if (!apiClient) return;
    setPendingAction({ id: invitation.id, type: "revoke" });

    try {
      const response = await apiClient.revokeCollaboratorInvitation(eventId, invitation.id);
      replaceInvitation(response.invitation);
      toast.success(`Invitation for ${invitation.email} was revoked.`);
    } catch (error) {
      toast.error(toFriendlyApiMessage(error));
    } finally {
      setPendingAction(null);
    }
  };

  const updateRole = async (collaborator: EventCollaborator, role: CollaboratorRole) => {
    if (!apiClient || collaborator.role === role) return;
    setPendingAction({ id: collaborator.userId, type: "role" });

    try {
      const response = await apiClient.updateEventCollaboratorRole(eventId, collaborator.userId, {
        role,
      });
      setState((current) =>
        current.status === "ready"
          ? {
              ...current,
              data: {
                ...current.data,
                collaborators: current.data.collaborators.map((item) =>
                  item.userId === collaborator.userId ? response.collaborator : item,
                ),
              },
            }
          : current,
      );
      toast.success(`${collaborator.email} is now a ${role}.`);
    } catch (error) {
      toast.error(toFriendlyApiMessage(error));
    } finally {
      setPendingAction(null);
    }
  };

  const removeCollaborator = async () => {
    if (!apiClient || !pendingRemoval) return;
    const collaborator = pendingRemoval;
    setPendingAction({ id: collaborator.userId, type: "remove" });

    try {
      await apiClient.removeEventCollaborator(eventId, collaborator.userId);
      setState((current) =>
        current.status === "ready"
          ? {
              ...current,
              data: {
                ...current.data,
                collaborators: current.data.collaborators.filter(
                  (item) => item.userId !== collaborator.userId,
                ),
              },
            }
          : current,
      );
      setPendingRemoval(null);
      toast.success(`${collaborator.email} no longer has access.`);
    } catch (error) {
      toast.error(toFriendlyApiMessage(error));
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <>
      <section className="grid gap-5 rounded-[var(--radius-lg)] border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">Collaborators & access</p>
            <h2 className="mt-2 text-lg font-semibold">Manage event collaborators</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Editors can update the event. Viewers can review event data without making changes.
              The owner remains the only event administrator.
            </p>
          </div>
          <Button className="w-fit" onClick={() => setInviteOpen(true)}>
            Invite collaborator
          </Button>
        </div>

        {state.status === "loading" ? (
          <CollaborationLoading />
        ) : state.status === "error" ? (
          <div className="grid justify-items-start gap-3" role="alert">
            <p className="text-sm text-destructive">{state.error}</p>
            <Button onClick={() => void loadCollaboration()} variant="outline">
              Try again
            </Button>
          </div>
        ) : state.status === "ready" ? (
          <CollaborationLists
            data={state.data}
            eventTitle={eventTitle}
            onRemove={setPendingRemoval}
            onResend={(invitation) => void resendInvitation(invitation)}
            onRevoke={(invitation) => void revokeInvitation(invitation)}
            onRoleChange={(collaborator, role) => void updateRole(collaborator, role)}
            pendingAction={pendingAction}
          />
        ) : null}
      </section>

      <InviteCollaboratorModal
        eventId={eventId}
        eventTitle={eventTitle}
        onInvited={(invitation) => {
          setState((current) =>
            current.status === "ready"
              ? {
                  ...current,
                  data: {
                    ...current.data,
                    invitations: [invitation, ...current.data.invitations],
                  },
                }
              : current,
          );
        }}
        onOpenChange={setInviteOpen}
        open={inviteOpen}
      />

      <AlertDialog
        open={Boolean(pendingRemoval)}
        onOpenChange={(open) => {
          if (!open && pendingAction?.type !== "remove") setPendingRemoval(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove collaborator access?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingRemoval?.email} will immediately lose access to {eventTitle}. Their previous
              event activity remains in the audit timeline.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pendingAction?.type === "remove"}>
              Keep access
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={pendingAction?.type === "remove"}
              onClick={() => void removeCollaborator()}
              variant="destructive"
            >
              {pendingAction?.type === "remove" ? "Removing..." : "Remove access"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function CollaborationLists({
  data,
  eventTitle,
  onRemove,
  onResend,
  onRevoke,
  onRoleChange,
  pendingAction,
}: {
  data: EventCollaborationResponse;
  eventTitle: string;
  onRemove: (collaborator: EventCollaborator) => void;
  onResend: (invitation: CollaboratorInvitation) => void;
  onRevoke: (invitation: CollaboratorInvitation) => void;
  onRoleChange: (collaborator: EventCollaborator, role: CollaboratorRole) => void;
  pendingAction: PendingAction;
}) {
  const pendingInvitations = data.invitations.filter((invitation) =>
    ["expired", "pending"].includes(invitation.status),
  );

  return (
    <div className="grid gap-5">
      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">People with access</h3>
          <Badge variant="secondary">{data.collaborators.length}</Badge>
        </div>
        {data.collaborators.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            The owner membership is being prepared. Refresh to check again.
          </p>
        ) : (
          <div className="overflow-hidden rounded-[var(--radius-md)] border border-border">
            {data.collaborators.map((collaborator, index) => {
              const isOwner = collaborator.role === "owner";
              const isUpdating =
                pendingAction?.id === collaborator.userId &&
                ["remove", "role"].includes(pendingAction.type);

              return (
                <div key={collaborator.id}>
                  {index > 0 ? <Separator /> : null}
                  <div className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_10rem_auto] md:items-center">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {collaborator.displayName || collaborator.email}
                      </p>
                      {collaborator.displayName ? (
                        <p className="truncate text-sm text-muted-foreground">
                          {collaborator.email}
                        </p>
                      ) : null}
                    </div>
                    {isOwner ? (
                      <Badge className="w-fit" variant="outline">
                        Owner
                      </Badge>
                    ) : (
                      <DashboardSelect
                        disabled={isUpdating}
                        label={<span className="sr-only">Role for {collaborator.email}</span>}
                        onValueChange={(value) =>
                          onRoleChange(collaborator, value as CollaboratorRole)
                        }
                        options={collaboratorRoleOptions}
                        value={collaborator.role}
                      />
                    )}
                    <div className="flex justify-end">
                      {isOwner ? (
                        <span className="text-xs text-muted-foreground">Event administrator</span>
                      ) : (
                        <Button
                          aria-label={`Remove ${collaborator.email} from ${eventTitle}`}
                          disabled={isUpdating}
                          onClick={() => onRemove(collaborator)}
                          size="sm"
                          variant="outline"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">Invitations</h3>
          <Badge variant="secondary">{pendingInvitations.length}</Badge>
        </div>
        {pendingInvitations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No open invitations.</p>
        ) : (
          <div className="overflow-hidden rounded-[var(--radius-md)] border border-border">
            {pendingInvitations.map((invitation, index) => {
              const isBusy = pendingAction?.id === invitation.id;

              return (
                <div key={invitation.id}>
                  {index > 0 ? <Separator /> : null}
                  <div className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{invitation.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatRole(invitation.role)} ·{" "}
                        {invitation.status === "expired"
                          ? "Expired"
                          : `Expires ${formatInvitationDate(invitation.expiresAt)}`}
                      </p>
                    </div>
                    <Button
                      disabled={isBusy}
                      onClick={() => onResend(invitation)}
                      size="sm"
                      variant="outline"
                    >
                      {pendingAction?.id === invitation.id && pendingAction.type === "resend"
                        ? "Refreshing..."
                        : invitation.status === "expired"
                          ? "Renew"
                          : "Resend"}
                    </Button>
                    <Button
                      disabled={isBusy || invitation.status === "expired"}
                      onClick={() => onRevoke(invitation)}
                      size="sm"
                      variant="ghost"
                    >
                      {pendingAction?.id === invitation.id && pendingAction.type === "revoke"
                        ? "Revoking..."
                        : "Revoke"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function InviteCollaboratorModal({
  eventId,
  eventTitle,
  onInvited,
  onOpenChange,
  open,
}: {
  eventId: string;
  eventTitle: string;
  onInvited: (invitation: CollaboratorInvitation) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const { apiClient } = useDashboardAuth();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<CollaboratorRole>("editor");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setEmail("");
      setRole("editor");
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  const submit = async (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();

    if (!apiClient) {
      setError("Dashboard API is not configured.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const response = await apiClient.inviteEventCollaborator(eventId, { email, role });
      onInvited(response.invitation);
      onOpenChange(false);
      toast.success(`Invitation created for ${response.invitation.email}.`);
    } catch (requestError) {
      const message = toFriendlyApiMessage(requestError);
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ResponsiveModal
      contentClassName="sm:max-w-xl"
      description={`Give another manager access to ${eventTitle}.`}
      dirty={email.length > 0}
      onOpenChange={onOpenChange}
      open={open}
      title="Invite collaborator"
    >
      {({ requestClose }) => (
        <form className="flex flex-col gap-5" onSubmit={submit}>
          <FieldGroup>
            <Field data-invalid={Boolean(error)}>
              <FieldLabel htmlFor="collaborator-email">Email address</FieldLabel>
              <Input
                aria-invalid={Boolean(error)}
                autoComplete="email"
                autoFocus
                disabled={submitting}
                id="collaborator-email"
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError(null);
                }}
                placeholder="manager@example.com"
                required
                type="email"
                value={email}
              />
              <FieldDescription>
                The invitation appears on the dashboard home for a signed-in user with this email.
              </FieldDescription>
              <FieldError>{error}</FieldError>
            </Field>
            <DashboardSelect
              description={
                role === "editor"
                  ? "Editors can update event details, content, themes, and guests."
                  : "Viewers can review event data but cannot make event changes."
              }
              disabled={submitting}
              label="Access role"
              onValueChange={(value) => setRole(value as CollaboratorRole)}
              options={collaboratorRoleOptions}
              value={role}
            />
          </FieldGroup>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button disabled={submitting} onClick={requestClose} type="button" variant="outline">
              Cancel
            </Button>
            <Button disabled={submitting || email.trim().length === 0} type="submit">
              {submitting ? "Creating invitation..." : "Create invitation"}
            </Button>
          </div>
        </form>
      )}
    </ResponsiveModal>
  );
}

function CollaborationLoading() {
  return (
    <div aria-label="Loading collaborators" aria-live="polite" className="grid gap-3">
      <Skeleton className="h-20 rounded-[var(--radius-md)] motion-reduce:animate-none" />
      <Skeleton className="h-20 rounded-[var(--radius-md)] motion-reduce:animate-none" />
    </div>
  );
}

function formatRole(role: ManagerRole) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function formatInvitationDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
