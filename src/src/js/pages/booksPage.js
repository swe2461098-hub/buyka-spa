import { renderPageLayout } from "../layouts/pageLayout.js";

export function renderBooksPage() {

    const app = document.getElementById("app");

    app.innerHTML = renderPageLayout({

        id: "books",

        title: "Ургийн гишүүд",

        content: `

      <p>Ургийн гишүүдийн нэр, төрсөн он, гэр бүлийн холбоо болон хувийн мэдээллийг харах хэсэг.</p>

    `,

    });

}