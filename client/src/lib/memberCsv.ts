const MEMBER_CSV_COLUMNS = [
  ["Membership ID", "membershipNumber"],
  ["Name", "fullName"],
  ["Phone", "phone"],
  ["Tier", "tier"],
  ["Status", "status"],
  ["Joined", "joinedDate"],
] as const;

function getRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function formatJoinedDate(value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function csvCell(value: unknown, columnKey: string): string {
  let text =
    columnKey === "joinedDate"
      ? formatJoinedDate(value)
      : value === null || value === undefined
        ? ""
        : String(value);

  // Prevent spreadsheet applications from treating untrusted values as formulas.
  if (/^[\s]*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function serializeMembersCsv(members: readonly unknown[]): string {
  const header = MEMBER_CSV_COLUMNS.map(([label]) => csvCell(label, "")).join(",");
  const rows = members.map((member) => {
    const record = getRecord(member);
    return MEMBER_CSV_COLUMNS.map(([, key]) =>
      csvCell(record[key], key),
    ).join(",");
  });
  return [header, ...rows].join("\r\n");
}
