import { readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
for (const directory of [".", "public", "scripts", "tests"])
  for (const name of readdirSync(directory)) {
    if (/\.(?:mjs|js)$/.test(name))
      execFileSync(process.execPath, ["--check", join(directory, name)], {
        stdio: "inherit",
      });
  }
console.log("Syntaxe všech JavaScriptových souborů je v pořádku.");
