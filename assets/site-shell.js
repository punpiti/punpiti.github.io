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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", normalizeBrand);
  } else {
    normalizeBrand();
  }
}());
