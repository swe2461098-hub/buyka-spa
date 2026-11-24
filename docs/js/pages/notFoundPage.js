import { renderPageLayout } from "../layouts/pageLayout.js";

export function renderNotFoundPage() {
  const app = document.getElementById("app");

  app.innerHTML = renderPageLayout({
    id: "notFound",
    title: "404 - Хуудас олдсонгүй",
    content: `
      <div class="has-text-centered app-404">
        <p class="app-404-icon"><i class="fas fa-leaf"></i></p>
        <p class="mb-4">Энэ мөчир ургийн модонд байхгүй байна. Хаягаа шалгаад дахин оролдоно уу.</p>
        <a class="button is-primary" href="#/overview">Нүүр хуудас руу буцах</a>
      </div>
    `,
  });
}
