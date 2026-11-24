
import { t } from "../i18n/i18n.js";

import { renderPageLayout } from "../layouts/pageLayout.js";

export function renderOverviewPage() {
  const app = document.getElementById("app");

  if (!app) return;

  app.innerHTML = renderPageLayout({
    id: "overview",
    title: t("overview.title"),
    content: `
      <div class="has-text-centered">
        <h2 class="title is-4">Ургийн бичиг</h2>
        <p class="subtitle is-5">${t("overview.welcome")}</p>
        <p>
          Өөрийн гэр бүлийн угсаа гарвал, өвөг дээдэс болон
          үр хүүхдийн мэдээллийг нэг дор бүртгэж, хадгална.
        </p>
      </div>
    `,
  });
}
