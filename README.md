# Prime Auto

Český responzivní web Prime Auto / L&M Garage, verze 2: rovnocenná nabídka čtyř služeb s oddělenými podstránkami. Node.js 22 nebo novější, žádné instalační závislosti.

## Spuštění

```sh
cd /workspace/primeauto
npm run check
npm start
```

Výchozí port 3000, změna pomocí `PORT`. Server poslouchá na `0.0.0.0`.

## Co funguje

Nabídka detailingu, servisu a předkupních prohlídek, odtah jako nedostupná služba. Ceník s jednorázovým poplatkem 1 530 Kč za energie, kombinovaný balíček, volba preferovaného data bez minulých dnů, příprava e-mailové poptávky, telefonní a e-mailové odkazy, právní dokumenty v přístupném dialogu. Bez cookies, analytiky, účtů a ukládání poptávek na serveru.

## Před veřejným nasazením

- Ověřit identitu a podnikatelské oprávnění provozovatele, úplnou adresu včetně PSČ, údaj o zápisu v příslušné evidenci, režim DPH a případné DIČ. Podklady převzaty od zadavatele, nebyly ověřeny v registru.
- Potvrdit, že energie 1 530 Kč se účtují jednou za celou zakázku i při kombinaci služeb. Potvrdit konečné spotřebitelské ceny a pravidla dopravy. Pro servis a prohlídky dohodnout cenu vždy před smlouvou.
- Právní dokumenty jsou pracovní znění, nikoli potvrzení právní shody. Doplnit skutečný proces smluv, plateb, reklamační adresu, hosting, zpracovatele a retenční lhůty; nechat posoudit podle skutečného provozu. Odstranit pracovní poznámky až po ověření údajů.
- Pro skutečné volné termíny a závazné rezervace připojit serverový rezervační systém s databází, administrací dostupnosti, atomickým blokováním slotů, potvrzovacím e-mailem, ochranou proti spamu a procesem změn/storna. Aktuální kalendář není obsazenost a e-mailová žádost není závaznou objednávkou. Nezobrazovat neověřené dny jako volné.
- Zajistit smluvní a GDPR podmínky hostingu a e-mailu; u služby před uplynutím 14 dnů řešit samostatnou výslovnou žádost spotřebitele a zákonné poučení.
- Web používá lokální AI vizualizace služeb, generovaný návrh loga a SVG varianty. Nejde o fotografie skutečných realizací. Před produkcí opatřit vlastní nebo licenčně ověřené snímky, uložit je lokálně a upravit informace o zpracování údajů. Není vytvořen falešný obsah o realizacích nebo recenzích.
- Produkční hosting musí poskytovat HTTPS, dohled, zálohy a příslušné zabezpečení. Tento jednoduchý server slouží pro vývoj/preview.

## Ověření

`npm run check` kontroluje syntaxi serveru a klienta. Funkční HTTP požadavky ověřují načtení HTML, CSS a JS. Žádný externí e-mail se při ověřování neodesílá.

## Navigace a značka

Úvod je rozcestník čtyř rovnocenných služeb; `#detailing`, `#servis`, `#prohlidky`, `#odtah` otevírají samostatné pohledy. Ceník a formulář jsou pouze v detailingu. Odtah je jasně nedostupný. `#sluzby`, `#pristup` a `#kontakt` vedou na úvodní sekce. Bez JS zůstává dostupný rozcestník, kontakt a informace na úvodu; detailní pohledy vyžadují JavaScript.

`public/images/services.png` obsahuje čtyři AI vizualizace jako CSS atlas. `logo-concept.png` je generovaný návrh identity; hlavička z něj používá monogram. SVG logo je textová/vektorová varianta. Obrázky jsou lokální, nejsou nutné externí domény.

V prohlížeči Chromium byly ověřeny všechny služby a navigace, čtyři karty, ceník a kombinace, kalendář, HTML validace formuláře, právní dialogy, mobilní menu, absence horizontálního přetékání při 390 px a načtení všech obrázků. Žádné e-maily se při ověřování neodesílaly. Interaktivní náhled v onboarding UI není dostupný; snímky v chatu nejsou živý web.

## GitHub Pages

Statický obsah složky `public/` lze publikovat jako kořen samostatné větve `gh-pages`. Relativní cesty podporují adresu `/primeauto/`. V Settings → Pages vyberte Deploy from a branch, větev gh-pages, složka / (root). Tato verze je pracovní náhled s noindex; před veřejným spuštěním vyřešte výše uvedené podmínky.
