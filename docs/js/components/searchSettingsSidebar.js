import { escapeHtml } from "../fn/format.js";

// Ямар мэдээллийн хүснэгтүүдийг харуулахаа сонгох тохиргоо.
export const infoGroups = [
  {
    groupName: "Үндсэн мэдээлэл",
    items: [
      { value: "basic", label: "Танилцуулга", checked: true },
      { value: "life", label: "Төрсөн, нас барсан", checked: true },
    ],
  },
  {
    groupName: "Нэмэлт мэдээлэл",
    items: [
      { value: "relations", label: "Гэр бүл, удам", checked: false },
      { value: "note", label: "Тэмдэглэл", checked: false },
    ],
  },
];

function renderInfoGroup(group) {
  return `
    <li>
      <a class="app-toggle-sublist" href="#" role="button"><span>${escapeHtml(group.groupName)}</span></a>
      <ul class="app-sublist is-hidden">
        ${group.items
          .map(
            (item) => `
              <li>
                <label class="app-sublist-item">
                  <input type="checkbox" name="info" value="${escapeHtml(item.value)}" ${item.checked ? "checked" : ""}>
                  <span>${escapeHtml(item.label)}</span>
                </label>
              </li>`,
          )
          .join("")}
      </ul>
    </li>
  `;
}

export function renderSearchSettings() {
  return `
    <p class="menu-label app-menu-label">🛠 Хайх тохиргоо:</p>
    <ul class="menu-list">${infoGroups.map(renderInfoGroup).join("")}</ul>
  `;
}
