(function () {
  const SITE_TITLE = "พันธุ์ปิติ เปี่ยมสง่า";
  const SITE_SUBTITLE = "Academic work and public writing";

  function normalizeBrand() {
    document.querySelectorAll(".brand, .site-label").forEach((brand) => {
      const title = brand.querySelector("strong, span:first-child");
      const subtitle = brand.querySelector("span:last-child");

      if (title) title.textContent = SITE_TITLE;
      if (subtitle) subtitle.textContent = SITE_SUBTITLE;
    });
  }

  function setupMobileNav() {
    document.querySelectorAll(".site-header").forEach((header) => {
      const topbar = header.querySelector(".topbar");
      const nav = header.querySelector(".nav");
      const brand = header.querySelector(".brand");
      if (!topbar || !nav || !brand || topbar.querySelector(".nav-toggle")) return;

      const button = document.createElement("button");
      const navId = nav.id || `site-nav-${Math.random().toString(36).slice(2, 8)}`;
      nav.id = navId;
      button.className = "nav-toggle";
      button.type = "button";
      button.setAttribute("aria-controls", navId);
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-label", "เปิดเมนูหลัก");
      button.innerHTML = "<span></span><span></span><span></span>";

      button.addEventListener("click", () => {
        const isOpen = header.classList.toggle("is-nav-open");
        button.setAttribute("aria-expanded", String(isOpen));
        button.setAttribute("aria-label", isOpen ? "ปิดเมนูหลัก" : "เปิดเมนูหลัก");
      });

      nav.addEventListener("click", (event) => {
        if (!event.target.closest("a")) return;
        header.classList.remove("is-nav-open");
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-label", "เปิดเมนูหลัก");
      });

      header.classList.add("has-mobile-nav");
      topbar.insertBefore(button, brand.nextSibling);
    });
  }

  function init() {
    normalizeBrand();
    setupMobileNav();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}());
