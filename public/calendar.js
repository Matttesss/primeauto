export function escapeICS(text) {
  return String(text)
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}
export function foldICS(line) {
  const encoder = new TextEncoder();
  let current = "",
    size = 0,
    lines = [];
  for (const char of line) {
    const length = encoder.encode(char).length;
    if (size + length > 75) {
      lines.push(current);
      current = " ";
      size = 1;
    }
    current += char;
    size += length;
  }
  lines.push(current);
  return lines.join("\r\n");
}
export function createCalendar(events, now = Date.now(), name = "Prime Auto") {
  const stamp = (t) =>
    new Date(t)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Prime Auto//Bookings//CS",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${escapeICS(name)}`,
    ...events.flatMap((e) => [
      "BEGIN:VEVENT",
      `UID:${e.id}@primeauto`,
      `DTSTAMP:${stamp(e.created || now)}`,
      `DTSTART:${stamp(e.start)}`,
      `DTEND:${stamp(e.end)}`,
      `SUMMARY:${escapeICS(e.summary || "Obsazeno – detailing")}`,
      ...(e.description ? [`DESCRIPTION:${escapeICS(e.description)}`] : []),
      "CLASS:PRIVATE",
      "TRANSP:OPAQUE",
      "END:VEVENT",
    ]),
    "END:VCALENDAR",
    "",
  ]
    .map(foldICS)
    .join("\r\n");
}
