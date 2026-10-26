import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { randomUUID, createHash } from "node:crypto";
import { CATALOG, RULES } from "./public/catalog.js";
import { createCalendar } from "./public/calendar.js";
export { CATALOG };
const ZONE = RULES.timezone;
const parts = (t) =>
  Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date(t))
      .filter((p) => p.type !== "literal")
      .map((p) => [p.type, p.value]),
  );
export function localDate(t = Date.now()) {
  const p = parts(t);
  return `${p.year}-${p.month}-${p.day}`;
}
export function instant(date, time) {
  const [y, m, d] = date.split("-").map(Number),
    [h, min] = time.split(":").map(Number);
  const target = Date.UTC(y, m - 1, d, h, min);
  let guess = target;
  for (let i = 0; i < 3; i++) {
    const p = parts(guess);
    const represented = Date.UTC(
      +p.year,
      +p.month - 1,
      +p.day,
      +p.hour,
      +p.minute,
    );
    guess += target - represented;
  }
  return guess;
}
function validDate(date) {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return false;
  const parsed = new Date(date + "T12:00:00Z");
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date
  );
}
function clock(minutes) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}
function minutes(value) {
  if (typeof value !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value))
    return null;
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}
export function quote(input, transport = false) {
  if (
    !Array.isArray(input) ||
    !input.length ||
    input.length > 3 ||
    new Set(input).size !== input.length ||
    input.some((k) => typeof k !== "string" || !Object.hasOwn(CATALOG, k))
  )
    throw Object.assign(Error("Vyberte alespoň jednu platnou službu."), {
      status: 400,
    });
  return {
    services: input,
    cleaning: input.reduce((p, k) => p + CATALOG[k].price, 0),
    energy: RULES.energy,
    total: input.reduce((p, k) => p + CATALOG[k].price, RULES.energy),
    duration: transport ? RULES.transportDuration : RULES.duration,
  };
}
export function createBooking({
  dbPath = "./.data/bookings.sqlite",
  open = process.env.BOOKING_OPEN || RULES.open,
  close = process.env.BOOKING_CLOSE || RULES.close,
  now = () => Date.now(),
} = {}) {
  const start = minutes(open),
    end = minutes(close);
  const configured = start !== null && end !== null && end - start >= 300;
  mkdirSync(dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec(
    "PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS bookings(id TEXT PRIMARY KEY, created INTEGER NOT NULL, start INTEGER NOT NULL, end INTEGER NOT NULL, name TEXT NOT NULL, phone TEXT NOT NULL, email TEXT NOT NULL, services TEXT NOT NULL, total INTEGER NOT NULL, message TEXT NOT NULL, transport INTEGER NOT NULL, early INTEGER NOT NULL, terms_version TEXT NOT NULL, cancelled INTEGER NOT NULL DEFAULT 0); CREATE INDEX IF NOT EXISTS booking_interval ON bookings(start,end)",
  );
  db.exec(
    "CREATE TABLE IF NOT EXISTS blocked_times(id TEXT PRIMARY KEY, start INTEGER NOT NULL, end INTEGER NOT NULL, note TEXT NOT NULL)",
  );
  function availability(date, selected, transport = false) {
    const q = quote(selected, transport);
    if (!validDate(date))
      throw Object.assign(Error("Neplatné datum."), { status: 400 });
    const today = localDate(now()),
      distance =
        (Date.parse(date + "T12:00:00Z") - Date.parse(today + "T12:00:00Z")) /
        86400000;
    const sunday = new Date(date + "T12:00:00Z").getUTCDay() === 0;
    const slots = [];
    if (
      configured &&
      !sunday &&
      distance >= 0 &&
      distance <= RULES.advanceDays
    ) {
      const busy = db
        .prepare(
          "SELECT start,end FROM bookings WHERE cancelled=0 AND start<? AND end>? UNION ALL SELECT start,end FROM blocked_times WHERE start<? AND end>?",
        )
        .all(
          instant(date, "23:59") + 60000,
          instant(date, "00:00"),
          instant(date, "23:59") + 60000,
          instant(date, "00:00"),
        );
      for (let m = start; m + q.duration <= end; m += 30) {
        const a = instant(date, clock(m)),
          b = a + q.duration * 60000;
        if (
          a < now() + RULES.leadHours * 3600000 ||
          busy.some((row) => row.start < b && row.end > a)
        )
          continue;
        slots.push({
          time: clock(m),
          endTime: clock(m + q.duration),
          start: a,
          end: b,
        });
      }
    }
    return {
      enabled: configured,
      date,
      timezone: ZONE,
      duration: q.duration,
      total: q.total,
      slots,
      closed: sunday,
      opening: configured ? { open, close } : null,
    };
  }
  if (
    !db
      .prepare("PRAGMA table_info(bookings)")
      .all()
      .some((c) => c.name === "vehicle")
  )
    db.exec("ALTER TABLE bookings ADD COLUMN vehicle TEXT NOT NULL DEFAULT ''");
  db.exec(
    "CREATE TABLE IF NOT EXISTS booking_requests(id TEXT PRIMARY KEY, fingerprint TEXT NOT NULL, result TEXT NOT NULL, created INTEGER NOT NULL)",
  );
  function reserveOne(data) {
    if (typeof data.transport !== "boolean" || typeof data.vehicle !== "string")
      throw Object.assign(Error("Zkontrolujte údaje o vozidle a dopravě."), {
        status: 400,
      });
    if (!configured)
      throw Object.assign(
        Error(
          "Online rezervace zatím nejsou aktivní. Zavolejte na 736 212 511.",
        ),
        { status: 503 },
      );
    const q = quote(data.services, data.transport);
    if (!validDate(data.date || "") || minutes(data.time) === null)
      throw Object.assign(Error("Vyberte platný termín."), { status: 400 });
    const name = String(data.name || "").trim(),
      phone = String(data.phone || "").trim(),
      email = String(data.email || "").trim(),
      message = String(data.message || "").trim();
    if (
      name.length < 2 ||
      name.length > 120 ||
      phone.replace(/\D/g, "").length < 9 ||
      phone.replace(/\D/g, "").length > 15 ||
      phone.length > 30 ||
      email.length > 200 ||
      !/^\S+@\S+\.\S+$/.test(email) ||
      message.length > 2000 ||
      data.acceptedTerms !== true
    )
      throw Object.assign(
        Error("Zkontrolujte kontaktní údaje a souhlas s podmínkami."),
        { status: 400 },
      );
    const early = instant(data.date, data.time) < now() + 14 * 86400000;
    if (early && data.earlyStart !== true)
      throw Object.assign(
        Error(
          "Pro termín do 14 dnů je nutná samostatná žádost o dřívější zahájení služby.",
        ),
        { status: 400 },
      );
    if (data.website)
      throw Object.assign(Error("Žádost nelze přijmout."), { status: 400 });
    const slot = availability(
      data.date,
      data.services,
      data.transport,
    ).slots.find((s) => s.time === data.time);
    if (!slot)
      throw Object.assign(
        Error("Tento termín už není dostupný. Vyberte jiný."),
        { status: 409 },
      );
    const vehicle = String(data.vehicle || "").trim();
    if (vehicle.length < 2 || vehicle.length > 160)
      throw Object.assign(Error("Vyplňte značku a model vozidla."), {
        status: 400,
      });
    const id = randomUUID();
    db.prepare(
      "INSERT INTO bookings(id,created,start,end,name,phone,email,services,total,message,transport,early,terms_version,vehicle) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    ).run(
      id,
      now(),
      slot.start,
      slot.end,
      name,
      phone,
      email,
      JSON.stringify(q.services),
      q.total,
      message,
      data.transport ? 1 : 0,
      early ? 1 : 0,
      RULES.termsVersion,
      vehicle,
    );
    return {
      id,
      date: data.date,
      time: data.time,
      endTime: slot.endTime,
      timezone: ZONE,
      services: q.services,
      total: q.total,
      duration: q.duration,
      start: slot.start,
      end: slot.end,
      vehicle,
    };
  }
  function reserve(data) {
    const bad = (message) => Object.assign(Error(message), { status: 400 });
    if (!data || typeof data !== "object" || Array.isArray(data))
      throw bad("Neplatná objednávka.");
    if (
      !Array.isArray(data.vehicles) ||
      !data.vehicles.length ||
      data.vehicles.length > 6 ||
      data.vehicles.some((v) => !v || typeof v !== "object" || Array.isArray(v))
    )
      throw bad("Objednávka musí obsahovat 1 až 6 vozidel.");
    if (
      ["name", "phone", "email"].some((k) => typeof data[k] !== "string") ||
      (data.message !== undefined && typeof data.message !== "string")
    )
      throw bad("Vyplňte platné kontaktní údaje.");
    const requestId = data.requestId;
    if (
      requestId !== undefined &&
      !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
        requestId,
      )
    )
      throw bad("Neplatný identifikátor objednávky.");
    const normalized = {
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email.trim(),
      message: (data.message || "").trim(),
      acceptedTerms: data.acceptedTerms,
      earlyStart: data.earlyStart,
      website: data.website || "",
      vehicles: data.vehicles.map((v) => ({
        vehicle: v.vehicle,
        services: v.services,
        transport: v.transport,
        date: v.date,
        time: v.time,
      })),
    };
    const fingerprint = createHash("sha256")
      .update(JSON.stringify(normalized))
      .digest("hex");
    db.exec("BEGIN IMMEDIATE");
    try {
      if (requestId) {
        const existing = db
          .prepare("SELECT fingerprint,result FROM booking_requests WHERE id=?")
          .get(requestId);
        if (existing) {
          if (existing.fingerprint !== fingerprint)
            throw Object.assign(
              Error(
                "Obsah objednávky se změnil. Zkontrolujte údaje a odešlete ji znovu.",
              ),
              { status: 409 },
            );
          const result = JSON.parse(existing.result);
          if (
            result.reservations.some(
              (r) =>
                db
                  .prepare("SELECT cancelled FROM bookings WHERE id=?")
                  .get(r.id)?.cancelled,
            )
          )
            throw Object.assign(
              Error(
                "Tato objednávka již byla zrušena. Pro nový termín začněte novou rezervaci.",
              ),
              { status: 409 },
            );
          db.exec("COMMIT");
          return { ...result, replayed: true };
        }
      }
      const reservations = normalized.vehicles.map((v) =>
        reserveOne({ ...normalized, ...v }),
      );
      const result = {
        reservations,
        total: reservations.reduce((sum, r) => sum + r.total, 0),
      };
      if (requestId)
        db.prepare(
          "INSERT INTO booking_requests(id,fingerprint,result,created) VALUES(?,?,?,?)",
        ).run(requestId, fingerprint, JSON.stringify(result), now());
      db.exec("COMMIT");
      return result;
    } catch (e) {
      db.exec("ROLLBACK");
      throw e;
    }
  }
  function calendar() {
    return createCalendar(
      [
        ...db
          .prepare(
            "SELECT id,start,end,created FROM bookings WHERE cancelled=0 AND end>? ORDER BY start",
          )
          .all(now() - 86400000),
        ...db
          .prepare("SELECT id,start,end FROM blocked_times WHERE end>?")
          .all(now() - 86400000),
      ],
      now(),
      "Prime Auto – obsazenost",
    );
  }
  return {
    availability,
    reserve,
    calendar,
    configured,
    blocks: () =>
      db.prepare("SELECT * FROM blocked_times ORDER BY start").all(),
    block: (data) => {
      if (
        !data ||
        !validDate(data.date) ||
        minutes(data.from) === null ||
        minutes(data.to) === null ||
        minutes(data.from) >= minutes(data.to) ||
        String(data.note || "").length > 200
      )
        throw Object.assign(Error("Vyberte datum a platný rozsah blokace."), {
          status: 400,
        });
      const id = randomUUID();
      db.prepare(
        "INSERT INTO blocked_times(id,start,end,note) VALUES(?,?,?,?)",
      ).run(
        id,
        instant(data.date, data.from),
        instant(data.date, data.to),
        String(data.note || ""),
      );
      return { id };
    },
    unblock: (id) => {
      if (typeof id !== "string" || !/^[a-f0-9-]{36}$/.test(id))
        throw Object.assign(Error("Neplatná blokace."), { status: 400 });
      return {
        removed:
          db.prepare("DELETE FROM blocked_times WHERE id=?").run(id).changes >
          0,
      };
    },
    list: () => db.prepare("SELECT * FROM bookings ORDER BY start").all(),
    cancel: (id) => {
      if (!/^[a-f0-9-]{36}$/.test(id || ""))
        throw Object.assign(Error("Neplatná rezervace."), { status: 400 });
      const r = db
        .prepare("UPDATE bookings SET cancelled=1 WHERE id=? AND cancelled=0")
        .run(id);
      if (!r.changes)
        throw Object.assign(Error("Aktivní rezervace nebyla nalezena."), {
          status: 404,
        });
      return { cancelled: true };
    },
    close: () => db.close(),
  };
}
