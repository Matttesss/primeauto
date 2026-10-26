import http from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { timingSafeEqual } from "node:crypto";
import { createBooking } from "./booking.mjs";
const root = new URL("./public/", import.meta.url);
const booking = createBooking({
  dbPath: process.env.BOOKING_DB_PATH || "./.data/bookings.sqlite",
});
const origins = new Set(
  (process.env.BOOKING_ALLOWED_ORIGINS || "https://matttesss.github.io")
    .split(",")
    .map((v) => v.trim()),
);
const limits = new Map();
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const origin = req.headers.origin;
  const same =
    origin === `http://${req.headers.host}` ||
    origin === `https://${req.headers.host}`;
  const cors = origin && (origins.has(origin) || same);
  if (cors) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  const json = (status, data) => {
    res
      .writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      })
      .end(JSON.stringify(data));
  };
  try {
    if (
      url.pathname === "/admin" ||
      url.pathname === "/admin.js" ||
      url.pathname.startsWith("/api/admin/")
    ) {
      const password = process.env.ADMIN_PASSWORD;
      if (!password) {
        res
          .writeHead(503, { "Content-Type": "text/plain; charset=utf-8" })
          .end("Správa není nakonfigurována. Nastavte ADMIN_PASSWORD.");
        return;
      }
      const provided = String(req.headers.authorization || "");
      const expected = Buffer.from("admin:" + password);
      const actual = Buffer.from(
        provided.startsWith("Basic ")
          ? Buffer.from(provided.slice(6), "base64").toString()
          : "",
      );
      if (
        expected.length !== actual.length ||
        !timingSafeEqual(expected, actual)
      ) {
        res
          .writeHead(401, {
            "WWW-Authenticate": 'Basic realm="Prime Auto", charset="UTF-8"',
            "Cache-Control": "no-store",
          })
          .end("Přihlášení vyžadováno.");
        return;
      }
      if (url.pathname === "/admin" || url.pathname === "/admin.js") {
        const file = url.pathname === "/admin" ? "admin.html" : "admin.js";
        res
          .writeHead(200, {
            "Content-Type": file.endsWith("html")
              ? "text/html; charset=utf-8"
              : "text/javascript",
            "Cache-Control": "no-store",
            "X-Frame-Options": "DENY",
            "X-Content-Type-Options": "nosniff",
          })
          .end(await readFile(new URL("./" + file, import.meta.url)));
        return;
      }
    }
    if (url.pathname.startsWith("/api/")) {
      if (origin && !cors)
        return json(403, { error: "Nepovolený původ požadavku." });
      if (req.method === "OPTIONS") {
        res
          .writeHead(204, {
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          })
          .end();
        return;
      }
      if (req.method === "GET" && url.pathname === "/api/admin/bookings")
        return json(200, booking.list());
      if (req.method === "POST" && url.pathname === "/api/admin/cancel") {
        if (!String(req.headers["content-type"]).startsWith("application/json"))
          return json(415, { error: "Očekáván JSON." });
        let body = "";
        for await (const chunk of req) {
          body += chunk;
          if (Buffer.byteLength(body) > 1024)
            return json(413, { error: "Příliš velký požadavek." });
        }
        let data;
        try {
          data = JSON.parse(body);
        } catch {
          return json(400, { error: "Neplatný JSON." });
        }
        return json(200, booking.cancel(data.id));
      }
      if (req.method === "GET" && url.pathname === "/api/health")
        return json(200, { status: "ok", booking: booking.configured });
      if (req.method === "GET" && url.pathname === "/api/availability") {
        const selected = (url.searchParams.get("services") || "interier").split(
          ",",
        );
        return json(
          200,
          booking.availability(
            url.searchParams.get("date") || "",
            selected,
            url.searchParams.get("transport") === "true",
          ),
        );
      }
      if (req.method === "GET" && url.pathname === "/api/calendar.ics") {
        res
          .writeHead(200, {
            "Content-Type": "text/calendar; charset=utf-8",
            "Cache-Control": "no-store",
          })
          .end(booking.calendar());
        return;
      }
      if (req.method === "POST" && url.pathname === "/api/bookings") {
        const ip = req.socket.remoteAddress;
        const now = Date.now();
        const rate = limits.get(ip);
        if (rate && rate.until > now && rate.count >= 10)
          return json(429, {
            error: "Příliš mnoho pokusů. Zkuste to později nebo zavolejte.",
          });
        if (limits.size > 10000)
          for (const [k, v] of limits) if (v.until < now) limits.delete(k);
        limits.set(
          ip,
          rate && rate.until > now
            ? { ...rate, count: rate.count + 1 }
            : { until: now + 3600000, count: 1 },
        );
        if (!String(req.headers["content-type"]).startsWith("application/json"))
          return json(415, { error: "Očekáván JSON." });
        let body = "";
        for await (const chunk of req) {
          body += chunk;
          if (Buffer.byteLength(body) > 16384)
            return json(413, { error: "Požadavek je příliš velký." });
        }
        let data;
        try {
          data = JSON.parse(body);
        } catch {
          return json(400, { error: "Neplatný požadavek." });
        }
        return json(201, booking.reserve(data));
      }
      return json(404, { error: "Nenalezeno." });
    }
    if (!["GET", "HEAD"].includes(req.method)) {
      res.writeHead(405).end();
      return;
    }
    const path = decodeURIComponent(url.pathname);
    const file = new URL("." + (path === "/" ? "/index.html" : path), root);
    if (!file.href.startsWith(root.href)) {
      res.writeHead(403).end();
      return;
    }
    const data = await readFile(fileURLToPath(file));
    res
      .writeHead(200, {
        "Content-Type":
          {
            html: "text/html; charset=utf-8",
            css: "text/css",
            js: "text/javascript",
            svg: "image/svg+xml",
            png: "image/png",
            webp: "image/webp",
            jpg: "image/jpeg",
          }[file.pathname.split(".").pop()] || "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Content-Security-Policy":
          "default-src 'self'; img-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self' https:; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
      })
      .end(req.method === "HEAD" ? undefined : data);
  } catch (e) {
    if (url.pathname.startsWith("/api/"))
      json(e.status || 500, {
        error: e.status
          ? e.message
          : "Rezervaci se nepodařilo zpracovat. Zavolejte na 736 212 511.",
      });
    else res.writeHead(404).end("Stránka nenalezena");
  }
});
server.listen(Number(process.env.PORT) || 3000, "0.0.0.0", () =>
  console.log(
    "Prime Auto běží; online rezervace " +
      (booking.configured ? "aktivní" : "čekají na nastavení pracovní doby"),
  ),
);
