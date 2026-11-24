export function initRouter(routes) {
  function renderRoute() {
    const hash = window.location.hash || "#/overview";
    const page = routes[hash] || routes["#/404"];
    page?.();
  }

  // URL-ийн # хэсэг өөрчлөгдөх бүрд дахин ажиллана
  window.addEventListener("hashchange", renderRoute);

  // Анх ачаалахад шууд ажиллана
  renderRoute();
}
