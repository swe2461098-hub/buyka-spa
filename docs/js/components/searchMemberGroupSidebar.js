import { escapeHtml } from "../fn/format.js";

function renderGroup(group) {
  return `
    <li>
      <a class="app-toggle-sublist" href="#" role="button"><span>${escapeHtml(group.groupName)}</span></a>
      <ul class="app-sublist is-hidden">
        ${group.items
          .map(
            (item) => `
              <li>
                <label class="app-sublist-item">
                  <input type="checkbox" name="membercode" value="${escapeHtml(item.member_code)}">
                  <span>${escapeHtml(item.full_name)}</span>
                </label>
              </li>`,
          )
          .join("")}
      </ul>
    </li>
  `;
}

// "Үеээр хайх", "Овгоор хайх" гэх мэт бүлэглэсэн жагсаалтыг дахин ашиглаж зурна.
export function renderMemberGroupList(title, groups = []) {
  return `
    <p class="menu-label app-menu-label">🔍︎ ${escapeHtml(title)}:</p>
    <ul class="menu-list">${groups.map(renderGroup).join("")}</ul>
  `;
}
