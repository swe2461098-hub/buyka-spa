import { getMembers } from "../services/memberService.js";

export async function renderSearchPage() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="box">
      <h2 class="title is-4">Хайлт</h2>
      <p>Өгөгдөл ачаалж байна...</p>
    </div>
  `;

  try {
    const members = await getMembers();

    app.innerHTML = `
      <div class="box">
        <h2 class="title is-4">Хайлт</h2>
        <p class="mb-4">Ургийн гишүүд: <strong>${members.length}</strong></p>
        <ul>
          ${members
            .map((m) => `<li><strong>${m.full_name}</strong> (${m.member_code}) — ${m.generation}-р үе, ${m.birth_year}${m.death_year ? "–" + m.death_year : ""}</li>`)
            .join("")}
        </ul>
      </div>
    `;
  } catch (error) {
    app.innerHTML = `
      <div class="box">
        <h2 class="title is-4">Хайлт</h2>
        <p class="has-text-danger">Ургийн гишүүдийн өгөгдөл ачаалахад алдаа гарлаа.</p>
      </div>
    `;
    console.error(error);
  }
}
