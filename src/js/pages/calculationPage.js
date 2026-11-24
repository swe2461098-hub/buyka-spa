import { renderPageLayout } from "../layouts/pageLayout.js";
import { renderNotification } from "../layouts/notificationLayout.js";
import { getMembers } from "../services/memberService.js";
import { indexByCode, findRelation } from "../fn/family.js";
import { escapeHtml } from "../fn/format.js";
import { renderTreePerson, openMemberModal } from "../components/memberCard.js";

/* Ургийн модны эхлэл: эцэг эх нь бүртгэлгүй, ханийнх нь эцэг эх ч бүртгэлгүй (гаднаас бэр/хүргэн
   орж ирээгүй) гишүүд. Хосоос нэгийг нь (эрэгтэйг) авна. */
function findRoots(members, byCode) {
  const seen = new Set();
  return members
    .filter((m) => !m.father_code && !m.mother_code)
    .filter((m) => {
      const s = byCode.get(m.spouse_code);
      return !s || (!s.father_code && !s.mother_code);
    })
    .sort((a, b) => a.generation - b.generation || (a.gender === "эр" ? -1 : 1))
    .filter((m) => {
      if (seen.has(m.member_code)) return false;
      seen.add(m.member_code);
      if (m.spouse_code) seen.add(m.spouse_code);
      return true;
    });
}

// Нэг зангилаа = хос (гишүүн + хань) ба тэдний хүүхдүүд (рекурс)
function renderNode(m, byCode) {
  const spouse = byCode.get(m.spouse_code);
  const children = (m.children || []).map((c) => byCode.get(c)).filter(Boolean);
  children.sort((a, b) => (a.birth_year ?? 0) - (b.birth_year ?? 0));

  return `
    <li>
      <div class="app-couple">
        ${renderTreePerson(m)}
        ${spouse ? `<span class="app-couple-link" aria-hidden="true">♥</span>${renderTreePerson(spouse, "is-spouse")}` : ""}
      </div>
      ${children.length ? `<ul>${children.map((c) => renderNode(c, byCode)).join("")}</ul>` : ""}
    </li>`;
}

function renderOptions(members, selected) {
  return members
    .map(
      (m) =>
        `<option value="${escapeHtml(m.member_code)}" ${m.member_code === selected ? "selected" : ""}>${escapeHtml(m.full_name)} (${m.generation}-р үе)</option>`,
    )
    .join("");
}

function renderCalculator(members) {
  const youngest = [...members].sort((a, b) => (b.birth_year ?? 0) - (a.birth_year ?? 0))[0];
  return `
    <div class="box app-calc">
      <div class="columns is-vcentered">
        <div class="column">
          <label class="label" for="relA">Би (хэнээс харах)</label>
          <div class="select is-fullwidth"><select id="relA">${renderOptions(members, youngest.member_code)}</select></div>
        </div>
        <div class="column is-narrow has-text-centered app-calc-arrow">⇄</div>
        <div class="column">
          <label class="label" for="relB">Хамаатан</label>
          <div class="select is-fullwidth"><select id="relB">${renderOptions(members, members[0].member_code)}</select></div>
        </div>
        <div class="column is-narrow">
          <label class="label is-invisible">.</label>
          <button class="button is-primary" type="button" id="relBtn">Тооцоолох</button>
        </div>
      </div>
      <div id="relResult" aria-live="polite"></div>
    </div>`;
}

function highlight(codes) {
  document.querySelectorAll(".app-tree-person").forEach((el) => {
    el.classList.toggle("is-highlight", codes.includes(el.dataset.code));
  });
}

function bindTreeEvents(members, byCode) {
  document.querySelectorAll(".app-tree-person").forEach((el) =>
    el.addEventListener("click", () => openMemberModal(el.dataset.code, byCode)),
  );

  const run = () => {
    const a = document.getElementById("relA").value;
    const b = document.getElementById("relB").value;
    const rel = findRelation(a, b, members);
    const nameA = byCode.get(a)?.given_name;
    const nameB = byCode.get(b)?.given_name;

    document.getElementById("relResult").innerHTML = `
      <div class="notification is-success is-light app-calc-result">
        <p><strong>${escapeHtml(nameA)}</strong> → <strong>${escapeHtml(nameB)}</strong>:
          <span class="tag is-warning is-medium">${escapeHtml(rel.label)}</span></p>
        <p class="is-size-7 mt-2">${escapeHtml(rel.detail)}</p>
      </div>`;
    highlight([a, b, rel.common?.member_code].filter(Boolean));
  };

  document.getElementById("relBtn")?.addEventListener("click", run);
  run();
}

export async function renderCalculationPage() {
  const app = document.getElementById("app");
  app.innerHTML = renderPageLayout({ content: renderNotification("Ургийн мод зурж байна...", "info") });

  try {
    const members = await getMembers();
    const byCode = indexByCode(members);
    const roots = findRoots(members, byCode);

    app.innerHTML = renderPageLayout({
      id: "calculation",
      title: "Ургийн мод",
      content: `
        <p class="mb-4">Өвөг дээдсээс (зүүн) үр удам (баруун) хүртэл үеэр нь харуулав. Хүн дээр дарж дэлгэрэнгүйг үзнэ.
          <span class="tag app-legend is-male">эрэгтэй</span>
          <span class="tag app-legend is-female">эмэгтэй</span>
          <span class="tag app-legend is-passed">өнгөрсөн</span></p>

        <div class="app-tree-scroll">
          <div class="app-tree"><ul>${roots.map((r) => renderNode(r, byCode)).join("")}</ul></div>
        </div>

        <h2 class="subtitle app-subtitle mt-6">Хамаатны холбоо тооцоолох</h2>
        <p class="mb-4">Хоёр гишүүн сонгоход нийтлэг өвгийг олж, хэн нь хэн болохыг (ах, авга, нагац, үеэл, ач, зээ...) тооцоолно.</p>
        ${renderCalculator(members)}
      `,
    });

    bindTreeEvents(members, byCode);
  } catch (error) {
    console.error(error);
    app.innerHTML = renderPageLayout({ content: renderNotification("Ургийн мод ачаалахад алдаа гарлаа.", "danger") });
  }
}
