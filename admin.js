const $ = (s) => document.querySelector(s);
let rows = [];
const date = (t) =>
  new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Prague",
  }).format(new Date(t));
const iso = (t) => {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Europe/Prague",
    })
      .formatToParts(new Date(t))
      .map((p) => [p.type, p.value]),
  );
  return `${p.year}-${p.month}-${p.day}`;
};
function render() {
  const container = $("#reservations");
  container.replaceChildren();
  const filtered = rows.filter(
    (r) =>
      (!$("#filter-date").value || iso(r.start) === $("#filter-date").value) &&
      ($("#filter-status").value === "all" || !r.cancelled),
  );
  $("#admin-status").textContent = `${filtered.length} rezervací`;
  for (const r of filtered) {
    const article = document.createElement("article");
    article.className = "admin-booking";
    const h = document.createElement("h3");
    h.textContent = `${date(r.start)} → ${date(r.end)}`;
    article.append(h);
    for (const line of [
      r.vehicle,
      `${r.name} · ${r.phone} · ${r.email}`,
      `${JSON.parse(r.services).join(", ")} · ${r.total.toLocaleString("cs-CZ")} Kč · ${r.transport ? "Doprava k dohodě" : "Bez dopravy"}`,
      r.message || "",
      `ID: ${r.id}`,
      r.cancelled ? "ZRUŠENO" : "AKTIVNÍ",
    ]) {
      const p = document.createElement("p");
      p.textContent = line;
      article.append(p);
    }
    if (!r.cancelled) {
      const button = document.createElement("button");
      button.className = "button";
      button.textContent = "Zrušit a uvolnit termín";
      button.onclick = async () => {
        if (
          !confirm(`Opravdu zrušit rezervaci ${r.vehicle} (${date(r.start)})?`)
        )
          return;
        button.disabled = true;
        try {
          const response = await fetch("/api/admin/cancel", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: r.id }),
          });
          if (!response.ok) throw Error("Storno se nepodařilo.");
          await load();
        } catch (e) {
          $("#admin-status").textContent = e.message;
          button.disabled = false;
        }
      };
      article.append(button);
    }
    container.append(article);
  }
}
async function load() {
  try {
    const response = await fetch("/api/admin/bookings", { cache: "no-store" });
    if (!response.ok) throw Error("Rezervace nelze načíst.");
    rows = await response.json();
    render();
  } catch (e) {
    $("#admin-status").textContent = e.message;
  }
}
$("#filter-date").onchange = render;
$("#filter-status").onchange = render;
$("#refresh").onclick = load;
load();
