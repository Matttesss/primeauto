import { routes, detailingContent, otherContent } from "./content.js";
import { bookingHTML, initBooking } from "./booking-ui.js";
const $ = (s) => document.querySelector(s);
let active = "";
const built = new Map();
let booking;
const detailingAnchors = new Set([
  "pece",
  "prubeh",
  "cenik",
  "rezervace",
  "detailing-dotazy",
]);
const homeAnchors = new Set(["domu", "sluzby", "pristup", "dotazy"]);
function buildView(key) {
  if (built.has(key)) return;
  const r = routes[key],
    view = document.createElement("div");
  view.dataset.serviceView = key;
  view.hidden = true;
  const image =
    key === "odtah"
      ? `<div class="tow-visual" aria-hidden="true"><svg viewBox="0 0 600 300"><path d="M35 245H565M80 208h335l39-98h67l44 74v49h-35m-82 0H187m-80 0H65v-25h15v-39h290l29-25"/><circle cx="147" cy="233" r="30"/><circle cx="491" cy="233" r="30"/><path d="M447 126h62l25 45h-103zm-335 35l29-54h113l57 54M157 109l29-35h74l40 35m-115-2V78m-69 84h224"/><circle cx="155" cy="162" r="17"/><circle cx="286" cy="162" r="17"/></svg></div>`
      : `<img src="./images/${r.photo}" width="1774" height="887" alt="${r.alt}" fetchpriority="high">`;
  view.innerHTML = `<div class="breadcrumb"><a href="#domu">Úvod</a><span aria-hidden="true">/</span><span>${r.name}</span></div><section class="service-hero"><div><p class="eyebrow">${r.kicker}</p>${key === "odtah" ? '<span class="status-chip">PŘIPRAVUJEME</span>' : ""}<h1>${r.title}</h1><p class="lead">${r.description}</p><div class="hero-actions"><a class="button" href="${r.target}">${r.action}<span aria-hidden="true">↗</span></a>${key === "detailing" ? '<a class="text-link" href="#cenik">Nejdřív si prohlédnout ceník ↓</a>' : ""}</div><div class="hero-facts">${key === "detailing" ? "<span>5 hodin na vůz</span><span>Po–So 8:00–20:00</span><span>Po celé ČR</span>" : key !== "odtah" ? "<span>Cena a termín předem</span><span>Přímý kontakt na nás</span>" : "<span>Zatím nelze objednat</span>"}</div></div><div class="service-hero-image">${image}</div></section>${key === "detailing" ? detailingContent(bookingHTML) : otherContent(key)}<div class="other-services"><span>DALŠÍ SLUŽBY</span>${Object.entries(
    routes,
  )
    .filter(([k]) => k !== key)
    .map(([k, v]) => `<a href="#${k}">${v.name} ↗</a>`)
    .join("")}</div>`;
  $("#detail-view").append(view);
  built.set(key, view);
  if (key === "detailing") {
    booking = initBooking(view);
    view
      .querySelectorAll("[data-select-service]")
      .forEach((a) =>
        a.addEventListener("click", () =>
          booking.selectServices(
            a.dataset.selectService === "all"
              ? ["interier", "exterier", "motor"]
              : [a.dataset.selectService],
          ),
        ),
      );
  }
  bindLegal(view);
  icons(view);
}
function route() {
  let hash;
  try {
    hash = decodeURIComponent(location.hash.slice(1)) || "domu";
  } catch {
    hash = "domu";
  }
  let key = routes[hash]
    ? hash
    : detailingAnchors.has(hash)
      ? "detailing"
      : homeAnchors.has(hash)
        ? ""
        : active;
  const changed = key !== active;
  if (key) buildView(key);
  $("#home-view").hidden = !!key;
  $("#detail-view").hidden = !key;
  for (const [name, view] of built) view.hidden = name !== key;
  active = key;
  document.title = key
    ? routes[key].name + " | Prime Auto"
    : "Prime Auto — Detailing, servis a předkupní prohlídky";
  document.querySelectorAll("#navigation a").forEach((a) => {
    const current = a.hash === "#" + key;
    a.toggleAttribute("aria-current", current);
    if (current) a.setAttribute("aria-current", "page");
  });
  document.querySelectorAll(".section-nav a").forEach((a) => {
    const current = a.hash === "#" + hash;
    a.toggleAttribute("aria-current", current);
    if (current) a.setAttribute("aria-current", "location");
  });
  closeMenu();
  const action = $("#mobile-primary");
  action.href =
    key === "detailing"
      ? "#rezervace"
      : key === "servis" || key === "prohlidky"
        ? "tel:+420736212511"
        : "#sluzby";
  action.textContent =
    key === "detailing"
      ? "Rezervovat detailing"
      : key === "servis"
        ? "Domluvit servis"
        : key === "prohlidky"
          ? "Domluvit prohlídku"
          : "Vybrat službu";
  $(".mobile-actions").hidden = hash === "rezervace";
  requestAnimationFrame(() => {
    if (hash === "main-content") {
      $("#main-content").focus();
      return;
    }
    const target = document.getElementById(hash);
    if (target && hash !== "domu") {
      target.scrollIntoView({ block: "start", behavior: "auto" });
      if (changed) {
        const heading = (key ? built.get(key) : $("#home-view")).querySelector(
          "h1",
        );
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
    } else if (changed || hash === "domu") {
      window.scrollTo({ top: 0, behavior: "instant" });
      const heading = (key ? built.get(key) : $("#home-view")).querySelector(
        "h1",
      );
      if (changed) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
    }
  });
}
let returnFocus;
function bindLegal(root = document) {
  root.querySelectorAll("[data-legal]").forEach(
    (b) =>
      (b.onclick = () => {
        returnFocus = b;
        $("#legal-content").innerHTML =
          window.PRIME_LEGAL[b.dataset.legal] || "";
        $("#legal-dialog").showModal();
        $("#legal-dialog").scrollTop = 0;
      }),
  );
}
function closeMenu() {
  $("#navigation").classList.remove("open");
  $(".menu-toggle").setAttribute("aria-expanded", "false");
}
$(".menu-toggle").onclick = () => {
  const open = $("#navigation").classList.toggle("open");
  $(".menu-toggle").setAttribute("aria-expanded", String(open));
};
$("#navigation")
  .querySelectorAll("a")
  .forEach((a) => a.addEventListener("click", closeMenu));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});
document.addEventListener("click", (e) => {
  if (!$(".site-header").contains(e.target)) closeMenu();
});
$(".dialog-close").onclick = () => $("#legal-dialog").close();
$("#legal-dialog").addEventListener("close", () =>
  returnFocus?.focus({ preventScroll: true }),
);
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
function icons(root = document.body) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT),
    nodes = [];
  while (walker.nextNode()) {
    const n = walker.currentNode;
    if (
      n.textContent.includes("↗") &&
      !["SCRIPT", "STYLE", "TEXTAREA"].includes(n.parentElement.tagName)
    )
      nodes.push(n);
  }
  for (const node of nodes) {
    const fragment = document.createDocumentFragment();
    node.textContent.split("↗").forEach((part, index) => {
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
    node.replaceWith(fragment);
  }
}
$("#year").textContent = new Date().getFullYear();
bindLegal();
icons();
window.addEventListener("hashchange", route);
route();
