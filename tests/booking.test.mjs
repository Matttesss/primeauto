import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createBooking, quote, instant } from "../booking.mjs";
const NOW = Date.parse("2026-10-26T06:00:00Z");
const contacts = {
  name: "Test zákazník",
  phone: "+420 777 111 222",
  email: "test@example.com",
  acceptedTerms: true,
  earlyStart: true,
};
function fixture() {
  const dir = mkdtempSync(join(tmpdir(), "primeauto-test-"));
  const path = join(dir, "db.sqlite");
  const api = createBooking({ dbPath: path, now: () => NOW });
  return {
    api,
    path,
    done() {
      api.close();
      rmSync(dir, { recursive: true, force: true });
    },
  };
}
const vehicle = (time = "08:00", extra = {}) => ({
  vehicle: "BMW E60",
  date: "2026-10-27",
  time,
  services: ["interier"],
  transport: false,
  ...extra,
});
test("all seven non-empty combinations have one energy fee and fixed 5/7-hour duration", () => {
  const keys = ["interier", "exterier", "motor"];
  for (let mask = 1; mask < 8; mask++) {
    const choices = keys.filter((_, i) => mask & (1 << i));
    const q = quote(choices);
    assert.equal(
      q.total,
      choices.reduce(
        (sum, k) => sum + { interier: 3990, exterier: 1990, motor: 990 }[k],
        1530,
      ),
    );
    assert.equal(q.duration, 300);
    assert.equal(quote(choices, true).duration, 420);
  }
  assert.equal(quote(keys).total, 8500);
  assert.throws(() => quote([]));
  assert.throws(() => quote(["motor", "motor"]));
  assert.throws(() => quote(["__proto__"]));
});
test("Monday-Saturday 08-20, 30 minute slots, Sunday closed and no late finishes", () => {
  const f = fixture();
  try {
    const day = f.api.availability("2026-10-27", ["interier"]);
    assert.equal(day.slots[0].time, "08:00");
    assert.equal(day.slots.at(-1).time, "15:00");
    assert.equal(day.slots.at(-1).endTime, "20:00");
    assert.equal(f.api.availability("2026-10-31", ["motor"]).slots.length, 15);
    assert.deepEqual(f.api.availability("2026-11-01", ["motor"]).slots, []);
    const transport = f.api.availability("2026-10-27", ["interier"], true);
    assert.equal(transport.slots.at(-1).time, "13:00");
    assert.equal(transport.slots[0].endTime, "15:00");
    assert.deepEqual(f.api.availability("2026-10-25", ["motor"]).slots, []);
    assert.throws(() => f.api.availability("2026-99-99", ["motor"]), {
      status: 400,
    });
  } finally {
    f.done();
  }
});
test("two cars reserve atomically, block separate intervals and survive database reopening", () => {
  const f = fixture();
  try {
    const result = f.api.reserve({
      ...contacts,
      vehicles: [
        vehicle(),
        vehicle("13:00", {
          vehicle: "Mercedes W203",
          services: ["exterier", "motor"],
        }),
      ],
    });
    assert.equal(result.reservations.length, 2);
    assert.equal(result.total, 5520 + 4510);
    assert.equal(
      f.api.availability("2026-10-27", ["interier"]).slots.length,
      0,
    );
    const second = createBooking({ dbPath: f.path, now: () => NOW });
    assert.equal(second.availability("2026-10-27", ["motor"]).slots.length, 0);
    second.close();
    const calendar = f.api.calendar();
    assert.equal((calendar.match(/BEGIN:VEVENT/g) || []).length, 2);
    assert.ok(!calendar.includes(contacts.email));
    assert.ok(!calendar.includes(contacts.name));
    assert.ok(!calendar.includes("BMW"));
  } finally {
    f.done();
  }
});
test("overlap in same submission rolls all cars back, then exact-boundary slots remain valid", () => {
  const f = fixture();
  try {
    assert.throws(
      () =>
        f.api.reserve({ ...contacts, vehicles: [vehicle(), vehicle("12:30")] }),
      { status: 409 },
    );
    assert.equal(
      f.api.availability("2026-10-27", ["motor"]).slots[0].time,
      "08:00",
    );
    f.api.reserve({ ...contacts, vehicles: [vehicle()] });
    assert.equal(
      f.api.availability("2026-10-27", ["motor"]).slots[0].time,
      "13:00",
    );
    assert.throws(() => f.api.reserve({ ...contacts, vehicles: [vehicle()] }), {
      status: 409,
    });
  } finally {
    f.done();
  }
});
test("transport blocks seven hours, cannot finish after 20 and Sunday never books", () => {
  const f = fixture();
  try {
    f.api.reserve({
      ...contacts,
      vehicles: [vehicle("08:00", { transport: true })],
    });
    assert.equal(
      f.api.availability("2026-10-27", ["motor"]).slots[0].time,
      "15:00",
    );
    assert.throws(
      () =>
        f.api.reserve({
          ...contacts,
          vehicles: [vehicle("14:00", { date: "2026-10-28", transport: true })],
        }),
      { status: 409 },
    );
    assert.throws(
      () =>
        f.api.reserve({
          ...contacts,
          vehicles: [vehicle("08:00", { date: "2026-11-01" })],
        }),
      { status: 409 },
    );
  } finally {
    f.done();
  }
});
test("server enforces contacts, terms, early-start request and correct Prague daylight savings", () => {
  const f = fixture();
  try {
    assert.throws(
      () =>
        f.api.reserve({ ...contacts, phone: "invalid", vehicles: [vehicle()] }),
      { status: 400 },
    );
    assert.throws(
      () =>
        f.api.reserve({
          ...contacts,
          acceptedTerms: false,
          vehicles: [vehicle()],
        }),
      { status: 400 },
    );
    assert.throws(
      () =>
        f.api.reserve({
          ...contacts,
          earlyStart: false,
          vehicles: [vehicle()],
        }),
      { status: 400 },
    );
    assert.equal(
      new Date(instant("2026-07-07", "08:00")).toISOString(),
      "2026-07-07T06:00:00.000Z",
    );
    assert.equal(
      new Date(instant("2026-12-07", "08:00")).toISOString(),
      "2026-12-07T07:00:00.000Z",
    );
  } finally {
    f.done();
  }
});

test("idempotent retry returns the same reservations, rejects changed payload, and survives reopen", () => {
  const f = fixture();
  try {
    const payload = {
      ...contacts,
      requestId: "a1b2c3d4-1234-4123-8123-abcdef123456",
      vehicles: [vehicle()],
    };
    const first = f.api.reserve(payload);
    const retry = f.api.reserve(payload);
    assert.equal(retry.replayed, true);
    assert.equal(retry.reservations[0].id, first.reservations[0].id);
    assert.equal(f.api.list().length, 1);
    const second = createBooking({ dbPath: f.path, now: () => NOW });
    assert.equal(
      second.reserve(payload).reservations[0].id,
      first.reservations[0].id,
    );
    second.close();
    assert.throws(() => f.api.reserve({ ...payload, name: "Jiný zákazník" }), {
      status: 409,
    });
    f.api.cancel(first.reservations[0].id);
    assert.throws(() => f.api.reserve(payload), { status: 409 });
  } finally {
    f.done();
  }
});
test("malformed payloads are rejected and per-car fields cannot override shared contacts", () => {
  const f = fixture();
  try {
    for (const data of [
      null,
      [],
      {},
      { ...contacts, vehicles: [null] },
      { ...contacts, vehicles: [vehicle("08:00", { transport: "false" })] },
      { ...contacts, vehicles: [vehicle("08:00", { date: ["2026-10-27"] })] },
      { ...contacts, vehicles: [vehicle("08:00", { time: ["08:00"] })] },
    ])
      assert.throws(() => f.api.reserve(data), { status: 400 });
    f.api.reserve({
      ...contacts,
      vehicles: [
        vehicle("08:00", { name: "Override", email: "override@example.com" }),
      ],
    });
    assert.equal(f.api.list()[0].name, contacts.name);
    assert.equal(f.api.list()[0].email, contacts.email);
  } finally {
    f.done();
  }
});

test("owner time blocks prevent new reservations, remain private in ICS and can be removed", () => {
  const f = fixture();
  try {
    const result = f.api.block({
      date: "2026-10-27",
      from: "08:00",
      to: "13:00",
      note: "Soukromá poznámka dovolená",
    });
    assert.equal(
      f.api.availability("2026-10-27", ["interier"]).slots[0].time,
      "13:00",
    );
    assert.throws(() => f.api.reserve({ ...contacts, vehicles: [vehicle()] }), {
      status: 409,
    });
    assert(!f.api.calendar().includes("Soukromá"));
    assert(f.api.calendar().includes("BEGIN:VEVENT"));
    assert.equal(f.api.blocks().length, 1);
    f.api.unblock(result.id);
    assert.equal(
      f.api.availability("2026-10-27", ["motor"]).slots[0].time,
      "08:00",
    );
    assert.throws(
      () => f.api.block({ date: "bad", from: "08:00", to: "20:00" }),
      { status: 400 },
    );
  } finally {
    f.done();
  }
});
