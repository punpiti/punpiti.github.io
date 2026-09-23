(function () {
  const list = document.querySelector("#article-list");
  const search = document.querySelector("#article-search");
  const status = document.querySelector("#article-filter-status");
  const articles = Array.isArray(window.ARTICLES_DATA) ? window.ARTICLES_DATA : [];
  const params = new URLSearchParams(window.location.search);
  const initialTag = (params.get("tag") || "").trim().toLowerCase();
  const initialTopic = (params.get("topic") || "").trim().toLowerCase();
  const labelByTag = {
    "talent-development": "Talent Development",
    "ai": "AI",
    "higher-education": "Higher Education"
  };

  // Topic groups collect several related tags under one heading, so a reader can
  // filter by subject without knowing the tag vocabulary.
  const TOPIC_GROUPS = {
    education: {
      label: "การศึกษา",
      tags: ["education", "curriculum", "curriculum-design", "teaching", "ai-literacy", "hopeless-learning", "admissions", "graduate-education"]
    },
    university: {
      label: "มหาวิทยาลัย",
      tags: ["higher-education", "university-reform", "ku", "kasetsart-university", "university-council", "future-university", "future-of-university"]
    },
    "talent-development": {
      label: "การพัฒนาคน",
      tags: ["talent-development", "national-capability", "aiep", "future-of-work"]
    },
    "computer-olympiad": {
      label: "คอมพิวเตอร์โอลิมปิก",
      tags: ["computer-olympiad", "posn", "toi-zero"]
    },
    "university-council": {
      label: "สภามหาวิทยาลัย",
      tags: ["university-council", "university-governance", "financial-governance", "faculty-representation"]
    },
    tcas: {
      label: "TCAS",
      tags: ["tcas", "tcas1", "admissions", "portfolio", "quota"]
    }
  };

  const activeTopic = TOPIC_GROUPS[initialTopic] || null;
  const activeLabel = activeTopic ? activeTopic.label : labelByTag[initialTag] || initialTag;

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
      const matchesTopic = activeTopic ? activeTopic.tags.some((tag) => tags.includes(tag)) : true;
      const matchesTag = initialTag ? tags.includes(initialTag) : true;
      const matchesQuery = query ? textFor(article).includes(query) : true;
      return matchesTopic && matchesTag && matchesQuery;
    });
    render(items);

    if ((initialTag || activeTopic) && status) {
      status.hidden = false;
      status.innerHTML = `กำลังกรอง: <strong>${activeLabel}</strong> (${items.length} บทความ) <a href="articles.html">ล้างตัวกรอง</a>`;
    }
  }

  if ((initialTag || activeTopic) && search) {
    search.placeholder = `ค้นใน ${activeLabel}`;
  }

  // Mark the chip that matches the filter currently in the URL.
  function markActiveChip() {
    const current = initialTopic ? `topic=${initialTopic}` : initialTag ? `tag=${initialTag}` : "";
    document.querySelectorAll(".filter-chips a").forEach((chip) => {
      const query = (chip.getAttribute("href") || "").split("?")[1] || "";
      const isActive = current ? query === current : !query;
      chip.classList.toggle("is-active", isActive);
      if (isActive) chip.setAttribute("aria-current", "true");
    });
  }

  markActiveChip();

  if (search) search.addEventListener("input", update);
  update();
})();
