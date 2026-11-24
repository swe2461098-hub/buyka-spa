import { renderPageLayout } from "./pageLayout.js";

// Зүүн талдаа sidebar цэстэй, дахин ашиглагдах хуудасны загвар.
export function renderSidebarPageLayout({
  sidebarContent = "",
  mainContent = "",
  pageId = "",
  pageTitle = "",
  sidebarId = "docsSidebar",
  overlayId = "sidebarOverlay",
  openButtonId = "openSidebar",
  closeButtonId = "closeSidebar",
}) {
  const renderedMain = renderPageLayout({ id: pageId, title: pageTitle, content: mainContent });

  return `
    <div class="app-mobile-sidebar">
      <button id="${openButtonId}" class="app-sidebar-icon-btn" aria-label="Цэс нээх" type="button">↪</button>
    </div>

    <div id="${overlayId}" class="app-sidebar-overlay"></div>

    <div class="app-shell">
      <aside id="${sidebarId}" class="app-sidebar">
        <div class="app-sidebar-mobile-head">
          <button id="${closeButtonId}" class="button is-light is-small" aria-label="Цэс хаах" type="button">✕</button>
        </div>
        <nav class="menu">${sidebarContent}</nav>
      </aside>

      <main class="app-main-content">${renderedMain}</main>
    </div>
  `;
}
