import { renderPageLayout } from "../layouts/pageLayout.js";

export function renderSearchPage() {

    const app = document.getElementById("app");

    app.innerHTML = renderPageLayout({

        id: "search",

        title: "Ургийн бичгийн хайлт",

        content: `

      <p>Ургийн гишүүдийн нэр болон мэдээллийг хайх хэсэг.</p>

    `,

    });

}