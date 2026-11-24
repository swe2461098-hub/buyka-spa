import { renderPageLayout } from "../layouts/pageLayout.js";

export function renderCalculationPage() {

    const app = document.getElementById("app");

    app.innerHTML = renderPageLayout({

        id: "calculation",

        title: "Ургийн мод",

        content: `

      <p>Гэр бүлийн үе удмын холбоо, өвөг дээдэс болон үр удмын мэдээллийг ургийн мод хэлбэрээр харах хэсэг.</p>

    `,

    });

}