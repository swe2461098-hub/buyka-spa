import { getMembers } from "../services/memberService.js";
import { buildGenerationGroups, buildClanGroups, bindSearchEvents, renderDefaultTables, initMemberData } from "../fn/memberSearchEvents.js";
import { renderSidebarPageLayout } from "../layouts/sidebarPageLayout.js";
import { renderPageLayout } from "../layouts/pageLayout.js";
import { renderNotification } from "../layouts/notificationLayout.js";
import { bindSidebar, bindMenuListToggle } from "../fn/sidebarEvents.js";
import { renderSearchName } from "../components/searchNameSidebar.js";
import { renderSearchSettings } from "../components/searchSettingsSidebar.js";
import { renderMemberGroupList } from "../components/searchMemberGroupSidebar.js";

export async function renderSearchPage() {
  const app = document.getElementById("app");

  app.innerHTML = renderPageLayout({ content: renderNotification("Өгөгдөл ачаалж байна...") });

  try {
    const members = await getMembers();
    initMemberData(members);

    app.innerHTML = renderSidebarPageLayout({
      sidebarContent: [
        renderSearchName(),
        renderSearchSettings(),
        renderMemberGroupList("Үеээр хайх", buildGenerationGroups(members)),
        renderMemberGroupList("Овгоор хайх", buildClanGroups(members)),
      ].join(""),
      pageId: "search",
      pageTitle: "Ургийн бичгийн хайлт",
      mainContent: `<div id="resultTbl">${renderDefaultTables(members)}</div>`,
    });

    bindSidebar();
    bindMenuListToggle();
    bindSearchEvents();
  } catch (error) {
    app.innerHTML = renderPageLayout({
      content: renderNotification("Ургийн гишүүдийн өгөгдөл ачаалахад алдаа гарлаа.", "danger"),
    });
    console.error(error);
  }
}
