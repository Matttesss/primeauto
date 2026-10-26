import test from "node:test";
import assert from "node:assert/strict";
import { createCalendar, escapeICS } from "../public/calendar.js";
test("ICS folds UTF-8 by octets, escapes injected delimiters and preserves event boundaries", () => {
  const calendar = createCalendar(
    [
      {
        id: "safe",
        start: Date.parse("2026-10-27T07:00:00Z"),
        end: Date.parse("2026-10-27T12:00:00Z"),
        summary: "Příliš žluťoučký kůň ".repeat(15) + "\nEND:VEVENT,;\\",
        description: "Řádek 1\r\nŘádek 2",
      },
    ],
    Date.parse("2026-10-26T07:00:00Z"),
  );
  for (const line of calendar.split("\r\n"))
    assert.ok(Buffer.byteLength(line) <= 75);
  assert.equal((calendar.match(/\r\nEND:VEVENT\r\n/g) || []).length, 1);
  assert.ok(calendar.replace(/\r\n /g, "").includes("\\nEND:VEVENT\\,\\;\\\\"));
  assert.equal(escapeICS("a\nb,c;d\\e"), "a\\nb\\,c\\;d\\\\e");
});
