(function () {
  const list = document.querySelector("#article-list");
  const search = document.querySelector("#article-search");
  const status = document.querySelector("#article-filter-status");
  const articles = Array.isArray(window.ARTICLES_DATA) ? window.ARTICLES_DATA : [];
  const params = new URLSearchParams(window.location.search);
  const initialTag = (params.get("tag") || "").trim().toLowerCase();
  const labelByTag = {
    "talent-development": "Talent Development",
    "ai": "AI",
    "higher-education": "Higher Education"
  };

  function textFor(article) {
    return [
      article.title,
      article.summary,
      article.category,
      ...(article.tags || [])
    ].join(" ").toLowerCase();
  }

  function render(items) {
    if (!list) return;
    list.innerHTML = "";

    if (!items.length) {
      list.innerHTML = '<p class="muted-note">ไม่พบบทความที่ตรงกับคำค้น</p>';
      return;
    }

    const fragment = document.createDocumentFragment();
    items.forEach((article) => {
      const link = document.createElement("a");
      link.className = "article-row";
      link.href = article.archive_path || `articles/${article.slug}.html`;

      const image = document.createElement("img");
      image.src = article.image_index || "assets/convergence.png";
      image.alt = article.image_alt || "";

      const body = document.createElement("div");
      body.className = "article-row__body";

      const meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = [article.category, article.display_date].filter(Boolean).join(" / ");

      const title = document.createElement("h3");
      title.textContent = article.title;

      const summary = document.createElement("p");
      summary.textContent = article.summary || "";

      body.append(meta, title, summary);
      link.append(image, body);
      fragment.append(link);
    });
    list.append(fragment);
  }

  function update() {
    const query = (search && search.value ? search.value : "").trim().toLowerCase();
    const items = articles.filter((article) => {
      const tags = (article.tags || []).map((tag) => String(tag).toLowerCase());
      const matchesTag = initialTag ? tags.includes(initialTag) : true;
      const matchesQuery = query ? textFor(article).includes(query) : true;
      return matchesTag && matchesQuery;
    });
    render(items);

    if (initialTag && status) {
      const label = labelByTag[initialTag] || initialTag;
      status.hidden = false;
      status.innerHTML = `กำลังกรอง: <strong>${label}</strong> (${items.length} บทความ) <a href="articles.html">ล้างตัวกรอง</a>`;
    }
  }

  if (initialTag && search) {
    const label = labelByTag[initialTag] || initialTag;
    search.placeholder = `ค้นใน ${label}`;
  }

  if (search) search.addEventListener("input", update);
  update();
})();
