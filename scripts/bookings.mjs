import { DatabaseSync } from "node:sqlite";
const path = process.env.BOOKING_DB_PATH || "./.data/bookings.sqlite";
const db = new DatabaseSync(path, { readOnly: process.argv[2] !== "cancel" });
try {
  const command = process.argv[2] || "list";
  if (command === "list") {
    const rows = db
      .prepare(
        "SELECT id,start,end,vehicle,name,phone,email,services,total,transport,cancelled FROM bookings WHERE end>? ORDER BY start",
      )
      .all(Date.now() - 86400000);
    for (const r of rows)
      console.log(
        JSON.stringify({
          ...r,
          start: new Date(r.start).toLocaleString("cs-CZ", {
            timeZone: "Europe/Prague",
          }),
          end: new Date(r.end).toLocaleString("cs-CZ", {
            timeZone: "Europe/Prague",
          }),
        }),
      );
    console.log(`${rows.length} rezervací`);
  } else if (command === "cancel") {
    const id = process.argv[3];
    if (!/^[a-f0-9-]{36}$/.test(id || ""))
      throw Error("Zadejte úplné UUID rezervace.");
    const result = db
      .prepare("UPDATE bookings SET cancelled=1 WHERE id=? AND cancelled=0")
      .run(id);
    if (!result.changes) throw Error("Aktivní rezervace nebyla nalezena.");
    console.log("Rezervace zrušena; čas je znovu dostupný.");
  } else throw Error("Použití: node scripts/bookings.mjs list | cancel UUID");
} finally {
  db.close();
}
