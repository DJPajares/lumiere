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
} from "@lumiere/types";
import ExcelJS from "exceljs";

import { ApiHttpError } from "./errors";

export const guestDataExportRowLimit = 10_000;

export type GuestDataExportFilters = {
  query?: string;
  status?: GuestGroupStatus;
  tracking?: GuestInviteTrackingStage;
};

export type GuestDataExportOptions = {
  filters: GuestDataExportFilters;
  format: GuestDataExportFormat;
  scope: GuestDataExportScope;
};

export type GuestDataExportRow = {
  groupLabel: string;
  contactName: string;
  contactEmail: string;
  inviteStatus: string;
  trackingStage: string;
  firstSentAt: string;
  lastSentAt: string;
  sendCount: number;
  lastShareChannel: string;
  firstOpenedAt: string;
  lastOpenedAt: string;
  maxPax: number;
  namedMembers: string;
  rsvpStatus: string;
  attendingPax: number | "";
  selectedAttendees: string;
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
  { header: "Group label", key: "groupLabel", width: 24 },
  { header: "Contact name", key: "contactName", width: 22 },
  { header: "Contact email", key: "contactEmail", width: 30 },
  { header: "Invite status", key: "inviteStatus", width: 16 },
  { header: "Tracking stage", key: "trackingStage", width: 18 },
  { header: "First marked sent at", key: "firstSentAt", width: 24 },
  { header: "Last marked sent at", key: "lastSentAt", width: 24 },
  { header: "Send count", key: "sendCount", width: 12 },
  { header: "Last share channel", key: "lastShareChannel", width: 20 },
  { header: "First opened at", key: "firstOpenedAt", width: 24 },
  { header: "Last opened at", key: "lastOpenedAt", width: 24 },
  { header: "Max pax", key: "maxPax", width: 11 },
  { header: "Named members", key: "namedMembers", width: 32 },
  { header: "RSVP status", key: "rsvpStatus", width: 16 },
  { header: "Attending pax", key: "attendingPax", width: 14 },
  { header: "Selected attendees", key: "selectedAttendees", width: 32 },
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

    if (normalizedQuery) {
      const pattern = `%${escapeLikePattern(normalizedQuery)}%`;
      const searchCondition = or(
        ilike(guestGroups.label, pattern),
        ilike(guestGroups.contactName, pattern),
        ilike(guestGroups.contactEmail, pattern),
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

    return groupRows.map((group) => {
      const response = responsesByGroupId.get(group.id);

      return sanitizeGuestDataExportRow({
        attendingPax: response?.attendeeCount ?? "",
        contactEmail: group.contactEmail ?? "",
        contactName: group.contactName ?? "",
        groupCreatedAt: group.createdAt,
        groupLabel: group.label,
        groupUpdatedAt: group.updatedAt,
        guestMessage: response?.message ?? "",
        firstOpenedAt: group.firstOpenedAt ?? "",
        firstSentAt: group.firstSentAt ?? "",
        inviteStatus: group.status,
        lastOpenedAt: group.lastOpenedAt ?? "",
        lastSentAt: group.lastSentAt ?? "",
        lastShareChannel: group.lastShareChannel ?? "",
        maxPax: group.maxPax,
        namedMembers: joinNames(membersByGroupId.get(group.id) ?? []),
        privateNotes: group.notes ?? "",
        sendCount: group.sendCount,
        rsvpAnswers: formatRsvpAnswers(response?.answers ?? []),
        rsvpStatus: response?.responseStatus ?? "No response",
        rsvpSubmittedAt: response?.submittedAt ?? "",
        rsvpUpdatedAt: response?.updatedAt ?? "",
        selectedAttendees: joinNames(response?.guestNames ?? []),
        trackingStage: resolveGuestInviteTrackingStage({
          firstOpenedAt: group.firstOpenedAt ?? undefined,
          firstSentAt: group.firstSentAt ?? undefined,
          lastOpenedAt: group.lastOpenedAt ?? undefined,
          lastSentAt: group.lastSentAt ?? undefined,
          sendCount: group.sendCount,
          status: group.status,
        }),
      });
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

const joinNames = (names: string[]) => names.join("\n");

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
