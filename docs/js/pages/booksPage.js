import { renderPageLayout } from "../layouts/pageLayout.js";
import { renderNotification } from "../layouts/notificationLayout.js";
import { getMembers } from "../services/memberService.js";
import { indexByCode, isAlive } from "../fn/family.js";
import { escapeHtml } from "../fn/format.js";
import { renderMemberCard, openMemberModal } from "../components/memberCard.js";

// Шүүлтүүрийн утгууд
const filters = { gender: "all", generation: "all", status: "all", sort: "generation" };

const sorters = {
  generation: (a, b) => a.generation - b.generation || (a.birth_year ?? 0) - (b.birth_year ?? 0),
  name: (a, b) => a.given_name.localeCompare(b.given_name, "mn"),
  youngest: (a, b) => (b.birth_year ?? 0) - (a.birth_year ?? 0),
};

function applyFilters(members) {
  return members
    .filter((m) => filters.gender === "all" || m.gender === filters.gender)
    .filter((m) => filters.generation === "all" || String(m.generation) === filters.generation)
    .filter((m) => filters.status === "all" || (filters.status === "alive" ? isAlive(m) : !isAlive(m)))
    .sort(sorters[filters.sort]);
}

function select(id, label, options) {
  return `
    <div class="column is-6-mobile">
      <label class="label is-small" for="${id}">${label}</label>
      <div class="select is-small is-fullwidth">
        <select id="${id}" data-filter="${id.replace("f-", "")}">
          ${options.map(([v, t]) => `<option value="${escapeHtml(v)}">${escapeHtml(t)}</option>`).join("")}
        </select>
      </div>
    </div>`;
}

function renderFilterBar(members) {
  const generations = [...new Set(members.map((m) => m.generation))].sort((a, b) => a - b);
  return `
    <div class="columns is-multiline is-mobile app-filter-bar">
      ${select("f-gender", "Хүйс", [["all", "Бүгд"], ["эр", "Эрэгтэй"], ["эм", "Эмэгтэй"]])}
      ${select("f-generation", "Үе", [["all", "Бүх үе"], ...generations.map((g) => [String(g), `${g}-р үе`])])}
      ${select("f-status", "Төлөв", [["all", "Бүгд"], ["alive", "Амьд"], ["passed", "Өнгөрсөн"]])}
      ${select("f-sort", "Эрэмбэ", [["generation", "Үеэр"], ["name", "Нэрээр"], ["youngest", "Залуугаас"]])}
    </div>`;
}

function renderGrid(members) {
  const list = applyFilters(members);
  document.getElementById("memberCount").textContent = `${list.length} гишүүн`;
  document.getElementById("memberGrid").innerHTML = list.length
    ? `<div class="columns is-multiline">${list.map(renderMemberCard).join("")}</div>`
    : renderNotification("Шүүлтүүрт тохирох гишүүн алга.");
}

export async function renderBooksPage() {
  const app = document.getElementById("app");
  app.innerHTML = renderPageLayout({ content: renderNotification("Гишүүдийг ачаалж байна...", "info") });

  try {
    const members = await getMembers();
    const byCode = indexByCode(members);
    Object.assign(filters, { gender: "all", generation: "all", status: "all", sort: "generation" });

    app.innerHTML = renderPageLayout({
      id: "books",
      title: "Ургийн гишүүд",
      content: `
        <p class="mb-4">Ургийн бичигт бүртгэлтэй гишүүн бүрийн хувийн хуудас. Карт дээр дарж намтар, гэр бүлийг үзнэ.
          <span class="tag is-primary is-light" id="memberCount"></span></p>
        ${renderFilterBar(members)}
        <div id="memberGrid"></div>
      `,
    });

    document.querySelectorAll("[data-filter]").forEach((sel) =>
      sel.addEventListener("change", () => {
        filters[sel.dataset.filter] = sel.value;
        renderGrid(members);
      }),
    );

    // Event delegation: картууд дахин зурагдсан ч ажиллана.
    document.getElementById("memberGrid").addEventListener("click", (e) => {
      const card = e.target instanceof HTMLElement && e.target.closest(".app-member-card");
      if (card) openMemberModal(card.dataset.code, byCode);
    });

    renderGrid(members);
  } catch (error) {
    console.error(error);
    app.innerHTML = renderPageLayout({ content: renderNotification("Гишүүдийн мэдээлэл ачаалахад алдаа гарлаа.", "danger") });
  }
}
