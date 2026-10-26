import { CATALOG, RULES, money } from "./catalog.js";
export const routes = {
  detailing: {
    name: "Detailing",
    kicker: "DETAILING VOZIDEL",
    title: "Znovu si užijte<br><em>čisté auto.</em>",
    description:
      "Od sedaček po poslední detail karoserie. Vyberte péči, kterou váš vůz potřebuje, a rezervujte si konkrétní čas.",
    photo: "bmw-e60.webp",
    alt: "BMW řady 5 E60",
    action: "Vybrat péči a termín",
    target: "#rezervace",
  },
  servis: {
    name: "Servis vozidel",
    kicker: "SERVIS VOZIDEL",
    title: "Ať se na své auto<br><em>můžete spolehnout.</em>",
    description:
      "Pravidelná údržba nebo problém, který nechcete odkládat? Nejdřív probereme váš vůz, potřebný rozsah práce a cenovou nabídku.",
    photo: "mercedes-w203.webp",
    alt: "Mercedes-Benz třídy C W203",
    action: "Domluvit servis",
    target: "tel:+420736212511",
  },
  prohlidky: {
    name: "Předkupní prohlídky",
    kicker: "PŘEDKUPNÍ PROHLÍDKY",
    title: "Nejdřív prověřit.<br><em>Potom koupit.</em>",
    description:
      "Nadšení z nového auta doplňte informacemi o jeho technickém stavu. Domluvíme rozsah kontroly a vysvětlíme vám zjištění.",
    photo: "bmw-e60.webp",
    alt: "BMW E60",
    action: "Domluvit prohlídku",
    target: "tel:+420736212511",
  },
  odtah: {
    name: "Odtah vozidel",
    kicker: "ODTAH VOZIDEL",
    title: "Naše odtahovka<br><em>je na cestě.</em>",
    description:
      "Připravujeme další službu pro vaši mobilitu. Jakmile bude odtah připravený, najdete zde všechny informace. Zatím jej nelze objednat.",
    action: "Prohlédnout dostupné služby",
    target: "#sluzby",
  },
};
export function faq(items, id = "") {
  return `<div class="faq-list" ${id ? `id="${id}"` : ""}>${items.map(([q, a]) => `<details><summary>${q}<span aria-hidden="true">+</span></summary><div class="faq-answer">${a}</div></details>`).join("")}</div>`;
}
const detailingFAQ = [
  [
    "Jakou péči si mám vybrat?",
    '<p>Pro sedačky, podlahy a kokpit vyberte interiér. Pro karoserii a disky exteriér. Motorový prostor lze přidat samostatně. Všechny tři služby můžete kombinovat. Nejste si jistí? Zavolejte na <a href="tel:+420736212511">736 212 511</a>.</p>',
  ],
  [
    "Jsou uvedené ceny konečné?",
    "<p>Ano, výrazně uvedené ceny již zahrnují povinný poplatek za energie 1 530 Kč za vůz. Při kombinaci služeb ho platíte jen jednou za každý vůz. Případná doprava se naceňuje samostatně předem. Vícepráce pouze po odsouhlasení.</p>",
  ],
  [
    "Jak dlouho bude auto u vás?",
    "<p>Samotné čištění obvykle trvá 4–5 hodin podle stavu a rozsahu. Vždy rezervujeme 5 hodin na každý vůz, s dopravou tam i zpět 7 hodin. Zvolený čas v kalendáři ukazuje celý tento blok.</p>",
  ],
  [
    "Kde detailing probíhá a co znamená působnost po celé ČR?",
    "<p>Působíme z Nové Paky a detailing domlouváme po celé České republice. Místo provedení, možnosti převzetí a cenu dopravy potvrdíme podle konkrétní vzdálenosti a podmínek. Před objednáním dopravy nám zavolejte; není automaticky zdarma ani součástí ceny čištění.</p>",
  ],
  [
    "Co mám připravit před předáním?",
    "<p>Vyjměte osobní věci a cennosti. Sdělte nám známé závady, citlivé materiály nebo zvláštní požadavky. Při převzetí společně projdeme stav vozu, domluvenou péči a způsob předání zpět.</p>",
  ],
  [
    "Mohu rezervovat více vozů nebo změnit termín?",
    '<p>Ano, ve formuláři přidejte další vůz a každému vyberte vlastní služby i čas. Zakázky na sebe mohou navazovat, nemohou se překrývat. Změnu nebo zrušení vyřešíme na <a href="tel:+420736212511">736 212 511</a> nebo e-mailem s číslem rezervace.</p>',
  ],
  [
    "Jak poznám, že je rezervace uložená?",
    "<p>Po úspěšném objednání se zobrazí potvrzení s čísly rezervací a odkazy ke stažení potvrzení, podmínek a souboru pro kalendář. E-mailové potvrzení zatím neposíláme. Pokud se potvrzení nezobrazí, stav ověřte telefonicky.</p>",
  ],
];
export function detailingContent(bookingHTML) {
  return `
<nav class="section-nav" aria-label="Navigace detailingu"><a href="#pece">Co čistíme</a><a href="#prubeh">Jak to probíhá</a><a href="#cenik">Ceník</a><a href="#rezervace">Rezervace</a><a href="#detailing-dotazy">Časté dotazy</a></nav>
<section class="section detail-overview" id="pece"><div class="section-heading"><div><p class="eyebrow">PÉČE PODLE VAŠEHO VOZU</p><h2>Jen to, co potřebujete.<br><em>Nebo všechno najednou.</em></h2></div><p>Interiér, exteriér a motorový prostor můžete libovolně kombinovat. Rozsah vždy přizpůsobíme materiálům a technickému stavu.</p></div><div class="care-overview"><article><span class="line-icon">01</span><h3>Interiér</h3><p>Hloubkové čištění sedaček, podlah i míst, kterých se dotýkáte každý den.</p></article><article><span class="line-icon">02</span><h3>Exteriér</h3><p>Šetrné ruční mytí, péče o disky a čistý vzhled od kol po střechu.</p></article><article><span class="line-icon">03</span><h3>Motorový prostor</h3><p>Odstranění nečistot a péče o plastové kryty vhodným postupem.</p></article></div></section>
<section class="section process-section" id="prubeh"><div class="section-heading"><div><p class="eyebrow">JAK PROBÍHÁ DETAILING</p><h2>Pečlivě. Krok za krokem.</h2></div><p>Nejdřív společně projdeme vůz a domluvíme péči. Potom se pustíme do práce — podle služeb, které si vyberete.</p></div><div class="process-grid"><article><img src="./images/process-wash.webp" width="1536" height="1024" loading="lazy" alt="Šetrné předmytí karoserie BMW E60 aktivní pěnou"><div><span>01 / EXTERIÉR</span><h3>Nečistoty nejdřív uvolníme.</h3><p>Disky, aktivní pěna a následné ruční mytí. Šetrně k materiálům, důsledně k nečistotám.</p></div></article><article><img src="./images/process-interior.webp" width="1536" height="1024" loading="lazy" alt="Mokré čištění látkové sedačky extrakční hubicí"><div><span>02 / INTERIÉR</span><h3>Čistíme i pod povrchem.</h3><p>Vysátí, mokré čištění sedaček a podlah, kokpit i dveře. Následuje potřebné vysušení.</p></div></article><article><img src="./images/process-finish.webp" width="1536" height="1024" loading="lazy" alt="Dosušení čisté karoserie mikrovláknovou utěrkou"><div><span>03 / DOKONČENÍ</span><h3>Projdeme poslední detaily.</h3><p>Zkontrolujeme výsledek a při předání s vámi projdeme provedenou práci i další péči o vůz.</p></div></article></div></section>
<section class="section pricing" id="cenik"><div class="section-heading"><div><p class="eyebrow">CENÍK PRIME AUTO × L&M GARAGE</p><h2>Jasná cena.<br><em>Včetně energií.</em></h2></div><p>Žádné dopočítávání povinného poplatku. Tučně uvedené částky už zahrnují energie za jeden vůz.</p></div><div class="price-grid">${Object.entries(
    CATALOG,
  )
    .map(
      ([key, s]) =>
        `<article class="price-card"><p class="card-kicker">${s.tag}</p><h3>${s.label}</h3><div class="price">${money(s.price + RULES.energy)}</div><p class="price-caption">celkem za jeden vůz</p><p class="price-breakdown">Čištění ${money(s.price)} + energie ${money(RULES.energy)}</p><ul>${s.features.map((f) => `<li>${f}</li>`).join("")}</ul><a class="button button-outline" href="#rezervace" data-select-service="${key}">Vybrat tuto péči <span>↗</span></a></article>`,
    )
    .join(
      "",
    )}</div><div class="bundle"><div><p class="eyebrow">CHCETE KOMPLETNÍ PÉČI?</p><h3>Interiér + exteriér + motor</h3><p>Energie pouze jednou za vůz. Bez umělé slevy a skrytých příplatků.</p></div><strong>${money(Object.values(CATALOG).reduce((sum, s) => sum + s.price, RULES.energy))}</strong><a class="button" href="#rezervace" data-select-service="all">Vybrat všechny služby <span>↗</span></a></div><div class="transport-note"><span class="transport-arrow" aria-hidden="true">↔</span><div><h3>Auto převezmeme a přivezeme zpět po domluvě.</h3><p>Detailing po celé ČR. Dostupnost a cenu dopravy podle vzdálenosti odsouhlasíme předem. Cena dopravy není součástí výše uvedených částek.</p></div><a href="tel:+420736212511">Probrat dopravu ↗</a></div></section>
${bookingHTML()}
<section class="section faq-section" id="detailing-dotazy"><div><p class="eyebrow">NEŽ NÁM SVĚŘÍTE KLÍČE</p><h2>Časté dotazy.</h2><p>Máte něco dalšího na srdci?</p><a class="inline-phone" href="tel:+420736212511">736 212 511 ↗</a></div>${faq(detailingFAQ)}</section>`;
}
export function otherContent(key) {
  if (key === "odtah")
    return `<section class="section narrow"><div class="notice-panel"><p class="eyebrow">SLUŽBU PŘIPRAVUJEME</p><h2>Ještě nejsme na výjezdu.</h2><p>Termín spuštění a ceny zveřejníme, až bude služba skutečně dostupná. Teď si u nás můžete domluvit detailing, servis nebo předkupní prohlídku.</p><a class="button" href="#sluzby">Vybrat dostupnou službu <span>↗</span></a></div></section>`;
  const inspection = key === "prohlidky";
  return `<section class="section"><div class="section-heading"><div><p class="eyebrow">JAK TO FUNGUJE</p><h2>${inspection ? "Více informací.<br><em>Lepší rozhodnutí.</em>" : "Nejdřív domluva.<br><em>Potom práce.</em>"}</h2></div><p>${inspection ? "Rozsah prohlídky závisí na konkrétním autě, místě a možnostech prodávajícího. Vše si ujasníme předem." : "Žádný vůz ani požadavek není stejný. Proto cenu a termín servisu domlouváme individuálně."}</p></div><div class="care-overview"><article><span class="line-icon">01</span><h3>${inspection ? "Pošlete nám vybraný vůz" : "Řekněte nám o svém autě"}</h3><p>${inspection ? "Připravte odkaz na nabídku, model, rok výroby a místo prohlídky." : "Značka, model, motorizace a popis potíží nebo požadované údržby."}</p></article><article><span class="line-icon">02</span><h3>Odsouhlasíme rozsah a cenu</h3><p>Domluvíme konkrétní službu, termín, místo a konečnou cenovou nabídku.</p></article><article><span class="line-icon">03</span><h3>${inspection ? "Vysvětlíme zjištění" : "Projdeme provedenou práci"}</h3><p>${inspection ? "Zjištěné skutečnosti s vámi srozumitelně probereme. O koupi rozhodujete vy." : "Při předání vám řekneme, co bylo provedeno a co doporučujeme dál."}</p></article></div><div class="service-contact"><div><p class="eyebrow">TERMÍN A CENU DOMLUVÍME OSOBNĚ</p><h3>${inspection ? "Máte už vybraný vůz?" : "Co váš vůz potřebuje?"}</h3><p>Zavolejte nebo napište na primeautokontakt@gmail.com.</p></div><a class="button" href="tel:+420736212511">736 212 511 <span>↗</span></a></div><p class="small-note">${inspection ? "Prohlídka není zárukou odhalení všech skrytých vad ani budoucí bezporuchovosti. Některé závady lze zjistit až demontáží nebo specializovaným měřením. Dostupný rozsah kontroly si dohodneme předem." : "Pokud máte pochybnosti o bezpečnosti vozu, nepokračujte v jízdě. Tento kontakt není nonstop asistenční linka; odtah zatím není dostupný."}</p></section><section class="section faq-section alternate"><div><p class="eyebrow">DOBRÉ VĚDĚT</p><h2>Časté dotazy.</h2></div>${faq(
    inspection
      ? [
          [
            "Co si připravit před objednáním?",
            "<p>Odkaz na inzerát, značku a model, rok, místo prohlídky a kontakt na prodávajícího. Probereme možnosti přístupu k autu a zkušební jízdy.</p>",
          ],
          [
            "Kolik prohlídka stojí?",
            "<p>Cena závisí na rozsahu a místu. Konkrétní částku potvrdíme předem po telefonu. Bez vaší domluvy nezačínáme placenou práci.</p>",
          ],
          [
            "Odhalí prohlídka úplně všechny vady?",
            "<p>Ne. Některé skryté nebo přerušované závady se při prohlídce nemusí projevit. Výsledek je podkladem pro vaše rozhodnutí, nikoli zárukou bezporuchovosti.</p>",
          ],
        ]
      : [
          [
            "Jak získám cenu servisu?",
            "<p>Zavolejte a popište požadavek. Pokud je nejdřív nutné zjistit příčinu potíží, předem si domluvíme rozsah a cenu tohoto zjištění i další postup.</p>",
          ],
          [
            "Mohu přijet bez objednání?",
            "<p>Prosím nejdřív zavolejte. Domluvíme vhodný čas a místo předání vozu, abychom se vám mohli věnovat.</p>",
          ],
          [
            "Můžete zajistit odtah nepojízdného vozu?",
            "<p>Naši odtahovou službu zatím připravujeme. V tuto chvíli ji nelze objednat.</p>",
          ],
        ],
  )}</section>`;
}
