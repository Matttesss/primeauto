export const CATALOG = Object.freeze({
  interier: {
    label: "Kompletní interiér",
    price: 3990,
    tag: "Pro příjemnější každou jízdu",
    features: [
      "Vysátí celého interiéru",
      "Mokré kartáčování podlah a koberečků",
      "Mokré čištění sedaček a vysušení",
      "Volant, kokpit, plasty a displeje",
      "Dveře, mezidveří a prahy",
      "Provonění interiéru",
    ],
  },
  exterier: {
    label: "Základní exteriér",
    price: 1990,
    tag: "Čistota od disků po střechu",
    features: [
      "Dekontaminace a čištění disků",
      "Oživení pneumatik",
      "Předmytí aktivní pěnou",
      "Šetrné ruční mytí",
    ],
  },
  motor: {
    label: "Motorový prostor",
    price: 990,
    tag: "Péče i pod kapotou",
    features: [
      "Odstranění hrubých nečistot",
      "Vyčištění motorového prostoru",
      "Oživení plastových krytů",
      "Postup podle technického stavu vozu",
    ],
  },
});
export const RULES = Object.freeze({
  energy: 1530,
  duration: 300,
  transportDuration: 420,
  timezone: "Europe/Prague",
  open: "08:00",
  close: "20:00",
  advanceDays: 120,
  leadHours: 2,
  termsVersion: "2026-10-26-v4",
});
export const money = (n) =>
  new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 }).format(n) +
  " Kč";
export function totalFor(keys) {
  return keys.length
    ? keys.reduce((sum, k) => sum + CATALOG[k].price, RULES.energy)
    : 0;
}
export function pragueDate(timestamp = Date.now()) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: RULES.timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(new Date(timestamp))
      .map((p) => [p.type, p.value]),
  );
  return `${p.year}-${p.month}-${p.day}`;
}
export function addDays(date, count) {
  const d = new Date(date + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + count);
  return d.toISOString().slice(0, 10);
}
