import { renderNotification } from "../layouts/notificationLayout.js";
import { renderMemberTables } from "../components/memberTables.js";
import { infoGroups } from "../components/searchSettingsSidebar.js";

let memberData = [];

export function initMemberData(data) {
  memberData = data;
}

/* Гишүүдийг нэг талбараар (generation, clan) бүлэглэнэ.
   groupBy(member) -> бүлгийн нэр
   Гаралт: [{ groupName: "1-р үе", items: [{ member_code, full_name }] }] */
export function buildGroups(data, groupBy, sortGroups) {
  const grouped = new Map();

  for (const m of data) {
    const key = groupBy(m);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push({ member_code: m.member_code, full_name: m.full_name });
  }

  return Array.from(grouped.entries())
    .sort(sortGroups)
    .map(([groupName, items]) => ({
      groupName,
      items: items.sort((a, b) => a.full_name.localeCompare(b.full_name, "mn")),
    }));
}

// Үеээр: "1-р үе", "2-р үе" ... (тоон дарааллаар)
export function buildGenerationGroups(data) {
  return buildGroups(
    data,
    (m) => `${m.generation}-р үе`,
    (a, b) => parseInt(a[0]) - parseInt(b[0]),
  );
}

// Овгоор: "Хэрээд", "Урианхай" ... (цагаан толгойн дарааллаар)
export function buildClanGroups(data) {
  return buildGroups(
    data,
    (m) => m.clan || "Бусад",
    (a, b) => a[0].localeCompare(b[0], "mn"),
  );
}

const DEFAULT_TYPES = infoGroups
  .flatMap((g) => g.items)
  .filter((i) => i.checked)
  .map((i) => i.value);

const DEFAULT_ITEM_COUNT = 4;

let changeBound = false; // document-ийн listener давхардахаас сэргийлнэ

export function bindSearchEvents() {
  const searchBtn = document.getElementById("searchBtn");
  const searchTxt = document.getElementById("searchTxt");

  searchBtn?.addEventListener("click", handleTextSearch);

  searchTxt?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleTextSearch();
    }
  });

  if (changeBound) return;
  changeBound = true;

  document.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    if (target.matches('input[name="membercode"]')) {
      handleMemberCodeSearch();
      return;
    }
    if (target.matches('input[name="info"]')) {
      renderCurrentResults();
    }
  });
}

// Нэрээр хайх
function handleTextSearch() {
  clearCheckedMembers();

  if (!getSearchKeyword()) {
    setResultHtml(renderNotification("Ургийн гишүүний нэр оруулна уу."));
    return;
  }
  renderCurrentResults();
}

// Үе/овгийн жагсаалтаас сонгож хайх
function handleMemberCodeSearch() {
  const searchTxt = document.getElementById("searchTxt");
  if (searchTxt) searchTxt.value = "";

  if (!getSelectedMemberCodes().length) {
    setResultHtml(renderDefaultTables(memberData));
    return;
  }
  renderCurrentResults();
}

function renderCurrentResults() {
  setResultHtml(renderMemberTables(getMatchedItems(), getSelectedInfoTypes(), memberData));
}

// Сонгосон checkbox-ууд, эсвэл хайх үгээр шүүнэ. Хоёулаа хоосон бол эхний 4-ийг үзүүлнэ.
function getMatchedItems() {
  const codes = getSelectedMemberCodes();
  const keyword = getSearchKeyword();

  if (codes.length) return memberData.filter((m) => codes.includes(m.member_code));
  if (keyword) return memberData.filter((m) => (m.full_name || "").toLowerCase().includes(keyword));
  return memberData.slice(0, DEFAULT_ITEM_COUNT);
}

function getSearchKeyword() {
  return document.getElementById("searchTxt")?.value.trim().toLowerCase() || "";
}

// Үе, овгийн аль алинд нь байгаа гишүүн давхцаж орохгүй байхын тулд Set ашиглав.
function getSelectedMemberCodes() {
  const codes = Array.from(document.querySelectorAll('input[name="membercode"]:checked')).map((c) => c.value);
  return [...new Set(codes)];
}

function getSelectedInfoTypes() {
  return Array.from(document.querySelectorAll('input[name="info"]:checked')).map((c) => c.value);
}

function clearCheckedMembers() {
  document.querySelectorAll('input[name="membercode"]:checked').forEach((c) => (c.checked = false));
}

function setResultHtml(html) {
  const el = document.getElementById("resultTbl");
  if (el) el.innerHTML = html;
}

export function renderDefaultTables(data) {
  return renderMemberTables(data.slice(0, DEFAULT_ITEM_COUNT), DEFAULT_TYPES, data);
}
