(function () {
  document.body.classList.add("me-article-skin");

  const navItems = [
    ["../index.html", "About me"],
    ["../publications.html", "Publications"],
    ["../articles.html", "Articles"],
    ["../apps.html", "Apps"]
  ];

  function replaceHeader() {
    const topbar = document.querySelector(".topbar");
    if (!topbar) return;

    topbar.innerHTML = "";

    const brand = document.createElement("a");
    brand.className = "site-label";
    brand.href = "../index.html";
    brand.innerHTML = "<span>พันธุ์ปิติ เปี่ยมสง่า</span><span>Academic work and public writing</span>";

    const nav = document.createElement("nav");
    nav.className = "nav";
    nav.setAttribute("aria-label", "หลัก");

    navItems.forEach(([href, label]) => {
      const link = document.createElement("a");
      link.href = href;
      link.textContent = label;
      if (label === "Articles") link.setAttribute("aria-current", "page");
      nav.append(link);
    });

    topbar.append(brand, nav);
  }

  function replaceFooter() {
    const footer = document.querySelector(".footer");
    if (!footer) return;

    footer.innerHTML = "";
    const left = document.createElement("div");
    left.textContent = "Articles";
    const right = document.createElement("div");
    right.textContent = "พันธุ์ปิติ เปี่ยมสง่า";
    footer.append(left, right);
  }

  function addBackLink() {
    const hero = document.querySelector(".hero");
    if (!hero || hero.querySelector(".me-back-link")) return;

    const link = document.createElement("a");
    link.className = "me-back-link";
    link.href = "../articles.html";
    link.textContent = "กลับไป Articles";
    hero.append(link);
  }

  replaceHeader();
  replaceFooter();
  addBackLink();
})();
