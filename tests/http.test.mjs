import test from "node:test";
import { request as httpRequest } from "node:http";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
test("HTTP booking, concurrent conflict, authenticated calendar management and static assets", async () => {
  const dir = mkdtempSync(join(tmpdir(), "primeauto-http-")),
    password = randomUUID(),
    port = 32000 + (process.pid % 10000);
  const child = spawn(process.execPath, ["server.mjs"], {
    cwd: new URL("../", import.meta.url),
    env: {
      ...process.env,
      PORT: String(port),
      BOOKING_DB_PATH: join(dir, "db.sqlite"),
      ADMIN_PASSWORD: password,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  try {
    await Promise.race([
      once(child.stdout, "data"),
      new Promise((_, reject) =>
        setTimeout(() => reject(Error("Server did not start")), 8000).unref(),
      ),
    ]);
    const base = "http://127.0.0.1:" + port;
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + 2);
    while (date.getUTCDay() === 0) date.setUTCDate(date.getUTCDate() + 1);
    const day = date.toISOString().slice(0, 10);
    const get = await fetch(
      base + "/api/availability?date=" + day + "&services=interier,motor",
    );
    assert.equal(get.status, 200);
    const available = await get.json();
    assert.equal(available.slots[0].time, "08:00");
    const payload = {
      name: "Test zákazník",
      phone: "777111222",
      email: "test@example.com",
      acceptedTerms: true,
      earlyStart: true,
      vehicles: [
        {
          vehicle: "BMW E60",
          services: ["interier", "motor"],
          date: day,
          time: "08:00",
          transport: false,
        },
      ],
    };
    const responses = await Promise.all(
      [1, 2].map(() =>
        fetch(base + "/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
      ),
    );
    assert.deepEqual(responses.map((r) => r.status).sort(), [201, 409]);
    const saved = await responses.find((r) => r.status === 201).json();
    const id = saved.reservations[0].id;
    assert.equal(saved.total, 6510);
    assert.equal((await fetch(base + "/api/admin/bookings")).status, 401);
    assert.equal((await fetch(base + "/admin")).status, 401);
    const auth = {
      Authorization:
        "Basic " + Buffer.from("admin:" + password).toString("base64"),
    };
    assert.equal((await fetch(base + "/admin", { headers: auth })).status, 200);
    const rows = await (
      await fetch(base + "/api/admin/bookings", { headers: auth })
    ).json();
    assert.equal(rows.length, 1);
    assert.equal(rows[0].vehicle, "BMW E60");
    assert.equal(
      (
        await fetch(base + "/api/admin/cancel", {
          method: "POST",
          headers: { ...auth, "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        })
      ).status,
      200,
    );
    const after = await (
      await fetch(base + "/api/availability?date=" + day + "&services=interier")
    ).json();
    assert.equal(after.slots[0].time, "08:00");
    const ics = await (await fetch(base + "/api/calendar.ics")).text();
    assert.ok(!ics.includes("BEGIN:VEVENT"));
    for (const invalid of [null, [], { vehicles: [null] }])
      assert.equal(
        (
          await fetch(base + "/api/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(invalid),
          })
        ).status,
        400,
      );
    const replay = { ...payload, requestId: randomUUID() };
    const firstReplay = await fetch(base + "/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(replay),
    });
    assert.equal(firstReplay.status, 201);
    const repeated = await fetch(base + "/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(replay),
    });
    assert.equal(repeated.status, 200);
    assert.equal((await repeated.json()).replayed, true);
    date.setUTCDate(date.getUTCDate() + 1);
    while (date.getUTCDay() === 0) date.setUTCDate(date.getUTCDate() + 1);
    const utfPayload = {
      ...payload,
      name: "Žluťoučký zákazník",
      vehicles: [
        { ...payload.vehicles[0], date: date.toISOString().slice(0, 10) },
      ],
    };
    const bytes = Buffer.from(JSON.stringify(utfPayload));
    const split = bytes.indexOf(Buffer.from("Ž")) + 1;
    const utfStatus = await new Promise((resolve, reject) => {
      const req = httpRequest(
        base + "/api/bookings",
        { method: "POST", headers: { "Content-Type": "application/json" } },
        (response) => {
          response.resume();
          response.on("end", () => resolve(response.statusCode));
        },
      );
      req.on("error", reject);
      req.write(bytes.subarray(0, split));
      setImmediate(() => req.end(bytes.subarray(split)));
    });
    assert.equal(utfStatus, 201);
    const unicodeRows = await (
      await fetch(base + "/api/admin/bookings", { headers: auth })
    ).json();
    assert(unicodeRows.some((r) => r.name === "Žluťoučký zákazník"));
    const origin = await fetch(
      base + "/api/availability?date=" + day + "&services=motor",
      { headers: { Origin: "https://malicious.example" } },
    );
    assert.equal(origin.status, 403);
    for (const path of [
      "/",
      "/booking-config.js",
      "/images/bmw-e60.webp",
      "/images/mercedes-w203.webp",
    ])
      assert.equal((await fetch(base + path)).status, 200);
    assert.equal((await fetch(base + "/.data/bookings.sqlite")).status, 404);
  } finally {
    child.kill();
    await once(child, "exit");
    rmSync(dir, { recursive: true, force: true });
  }
});
