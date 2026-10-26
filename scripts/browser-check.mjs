import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { randomUUID } from "node:crypto";
import { mkdtempSync, mkdirSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const root = new URL("../", import.meta.url),
  dir = mkdtempSync(join(tmpdir(), "primeauto-ui-")),
  password = randomUUID(),
  port = 42000 + (process.pid % 1000),
  base = "http://127.0.0.1:" + port;
const child = spawn(process.execPath, ["server.mjs"], {
  cwd: root,
  env: {
    ...process.env,
    PORT: String(port),
    BOOKING_DB_PATH: join(dir, "db.sqlite"),
    ADMIN_PASSWORD: password,
  },
  stdio: ["ignore", "pipe", "pipe"],
});
let browser;
try {
  await once(child.stdout, "data");
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    httpCredentials: { username: "admin", password },
  });
  const page = await context.newPage(),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base);
  await page.waitForLoadState("networkidle");
  assert.equal(await page.locator(".service-card").count(), 4);
  assert.equal(await page.locator("#navigation a").count(), 5);
  mkdirSync(new URL("../.artifacts/", import.meta.url), { recursive: true });
  await page.screenshot({
    path: new URL("../.artifacts/home.png", import.meta.url).pathname,
    fullPage: true,
  });
  await page.screenshot({
    path: new URL("../.artifacts/home-top.png", import.meta.url).pathname,
  });
  for (const key of ["servis", "prohlidky", "odtah"]) {
    await page.goto(base + "/#" + key);
    await page.locator(`[data-service-view=${key}] h1`).waitFor();
    assert(await page.locator("#home-view").isHidden());
  }
  await page.goto(base + "/#rezervace");
  const first = page.locator(".vehicle-card").first();
  await first.locator("[data-model]").fill("BMW E60");
  await first.locator("[data-select-all]").click();
  await first.locator("[data-transport]").check();
  await page.locator("#add-vehicle").click();
  const second = page.locator(".vehicle-card").nth(1);
  await second.locator("[data-model]").fill("Mercedes W203");
  await second.locator("[data-service-option][value=interier]").uncheck();
  await second.locator("[data-service-option][value=exterier]").check();
  assert((await page.locator("#estimate").innerText()).includes("12 020"));
  await page.locator("#next-step").click();
  await page.waitForFunction(
    () =>
      document
        .querySelectorAll(".vehicle-card")[1]
        ?.querySelectorAll("[data-slot]").length > 0,
  );
  await first.locator('[data-slot="08:00"]').click();
  assert(await second.locator('[data-slot="13:00"]').isDisabled());
  await second.locator('[data-slot="15:00"]').click();
  await page.locator("#next-step").click();
  assert.equal(
    await page.locator("#booking-form").getAttribute("data-step"),
    "3",
  );
  await page.locator("[name=name]").fill("Testovací zákazník");
  await page.locator("[name=phone]").fill("777111222");
  await page.locator("[name=email]").fill("test@example.com");
  await page.locator("[name=acceptedTerms]").check();
  await page.locator("[name=earlyStart]").check();
  await page.locator("#booking-contact [data-legal=terms]").first().click();
  assert(await page.locator("dialog").isVisible());
  await page.keyboard.press("Escape");
  assert(
    await page
      .locator("#booking-contact [data-legal=terms]")
      .first()
      .evaluate((e) => e === document.activeElement),
  );
  await page.screenshot({
    path: new URL("../.artifacts/booking-review.png", import.meta.url).pathname,
    fullPage: true,
  });
  await page.locator(".submit").click();
  await page.locator(".confirmation.confirmed").waitFor();
  assert.equal(await page.locator(".download-confirmation").count(), 2);
  const waiting = page.waitForEvent("download");
  await page.locator(".download-confirmation").first().click();
  const file = await waiting;
  assert.equal(file.suggestedFilename(), "Prime-Auto-potvrzeni.txt");
  const content = readFileSync(await file.path(), "utf8");
  assert(content.includes("BMW E60"));
  assert(content.includes("12 020 Kč"));
  assert(content.includes("Odstoupení spotřebitele"));
  const admin = await context.newPage();
  await admin.goto(base + "/admin");
  await admin.locator(".admin-booking").first().waitFor();
  assert.equal(await admin.locator(".admin-booking").count(), 2);
  admin.once("dialog", (d) => d.accept());
  await admin.locator(".admin-booking button").first().click();
  await admin.waitForFunction(
    () => document.querySelectorAll(".admin-booking").length === 1,
  );
  assert.equal(await admin.locator(".admin-booking").count(), 1);
  await admin
    .locator("#block-form [name=date]")
    .fill(await first.locator("[data-date]").inputValue());
  await admin.locator("#block-form [name=note]").fill("Testovací blokace");
  await admin.locator("#block-form button").click();
  await admin.locator("#blocks .admin-booking").waitFor();
  await admin.locator("#blocks button").click();
  await admin.waitForFunction(
    () => document.querySelector("#blocks").children.length === 0,
  );
  await admin.close();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + "/#domu");
  await page.locator(".menu-toggle").click();
  assert(await page.locator("#navigation").isVisible());
  await page.keyboard.press("Escape");
  assert(await page.locator("#navigation").isHidden());
  await page.screenshot({
    path: new URL("../.artifacts/mobile-home.png", import.meta.url).pathname,
    fullPage: true,
  });
  for (const hash of [
    "domu",
    "detailing",
    "servis",
    "prohlidky",
    "odtah",
    "cenik",
    "rezervace",
  ]) {
    await page.goto(base + "/#" + hash);
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      "Mobile overflow " + hash,
    );
  }
  const offline = await context.newPage();
  await offline.route("**/api/availability?*", (r) => r.abort());
  await offline.goto(base + "/#rezervace");
  await offline.locator("[data-model]").fill("Testovací vůz");
  await offline.locator("#next-step").click();
  await offline.waitForFunction(
    () => !document.querySelector("#booking-connection").hidden,
  );
  assert(await offline.locator("#next-step").isDisabled());
  assert.equal(await offline.locator("[data-slot]").count(), 0);
  assert.equal(errors.length, 0, errors.join(";"));
  console.log(
    "PASS: service navigation, three-step multi-car checkout, price, 7h/5h slot collision prevention, terms focus, database write, confirmation download, authenticated cancellation, mobile and offline handling.",
  );
} finally {
  await browser?.close();
  child.kill();
  await once(child, "exit");
  rmSync(dir, { recursive: true, force: true });
}
