# Revize Prime Auto — 26. října 2026

## Cíl a zjištění

Zjednodušit cestu návštěvníka od výběru služby k reálné objednávce. Původní verze schovávala konkrétní služby za obecný odkaz, používala méně výrazné konečné ceny a dlouhý jednolitý formulář. CSS obsahovalo historické přepisy ze starších verzí.

Jako dostupné srovnání byla prohlédnuta struktura otevřené automobilové šablony [Autofix](https://github.com/codewithsadee/autofix): výrazný vstup, samostatné služby, přímý kontakt a jasný další krok. Vlastní značku, grafiku a implementaci zachovává Prime Auto. Externí weby Autoglym a Meguiar’s byly z této sítě blokované; nebyly hodnoceny jako načtené reference. Ze srovnání nebyly převzaty smyšlené statistiky, recenze ani tvrzení o zkušenostech.

## Co se změnilo

- Přímé odkazy na služby v hlavním menu, stejně výrazné karty na úvodu, sticky navigace, mobilní lišta s relevantním kontaktem.
- Samostatná orientace v detailingu: péče → průběh → ceník → rezervace → dotazy.
- Tři lokální obrázky průběhu: předmytí, čištění sedačky, dokončení. Jde o generované ilustrační podklady, nikoli fotodokumentaci zakázek. Výchozí originály zůstávají zachované mimo publikační složku; na webu jsou úsporné WebP soubory.
- Konečné ceny včetně energií jsou hlavní cenou, rozpad ceny je pod nimi. Jediný sdílený katalog pro klienta i server zabraňuje rozdílným částkám.
- Tříkrokový formulář: vůz a péče, termín, kontakt a kontrola. Přehled objednávky zůstává po ruce. Všechny kombinace služeb a více vozů; časové kolize jsou viditelné už při výběru.
- Idempotentní odeslání: stejná objednávka po výpadku spojení nevytváří další rezervaci. Změněný požadavek se stejným klíčem server odmítne.
- Jednotná časová zóna Europe/Prague, přísnější validace typů a zákaz přepsání společného kontaktu údaji z vozu.
- Korektní zpracování češtiny i při rozdělení UTF-8 znaků mezi síťové bloky; korektní skládání řádků ICS kalendáře.
- Soukromá správa umí vlastní blokace pracovní doby a jejich uvolnění. Blokace neruší již přijaté rezervace a její důvod není veřejný.
- Kód rozdělen na obsah, formulář, katalog a kalendář. Historické přepisy CSS nahrazeny jedním souborem.
- Windows má vlastní spouštěč `spustit-web.cmd` a návod k bezpečné aktualizaci se zachováním databáze.

## Ověření

- `npm run check`: syntaktická kontrola všech JavaScriptových souborů.
- `npm test`: 11 úspěšných testů, včetně databáze, perzistence, transakcí, časových kolizí, idempotence, správy, vlastních blokací, češtiny a HTTP autentizace.
- Chromium: celá tříkroková objednávka dvou vozů (7 + 5 hodin), skutečný zápis, stažení potvrzení, storno a vlastní blokace ve správě, mobilní menu a ovládání, offline stav, právní dialog a návrat zaměření.
- Automatický audit axe-core pro WCAG 2 A/AA a 2.1 AA: po opravě kontrastu žádné automaticky zjištěné porušení na úvodu, detailingu, rezervaci, servisu, prohlídkách a odtahu. Nejde o úplnou certifikaci přístupnosti; automatika nenahrazuje uživatelské testování.
- Žádné skutečné zákaznické objednávky ani e-maily nebyly při testování vytvořeny. Testy používají izolované databáze.

## Co vyžaduje skutečný provoz

Veřejné rezervace stále potřebují server s trvalým diskem; GitHub Pages samotné je neprovozuje. Render je připravený konfigurací, ale placená služba nebyla založena. Automatické potvrzovací e-maily nejsou nakonfigurované a rozhraní to uvádí. Fotografie reálných realizací musí dodat provozovatel. Před komerčním spuštěním zbývá ověřit úplné podnikatelské údaje a oprávnění, skutečná pravidla dopravy, platby, DPH, hostingové a zpracovatelské podmínky. Právní texty nejsou právním posudkem. Indexování je pro pracovní náhled záměrně vypnuté; veřejnou adresu a SEO indexaci nastavte při ostrém spuštění.

Spouštěč pro Windows byl zkontrolován na úrovni zdrojového kódu; v tomto Linuxovém prostředí nebylo možné ověřit spuštění Windows prohlížeče. Zaručené zvýšení prodeje nelze bez provozních dat tvrdit; úpravy odstraňují konkrétní překážky při výběru a objednání.
