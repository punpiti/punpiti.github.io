(function () {
  const PERSON_ID = "360009";
  const LOCAL_TOKEN = "kDImkQRP4D7J3KMHN-wmILyddTdY9qTcMkR22_OUNpM";
  const DEPLOY_TOKEN = "MMRFi88rFP2hJHrDSngacUQzegAQ8pgsTvGc8RWdjsk";
  const LOCAL_API = `http://127.0.0.1:8000/api/profile-claims/stream/${PERSON_ID}?token=${LOCAL_TOKEN}`;
  const DEPLOY_API = `https://urban.cpe.ku.ac.th/api/profile-claims/stream/${PERSON_ID}?token=${DEPLOY_TOKEN}`;
  const PAGE_SIZE = 18;

  const state = {
    outputs: [],
    projects: [],
    activeFilter: "all",
    search: "",
    visibleCount: PAGE_SIZE,
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function getApiUrl() {
    const params = new URLSearchParams(window.location.search);
    const override = params.get("api");
    if (override) return override;

    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0") {
      return LOCAL_API;
    }

    if (host === "urban.cpe.ku.ac.th") {
      return `${window.location.origin}/api/profile-claims/stream/${PERSON_ID}?token=${DEPLOY_TOKEN}`;
    }

    return DEPLOY_API;
  }

  function localText(value) {
    if (!value) return "";
    if (typeof value === "string" || typeof value === "number") return String(value);
    return value.th || value.en || "";
  }

  function stripHtml(value) {
    return String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }

  function yearOf(output) {
    return Number(output?.publication_date?.year_start || output?.year || 0);
  }

  function monthOf(output) {
    return Number(output?.publication_date?.month_start || 0);
  }

  function normalizeType(type) {
    if (!type) return "Other";
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  function authorsText(authors) {
    if (!Array.isArray(authors)) return "";
    return authors
      .slice()
      .sort((a, b) => Number(a.sequence || 0) - Number(b.sequence || 0))
      .map((author) => localText(author.name))
      .filter(Boolean)
      .join(", ");
  }

  function outputSearchText(output) {
    return [
      localText(output.title),
      localText(output.source_name),
      output.output_type,
      output.class_level,
      output.formula_tier,
      output.bibliographic?.doi,
      yearOf(output),
      authorsText(output.authors),
    ].join(" ").toLowerCase();
  }

  function compareOutputs(a, b) {
    return yearOf(b) - yearOf(a) || monthOf(b) - monthOf(a) || localText(a.title).localeCompare(localText(b.title), "th");
  }

  function compareProjects(a, b) {
    return Number(b.year || b.raw?.budgetYear || 0) - Number(a.year || a.raw?.budgetYear || 0);
  }

  function createEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined && text !== null) el.textContent = text;
    return el;
  }

  function renderProfile(data, apiUrl) {
    const person = data.profile?.data || data.person?.data || {};
    const panel = $(".profile-panel");
    $$("[data-api-link]").forEach((apiLink) => {
      apiLink.href = apiUrl;
    });
    if (person.profile_url) {
      $$("[data-profile-link]").forEach((profileLink) => {
        profileLink.href = person.profile_url;
      });
    }
    if (!panel) return;

    const name = `${localText(person.academic_rank)} ${localText(person.name)}`.trim();
    const analysisProfile = data.analysis?.profile || {};
    const interests = Array.isArray(person.interests) ? person.interests.map(localText).filter(Boolean) : analysisProfile.interests || [];

    panel.replaceChildren();
    if (person.image_url) {
      const image = createEl("img", "profile-photo");
      image.src = person.image_url;
      image.alt = localText(person.name) || "Profile photo";
      panel.append(image);
    }

    const body = createEl("div", "profile-body");
    body.append(createEl("div", "profile-name", name || "Publication profile"));
    body.append(createEl("div", "profile-affiliation", [localText(person.department), localText(person.faculty), localText(person.campus)].filter(Boolean).join(" · ")));

    const contacts = createEl("div", "profile-contact");
    if (person.email) {
      const mail = createEl("a", null, person.email);
      mail.href = `mailto:${person.email}`;
      contacts.append(mail);
    }
    if (person.telephone) contacts.append(createEl("span", null, person.telephone));
    body.append(contacts);

    if (interests.length) {
      const chips = createEl("div", "interest-chips");
      interests.slice(0, 6).forEach((interest) => chips.append(createEl("span", null, interest)));
      body.append(chips);
    }

    const hIndex = person.h_index || analysisProfile.h_index;
    if (hIndex) {
      body.append(createEl("div", "profile-note", `KU Forest h-index ${hIndex}${person.h_index_as_of ? ` · as of ${person.h_index_as_of}` : ""}`));
    }

    panel.append(body);
  }

  function renderStats(analysis) {
    const stats = $("[data-stats]");
    if (!stats) return;

    const outputAnalysis = analysis?.outputs || {};
    const projectAnalysis = analysis?.projects || {};
    const journals = outputAnalysis.by_type?.find((item) => item.label === "journal")?.count ?? state.outputs.filter((output) => output.output_type === "journal").length;
    const international = outputAnalysis.by_level?.find((item) => item.label === "International")?.count ?? state.outputs.filter((output) => output.class_level === "International").length;
    const values = [
      outputAnalysis.total ?? state.outputs.length,
      journals,
      international,
      projectAnalysis.total ?? state.projects.length,
    ];

    $$(".stat-value", stats).forEach((node, index) => {
      node.textContent = values[index].toLocaleString("th-TH");
    });
  }

  function renderAnalysis(analysis) {
    const section = $("[data-analysis-section]");
    if (!section || !analysis) return;

    const bullets = $("[data-summary-bullets]");
    const openAlexStats = $("[data-openalex-stats]");
    const topicChips = $("[data-topic-chips]");
    const openAlex = analysis.openalex || {};
    const author = openAlex.author || {};

    if (bullets) {
      bullets.replaceChildren();
      (analysis.summary_bullets || []).slice(0, 5).forEach((bullet) => {
        bullets.append(createEl("li", null, bullet));
      });
    }

    if (openAlexStats) {
      openAlexStats.replaceChildren();
      [
        ["Works", author.works_count],
        ["Citations", author.cited_by_count],
        ["OpenAlex h-index", author.summary_stats?.h_index],
        ["i10-index", author.summary_stats?.i10_index],
      ].filter(([, value]) => value !== undefined && value !== null).forEach(([label, value]) => {
        const item = createEl("div", "signal-stat");
        item.append(createEl("span", "signal-value", Number(value).toLocaleString("th-TH")));
        item.append(createEl("span", "signal-label", label));
        openAlexStats.append(item);
      });
    }

    if (topicChips) {
      topicChips.replaceChildren();
      const topics = openAlex.topics?.length ? openAlex.topics : openAlex.concepts || [];
      topics.slice(0, 10).forEach((topic) => {
        const chip = createEl("span", null, `${topic.label || topic.display_name}${topic.count ? ` (${topic.count})` : ""}`);
        topicChips.append(chip);
      });
    }

    const hasContent = Boolean(
      (analysis.summary_bullets || []).length ||
      author.works_count ||
      (openAlex.topics || []).length ||
      (openAlex.concepts || []).length
    );
    section.hidden = !hasContent;
  }

  function filterOutputs() {
    const query = state.search.trim().toLowerCase();
    return state.outputs.filter((output) => {
      const matchesQuery = !query || outputSearchText(output).includes(query);
      const filter = state.activeFilter;
      const matchesFilter =
        filter === "all" ||
        output.output_type === filter ||
        output.class_level === filter ||
        output.formula_tier === filter;
      return matchesQuery && matchesFilter;
    });
  }

  function renderOutput(output) {
    const item = createEl("article", "publication-item");
    const title = createEl("h3");
    const titleLink = createEl("a", null, localText(output.title) || "Untitled publication");
    titleLink.href = output.profile_url || (output.bibliographic?.doi ? `https://doi.org/${output.bibliographic.doi}` : "#");
    if (titleLink.href.endsWith("#")) titleLink.removeAttribute("href");
    title.append(titleLink);

    const meta = createEl("div", "publication-meta");
    [
      yearOf(output) || "",
      normalizeType(output.output_type),
      output.class_level,
      output.formula_tier,
    ].filter(Boolean).forEach((value) => meta.append(createEl("span", null, value)));

    const source = createEl("p", "publication-source", localText(output.source_name));
    const authors = createEl("p", "publication-authors", authorsText(output.authors));
    const links = createEl("div", "publication-links");

    if (output.bibliographic?.doi) {
      const doi = createEl("a", null, `DOI: ${output.bibliographic.doi}`);
      doi.href = `https://doi.org/${output.bibliographic.doi}`;
      links.append(doi);
    }

    if (output.profile_url) {
      const profile = createEl("a", null, "KU Forest");
      profile.href = output.profile_url;
      links.append(profile);
    }

    item.append(meta, title);
    if (source.textContent) item.append(source);
    if (authors.textContent) item.append(authors);
    if (links.children.length) item.append(links);
    return item;
  }

  function renderOutputs() {
    const list = $("[data-publication-list]");
    const status = $("[data-output-status]");
    if (!list) return;

    const filtered = filterOutputs();
    const visible = filtered.slice(0, state.visibleCount);
    list.replaceChildren();

    if (status) {
      status.textContent = `แสดง ${visible.length.toLocaleString("th-TH")} จาก ${filtered.length.toLocaleString("th-TH")} รายการ`;
    }

    if (!filtered.length) {
      list.append(createEl("div", "empty-state", "ไม่พบผลงานที่ตรงกับเงื่อนไข"));
      return;
    }

    visible.forEach((output) => list.append(renderOutput(output)));

    if (visible.length < filtered.length) {
      const more = createEl("button", "button publication-more", "แสดงเพิ่มเติม");
      more.type = "button";
      more.addEventListener("click", () => {
        state.visibleCount += PAGE_SIZE;
        renderOutputs();
      });
      list.append(more);
    }
  }

  function renderProjects() {
    const list = $("[data-project-list]");
    if (!list) return;

    list.replaceChildren();
    state.projects.slice(0, 9).forEach((project) => {
      const card = createEl("article", "project-card");
      const year = createEl("div", "project-year", project.year || project.raw?.budgetYear || "");
      const title = createEl("h3", null, project.title_th || project.title_en || "Untitled project");
      const meta = createEl("p", null, [stripHtml(project.role), project.funding_agency].filter(Boolean).join(" · "));
      card.append(year, title);
      if (meta.textContent) card.append(meta);
      if (project.raw?.forestUrl) {
        const link = createEl("a", "project-link", "KU Forest");
        link.href = project.raw.forestUrl;
        card.append(link);
      }
      list.append(card);
    });

    if (!state.projects.length) {
      list.append(createEl("div", "empty-state", "ไม่พบข้อมูลโครงการวิจัย"));
    }
  }

  function bindControls() {
    const search = $("[data-publication-search]");
    if (search) {
      search.addEventListener("input", () => {
        state.search = search.value;
        state.visibleCount = PAGE_SIZE;
        renderOutputs();
      });
    }

    $$("[data-publication-filters] .filter-pill").forEach((button) => {
      button.addEventListener("click", () => {
        state.activeFilter = button.dataset.filter || "all";
        state.visibleCount = PAGE_SIZE;
        $$("[data-publication-filters] .filter-pill").forEach((node) => node.classList.toggle("is-active", node === button));
        renderOutputs();
      });
    });
  }

  async function init() {
    const apiUrl = getApiUrl();
    try {
      const response = await fetch(apiUrl, { headers: { "Accept": "application/json" } });
      if (!response.ok) throw new Error(`API returned ${response.status}`);
      const data = await response.json();
      state.outputs = (data.outputs?.data || []).slice().sort(compareOutputs);
      state.projects = (Array.isArray(data.projects) ? data.projects : data.projects?.data || []).slice().sort(compareProjects);

      renderProfile(data, apiUrl);
      renderStats(data.analysis);
      renderAnalysis(data.analysis);
      renderOutputs();
      renderProjects();
    } catch (error) {
      const message = "โหลดข้อมูลจาก KU Urban ไม่สำเร็จ";
      const panel = $(".profile-panel");
      const list = $("[data-publication-list]");
      const status = $("[data-output-status]");
      if (panel) panel.replaceChildren(createEl("div", "empty-state", message));
      if (list) list.replaceChildren(createEl("div", "empty-state", `${message}: ${error.message}`));
      if (status) status.textContent = "ไม่สามารถโหลดข้อมูลได้";
      $$("[data-api-link]").forEach((apiLink) => {
        apiLink.href = apiUrl;
      });
      console.error(error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      bindControls();
      init();
    });
  } else {
    bindControls();
    init();
  }
}());
