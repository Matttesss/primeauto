# Spuštění a aktualizace na Windows

## Spuštění dvojklikem

1. Nainstalujte Node.js 24 LTS nebo novější.
2. Stáhněte větev **main** z GitHubu přes Code → Download ZIP a ZIP skutečně rozbalte.
3. Ve složce s `package.json` otevřete **spustit-web.cmd** dvojklikem.
4. Web se otevře na `http://localhost:3000`. Okno s běžícím serverem nechte otevřené.

Není potřeba `npm install`. Příkaz pro ruční spuštění je `npm start`; `npm run dev` navíc připraví místní přístup do správy a na Windows otevře prohlížeč.

## Správa rezervací

Při spuštění přes `spustit-web.cmd` nebo `npm run dev` se bezpečně vytvoří místní heslo. Otevřete `http://localhost:3000/admin`, uživatel je **admin**. Heslo najdete v souboru `.data/local-admin-password.txt` ve složce projektu. Neposílejte ho do chatu ani na GitHub.

Ve správě můžete prohlížet a rušit rezervace a vytvářet vlastní blokace pracovní doby. Zrušení ihned uvolní termín. Blokace času neruší již přijaté objednávky.

## Jak aktualizovat již spuštěný web

1. V okně serveru stiskněte **Ctrl+C** a ukončete ho.
2. Stáhněte a rozbalte novou větev **main**.
3. Nové soubory zkopírujte do původní složky projektu a potvrďte nahrazení souborů.
4. **Neodstraňujte složku `.data`**. Obsahuje rezervace a místní heslo; v ZIPu z GitHubu není.
5. Znovu spusťte `spustit-web.cmd` a v prohlížeči stiskněte **Ctrl+F5**.

Adresa localhost je pouze pro váš počítač. Pro objednávky zákazníků přes internet je potřeba veřejný server, například připravené nasazení na Renderu. GitHub Pages samo rezervační databázi neprovozuje.
