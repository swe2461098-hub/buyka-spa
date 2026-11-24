import { t } from "../i18n/i18n.js";
import { renderPageLayout } from "../layouts/pageLayout.js";
import { renderNotification } from "../layouts/notificationLayout.js";
import { getMembers } from "../services/memberService.js";
import { getStats, countByGeneration, paternalLine, indexByCode } from "../fn/family.js";
import { escapeHtml } from "../fn/format.js";

const features = [
  { href: "#/search", icon: "fa-search", color: "primary", title: "Хайлт", text: "Нэр, үе, овгоор нь ургийн гишүүдийг хайж, хүснэгтээр харна." },
  { href: "#/calculation", icon: "fa-sitemap", color: "link", title: "Ургийн мод", text: "Өвөг дээдсээс үр удам хүртэлх модыг харж, хамаатны холбоог тооцоолно." },
  { href: "#/books", icon: "fa-users", color: "info", title: "Ургийн гишүүд", text: "Гишүүн бүрийн хувийн хуудас, намтар тэмдэглэлийг үзнэ." },
  { href: "#/contact", icon: "fa-address-card", color: "danger", title: "Холбоо барих", text: "Шинэ гишүүн нэмүүлэх, мэдээлэл засуулах хүсэлт илгээнэ." },
];

function renderStat(value, label, icon) {
  return `
    <div class="column is-6-mobile is-3-tablet">
      <div class="app-stat">
        <span class="icon is-medium"><i class="fas ${icon}"></i></span>
        <p class="app-stat-value">${value}</p>
        <p class="app-stat-label">${label}</p>
      </div>
    </div>`;
}

function renderGenerationBars(members) {
  const rows = countByGeneration(members);
  const max = Math.max(...rows.map((r) => r.count));
  return rows
    .map(
      (r) => `
      <div class="app-bar-row">
        <span class="app-bar-label">${r.generation}-р үе</span>
        <div class="app-bar-track"><div class="app-bar-fill" style="width:${(r.count / max) * 100}%"></div></div>
        <span class="app-bar-count">${r.count}</span>
      </div>`,
    )
    .join("");
}

function renderLineage(members) {
  // Хамгийн залуу үеийн эрэгтэй гишүүнээс эцгийн шугамаар өгсөнө.
  const youngest = [...members].filter((m) => m.gender === "эр").sort((a, b) => b.generation - a.generation)[0];
  const line = paternalLine(youngest.member_code, indexByCode(members)).reverse();
  return `
    <ol class="app-lineage">
      ${line.map((m) => `<li><strong>${escapeHtml(m.given_name)}</strong><small>${m.birth_year}</small></li>`).join("")}
    </ol>`;
}

export async function renderOverviewPage() {
  const app = document.getElementById("app");
  if (!app) return;

  const hero = `
    <section class="app-hero">
      <div class="container">
        <p class="app-hero-kicker">Монгол ${t("nav.brand")}</p>
        <h1 class="app-hero-title">${t("overview.title")}</h1>
        <p class="app-hero-text">${t("overview.welcome")} Өвөг дээдсийнхээ нэрийг мартахгүй, үр хүүхэддээ өвлүүлэн үлдээх цахим удмын бичиг.</p>
        <div class="buttons">
          <a class="button is-primary" href="#/calculation"><span class="icon"><i class="fas fa-sitemap"></i></span><span>Ургийн мод үзэх</span></a>
          <a class="button is-secondary" href="#/search"><span class="icon"><i class="fas fa-search"></i></span><span>Гишүүн хайх</span></a>
        </div>
      </div>
    </section>`;

  app.innerHTML = hero + renderPageLayout({ content: renderNotification("Өгөгдөл ачаалж байна...", "info") });

  try {
    const members = await getMembers();
    const s = getStats(members);

    app.innerHTML =
      hero +
      renderPageLayout({
        id: "overview",
        title: "Манай ургийн тойм",
        content: `
          <div class="columns is-multiline is-mobile">
            ${renderStat(s.total, "Нийт гишүүн", "fa-user-group")}
            ${renderStat(s.generations, "Үе", "fa-layer-group")}
            ${renderStat(s.clans, "Овог", "fa-flag")}
            ${renderStat(s.span, "Жилийн түүх", "fa-hourglass-half")}
          </div>

          <div class="columns">
            <div class="column">
              <h2 class="subtitle app-subtitle">Үе тус бүрийн гишүүд</h2>
              ${renderGenerationBars(members)}
              <p class="has-text-grey mt-3">Амьд: ${s.living} · Эрэгтэй: ${s.male} · Эмэгтэй: ${s.female}</p>
            </div>
            <div class="column">
              <h2 class="subtitle app-subtitle">Эцгийн шугам</h2>
              ${renderLineage(members)}
            </div>
          </div>

          <h2 class="subtitle app-subtitle">Юу хийж болох вэ?</h2>
          <div class="columns is-multiline">
            ${features
              .map(
                (f) => `
              <div class="column is-6-tablet is-3-desktop">
                <a class="box app-feature" href="${f.href}">
                  <span class="icon is-large has-text-${f.color}"><i class="fas ${f.icon} fa-2x"></i></span>
                  <p class="title is-5">${f.title}</p>
                  <p>${f.text}</p>
                </a>
              </div>`,
              )
              .join("")}
          </div>
        `,
      });
  } catch (error) {
    console.error(error);
    app.innerHTML = hero + renderPageLayout({ content: renderNotification("Өгөгдөл ачаалахад алдаа гарлаа.", "danger") });
  }
}
