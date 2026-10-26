# Prime Auto

Minimalistický český web: čtyři rovnocenné služby, samostatný ceník detailingu a skutečný rezervační backend. Node.js **24+**, bez instalačních závislostí. Používá vestavěné `node:sqlite`.

## Lokální vývoj

```sh
npm run check
npm test
npm start
```

Port nastavuje `PORT` (výchozí 3000). Server poslouchá na `0.0.0.0`. Výchozí databáze je `.data/bookings.sqlite`, ignorovaná Gitem. Živé procesy je nutné v novém prostředí znovu spustit. Cloudové úlohy jsou izolované; používejte existující checkout, nevytvářejte Git worktree bez výslovného požadavku.

## Rezervace

- Pondělí–sobota **08:00–20:00**, neděle zavřeno, časová zóna **Europe/Prague**.
- Jeden vůz blokuje **5 hodin**, s dopravou **7 hodin**, bez ohledu na kombinaci služeb. Nabídka začátků po 30 minutách. Jeden vůz současně; více vozů má vlastní navazující termíny nebo jiné dny.
- Libovolná neprázdná kombinace interiéru (3 990 Kč), exteriéru (1 990 Kč), motoru (990 Kč). Energie **1 530 Kč jednou za vůz**; všechny služby 8 500 Kč za vůz. Doprava je samostatná poptávka s cenou dohodou, není zahrnuta do ceny objednaného čištění.
- Jedna objednávka může mít 1–6 vozů. Ukládá se v jedné databázové transakci; při kolizi kteréhokoli termínu se neuloží žádný vůz. `BEGIN IMMEDIATE` a opakovaná kontrola překryvů brání dvojí rezervaci.
- Objednává se nejvýše 120 dní dopředu a s dvouhodinovým předstihem. Neděle, minulost, překryvy a konec po 20:00 jsou zakázané serverem.
- Zákazník dostane potvrzení na stránce, ke stažení TXT s podmínkami a ICS pro osobní kalendář. E-maily se zatím automaticky neposílají; UI to uvádí. Nejde o `mailto` ani ukládání do localStorage.
- Při nedostupném backendu se formulář nesnaží objednávku falešně potvrdit a nabídne telefon.

## Render: připravené nasazení

Soubor **render.yaml** nasadí celý web i API společně, s trvalým diskem pro SQLite. V Renderu je nutný **placený webový tarif Starter a trvalý disk**. Tato konfigurace nic sama neobjednává; aktuální ceny zkontrolujte při vytvoření služby. Služba ani disk zatím nebyly založeny nebo zaplaceny.

1. V dashboardu Render vyberte **New → Blueprint** a připojte GitHub repozitář `Matttesss/primeauto`, větev `main`.
2. Render načte `render.yaml`. Zkontrolujte plán, umístění a cenu služby i disku a nasaďte.
3. Build spouští syntaktickou kontrolu a skutečné backendové/HTTP testy. Health check je `/api/health`.
4. Po nasazení otevřete HTTPS URL přidělenou Renderem. **Na této adrese funguje web i rezervace bez dalších úprav**, protože používají společný server. URL nelze předem garantovat.
5. Ověřte `/api/health`, stránky služeb a načtení skutečných volných hodin. Zkušební objednávku v soukromé správě zrušte, aby nezabírala termín.

### Soukromá správa

Otevřete `/admin` na Render adrese. Uživatelské jméno je **admin**. Heslo je hodnota **ADMIN_PASSWORD**, kterou Render automaticky bezpečně vygeneruje podle blueprintu; zobrazí ji pouze oprávněný správce v Environment. Nepište ji do chatu nebo Gitu. Bez této proměnné je správa nepřístupná. Používejte ji pouze přes HTTPS.

Správa zobrazuje kontakty, vozy, rozsah, cenu, poznámky a časy; filtruje podle dne a stavu. Zrušení objednávky ihned uvolní čas. Veřejný kalendář `/api/calendar.ics` obsahuje jen bloky „Obsazeno“, nikoli osobní údaje nebo modely aut. Lze ho odebírat v kalendářové aplikaci; frekvence obnovování závisí na dané aplikaci.

Ze serverového shellu lze použít také:

```sh
npm run bookings
node scripts/bookings.mjs cancel UUID_REZERVACE
```

Databázi pravidelně zálohujte; zajistěte obnovitelné zálohy i mazání údajů podle retenčních pravidel. Pro konzistentní export použijte SQLite backup nebo `VACUUM INTO`, nekopírujte samotný živý hlavní soubor bez jeho WAL. Trvalý disk není náhradou nezávislé zálohy. Změna instance nesmí vytvořit novou prázdnou databázi.

### Nastavení

| Proměnná                     | Význam                                                                                               |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| PORT                         | Port webového serveru, Render ho injektuje.                                                          |
| BOOKING_DB_PATH              | Trvalý soubor databáze; Render `/var/data/primeauto/bookings.sqlite`.                                |
| BOOKING_OPEN / BOOKING_CLOSE | Výchozí `08:00` / `20:00`.                                                                           |
| ADMIN_PASSWORD               | Silné náhodné heslo soukromé správy, generované Renderem.                                            |
| BOOKING_ALLOWED_ORIGINS      | Povolené cizí originy, výchozí `https://matttesss.github.io`; vlastní origin je povolen automaticky. |

## GitHub Pages

Větev `gh-pages` obsahuje pouze soubory `public/`. GitHub Pages nespouští Node.js a nemá SQLite. Proto bez externího API slouží jen jako náhled: **online objednání je zde správně vypnuté**. Funkční plná verze má běžet na Renderu.

Pokud chcete ponechat zákaznický web na Pages, po nasazení Renderu nastavte do `public/booking-config.js` `apiBase` na jeho přesnou HTTPS adresu a znovu publikujte `gh-pages`. API adresa není tajná. Nikdy sem nevkládejte administrátorské heslo. CORS už povoluje origin `https://matttesss.github.io`.

## Obrázky a veřejný obsah

Dva samostatné obrázky BMW E60 a Mercedesu W203 mají plné rozlišení 1774 × 887, bez výřezů z koláže. Jsou efektivně zakódované do WebP (přibližně 260–270 KB za obrázek) bez změny rozměrů. Jsou generované ilustrační podklady, nikoli důkaz skutečně provedených zakázek. Na přání zadavatele nejsou označené produktovými popisky AI, ale web je neprezentuje jako portfolio nebo fotografie zákaznických vozidel. Pro autentické realizace je nutné dodat skutečné fotografie a oprávnění k jejich zveřejnění. Logo je generovaný návrh; použitý monogram je lokální. Nenačítají se externí fotobanky, mapy ani fonty.

## Před komerčním provozem

Údaje o provozovateli pocházejí od zadavatele, nebyly ověřeny v registru. Ověřte úplnou adresu a údaje o evidenci podnikatele, oprávnění k nabízeným činnostem, režim DPH, konečné ceny, pravidlo energií za každý vůz, místo předání, způsob platby a dopravu. Podmínky a GDPR musí odpovídat reálnému provozu a smlouvám s poskytovateli hostingu; nejde o potvrzení právní shody. Ověřte také zpracovatelské podmínky a přenosy údajů, retenční postup a zálohy.

## Ověřeno

`npm test`: skutečné databázové testy kombinací a cen, bloků 5/7 h, pracovní doby, nedělí, překryvů, atomického uložení více vozů, perzistence po otevření databáze, kontaktů a souhlasů, zimního/letního času. HTTP integrační test ověřuje závod dvou objednávek (jedna 201, druhá 409), autentizaci správy, storno, CORS, neveřejnost databáze a lokální obrázky.

V Chromium byl proveden celý formulář pro dva vozy (7 + 5 hodin), zápis do databáze a ICS kalendáře, stažení potvrzení, všech sedm kombinací služeb na backendu, mobilní navigace a absence vodorovného přetékání při 390 px, právní dialogy a chování při výpadku API. Prohlížečové testy používají izolovanou testovací databázi; nevytvářejí skutečné zákaznické objednávky ani neodesílají e-maily. Nasazení a trvalý disk na Renderu zatím ověřeny nejsou.
