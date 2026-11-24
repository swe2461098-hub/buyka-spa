// Нэр бичиж хайх хэсэг
export function renderSearchName() {
  return `
    <p class="menu-label app-menu-label">🔍︎ Нэрээр хайх:</p>

    <div class="field">
      <p class="control has-icons-left">
        <input class="input is-primary" type="text" placeholder="Ургийн гишүүний нэр" id="searchTxt"/>
        <span class="icon is-small is-left"><i class="fa-solid fa-user"></i></span>
      </p>
    </div>

    <div class="field">
      <p class="control">
        <button class="button is-primary is-fullwidth" type="button" id="searchBtn">Хайх</button>
      </p>
    </div>
  `;
}
