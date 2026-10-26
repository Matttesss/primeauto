import {
  CATALOG,
  RULES,
  money,
  totalFor,
  pragueDate,
  addDays,
} from "./catalog.js";
import { createCalendar } from "./calendar.js";
const fields = ["interier", "exterier", "motor"];
export function bookingHTML() {
  return `<section class="section booking-section" id="rezervace"><div class="section-heading"><div><p class="eyebrow">REZERVACE DETAILINGU</p><h2>Od čistého auta<br><em>vás dělí tři kroky.</em></h2></div><p>Vyberte péči, skutečně volný čas a své kontaktní údaje. Můžete přidat i další vůz.</p></div><div class="booking-layout"><form id="booking-form" data-step="1" novalidate><ol class="booking-progress" aria-label="Postup rezervace"><li><button type="button" data-step-target="1" aria-current="step"><span>1</span> Vůz a péče</button></li><li><button type="button" data-step-target="2" disabled><span>2</span> Termín</button></li><li><button type="button" data-step-target="3" disabled><span>3</span> Kontakt</button></li></ol><div id="booking-connection" class="booking-connection" role="status" hidden></div><div class="step-heading"><h3 id="step-title">Jakou péči si přejete?</h3><p id="step-description">Vyberte jednu nebo více služeb pro každý vůz.</p></div><div id="booking-errors" class="form-error" role="alert" hidden></div><div id="vehicle-list"></div><button class="add-vehicle" type="button" id="add-vehicle">+ Přidat další vozidlo</button><div class="booking-contact" id="booking-contact"><div class="fields"><label>Jméno a příjmení<input name="name" required autocomplete="name" maxlength="120" minlength="2" placeholder="Jan Novák"></label><label>Telefon<input name="phone" required type="tel" autocomplete="tel" inputmode="tel" pattern="[+0-9 ()-]{9,25}" maxlength="25" placeholder="+420 777 123 456"></label></div><label>E-mail<input name="email" required type="email" autocomplete="email" maxlength="200" placeholder="vas@email.cz"></label><label>Poznámka <span class="optional">nepovinné</span><textarea name="message" rows="3" maxlength="2000" placeholder="Stav vozů, místo převzetí při dopravě, další přání…"></textarea></label><label class="honeypot" aria-hidden="true">Web<input name="website" tabindex="-1" autocomplete="off"></label><div id="final-order-summary" class="final-order-summary"></div><label class="checkbox"><input name="acceptedTerms" required type="checkbox"><span>Souhlasím s <button type="button" class="inline" data-legal="terms">obchodními podmínkami</button> a beru na vědomí <button type="button" class="inline" data-legal="privacy">informace o osobních údajích</button>. Objednávám vybrané čištění za uvedenou cenu. Dopravu a její cenu sjednáme samostatně.</span></label><label class="checkbox" id="early-label" hidden><input name="earlyStart" type="checkbox"><span>Výslovně žádám o zahájení služby v termínu do 14 dnů od objednání. Beru na vědomí podmínky poměrné úhrady při odstoupení po zahájení a zániku práva odstoupit po úplném poskytnutí služby podle <button type="button" class="inline" data-legal="terms">obchodních podmínek</button>.</span></label><p class="form-note">Platba za čištění při předání vozu po dokončení. Po objednání si stáhnete potvrzení a podmínky. Automatické e-maily zatím neposíláme.</p></div><div class="booking-actions"><button type="button" class="back-step" id="previous-step" hidden>← Zpět</button><button type="button" class="button" id="next-step">Pokračovat na termín <span>→</span></button><button type="submit" class="button submit" hidden>Objednat s povinností platby <span>↗</span></button></div><div id="form-status" class="confirmation" role="status" aria-live="polite" tabindex="-1" hidden></div></form><aside class="booking-summary"><p class="eyebrow">VAŠE PÉČE V KOSTCE</p><h3>Přehled objednávky</h3><div id="order-lines"></div><div class="summary-total"><span>Celkem včetně energií</span><strong id="estimate">0 Kč</strong></div><p class="summary-note">Doprava není zahrnuta. Její cenu si domluvíme předem.</p><dl><div><dt>Otevřeno</dt><dd>Po–So · 8:00–20:00</dd></div><div><dt>Na každý vůz</dt><dd>5 hodin / 7 s dopravou</dd></div><div><dt>Neděle</dt><dd>Zavřeno</dd></div></dl><a class="booking-help" href="tel:+420736212511"><span>Potřebujete s výběrem poradit?</span><strong>736 212 511 ↗</strong></a></aside></div></section>`;
}
export function initBooking(root) {
  const $ = (s) => root.querySelector(s),
    form = $("#booking-form"),
    list = $("#vehicle-list");
  let step = 1,
    furthest = 1,
    vehicleId = 0,
    busy = false,
    success = false,
    requestId = "",
    lastPayload = "";
  const today = pragueDate();
  const base = (window.PRIME_BOOKING?.apiBase || "").replace(/\/$/, "");
  const endpoint = (path) =>
    base
      ? base + "/api/" + path
      : new URL("api/" + path, new URL(".", location.href)).href;
  const cards = () => [...list.querySelectorAll(".vehicle-card")];
  const chosen = (c) =>
    [...c.querySelectorAll("[data-service-option]:checked")].map(
      (i) => i.value,
    );
  const transport = (c) => c.querySelector("[data-transport]").checked;
  const duration = (c) =>
    (transport(c) ? RULES.transportDuration : RULES.duration) / 60;
  const timeLabel = (c) =>
    c.querySelector("[data-time]").value
      ? `${c.querySelector("[data-time]").value}–${c.dataset.endTime}`
      : "Termín zatím nevybrán";
  function error(message, field) {
    $("#booking-errors").hidden = !message;
    $("#booking-errors").textContent = message;
    if (field) {
      field.focus();
      field.reportValidity?.();
    }
  }
  function updateSummary() {
    const all = cards();
    $("#order-lines").replaceChildren();
    $("#final-order-summary").replaceChildren();
    let total = 0;
    all.forEach((c, i) => {
      const selected = chosen(c),
        price = totalFor(selected);
      total += price;
      const title =
        c.querySelector("[data-model]").value.trim() || `Vozidlo ${i + 1}`;
      c.querySelector("[data-car-title]").textContent = title;
      const article = document.createElement("div");
      article.className = "summary-car";
      const h = document.createElement("strong");
      h.textContent = title;
      const p = document.createElement("p");
      p.textContent = selected.length
        ? selected.map((k) => CATALOG[k].label).join(" + ")
        : "Vyberte alespoň jednu službu";
      const detail = document.createElement("small");
      const date = c.querySelector("[data-date]").value;
      detail.textContent = `${date ? date.split("-").reverse().join(". ") : "Vyberte den"} · ${timeLabel(c)}${transport(c) ? " · s dopravou" : ""}`;
      const amount = document.createElement("b");
      amount.textContent = money(price);
      article.append(h, p, detail, amount);
      $("#order-lines").append(article);
      const final = document.createElement("p");
      final.textContent = `${title} · ${p.textContent} · ${detail.textContent} · ${money(price)}`;
      $("#final-order-summary").append(final);
    });
    $("#estimate").textContent = money(total);
    const line = document.createElement("strong");
    line.textContent = `Celkem za čištění: ${money(total)}. Doprava samostatně podle dohody.`;
    $("#final-order-summary").append(line);
    const early = all.some((c) => {
      const date = c.querySelector("[data-date]").value;
      return date && date <= addDays(today, 14);
    });
    form.elements.earlyStart.required = early;
    $("#early-label").hidden = !early;
    $("#add-vehicle").disabled = all.length >= 6 || busy;
    form.querySelectorAll("[data-step-target]").forEach((b) => {
      const n = Number(b.dataset.stepTarget);
      b.disabled = busy || success || n > furthest;
      b.toggleAttribute("aria-current", n === step);
      if (n === step) b.setAttribute("aria-current", "step");
    });
    $("#previous-step").disabled = busy || success;
    $("#next-step").disabled =
      busy ||
      success ||
      (step === 2 &&
        !all.every(
          (c) =>
            c.dataset.ready === "true" && c.querySelector("[data-time]").value,
        ));
    form.querySelector(".submit").disabled = busy || success;
  }
  function noOverlap(c, start, end) {
    return !cards().some(
      (other) =>
        other !== c &&
        other.querySelector("[data-time]").value &&
        Number(other.dataset.start) < end &&
        Number(other.dataset.end) > start,
    );
  }
  function refreshButtons() {
    for (const c of cards())
      for (const b of c.querySelectorAll("[data-slot]")) {
        const selected =
          c.querySelector("[data-time]").value === b.dataset.slot;
        b.disabled =
          busy || !noOverlap(c, Number(b.dataset.start), Number(b.dataset.end));
        b.setAttribute("aria-pressed", String(selected));
      }
    updateSummary();
  }
  function clearTime(c) {
    c.querySelector("[data-time]").value = "";
    delete c.dataset.start;
    delete c.dataset.end;
    delete c.dataset.endTime;
  }
  async function fetchSlots(c) {
    const seq = Number(c.dataset.seq || 0) + 1;
    c.dataset.seq = seq;
    c.dataset.ready = "false";
    const date = c.querySelector("[data-date]"),
      status = c.querySelector("[data-slot-status]"),
      grid = c.querySelector("[data-slots]"),
      previous = c.querySelector("[data-time]").value;
    clearTime(c);
    grid.replaceChildren();
    updateSummary();
    if (!date.value || !chosen(c).length) {
      status.textContent = "Vyberte den a alespoň jednu službu.";
      return;
    }
    if (new Date(date.value + "T12:00:00Z").getUTCDay() === 0) {
      status.textContent = "V neděli máme zavřeno. Vyberte jiný den.";
      return;
    }
    status.textContent = "Načítáme volné časy…";
    try {
      const query = new URLSearchParams({
        date: date.value,
        services: chosen(c).join(","),
        transport: String(transport(c)),
      });
      const response = await fetch(endpoint("availability?" + query), {
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw Error("offline");
      const data = await response.json();
      if (Number(c.dataset.seq) !== seq) return;
      if (!data.enabled || !Array.isArray(data.slots)) throw Error("offline");
      c.dataset.ready = "true";
      $("#booking-connection").hidden = true;
      for (const slot of data.slots) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "slot-button";
        b.dataset.slot = slot.time;
        b.dataset.start = slot.start;
        b.dataset.end = slot.end;
        b.setAttribute("aria-pressed", "false");
        b.setAttribute(
          "aria-label",
          `Začátek ${slot.time}, konec ${slot.endTime}`,
        );
        const strong = document.createElement("strong");
        strong.textContent = slot.time;
        const small = document.createElement("small");
        small.textContent = "do " + slot.endTime;
        b.append(strong, small);
        b.onclick = () => {
          c.querySelector("[data-time]").value = slot.time;
          c.dataset.start = slot.start;
          c.dataset.end = slot.end;
          c.dataset.endTime = slot.endTime;
          error("");
          refreshButtons();
        };
        grid.append(b);
        if (slot.time === previous && noOverlap(c, slot.start, slot.end)) {
          c.querySelector("[data-time]").value = slot.time;
          c.dataset.start = slot.start;
          c.dataset.end = slot.end;
          c.dataset.endTime = slot.endTime;
        }
      }
      status.textContent = data.slots.length
        ? `Vyberte začátek. Pro tento vůz vyhradíme ${duration(c)} hodin. Šedé časy kolidují s jiným vozem v této objednávce.`
        : "Tento den už nemá volný souvislý termín. Zvolte jiný den.";
      refreshButtons();
    } catch {
      if (Number(c.dataset.seq) !== seq) return;
      status.textContent = "Volné časy se nepodařilo načíst.";
      $("#booking-connection").hidden = false;
      $("#booking-connection").textContent =
        "Online objednání teď není k dispozici. Termín si domluvte na 736 212 511. Žádnou neuloženou rezervaci nepotvrdíme.";
      updateSummary();
    }
  }
  function addVehicle(initial = ["interier"]) {
    if (cards().length >= 6) return;
    const c = document.createElement("fieldset");
    c.className = "vehicle-card";
    c.dataset.key = ++vehicleId;
    c.dataset.ready = "false";
    c.innerHTML = `<legend><span data-car-number></span><span data-car-title></span></legend><button type="button" class="remove-vehicle" aria-label="Odebrat vozidlo">Odebrat</button><div class="vehicle-care"><label>Značka a model<input data-model required minlength="2" maxlength="160" placeholder="Např. BMW E60"></label><div class="service-choice-label"><span>Vyberte jednu nebo více služeb</span><button type="button" data-select-all>Vybrat vše</button></div><div class="service-choices">${fields.map((k) => `<label><input type="checkbox" data-service-option value="${k}" ${initial.includes(k) ? "checked" : ""}><span>${CATALOG[k].label}<small>${money(CATALOG[k].price)}</small></span></label>`).join("")}</div><p class="energy-line">+ energie ${money(RULES.energy)} jednou za vůz, i při kombinaci služeb.</p><label class="checkbox transport-choice"><input data-transport type="checkbox"><span>Mám zájem o dopravu vozu tam i zpět.<small>Vyhradíme 7 hodin. Cenu dopravy domluvíme zvlášť.</small></span></label></div><div class="vehicle-term"><label>Vyberte den<input type="date" data-date min="${today}" max="${addDays(today, RULES.advanceDays)}"></label><input type="hidden" data-time><p class="slot-status" data-slot-status aria-live="polite"></p><div class="slot-grid" data-slots role="group" aria-label="Dostupné časy začátku"></div></div>`;
    list.append(c);
    let next = addDays(today, 1);
    if (new Date(next + "T12:00:00Z").getUTCDay() === 0)
      next = addDays(next, 1);
    c.querySelector("[data-date]").value = next;
    c.querySelector("[data-model]").oninput = updateSummary;
    c.querySelector(".remove-vehicle").onclick = () => {
      c.remove();
      renumber();
      refreshButtons();
    };
    const change = () => {
      clearTime(c);
      c.dataset.ready = "false";
      updateSummary();
      if (step === 2) fetchSlots(c);
    };
    c.querySelectorAll("[data-service-option],[data-transport]").forEach(
      (i) => (i.onchange = change),
    );
    c.querySelector("[data-select-all]").onclick = () => {
      c.querySelectorAll("[data-service-option]").forEach(
        (i) => (i.checked = true),
      );
      change();
    };
    c.querySelector("[data-date]").onchange = () => fetchSlots(c);
    renumber();
    updateSummary();
  }
  function renumber() {
    cards().forEach((c, i) => {
      c.querySelector("[data-car-number]").textContent = String(i + 1).padStart(
        2,
        "0",
      );
      c.querySelector(".remove-vehicle").hidden = cards().length === 1;
    });
  }
  function validateCare() {
    for (const c of cards()) {
      const model = c.querySelector("[data-model]");
      if (!model.checkValidity()) {
        error("Vyplňte značku a model každého vozidla.", model);
        return false;
      }
      if (!chosen(c).length) {
        error(
          "U každého vozu vyberte alespoň jednu službu.",
          c.querySelector("[data-service-option]"),
        );
        return false;
      }
    }
    error("");
    return true;
  }
  function setStep(next, focus = true) {
    step = next;
    furthest = Math.max(furthest, step);
    form.dataset.step = step;
    const labels = {
      1: [
        "Jakou péči si přejete?",
        "Vyberte jednu nebo více služeb pro každý vůz.",
      ],
      2: [
        "Kdy se vám to hodí?",
        "Každému vozu vyberte vlastní den a skutečně volný čas.",
      ],
      3: [
        "Zkontrolujte objednávku.",
        "Doplňte kontakt a před odesláním projděte služby, termíny a cenu.",
      ],
    };
    $("#step-title").textContent = labels[step][0];
    $("#step-description").textContent = labels[step][1];
    $("#previous-step").hidden = step === 1;
    $("#next-step").hidden = step === 3;
    $("#next-step").innerHTML =
      (step === 1 ? "Pokračovat na termín" : "Pokračovat na kontakt") +
      ' <span aria-hidden="true">→</span>';
    form.querySelector(".submit").hidden = step !== 3;
    $("#booking-contact").hidden = step !== 3;
    $("#add-vehicle").hidden = step !== 1;
    if (step === 2) cards().forEach(fetchSlots);
    if (step !== 2) $("#booking-connection").hidden = true;
    error("");
    updateSummary();
    if (focus) {
      $("#step-title").tabIndex = -1;
      $("#step-title").focus({ preventScroll: true });
      $("#booking-form").scrollIntoView({ block: "start", behavior: "auto" });
    }
  }
  $("#add-vehicle").onclick = () => {
    addVehicle();
    cards().at(-1).querySelector("[data-model]").focus();
  };
  $("#previous-step").onclick = () => {
    if (!busy && !success) setStep(step - 1);
  };
  $("#next-step").onclick = () => {
    if (step === 1 && !validateCare()) return;
    if (
      step === 2 &&
      !cards().every(
        (c) =>
          c.dataset.ready === "true" && c.querySelector("[data-time]").value,
      )
    ) {
      error("Vyberte dostupný den a čas u každého vozu.");
      return;
    }
    setStep(step + 1);
  };
  form.querySelectorAll("[data-step-target]").forEach(
    (b) =>
      (b.onclick = () => {
        const next = +b.dataset.stepTarget;
        if (next > step && step === 1 && !validateCare()) return;
        if (
          next === 3 &&
          !cards().every(
            (c) =>
              c.dataset.ready === "true" &&
              c.querySelector("[data-time]").value,
          )
        )
          return;
        setStep(next);
      }),
  );
  addVehicle();
  setStep(1, false);
  form.onsubmit = async (e) => {
    e.preventDefault();
    if (busy || success) return;
    if (step !== 3) {
      $("#next-step").click();
      return;
    }
    const phone = form.elements.phone;
    phone.setCustomValidity(
      phone.value.replace(/\D/g, "").length < 9
        ? "Vyplňte platné telefonní číslo."
        : "",
    );
    if (!form.reportValidity()) return;
    const f = new FormData(form);
    const payload = {
      name: f.get("name"),
      phone: f.get("phone"),
      email: f.get("email"),
      message: f.get("message"),
      website: f.get("website"),
      acceptedTerms: f.get("acceptedTerms") === "on",
      earlyStart: f.get("earlyStart") === "on",
      vehicles: cards().map((c) => ({
        vehicle: c.querySelector("[data-model]").value.trim(),
        services: chosen(c),
        transport: transport(c),
        date: c.querySelector("[data-date]").value,
        time: c.querySelector("[data-time]").value,
      })),
    };
    const raw = JSON.stringify(payload);
    if (raw !== lastPayload) {
      lastPayload = raw;
      requestId = crypto.randomUUID();
    }
    busy = true;
    error("");
    updateSummary();
    $("#form-status").hidden = false;
    $("#form-status").textContent = "Ukládáme vaši objednávku…";
    try {
      const response = await fetch(endpoint("bookings"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, requestId }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await response.json();
      if (!response.ok)
        throw Object.assign(
          Error(data.error || "Objednávku se nepodařilo uložit."),
          { status: response.status },
        );
      success = true;
      showConfirmation(data, payload);
      form
        .querySelectorAll("input,select,textarea,button")
        .forEach((el) => (el.disabled = true));
      $("#form-status").focus();
    } catch (err) {
      $("#form-status").textContent = err.status
        ? err.message
        : "Spojení se přerušilo. Stejnou objednávku můžete bezpečně odeslat znovu — server ji neuloží dvakrát. Pokud potíže přetrvají, zavolejte na 736 212 511.";
      if (err.status === 409) {
        setStep(2);
        $("#form-status").hidden = false;
        $("#form-status").textContent = err.message;
      }
    } finally {
      busy = false;
      updateSummary();
    }
  };
  function showConfirmation(data, contact) {
    const target = $("#form-status");
    target.classList.add("confirmed");
    target.replaceChildren();
    const h = document.createElement("h3");
    h.textContent = "Hotovo. Vaše termíny jsou uložené.";
    target.append(h);
    for (const r of data.reservations) {
      const p = document.createElement("p");
      p.textContent = `${r.vehicle} · ${r.date.split("-").reverse().join(". ")} · ${r.time}–${r.endTime} · ${money(r.total)}`;
      const id = document.createElement("small");
      id.textContent = "Číslo rezervace: " + r.id;
      p.append(document.createElement("br"), id);
      target.append(p);
    }
    const note = document.createElement("p");
    note.textContent =
      "Uložte si potvrzení. Změnu termínu vyřešíme na 736 212 511. E-mailové potvrzení zatím neposíláme.";
    target.append(note);
    const legal = document.createElement("div");
    legal.innerHTML = window.PRIME_LEGAL.terms;
    const terms = [...legal.children].map((n) => n.textContent).join("\n\n");
    const detail = data.reservations
      .map(
        (r) =>
          `${r.vehicle} | ${r.date} ${r.time}–${r.endTime} (Europe/Prague) | ${r.services.map((k) => CATALOG[k].label).join(", ")} | ${money(r.total)} | číslo ${r.id}`,
      )
      .join("\n");
    const text = `PRIME AUTO – POTVRZENÍ OBJEDNÁVKY\nMatěj Krejčí, IČO 29752663\nHusitská 1321, Nová Paka\n736 212 511 | primeautokontakt@gmail.com\n\nZákazník: ${contact.name}\nTelefon: ${contact.phone}\nE-mail: ${contact.email}\n\n${detail}\n\nCelkem včetně energií: ${money(data.total)}\nDoprava se sjednává samostatně.\n\nOBCHODNÍ PODMÍNKY\n${terms}`;
    const ics = createCalendar(
      data.reservations.map((r) => ({
        ...r,
        summary: "Prime Auto – " + r.vehicle,
        description: "Číslo rezervace " + r.id + "; kontakt 736 212 511",
      })),
    );
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
      target.append(a);
    }
  }
  return {
    selectServices(keys) {
      const c = cards()[0];
      if (success) return;
      c.querySelectorAll("[data-service-option]").forEach(
        (i) => (i.checked = keys.includes(i.value)),
      );
      clearTime(c);
      c.dataset.ready = "false";
      setStep(1, false);
      updateSummary();
    },
    refresh() {
      if (step === 2 && !success) cards().forEach(fetchSlots);
    },
  };
}
