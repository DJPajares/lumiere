import type { Database } from "@lumiere/db";
import {
  activityEvents,
  and,
  asc,
  eq,
  guestGroupMembers,
  guestGroups,
  ilike,
  inArray,
  isNull,
  or,
  rsvpResponses,
  sql,
} from "@lumiere/db";
import {
  resolveGuestInviteTrackingStage,
  type GuestDataExportFormat,
  type GuestDataExportScope,
  type GuestGroupStatus,
  type GuestInviteTrackingStage,
  type RsvpAnswer,
  type RsvpStatus,
} from "@lumiere/types";
import ExcelJS from "exceljs";

import { ApiHttpError } from "./errors";

export const guestDataExportRowLimit = 10_000;

export type GuestDataExportFilters = {
  invitedBy?: string;
  query?: string;
  status?: GuestGroupStatus;
  tracking?: GuestInviteTrackingStage;
};

/** Sentinel matching the dashboard's "Not set" invited-by filter. */
export const guestDataExportUnassignedInvitedBy = "none";

export type GuestDataExportOptions = {
  filters: GuestDataExportFilters;
  format: GuestDataExportFormat;
  scope: GuestDataExportScope;
};

export type GuestDataExportRow = {
  name: string;
  groupLabel: string;
  invitedBy: string;
  rsvpStatus: string;
  onGuestList: string;
  inviteStatus: string;
  trackingStage: string;
  contactName: string;
  contactEmail: string;
  firstSentAt: string;
  lastSentAt: string;
  sendCount: number;
  lastShareChannel: string;
  firstOpenedAt: string;
  lastOpenedAt: string;
  maxPax: number;
  attendingPax: number | "";
  rsvpAnswers: string;
  guestMessage: string;
  privateNotes: string;
  rsvpSubmittedAt: string;
  rsvpUpdatedAt: string;
  groupCreatedAt: string;
  groupUpdatedAt: string;
};

export type GuestDataExportStore = {
  listRows(eventId: string, filters: GuestDataExportFilters): Promise<GuestDataExportRow[]>;
  recordExport(input: {
    actorUserId: string;
    eventId: string;
    format: GuestDataExportFormat;
    rowCount: number;
    scope: GuestDataExportScope;
    usedQueryFilter: boolean;
    usedStatusFilter: boolean;
    usedTrackingFilter: boolean;
  }): Promise<void>;
};

const exportColumns = [
  { header: "Name", key: "name", width: 24 },
  { header: "Group", key: "groupLabel", width: 24 },
  { header: "Invited by", key: "invitedBy", width: 22 },
  { header: "RSVP status", key: "rsvpStatus", width: 16 },
  { header: "On guest list", key: "onGuestList", width: 14 },
  { header: "Invite status", key: "inviteStatus", width: 16 },
  { header: "Tracking stage", key: "trackingStage", width: 18 },
  { header: "Contact name", key: "contactName", width: 22 },
  { header: "Contact email", key: "contactEmail", width: 30 },
  { header: "First marked sent at", key: "firstSentAt", width: 24 },
  { header: "Last marked sent at", key: "lastSentAt", width: 24 },
  { header: "Send count", key: "sendCount", width: 12 },
  { header: "Last share channel", key: "lastShareChannel", width: 20 },
  { header: "First opened at", key: "firstOpenedAt", width: 24 },
  { header: "Last opened at", key: "lastOpenedAt", width: 24 },
  { header: "Max pax", key: "maxPax", width: 11 },
  { header: "Attending pax", key: "attendingPax", width: 14 },
  { header: "RSVP answers", key: "rsvpAnswers", width: 36 },
  { header: "Guest message", key: "guestMessage", width: 36 },
  { header: "Private notes", key: "privateNotes", width: 36 },
  { header: "RSVP submitted at", key: "rsvpSubmittedAt", width: 24 },
  { header: "RSVP updated at", key: "rsvpUpdatedAt", width: 24 },
  { header: "Group created at", key: "groupCreatedAt", width: 24 },
  { header: "Group updated at", key: "groupUpdatedAt", width: 24 },
] as const satisfies ReadonlyArray<{
  header: string;
  key: keyof GuestDataExportRow;
  width: number;
}>;

export const createDrizzleGuestDataExportStore = (db: Database): GuestDataExportStore => ({
  async listRows(eventId, filters) {
    const conditions = [eq(guestGroups.eventId, eventId)];
    const normalizedQuery = filters.query?.trim();

    if (filters.status) {
      conditions.push(eq(guestGroups.status, filters.status));
    }

    if (filters.tracking) {
      conditions.push(trackingStageCondition(filters.tracking));
    }

    const normalizedInvitedBy = filters.invitedBy?.trim();

    if (normalizedInvitedBy === guestDataExportUnassignedInvitedBy) {
      conditions.push(isNull(guestGroups.invitedBy));
    } else if (normalizedInvitedBy) {
      conditions.push(eq(guestGroups.invitedBy, normalizedInvitedBy));
    }

    if (normalizedQuery) {
      const pattern = `%${escapeLikePattern(normalizedQuery)}%`;
      const searchCondition = or(
        ilike(guestGroups.label, pattern),
        ilike(guestGroups.contactName, pattern),
        ilike(guestGroups.contactEmail, pattern),
        ilike(guestGroups.invitedBy, pattern),
        ilike(guestGroups.inviteCode, pattern),
        sql`exists (
          select 1
          from ${guestGroupMembers}
          where ${guestGroupMembers.guestGroupId} = ${guestGroups.id}
            and ${guestGroupMembers.name} ilike ${pattern}
        )`,
      );

      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    const groupRows = await db
      .select({
        contactEmail: guestGroups.contactEmail,
        contactName: guestGroups.contactName,
        createdAt: guestGroups.createdAt,
        id: guestGroups.id,
        invitedBy: guestGroups.invitedBy,
        label: guestGroups.label,
        firstOpenedAt: guestGroups.firstOpenedAt,
        firstSentAt: guestGroups.firstSentAt,
        lastOpenedAt: guestGroups.lastOpenedAt,
        lastSentAt: guestGroups.lastSentAt,
        lastShareChannel: guestGroups.lastShareChannel,
        maxPax: guestGroups.maxPax,
        notes: guestGroups.notes,
        sendCount: guestGroups.sendCount,
        status: guestGroups.status,
        updatedAt: guestGroups.updatedAt,
      })
      .from(guestGroups)
      .where(and(...conditions))
      .orderBy(asc(guestGroups.createdAt), asc(guestGroups.id))
      .limit(guestDataExportRowLimit + 1);

    if (groupRows.length > guestDataExportRowLimit) {
      throw new ApiHttpError(
        "VALIDATION_ERROR",
        `Guest exports are limited to ${guestDataExportRowLimit.toLocaleString("en-US")} rows. Apply guest filters and try again.`,
      );
    }

    const groupIds = groupRows.map((group) => group.id);
    const [memberRows, responseRows] =
      groupIds.length === 0
        ? [[], []]
        : await Promise.all([
            db
              .select({
                guestGroupId: guestGroupMembers.guestGroupId,
                name: guestGroupMembers.name,
              })
              .from(guestGroupMembers)
              .where(inArray(guestGroupMembers.guestGroupId, groupIds))
              .orderBy(
                asc(guestGroupMembers.guestGroupId),
                asc(guestGroupMembers.sortOrder),
                asc(guestGroupMembers.createdAt),
              ),
            db
              .select({
                answers: rsvpResponses.answersJson,
                attendeeCount: rsvpResponses.attendeeCount,
                guestGroupId: rsvpResponses.guestGroupId,
                guestNames: rsvpResponses.guestNamesJson,
                message: rsvpResponses.message,
                responseStatus: rsvpResponses.responseStatus,
                submittedAt: rsvpResponses.submittedAt,
                updatedAt: rsvpResponses.updatedAt,
              })
              .from(rsvpResponses)
              .where(inArray(rsvpResponses.guestGroupId, groupIds)),
          ]);
    const membersByGroupId = new Map<string, string[]>();

    for (const member of memberRows) {
      const names = membersByGroupId.get(member.guestGroupId) ?? [];
      names.push(member.name);
      membersByGroupId.set(member.guestGroupId, names);
    }

    const responsesByGroupId = new Map(
      responseRows.map((response) => [response.guestGroupId, response] as const),
    );

    return groupRows.flatMap((group) => {
      const response = responsesByGroupId.get(group.id);
      const members = membersByGroupId.get(group.id) ?? [];
      const groupFields: Omit<GuestDataExportRow, "name" | "onGuestList" | "rsvpStatus"> = {
        attendingPax: response?.attendeeCount ?? "",
        contactEmail: group.contactEmail ?? "",
        contactName: group.contactName ?? "",
        groupCreatedAt: group.createdAt,
        groupLabel: group.label,
        groupUpdatedAt: group.updatedAt,
        guestMessage: response?.message ?? "",
        firstOpenedAt: group.firstOpenedAt ?? "",
        firstSentAt: group.firstSentAt ?? "",
        invitedBy: group.invitedBy ?? "",
        inviteStatus: group.status,
        lastOpenedAt: group.lastOpenedAt ?? "",
        lastSentAt: group.lastSentAt ?? "",
        lastShareChannel: group.lastShareChannel ?? "",
        maxPax: group.maxPax,
        privateNotes: group.notes ?? "",
        sendCount: group.sendCount,
        rsvpAnswers: formatRsvpAnswers(response?.answers ?? []),
        rsvpSubmittedAt: response?.submittedAt ?? "",
        rsvpUpdatedAt: response?.updatedAt ?? "",
        trackingStage: resolveGuestInviteTrackingStage({
          firstOpenedAt: group.firstOpenedAt ?? undefined,
          firstSentAt: group.firstSentAt ?? undefined,
          lastOpenedAt: group.lastOpenedAt ?? undefined,
          lastSentAt: group.lastSentAt ?? undefined,
          sendCount: group.sendCount,
          status: group.status,
        }),
      };

      return resolvePersonRows({ group, members, response }).map((person) =>
        sanitizeGuestDataExportRow({
          ...groupFields,
          name: person.name,
          onGuestList: person.onGuestList ? "Yes" : "No",
          rsvpStatus: formatPersonRsvpStatus(person.rsvpStatus),
        }),
      );
    });
  },

  async recordExport(input) {
    await db.insert(activityEvents).values({
      actorId: input.actorUserId,
      actorType: "manager",
      activityType: "guest_data_exported",
      eventId: input.eventId,
      metadataJson: {
        format: input.format,
        rowCount: input.rowCount,
        scope: input.scope,
        usedQueryFilter: input.usedQueryFilter,
        usedStatusFilter: input.usedStatusFilter,
        usedTrackingFilter: input.usedTrackingFilter,
      },
    });
  },
});

const trackingStageCondition = (tracking: GuestInviteTrackingStage) => {
  const hasResponse = sql`${guestGroups.status} in ('responded', 'declined')`;
  const hasOpen = sql`(${guestGroups.firstOpenedAt} is not null or ${guestGroups.lastOpenedAt} is not null)`;
  const hasSend = sql`(${guestGroups.firstSentAt} is not null or ${guestGroups.lastSentAt} is not null or ${guestGroups.sendCount} > 0)`;

  switch (tracking) {
    case "responded":
      return hasResponse;
    case "opened":
      return sql`not (${hasResponse}) and (${hasOpen})`;
    case "sent":
      return sql`not (${hasResponse}) and not (${hasOpen}) and (${hasSend})`;
    case "not_sent":
      return sql`not (${hasResponse}) and not (${hasOpen}) and not (${hasSend})`;
  }
};

export const buildGuestDataCsv = (rows: GuestDataExportRow[]) => {
  const lines = [
    exportColumns.map((column) => escapeCsvCell(column.header)).join(","),
    ...rows.map((row) => exportColumns.map((column) => escapeCsvCell(row[column.key])).join(",")),
  ];

  return `\uFEFF${lines.join("\r\n")}\r\n`;
};

export const buildGuestDataXlsx = async (rows: GuestDataExportRow[]) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Guest data", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  workbook.creator = "Lumiere";
  workbook.created = new Date();
  worksheet.columns = exportColumns.map((column) => ({
    header: column.header,
    key: column.key,
    width: column.width,
  }));
  worksheet.autoFilter = {
    from: "A1",
    to: `${toExcelColumnName(exportColumns.length)}1`,
  };
  worksheet.addRows(rows.map(sanitizeGuestDataExportRow));

  const header = worksheet.getRow(1);
  header.font = { bold: true };
  header.alignment = { vertical: "middle" };
  header.height = 24;
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.alignment = { vertical: "top", wrapText: true };
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};

export const buildGuestDataExportFilename = (
  eventSlug: string,
  format: GuestDataExportFormat,
  now = new Date(),
) => {
  const date = now.toISOString().slice(0, 10);
  const safeSlug = eventSlug
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${safeSlug || "event"}-guest-data-${date}.${format}`;
};

export const sanitizeSpreadsheetText = (value: string) =>
  /^[\t\r\n ]*[=+\-@]/.test(value) ? `'${value}` : value;

const sanitizeGuestDataExportRow = (row: GuestDataExportRow): GuestDataExportRow =>
  Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key,
      typeof value === "string" ? sanitizeSpreadsheetText(value) : value,
    ]),
  ) as GuestDataExportRow;

const escapeCsvCell = (value: number | string) => {
  const safeValue = typeof value === "string" ? sanitizeSpreadsheetText(value) : value;
  return `"${String(safeValue).replaceAll('"', '""')}"`;
};

const escapeLikePattern = (value: string) => value.replace(/[\\%_]/g, "\\$&");

type ExportPersonRow = {
  name: string;
  onGuestList: boolean;
  rsvpStatus: "attending" | "awaiting" | "maybe" | "not_attending";
};

/**
 * A group's RSVP does not always match its RSVP response row: resetting an invite link
 * puts the group back to pending/opened while leaving the old response in place, and
 * that stale response must never read as the group's current answer.
 */
const resolveGroupRsvpStatus = (
  group: { status: GuestGroupStatus },
  response: { responseStatus: RsvpStatus } | undefined,
): "attending" | "awaiting" | "maybe" | "not_attending" => {
  if (group.status === "pending" || group.status === "opened") {
    return "awaiting";
  }

  if (response) {
    return response.responseStatus;
  }

  return group.status === "declined" ? "not_attending" : "awaiting";
};

/**
 * Flattens one guest group into one row per named guest, mirroring the dashboard's
 * per-person view: named members whose seat was not claimed in an attending response
 * read as not attending, and RSVP names that are not on the guest list still get a row
 * of their own. A group with nobody named contributes a single row standing in for the
 * whole household.
 */
const resolvePersonRows = ({
  group,
  members,
  response,
}: {
  group: { contactName: string | null; label: string; status: GuestGroupStatus };
  members: string[];
  response: { guestNames: string[]; responseStatus: RsvpStatus } | undefined;
}): ExportPersonRow[] => {
  const groupRsvp = resolveGroupRsvpStatus(group, response);
  const attendingNames = new Set(
    groupRsvp === "attending" ? (response?.guestNames ?? []).map(normalizeGuestName) : [],
  );
  const attributesAttendance = groupRsvp === "attending" && attendingNames.size > 0;

  const memberRows: ExportPersonRow[] = members.map((name) => ({
    name,
    onGuestList: true,
    rsvpStatus: attributesAttendance
      ? attendingNames.has(normalizeGuestName(name))
        ? "attending"
        : "not_attending"
      : groupRsvp,
  }));

  const memberNames = new Set(members.map(normalizeGuestName));
  const legacyRows: ExportPersonRow[] = (response?.guestNames ?? [])
    .filter((name) => !memberNames.has(normalizeGuestName(name)))
    .map((name) => ({ name, onGuestList: false, rsvpStatus: groupRsvp }));

  if (memberRows.length === 0 && legacyRows.length === 0) {
    return [{ name: group.contactName || group.label, onGuestList: false, rsvpStatus: groupRsvp }];
  }

  return [...memberRows, ...legacyRows];
};

const normalizeGuestName = (name: string) => name.trim().toLocaleLowerCase();

const formatPersonRsvpStatus = (status: ExportPersonRow["rsvpStatus"]) => {
  if (status === "not_attending") return "Not attending";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const formatRsvpAnswers = (answers: RsvpAnswer[]) =>
  answers
    .map((answer) => `${answer.questionKey}: ${formatRsvpAnswerValue(answer.value)}`)
    .join("\n");

const formatRsvpAnswerValue = (value: RsvpAnswer["value"]) =>
  Array.isArray(value) ? value.join("; ") : String(value);

const toExcelColumnName = (columnCount: number) => {
  let value = columnCount;
  let name = "";

  while (value > 0) {
    value -= 1;
    name = String.fromCharCode(65 + (value % 26)) + name;
    value = Math.floor(value / 26);
  }

  return name;
};
