export function initRouter(routes) {
  function renderRoute() {
    const hash = window.location.hash || "#/overview";
    const page = routes[hash] || routes["#/404"];

    // Цэсэн дээр идэвхтэй хуудсыг тодруулна
    document.querySelectorAll(".navbar-item[href^='#/']").forEach((a) => {
      a.classList.toggle("is-active", a.getAttribute("href") === hash);
    });

    window.scrollTo(0, 0);
    page?.();
  }

  // URL-ийн # хэсэг өөрчлөгдөх бүрд дахин ажиллана
  window.addEventListener("hashchange", renderRoute);

  // Анх ачаалахад шууд ажиллана
  renderRoute();
}
