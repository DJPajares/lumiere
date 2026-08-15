import { Button } from "@lumiere/dashboard-ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@lumiere/dashboard-ui/components/dropdown-menu";
import { EllipsisIcon } from "@lumiere/dashboard-ui/components/icons";
import type { GuestGroup } from "@lumiere/types";

import type { InviteShareMethod } from "./guest-share";

export type GuestRowActionHandlers = {
  onCopy: (group: GuestGroup) => void;
  onDisable: (group: GuestGroup) => void;
  onEdit: (group: GuestGroup) => void;
  onMarkSent: (group: GuestGroup) => void;
  onOpen: (group: GuestGroup) => void;
  onReenable: (group: GuestGroup) => void;
  onRegenerate: (group: GuestGroup) => void;
  onShare: (group: GuestGroup, method: InviteShareMethod) => void;
};

/**
 * Share is the single primary invitation action. "Share from device" only appears where
 * the Web Share API exists, so the menu never offers something the browser cannot do.
 */
export function GuestShareMenu({
  canShareFromDevice,
  group,
  handlers,
}: {
  canShareFromDevice: boolean;
  group: GuestGroup;
  handlers: Pick<GuestRowActionHandlers, "onCopy" | "onShare">;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button aria-label={`Share invite for ${group.label}`} size="sm" type="button" />}
      >
        Share
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canShareFromDevice ? (
          <>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => handlers.onShare(group, "native")}>
                Share from device
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handlers.onCopy(group)}>Copy link</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlers.onShare(group, "email")}>
            Email
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlers.onShare(group, "whatsapp")}>
            WhatsApp
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlers.onShare(group, "messenger")}>
            Messenger
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function GuestOverflowMenu({
  busy,
  canEdit,
  canUseInvite,
  group,
  handlers,
}: {
  busy: boolean;
  canEdit: boolean;
  canUseInvite: boolean;
  group: GuestGroup;
  handlers: GuestRowActionHandlers;
}) {
  const isDisabled = group.status === "disabled";

  if (!canEdit && !canUseInvite) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label={`More actions for ${group.label}`}
            size="icon-sm"
            type="button"
            variant="ghost"
          />
        }
      >
        <EllipsisIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          {canEdit ? (
            <DropdownMenuItem onClick={() => handlers.onEdit(group)}>Edit group</DropdownMenuItem>
          ) : null}
          {canUseInvite ? (
            <DropdownMenuItem onClick={() => handlers.onOpen(group)}>Open invite</DropdownMenuItem>
          ) : null}
          {canEdit ? (
            <DropdownMenuItem
              disabled={busy || isDisabled}
              onClick={() => handlers.onMarkSent(group)}
            >
              {group.sendCount ? "Record resend" : "Mark sent"}
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuGroup>
        {canEdit ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                disabled={busy || isDisabled}
                onClick={() => handlers.onRegenerate(group)}
              >
                Reset invite link
              </DropdownMenuItem>
              {isDisabled ? (
                <DropdownMenuItem disabled={busy} onClick={() => handlers.onReenable(group)}>
                  Re-enable invite
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  disabled={busy}
                  onClick={() => handlers.onDisable(group)}
                  variant="destructive"
                >
                  Disable invite
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
