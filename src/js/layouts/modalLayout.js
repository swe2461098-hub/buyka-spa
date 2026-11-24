// Bulma modal-ыг дахин ашиглах загвар. openModal(html) -> нээнэ, Esc/арын дэвсгэр -> хаана.
const MODAL_ID = "appModal";

function ensureModal() {
  let modal = document.getElementById(MODAL_ID);
  if (modal) return modal;

  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <div class="modal" id="${MODAL_ID}">
      <div class="modal-background" data-close></div>
      <div class="modal-content">
        <div class="box" id="${MODAL_ID}Body"></div>
      </div>
      <button class="modal-close is-large" aria-label="Хаах" data-close></button>
    </div>`,
  );

  modal = document.getElementById(MODAL_ID);
  modal.addEventListener("click", (e) => {
    if (e.target instanceof HTMLElement && e.target.hasAttribute("data-close")) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
  window.addEventListener("hashchange", closeModal);
  return modal;
}

export function openModal(html) {
  const modal = ensureModal();
  document.getElementById(`${MODAL_ID}Body`).innerHTML = html;
  modal.classList.add("is-active");
  document.documentElement.classList.add("is-clipped");
}

export function closeModal() {
  document.getElementById(MODAL_ID)?.classList.remove("is-active");
  document.documentElement.classList.remove("is-clipped");
}

export function getModalBody() {
  return document.getElementById(`${MODAL_ID}Body`);
}
