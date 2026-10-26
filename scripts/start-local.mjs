import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
process.chdir(root);
if (Number(process.versions.node.split(".")[0]) < 24) {
  console.error(
    "Prime Auto vyžaduje Node.js 24 nebo novější. Stáhněte jej z https://nodejs.org/.",
  );
  process.exit(1);
}
await mkdir(".data", { recursive: true });
let password = process.env.ADMIN_PASSWORD;
if (!password) {
  try {
    password = (
      await readFile(".data/local-admin-password.txt", "utf8")
    ).trim();
  } catch {
    password = randomBytes(24).toString("base64url");
    await writeFile(".data/local-admin-password.txt", password + "\n", {
      mode: 0o600,
      flag: "wx",
    });
  }
}
const child = spawn(process.execPath, ["server.mjs"], {
  cwd: root,
  env: { ...process.env, ADMIN_PASSWORD: password },
  stdio: ["inherit", "pipe", "inherit"],
});
let opened = false;
child.stdout.on("data", (chunk) => {
  process.stdout.write(chunk);
  if (!opened && String(chunk).includes("Prime Auto běží")) {
    opened = true;
    const port = Number(process.env.PORT) || 3000;
    const url = "http://localhost:" + port;
    console.log("Správa rezervací: " + url + "/admin (uživatel admin).");
    console.log(
      "Lokální heslo najdete v souboru .data/local-admin-password.txt. Nikam ho neposílejte.",
    );
    if (process.platform === "win32") {
      const opener = spawn(
        "powershell.exe",
        ["-NoProfile", "-NonInteractive", "-Command", `Start-Process '${url}'`],
        { stdio: "ignore", windowsHide: true },
      );
      opener.on("error", () => console.log("Otevřete v prohlížeči: " + url));
    } else console.log("Otevřete v prohlížeči: " + url);
  }
});
process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
child.on("exit", (code) => process.exit(code || 0));
child.on("error", (error) => {
  console.error(error.message);
  process.exit(1);
});
