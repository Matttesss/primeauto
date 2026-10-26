const $ = (s) => document.querySelector(s);
const services = {
  interier: ["Kompletní interiér", 3990],
  exterier: ["Základní exteriér", 1990],
  motor: ["Motorový prostor", 990],
  komplet: ["Interiér + exteriér + motor", 6970],
};
const money = (n) => new Intl.NumberFormat("cs-CZ").format(n) + " Kč";
const routes = {
  detailing: {
    name: "Detailing vozidel",
    eyebrow: "01 / PÉČE O VZHLED",
    title: "Čistota je začátek.<br><em>Detail je rozdíl.</em>",
    description:
      "Interiér, exteriér i motorový prostor. Služby libovolně kombinujte a rezervujte si vlastní čas. Detailing po celé ČR po předchozí domluvě, pondělí až sobota 8:00–20:00.",
    photo: "photo-detail",
  },
  servis: {
    name: "Servis vozidel",
    eyebrow: "02 / PÉČE O TECHNIKU",
    title: "Dobrá péče začíná<br><em>správnou domluvou.</em>",
    description:
      "Ozývá se neobvyklý zvuk, blíží se údržba nebo se objevila závada? Zavolejte nám. Probereme příznaky a domluvíme další postup, rozsah i cenu.",
    photo: "photo-service",
  },
  prohlidky: {
    name: "Předkupní prohlídky",
    eyebrow: "03 / JISTOTA PŘI KOUPI",
    title: "Než převezmete klíče,<br><em>poznejte svůj vůz.</em>",
    description:
      "Vysněné auto si zaslouží i střízlivý pohled. Domluvte si nezávislé posouzení jeho technického stavu a získejte další podklady pro rozhodnutí.",
    photo: "photo-inspection",
  },
  odtah: {
    name: "Odtah vozidel",
    eyebrow: "04 / PÉČE NA CESTÁCH",
    title: "Naše odtahovka<br><em>je právě na cestě.</em>",
    description:
      "Rozšiřujeme péči o vaše auto také na cesty. Jakmile bude odtahová služba připravena, dáme vám zde vědět. V tuto chvíli odtah ani výjezd nelze objednat.",
    photo: "tow-detail",
  },
};
function detailingContent() {
  return `<section class="detail-section"><p class="eyebrow">JAK DETAILING PROBÍHÁ</p><h2>Od předání k dobrému pocitu.</h2><div class="steps"><div><b>01 / DOMLUVA</b><h3>Vybereme vhodnou péči</h3><p>Probereme stav auta, rozsah, cenu a termín.</p></div><div><b>02 / PŘEVZETÍ</b><h3>Zaznamenáme stav</h3><p>Projdeme vůz a odsouhlasíme konkrétní práci.</p></div><div><b>03 / DETAILING</b><h3>Postaráme se o detaily</h3><p>Postup přizpůsobíme materiálům a stavu vozu.</p></div><div><b>04 / PŘEDÁNÍ</b><h3>Společně vše projdeme</h3><p>Předáme výsledek a doporučení k další péči.</p></div></div></section>
<section class="detail-section pricing" id="cenik"><p class="eyebrow">CENÍK L&M GARAGE</p><h2>Víte, za co platíte.</h2><div class="price-grid">
<article class="price-card"><h3>Kompletní interiér</h3><div class="price">3 990 <small>Kč</small></div><p class="inclusive">S energiemi celkem <strong>5 520 Kč</strong></p><ul><li>Vysátí interiéru</li><li>Mokré kartáčování podlah a koberečků</li><li>Mokré čištění sedaček a vysušení</li><li>Volant, kokpit, plasty a displeje</li><li>Dveře, mezidveří a prahy</li><li>Provonění interiéru</li></ul><a class="button" href="#rezervace" data-service="interier">Vybrat interiér <span>↗</span></a></article>
<article class="price-card"><h3>Základní exteriér</h3><div class="price">1 990 <small>Kč</small></div><p class="inclusive">S energiemi celkem <strong>3 520 Kč</strong></p><ul><li>Dekontaminace a čištění disků</li><li>Oživení pneumatik</li><li>Předmytí aktivní pěnou</li><li>Ruční mytí</li></ul><a class="button" href="#rezervace" data-service="exterier">Vybrat exteriér <span>↗</span></a></article>
<article class="price-card"><h3>Motorový prostor</h3><div class="price">990 <small>Kč</small></div><p class="inclusive">S energiemi celkem <strong>2 520 Kč</strong></p><ul><li>Odstranění hrubých nečistot</li><li>Vyčištění motorového prostoru</li><li>Oživení plastových krytů</li><li>Postup podle technického stavu</li></ul><a class="button" href="#rezervace" data-service="motor">Vybrat motor <span>↗</span></a></article></div><div class="transport"><div><h3>Převzetí u vás a doprava zpět</h3><p>Máte zájem o dopravu vozu na detailing a zpět? Dostupnost a cenu podle vzdálenosti domluvíme předem. Nejde o odtahovou službu.</p></div><a href="tel:+420736212511">Domluvit dopravu ↗</a></div><p class="image-note">Poplatek za energie (voda, elektřina) 1 530 Kč je již zahrnut v uvedených celkových částkách. Účtuje se jednou za každý vůz i při kombinaci služeb. Vícepráce pouze s vaším předchozím souhlasem.</p></section>
${bookingHTML()}`;
}
function otherContent(key) {
  if (key === "odtah")
    return `<section class="detail-section"><div class="detail-info-grid"><article class="info-card"><span class="status-chip">PŘIPRAVUJEME</span><h3>Další krok pro Prime Auto.</h3><p>Odtah bude přirozeným rozšířením našich služeb. Zatím pracujeme na jeho přípravě, proto zde neuvádíme termín spuštění, dojezdové časy ani ceny.</p><p>Až bude služba dostupná, najdete zde aktuální podmínky a kontaktní postup.</p></article><article class="info-card"><h3>Co pro vás můžeme udělat už teď?</h3><p>Domluvit detailing, probrat servis nebo pomoci s posouzením auta před koupí. Vyberte službu a ozvěte se nám.</p><a class="button" href="#sluzby">Zpět na všechny služby <span>↗</span></a></article></div></section>`;
  const inspection = key === "prohlidky";
  return `<section class="detail-section"><p class="eyebrow">JAK TO FUNGUJE</p><h2>${inspection ? "Rozhodnutí s lepšími podklady." : "Od prvního telefonu k jasnému plánu."}</h2><div class="steps"><div><b>01 / KONTAKT</b><h3>${inspection ? "Pošlete nám nabídku" : "Popište nám problém"}</h3><p>${inspection ? "Připravte odkaz na inzerát, model, rok a místo prohlídky." : "Připravte značku, model, rok a popis potíží či požadované údržby."}</p></div><div><b>02 / DOMLUVA</b><h3>Rozsah a cena předem</h3><p>Potvrdíme vhodný termín, místo a konkrétní rozsah služby.</p></div><div><b>03 / PROVEDENÍ</b><h3>${inspection ? "Projdeme stav vozu" : "Vůz převezmeme"}</h3><p>${inspection ? "Kontrolu provedeme v domluveném rozsahu a podle dostupných podmínek." : "Stav a požadavek probereme při převzetí. Změny rozsahu nejdřív konzultujeme."}</p></div><div><b>04 / VÝSLEDEK</b><h3>${inspection ? "Vysvětlíme zjištění" : "Projdeme provedenou práci"}</h3><p>${inspection ? "Probereme zjištěné skutečnosti a jejich význam pro vaše rozhodnutí." : "Při předání vysvětlíme provedené úkony a případná další doporučení."}</p></div></div></section><section class="detail-section pricing"><div class="detail-info-grid"><article class="info-card"><h3>${inspection ? "Co si domluvíme před prohlídkou" : "Nejdřív potřebujeme znát vaše auto"}</h3><ul>${inspection ? "<li>Konkrétní vozidlo a místo prohlídky.</li><li>Možnost zkušební jízdy a přístupu k vozu.</li><li>Dostupné doklady a souhlas prodávajícího.</li><li>Rozsah kontroly, čas a konečnou cenu.</li>" : "<li>Značku, model, motorizaci a rok výroby.</li><li>Popis závady, kontrolky a projevy při jízdě.</li><li>Požadovaný servis nebo plánovanou údržbu.</li><li>Termín, způsob předání a cenovou nabídku.</li>"}</ul></article><article class="info-card"><p class="eyebrow">OBJEDNÁNÍ PO TELEFONU</p><h3>Probereme to spolu.</h3><p>Cena je individuální podle rozsahu ${inspection ? "prohlídky, místa a dostupných podmínek" : "práce a potřeb vašeho vozu"}. Konkrétní nabídku si odsouhlasíme předem.</p><a class="button" href="tel:+420736212511">736 212 511 <span>↗</span></a><p>Nebo napište na <a href="mailto:primeautokontakt@gmail.com">primeautokontakt@gmail.com</a>.</p></article></div><div class="note-panel">${inspection ? "Předkupní prohlídka není zárukou budoucí bezporuchovosti ani odhalení všech skrytých vad. Některá zjištění vyžadují demontáž nebo specializované vybavení; možnosti kontroly si vždy domluvíme předem." : "Pokud máte pochybnosti o bezpečnosti vozu, nepokračujte v jízdě. Zde uvedený kontakt není nonstop asistenční linkou a odtahová služba zatím není dostupná."}</div></section>`;
}
function renderDetail(key) {
  const r = routes[key];
  const tow = $(".photo-tow svg").outerHTML;
  $("#detail-view").innerHTML =
    `<div class="detail-top"><a href="#domu">← Zpět na úvod</a> / &nbsp; ${r.name}</div><section class="detail-hero"><div class="detail-copy"><p class="eyebrow">${r.eyebrow}</p>${key === "odtah" ? '<span class="status-chip">SLUŽBU PŘIPRAVUJEME</span>' : ""}<h1>${r.title}</h1><p>${r.description}</p>${key === "detailing" ? '<a class="button" href="#cenik">Prohlédnout ceník <span>↓</span></a>' : key !== "odtah" ? '<a class="button" href="tel:+420736212511">Domluvit ' + (key === "servis" ? "servis" : "prohlídku") + " <span>↗</span></a>" : ""}</div><div class="detail-banner-photo ${r.photo}" role="img" aria-label="Automobil">${key === "odtah" ? tow : ""}</div></section>${key === "detailing" ? detailingContent() : otherContent(key)}<div class="other-services"><span>DALŠÍ SLUŽBY PRIME AUTO</span>${Object.entries(
      routes,
    )
      .filter(([k]) => k !== key)
      .map(([k, v]) => `<a href="#${k}">${v.name} ↗</a>`)
      .join("")}</div>`;
  if (key === "detailing") bindBooking();
  bindLegal($("#detail-view"));
}
let active = "";
function route() {
  const hash = decodeURIComponent(location.hash.slice(1)) || "domu";
  const booking = ["cenik", "rezervace"].includes(hash);
  const key = routes[hash] ? hash : booking ? "detailing" : "";
  const change = active !== key;
  if (key) {
    $("#home-view").hidden = true;
    $("#detail-view").hidden = false;
    if (change) renderDetail(key);
    document.title = routes[key].name + " | Prime Auto";
  } else {
    $("#home-view").hidden = false;
    $("#detail-view").hidden = true;
    document.title = "Prime Auto — Péče. Jistota. Mobilita.";
  }
  active = key;
  $("#navigation").classList.remove("open");
  $(".menu-toggle").setAttribute("aria-expanded", "false");
  requestAnimationFrame(() => {
    if (booking || ["sluzby", "pristup", "kontakt"].includes(hash))
      document.getElementById(hash)?.scrollIntoView({ behavior: "instant" });
    else if (change || hash === "domu")
      window.scrollTo({ top: 0, behavior: "instant" });
  });
}
function bookingHTML() {
  return `<section class="detail-section" id="rezervace"><p class="eyebrow">ONLINE REZERVACE</p><h2>Vaše auto. Váš termín.</h2><div class="booking-grid"><aside class="booking-aside"><h3>Vyberte služby a čas.</h3><p>Interiér, exteriér i motor můžete libovolně kombinovat. Pro každý vůz vyberte vlastní termín.</p><dl><div><dt>Otevřeno</dt><dd>Po–So · 8:00–20:00</dd></div><div><dt>Detailing jednoho vozu</dt><dd>5 hodin</dd></div><div><dt>Včetně dopravy</dt><dd>7 hodin</dd></div><div><dt>Neděle</dt><dd>Zavřeno</dd></div></dl><p>Pracujeme po celé ČR po předchozí domluvě. Dostupnost a cena dopravy závisí na místě; cenu si odsouhlasíme zvlášť.</p><a class="phone-box" href="tel:+420736212511"><small>DOTAZY K VÝBĚRU NEBO TERMÍNU?</small><strong>736 212 511 ↗</strong><span>Rádi vše probereme po telefonu.</span></a><p class="form-note">Kalendář zobrazuje pouze termíny vrácené rezervačním serverem. Obsazený čas už nelze znovu objednat.</p></aside><form id="booking-form"><div class="booking-connection" id="booking-connection" role="status">Ověřujeme dostupnost online rezervací…</div><div id="vehicle-list"></div><button class="add-vehicle" type="button" id="add-vehicle">+ Přidat další vozidlo</button><h3 class="contact-form-title">Vaše kontaktní údaje</h3><div class="fields"><label>Jméno a příjmení<input name="name" required autocomplete="name" maxlength="120" placeholder="Jan Novák"></label><label>Telefon<input name="phone" required type="tel" autocomplete="tel" pattern="[+0-9 ()-]{9,25}" maxlength="25" placeholder="+420 777 123 456"></label></div><label>E-mail<input name="email" required type="email" autocomplete="email" maxlength="200" placeholder="vas@email.cz"></label><label>Co bychom měli vědět?<textarea name="message" rows="3" maxlength="2000" placeholder="Stav vozů, místo dopravy, další přání…"></textarea></label><label class="honeypot" aria-hidden="true">Web<input name="website" tabindex="-1" autocomplete="off"></label><div class="order-summary" id="estimate" aria-live="polite"></div><label class="checkbox"><input name="acceptedTerms" required type="checkbox"><span>Souhlasím s <button type="button" class="inline" data-legal="terms">obchodními podmínkami</button> a beru na vědomí <button type="button" class="inline" data-legal="privacy">informace o osobních údajích</button>. Objednávám vybrané služby za zobrazenou cenu; případnou dopravu a její cenu sjednáme samostatně.</span></label><label class="checkbox" id="early-label"><input name="earlyStart" type="checkbox"><span>Pro termín do 14 dnů výslovně žádám o zahájení služby před uplynutím lhůty pro odstoupení. Beru na vědomí zákonné podmínky úhrady již poskytnutého plnění a zániku práva odstoupit po úplném poskytnutí služby.</span></label><button class="button submit" type="submit" disabled>Objednat s povinností platby <span>↗</span></button><p class="form-note">Termín je uložený až po potvrzení na této stránce. Cena dopravy není zahrnuta. Potvrzení s podmínkami si po objednání stáhnete. E-mailové potvrzení zatím neposíláme.</p><div id="form-status" role="status" aria-live="polite"></div></form></div></section>`;
}
function bindBooking() {
  const form = $("#booking-form"),
    list = $("#vehicle-list");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const iso = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const base = (window.PRIME_BOOKING?.apiBase || "").replace(/\/$/, "");
  const api = (path) =>
    base
      ? base + "/api/" + path
      : new URL("api/" + path, new URL(".", location.href)).href;
  let vehicleId = 0,
    submitted = false;
  const cards = () => [...list.querySelectorAll(".vehicle-card")];
  const selected = (c) =>
    [...c.querySelectorAll("[data-service-option]:checked")].map(
      (i) => i.value,
    );
  const duration = (c) =>
    c.querySelector("[data-transport]").checked ? 420 : 300;
  const cost = (c) =>
    selected(c).reduce((sum, k) => sum + services[k][1], 0) +
    (selected(c).length ? 1530 : 0);
  function summary() {
    const all = cards(),
      sum = all.reduce((n, c) => n + cost(c), 0);
    $("#estimate").textContent =
      `Celkem za čištění ${all.length} ${all.length === 1 ? "vozu" : "vozů"} včetně energií: ${money(sum)}. Doprava bude naceněna zvlášť.`;
    const early = all.some((c) => {
      const date = c.querySelector("[data-date]").value;
      return (
        date &&
        new Date(date + "T08:00:00") < new Date(Date.now() + 14 * 86400000)
      );
    });
    form.elements.earlyStart.required = early;
    $("#early-label").hidden = !early;
    form.querySelector(".submit").disabled =
      submitted ||
      !all.every(
        (c) =>
          c.dataset.ready === "true" &&
          c.querySelector("[data-time]").value &&
          selected(c).length,
      );
  }
  async function slots(c) {
    const seq = Number(c.dataset.seq || 0) + 1;
    c.dataset.seq = seq;
    c.dataset.ready = "false";
    const date = c.querySelector("[data-date]"),
      time = c.querySelector("[data-time]"),
      status = c.querySelector("[data-slot-status]");
    const previous = time.value;
    time.replaceChildren(new Option("Vyberte nejprve den a služby", ""));
    time.disabled = true;
    summary();
    if (!selected(c).length) {
      status.textContent = "Vyberte alespoň jednu službu.";
      return;
    }
    if (!date.value) return;
    if (new Date(date.value + "T12:00:00").getDay() === 0) {
      date.setCustomValidity(
        "V neděli máme zavřeno. Vyberte pondělí až sobotu.",
      );
      status.textContent = "V neděli máme zavřeno.";
      return;
    }
    date.setCustomValidity("");
    status.textContent = "Načítáme volné časy…";
    try {
      const query = new URLSearchParams({
        date: date.value,
        services: selected(c).join(","),
        transport: String(c.querySelector("[data-transport]").checked),
      });
      const response = await fetch(api("availability?" + query), {
        signal: AbortSignal.timeout(10000),
        cache: "no-store",
      });
      if (!response.ok) throw Error("offline");
      const data = await response.json();
      if (Number(c.dataset.seq) !== seq) return;
      if (!data.enabled || !Array.isArray(data.slots)) throw Error("offline");
      c.dataset.ready = "true";
      $("#booking-connection").textContent =
        "Online rezervace jsou připojené. Časy ověřujeme proti uloženým objednávkám.";
      $("#booking-connection").classList.add("connected");
      time.replaceChildren(
        new Option(
          data.slots.length
            ? "Vyberte čas příjezdu"
            : "Tento den není volný termín",
          "",
        ),
      );
      for (const s of data.slots)
        time.add(new Option(`${s.time}–${s.endTime}`, s.time));
      time.disabled = !data.slots.length;
      if (data.slots.some((s) => s.time === previous)) time.value = previous;
      status.textContent = data.slots.length
        ? `Blok ${duration(c) / 60} hodin · Po–So 8:00–20:00`
        : "Zkuste jiný den. Neděle jsou zavřené.";
    } catch {
      if (Number(c.dataset.seq) !== seq) return;
      status.textContent = "Online termíny nyní nejsou dostupné.";
      $("#booking-connection").textContent =
        "Online rezervace zatím nejsou připojené. Termín si prosím domluvte na 736 212 511. Neodesíláme neuložené objednávky.";
      $("#booking-connection").classList.remove("connected");
    }
    summary();
  }
  function addVehicle(initial = ["interier"]) {
    if (cards().length >= 6) return;
    const c = document.createElement("fieldset");
    c.className = "vehicle-card";
    c.dataset.ready = "false";
    c.innerHTML = `<legend>Vozidlo <span data-car-number></span></legend><button type="button" class="remove-vehicle" aria-label="Odebrat vozidlo">Odebrat</button><label>Značka a model<input data-model required maxlength="160" placeholder="Např. BMW E60"></label><div class="service-choice-label">Vyberte jednu nebo více služeb <button type="button" data-select-all>Vybrat vše</button></div><div class="service-choices">${["interier", "exterier", "motor"].map((k) => `<label><input type="checkbox" data-service-option value="${k}" ${initial.includes(k) ? "checked" : ""}><span>${services[k][0]}<small>${money(services[k][1])}</small></span></label>`).join("")}</div><label class="checkbox transport-choice"><input type="checkbox" data-transport><span>Doprava vozu tam i zpět · blok 7 hodin<br><small>Cena dopravy po individuální dohodě.</small></span></label><div class="fields"><label>Den<input type="date" data-date required min="${iso(today)}"></label><label>Čas příjezdu<select data-time required disabled><option value="">Vyberte nejprve den</option></select></label></div><p class="slot-status" data-slot-status aria-live="polite"></p>`;
    c.dataset.key = ++vehicleId;
    list.append(c);
    const max = new Date(today);
    max.setDate(max.getDate() + 120);
    c.querySelector("[data-date]").max = iso(max);
    const initialDate = new Date(today);
    initialDate.setDate(initialDate.getDate() + 1);
    if (initialDate.getDay() === 0)
      initialDate.setDate(initialDate.getDate() + 1);
    c.querySelector("[data-date]").value = iso(initialDate);
    c.querySelector(".remove-vehicle").onclick = () => {
      c.remove();
      renumber();
      summary();
    };
    c.querySelector("[data-select-all]").onclick = () => {
      c.querySelectorAll("[data-service-option]").forEach(
        (i) => (i.checked = true),
      );
      slots(c);
    };
    c.querySelectorAll(
      "[data-service-option],[data-transport],[data-date]",
    ).forEach((i) => (i.onchange = () => slots(c)));
    c.querySelector("[data-time]").onchange = summary;
    renumber();
    slots(c);
  }
  function renumber() {
    cards().forEach((c, i) => {
      c.querySelector("[data-car-number]").textContent = i + 1;
      c.querySelector(".remove-vehicle").hidden = cards().length === 1;
    });
    $("#add-vehicle").disabled = cards().length >= 6;
  }
  $("#add-vehicle").onclick = () => addVehicle();
  document.querySelectorAll("[data-service]").forEach(
    (a) =>
      (a.onclick = () => {
        const c = cards()[0];
        c.querySelectorAll("[data-service-option]").forEach((i) => {
          i.checked = i.value === a.dataset.service;
        });
        slots(c);
      }),
  );
  addVehicle();
  form.onsubmit = async (e) => {
    e.preventDefault();
    if (submitted || !form.reportValidity()) return;
    const f = new FormData(form);
    const vehicles = cards().map((c) => ({
      vehicle: c.querySelector("[data-model]").value.trim(),
      services: selected(c),
      transport: c.querySelector("[data-transport]").checked,
      date: c.querySelector("[data-date]").value,
      time: c.querySelector("[data-time]").value,
    }));
    if (vehicles.some((v) => !v.services.length || !v.time)) {
      $("#form-status").textContent =
        "U každého vozu vyberte služby a volný čas.";
      return;
    }
    submitted = true;
    summary();
    $("#form-status").textContent =
      "Ukládáme rezervaci a blokujeme vybrané časy…";
    try {
      const response = await fetch(api("bookings"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.get("name"),
          phone: f.get("phone"),
          email: f.get("email"),
          message: f.get("message"),
          website: f.get("website"),
          acceptedTerms: f.get("acceptedTerms") === "on",
          earlyStart: f.get("earlyStart") === "on",
          vehicles,
        }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await response.json();
      if (!response.ok)
        throw Object.assign(
          Error(data.error || "Rezervaci se nepodařilo uložit."),
          { conflict: response.status === 409 },
        );
      $("#form-status").replaceChildren();
      const heading = document.createElement("strong");
      heading.textContent = "Hotovo. Vaše termíny jsou uložené.";
      $("#form-status").append(heading);
      for (const r of data.reservations) {
        const p = document.createElement("p");
        p.textContent = `${r.vehicle} · ${r.date.split("-").reverse().join(". ")} · ${r.time}–${r.endTime} · ${money(r.total)} · rezervace ${r.id}`;
        $("#form-status").append(p);
      }
      const info = document.createElement("p");
      info.textContent =
        "Uložte si čísla rezervací. Změnu nebo zrušení vyřešíte na 736 212 511. Potvrzení e-mailem zatím neposíláme.";
      $("#form-status").append(info);
      downloadConfirmation(data, {
        name: f.get("name"),
        phone: f.get("phone"),
        email: f.get("email"),
      });
      form
        .querySelectorAll("input,select,textarea,button")
        .forEach((el) => (el.disabled = true));
      $("#form-status").scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (err) {
      $("#form-status").textContent =
        err.name === "TimeoutError"
          ? "Spojení vypršelo. Rezervace již mohla být uložena; před opakováním zavolejte na 736 212 511, abychom předešli duplicitě."
          : err.message || "Služba není dostupná. Zavolejte na 736 212 511.";
      submitted = false;
      cards().forEach((c) => slots(c));
      summary();
    }
  };
}

function bindLegal(root = document) {
  root.querySelectorAll("[data-legal]").forEach(
    (b) =>
      (b.onclick = () => {
        $("#legal-content").innerHTML = window.PRIME_LEGAL[b.dataset.legal];
        $("#legal-dialog").showModal();
      }),
  );
}
bindLegal();
$(".dialog-close").onclick = () => $("#legal-dialog").close();
$("#legal-dialog").onclick = (e) => {
  if (e.target === $("#legal-dialog")) {
    const r = e.target.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      e.target.close();
  }
};
$(".menu-toggle").onclick = () => {
  const open = $("#navigation").classList.toggle("open");
  $(".menu-toggle").setAttribute("aria-expanded", String(open));
};
$("#year").textContent = new Date().getFullYear();
window.addEventListener("hashchange", route);
route();
function hydrateIcons(root = document.body) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) {
    const n = walker.currentNode;
    if (
      n.textContent.includes("↗") &&
      !["SCRIPT", "STYLE", "TEXTAREA"].includes(n.parentElement.tagName)
    )
      nodes.push(n);
  }
  for (const n of nodes) {
    const fragment = document.createDocumentFragment();
    n.textContent.split("↗").forEach((part, index) => {
      if (index) {
        const svg = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg",
        );
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("class", "arrow-icon");
        svg.setAttribute("aria-hidden", "true");
        const path = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path",
        );
        path.setAttribute("d", "M5 19L19 5M5 5h14v14");
        svg.append(path);
        fragment.append(svg);
      }
      fragment.append(document.createTextNode(part));
    });
    n.replaceWith(fragment);
  }
}
hydrateIcons();
window.addEventListener("hashchange", () => hydrateIcons());
$("#navigation")
  .querySelectorAll("a")
  .forEach((a) =>
    a.addEventListener("click", () => {
      $("#navigation").classList.remove("open");
      $(".menu-toggle").setAttribute("aria-expanded", "false");
    }),
  );

function downloadConfirmation(data, contact) {
  const node = document.createElement("div");
  node.innerHTML = window.PRIME_LEGAL.terms;
  const stamp = (t) =>
    new Date(t)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  const esc = (s) =>
    String(s)
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  const detail = data.reservations
    .map(
      (r) =>
        `${r.vehicle} | ${r.date} ${r.time}–${r.endTime} (Europe/Prague) | ${r.services.map((k) => services[k][0]).join(", ")} | ${money(r.total)} | číslo ${r.id}`,
    )
    .join("\n");
  const text = `PRIME AUTO – POTVRZENÍ OBJEDNÁVKY\nMatěj Krejčí, IČO 29752663\nHusitská 1321, Nová Paka\n736 212 511 | primeautokontakt@gmail.com\n\nZákazník: ${contact.name}\nTelefon: ${contact.phone}\nE-mail: ${contact.email}\n\n${detail}\n\nCelkem za služby včetně energií: ${money(data.total)}\nDoprava není součástí této ceny a sjednává se samostatně.\n\nOBCHODNÍ PODMÍNKY\n${node.innerText || node.textContent}`;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Prime Auto//Bookings//CS",
    "CALSCALE:GREGORIAN",
    ...data.reservations.flatMap((r) => [
      "BEGIN:VEVENT",
      `UID:${r.id}@primeauto`,
      `DTSTAMP:${stamp(Date.now())}`,
      `DTSTART:${stamp(r.start)}`,
      `DTEND:${stamp(r.end)}`,
      `SUMMARY:${esc("Prime Auto – " + r.vehicle)}`,
      `DESCRIPTION:${esc("Rezervace " + r.id + "; kontakt 736 212 511")}`,
      "END:VEVENT",
    ]),
    "END:VCALENDAR",
    "",
  ].join("\r\n");
  for (const [label, filename, body, type] of [
    [
      "Stáhnout potvrzení a podmínky",
      "Prime-Auto-potvrzeni.txt",
      text,
      "text/plain;charset=utf-8",
    ],
    [
      "Přidat termíny do kalendáře",
      "Prime-Auto-terminy.ics",
      ics,
      "text/calendar;charset=utf-8",
    ],
  ]) {
    const a = document.createElement("a");
    a.className = "download-confirmation";
    a.href = URL.createObjectURL(new Blob([body], { type }));
    a.download = filename;
    a.textContent = label;
    $("#form-status").append(a);
  }
}
