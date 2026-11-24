import { escapeHtml, safeValue } from "../fn/format.js";
import { getAge, isAlive, isMale, lifeSpan } from "../fn/family.js";
import { openModal, getModalBody } from "../layouts/modalLayout.js";

const initials = (m) => escapeHtml((m.given_name || m.full_name || "?").charAt(0));

// Гишүүний жижиг карт (Ургийн гишүүд хуудас)
export function renderMemberCard(m) {
  return `
    <div class="column is-6-tablet is-4-desktop">
      <button type="button" class="app-member-card ${isMale(m) ? "is-male" : "is-female"}" data-code="${escapeHtml(m.member_code)}">
        <span class="app-avatar">${initials(m)}</span>
        <span class="app-member-info">
          <strong>${escapeHtml(m.full_name)}</strong>
          <small>${lifeSpan(m)} ${isAlive(m) ? "" : "<span class=\"tag is-light\">өнгөрсөн</span>"}</small>
          <small>${m.generation}-р үе · ${safeValue(m.clan)} · ${safeValue(m.occupation)}</small>
        </span>
      </button>
    </div>`;
}

// Модон дээрх жижиг зангилаа
export function renderTreePerson(m, extraClass = "") {
  if (!m) return "";
  return `
    <button type="button" class="app-tree-person ${isMale(m) ? "is-male" : "is-female"} ${isAlive(m) ? "" : "is-passed"} ${extraClass}"
      data-code="${escapeHtml(m.member_code)}" title="${escapeHtml(m.full_name)}">
      <strong>${escapeHtml(m.given_name)}</strong>
      <small>${lifeSpan(m)}</small>
    </button>`;
}

// Дэлгэрэнгүй мэдээлэл (modal дотор)
export function renderMemberDetail(m, byCode) {
  const name = (code) => (byCode.get(code) ? escapeHtml(byCode.get(code).full_name) : "-");
  const link = (code) =>
    byCode.get(code) ? `<a href="#" data-code="${escapeHtml(code)}" class="app-member-link">${name(code)}</a>` : "-";
  const children = (m.children || []).map(link).join(", ") || "-";

  return `
    <div class="media">
      <div class="media-left"><span class="app-avatar is-large ${isMale(m) ? "is-male" : "is-female"}">${initials(m)}</span></div>
      <div class="media-content">
        <p class="title is-4">${escapeHtml(m.full_name)}</p>
        <p class="subtitle is-6">${escapeHtml(m.member_code)} · ${m.generation}-р үе · ${safeValue(m.clan)} овог</p>
      </div>
    </div>
    <table class="table is-fullwidth is-narrow">
      <tbody>
        <tr><th>Хүйс</th><td>${safeValue(m.gender)}</td></tr>
        <tr><th>Он жил</th><td>${lifeSpan(m)} (${getAge(m) ?? "-"} нас)</td></tr>
        <tr><th>Төрсөн газар</th><td>${safeValue(m.birthplace)}</td></tr>
        <tr><th>Мэргэжил</th><td>${safeValue(m.occupation)}</td></tr>
        <tr><th>Эцэг</th><td>${link(m.father_code)}</td></tr>
        <tr><th>Эх</th><td>${link(m.mother_code)}</td></tr>
        <tr><th>Хань</th><td>${link(m.spouse_code)}</td></tr>
        <tr><th>Хүүхдүүд</th><td>${children}</td></tr>
      </tbody>
    </table>
    ${m.note ? `<blockquote class="app-note">${escapeHtml(m.note)}</blockquote>` : ""}
  `;
}

// Гишүүний дэлгэрэнгүйг modal-аар нээх. Доторх эцэг/эх/хүүхдийн холбоос дээр дарахад шилжинэ.
export function openMemberModal(code, byCode) {
  const m = byCode.get(code);
  if (!m) return;
  openModal(renderMemberDetail(m, byCode));
  getModalBody()
    .querySelectorAll(".app-member-link")
    .forEach((a) =>
      a.addEventListener("click", (e) => {
        e.preventDefault();
        openMemberModal(a.dataset.code, byCode);
      }),
    );
}
