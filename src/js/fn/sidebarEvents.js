// Mobile дээр sidebar-ийг нээх/хаах
export function bindSidebar() {
  const openBtn = document.getElementById("openSidebar");
  const closeBtn = document.getElementById("closeSidebar");
  const sidebar = document.getElementById("docsSidebar");
  const overlay = document.getElementById("sidebarOverlay");

  function open() {
    if (!sidebar || !overlay) return;
    sidebar.classList.add("is-open");
    overlay.classList.add("is-active");
    document.body.style.overflow = "hidden";
  }

  function close() {
    if (!sidebar || !overlay) return;
    sidebar.classList.remove("is-open");
    overlay.classList.remove("is-active");
    document.body.style.overflow = "";
  }

  openBtn?.addEventListener("click", open);
  closeBtn?.addEventListener("click", close);
  overlay?.addEventListener("click", close);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) close();
  });
}

// Sidebar дээрх дэд жагсаалтыг (үе, овог, тохиргоо) нээх/хаах
export function bindMenuListToggle() {
  document.querySelectorAll(".app-toggle-sublist").forEach((toggle) => {
    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      const li = toggle.closest("li");
      const sublist = li?.querySelector(".app-sublist");
      if (!sublist) return;
      sublist.classList.toggle("is-hidden");
      li.classList.toggle("is-active");
    });
  });
}
