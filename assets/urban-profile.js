(function () {
  const PERSON_ID = "360009";
  const LOCAL_TOKEN = "kDImkQRP4D7J3KMHN-wmILyddTdY9qTcMkR22_OUNpM";
  const DEPLOY_TOKEN = "MMRFi88rFP2hJHrDSngacUQzegAQ8pgsTvGc8RWdjsk";
  const LOCAL_API = `http://127.0.0.1:8000/api/profile-claims/stream/${PERSON_ID}?token=${LOCAL_TOKEN}`;
  const DEPLOY_API = `https://urban.cpe.ku.ac.th/api/profile-claims/stream/${PERSON_ID}?token=${DEPLOY_TOKEN}`;
  const MANUAL_ADMIN_TIMELINE = [
    "พ.ย. 2567 - ก.ค. 2569 กรรมการสภามหาวิทยาลัยเกษตรศาสตร์ ประเภทคณาจารย์ประจำ",
  ];

  const $ = (selector, root = document) => root.querySelector(selector);

  function getApiUrl() {
    const params = new URLSearchParams(window.location.search);
    const override = params.get("api");
    if (override === "local") return LOCAL_API;
    if (override) return override;

    const host = window.location.hostname;
    if (host === "urban.cpe.ku.ac.th") return `${window.location.origin}/api/profile-claims/stream/${PERSON_ID}?token=${DEPLOY_TOKEN}`;
    return DEPLOY_API;
  }

  function localText(value) {
    if (!value) return "";
    if (typeof value === "string" || typeof value === "number") return String(value);
    return value.th || value.en || "";
  }

  function createEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined && text !== null) el.textContent = text;
    return el;
  }

  function courseName(summary) {
    return String(summary || "").replace(/\s*\(.+\)\s*$/, "").trim();
  }

  function courseMeta(summary) {
    const text = String(summary || "");
    const count = text.match(/สอน\s*(\d+)\s*ครั้ง/);
    const latest = text.match(/ล่าสุด\s*(\d{4})/);
    return [
      count ? `สอนมาแล้ว ${Number(count[1]).toLocaleString("th-TH")} ครั้ง` : "",
      latest ? `ล่าสุด ${latest[1]}` : "",
    ].filter(Boolean).join(" · ");
  }

  function yearsFromTeachingSummary(classes) {
    return classes
      .map(localText)
      .map((item) => item.match(/ล่าสุด\s*(\d{4})/))
      .filter(Boolean)
      .map((match) => Number(match[1]))
      .filter(Boolean);
  }

  function renderList(target, values, emptyText) {
    if (!target) return;
    target.replaceChildren();
    const items = (values || []).map(localText).filter(Boolean);
    if (!items.length) {
      target.append(createEl("li", null, emptyText));
      return;
    }
    items.forEach((item) => target.append(createEl("li", null, item)));
  }

  function renderInsight(target, markdown) {
    if (!target) return;
    target.replaceChildren();
    const text = String(markdown || "").trim();
    if (!text) {
      target.append(createEl("p", null, "ยังไม่มีข้อมูล Personal Insights จาก Urban profile"));
      return;
    }

    let list = null;
    text.split(/\n+/).forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line) {
        list = null;
        return;
      }

      const heading = line.match(/^\*\*(.+)\*\*$/);
      if (heading) {
        list = null;
        target.append(createEl("h3", null, heading[1]));
        return;
      }

      const bullet = line.match(/^[–-]{1,2}\s*(.+)$/);
      if (bullet) {
        if (!list) {
          list = createEl("ul");
          target.append(list);
        }
        list.append(createEl("li", null, bullet[1]));
        return;
      }

      list = null;
      target.append(createEl("p", null, line.replace(/\*\*/g, "")));
    });
  }

  function parseThaiTimelineItem(value) {
    const text = localText(value);
    const match = text.match(/^(.+?\d{4})\s+-\s+((?:ปัจจุบัน|Present day)|.+?\d{4})\s+(.+)$/i);
    if (!match) return { text, title: text, startLabel: "", endLabel: "", startSort: 0, endSort: 0 };

    const [, startLabel, endLabel, title] = match;
    return {
      text,
      title: title.trim(),
      startLabel: startLabel.trim(),
      endLabel: endLabel.trim(),
      startSort: thaiDateSortValue(startLabel, false),
      endSort: thaiDateSortValue(endLabel, true),
    };
  }

  function thaiDateSortValue(label, isEnd) {
    const clean = String(label || "").trim();
    if (/ปัจจุบัน|present/i.test(clean)) return 999999;

    const yearMatch = clean.match(/(\d{4})/);
    const year = yearMatch ? Number(yearMatch[1]) : 0;
    const monthMap = {
      "ม.ค.": 1, "ก.พ.": 2, "มี.ค.": 3, "เม.ย.": 4, "พ.ค.": 5, "มิ.ย.": 6,
      "ก.ค.": 7, "ส.ค.": 8, "ก.ย.": 9, "ต.ค.": 10, "พ.ย.": 11, "ธ.ค.": 12,
      "Jan.": 1, "Feb.": 2, "Mar.": 3, "Apr.": 4, "May.": 5, "Jun.": 6,
      "Jul.": 7, "Aug.": 8, "Sep.": 9, "Oct.": 10, "Nov.": 11, "Dec.": 12,
    };
    const monthKey = Object.keys(monthMap).find((key) => clean.includes(key));
    const month = monthKey ? monthMap[monthKey] : (isEnd ? 12 : 1);
    return year * 100 + month;
  }

  function mergeTimelineItems(values) {
    const grouped = new Map();
    (values || []).map(parseThaiTimelineItem).filter((item) => item.text && !shouldHideAdminTimelineItem(item)).forEach((item) => {
      const existing = grouped.get(item.title);
      if (!existing) {
        grouped.set(item.title, item);
        return;
      }

      if (item.startSort && (!existing.startSort || item.startSort < existing.startSort)) {
        existing.startSort = item.startSort;
        existing.startLabel = item.startLabel;
      }
      if (item.endSort && item.endSort > existing.endSort) {
        existing.endSort = item.endSort;
        existing.endLabel = item.endLabel;
      }
    });

    return Array.from(grouped.values())
      .sort((a, b) => b.endSort - a.endSort || b.startSort - a.startSort)
      .map((item) => item.startLabel && item.endLabel ? `${item.startLabel} - ${item.endLabel} ${item.title}` : item.text);
  }

  function shouldHideAdminTimelineItem(item) {
    return item.title.includes("รองผู้อำนวยการฝ่ายสารสนเทศงานวิจัย (รักษาการแทน)") &&
      item.startLabel.includes("ก.ค. 2561") &&
      /ปัจจุบัน|present/i.test(item.endLabel);
  }

  function renderProfile(data, apiUrl) {
    const profile = data.profile?.data || data.person?.data || {};
    const analysisProfile = data.analysis?.profile || {};
    const card = $("[data-urban-profile-card]");
    const interests = $("[data-profile-interests]");
    const links = $("[data-profile-links]");

    if (card) {
      card.replaceChildren();
      if (profile.image_url) {
        const image = createEl("img", "profile-photo");
        image.src = profile.image_url;
        image.alt = localText(profile.name) || "Profile photo";
        card.append(image);
      }

      const body = createEl("div", "profile-body");
      const name = `${localText(profile.academic_rank) || analysisProfile.academic_rank || ""} ${localText(profile.name) || analysisProfile.name || ""}`.trim();
      body.append(createEl("div", "profile-name", name || "Profile"));
      body.append(createEl("div", "profile-affiliation", [localText(profile.department), localText(profile.faculty), localText(profile.campus)].filter(Boolean).join(" · ") || analysisProfile.affiliation || ""));

      const contact = createEl("div", "profile-contact");
      if (profile.email) {
        const mail = createEl("a", null, profile.email);
        mail.href = `mailto:${profile.email}`;
        contact.append(mail);
      }
      if (profile.telephone) contact.append(createEl("span", null, profile.telephone));
      body.append(contact);
      card.append(body);
    }

    if (interests) {
      interests.replaceChildren();
      const values = (profile.interests || analysisProfile.interests || []).map(localText).filter(Boolean);
      if (!values.length) interests.append(createEl("span", null, "ไม่มีข้อมูล"));
      values.forEach((item) => interests.append(createEl("span", null, item)));
    }

    renderList($("[data-profile-admin-timeline]"), mergeTimelineItems(MANUAL_ADMIN_TIMELINE.concat(profile.administration_timeline || [])), "ไม่มีข้อมูลประวัติงานบริหาร");
    renderList($("[data-profile-education]"), profile.education_summary, "ไม่มีข้อมูลการศึกษา");
    renderInsight($("[data-profile-insight]"), data.public_profile_context?.public_insight || data.analysis?.owner_context?.public_insight);

    if (links) {
      links.replaceChildren();
      [
        ["KU Urban API", apiUrl],
        ["KU Forest", profile.profile_url],
        ["OpenAlex", data.analysis?.openalex?.author?.id],
        ["ORCID", data.analysis?.openalex?.author?.orcid],
      ].filter(([, href]) => href).forEach(([label, href]) => {
        const link = createEl("a", null, label);
        link.href = href;
        links.append(link);
      });
    }

    const urbanLink = $("[data-urban-profile-link]");
    const forestLink = $("[data-urban-forest-link]");
    if (urbanLink) urbanLink.href = apiUrl;
    if (forestLink && profile.profile_url) forestLink.href = profile.profile_url;
  }

  function renderClasses(data) {
    const profile = data.profile?.data || data.person?.data || {};
    const classes = profile.teaching_summary || [];
    const list = $("[data-classes-list]");
    const status = $("[data-classes-status]");
    const title = $("[data-classes-title]");
    if (!list) return;

    list.replaceChildren();
    const years = yearsFromTeachingSummary(classes);
    if (title && years.length) {
      title.textContent = `รายวิชาที่เคยสอน ระหว่าง ${Math.min(...years)}-${Math.max(...years)}`;
    }
    if (status) status.textContent = `พบ ${classes.length.toLocaleString("th-TH")} รายการ`;

    if (!classes.length) {
      list.append(createEl("div", "empty-state", "ไม่พบข้อมูลคลาสจาก Urban API"));
      return;
    }

    classes.map(localText).filter(Boolean).forEach((summary) => {
      const item = courseName(summary);
      const meta = courseMeta(summary);
      if (!item) return;
      const card = createEl("article", "class-item");
      card.append(createEl("p", null, item));
      if (meta) card.append(createEl("div", "class-meta", meta));
      list.append(card);
    });
  }

  async function init() {
    const apiUrl = getApiUrl();
    try {
      const response = await fetch(apiUrl, { headers: { "Accept": "application/json" } });
      if (!response.ok) throw new Error(`API returned ${response.status}`);
      const data = await response.json();

      if ($("[data-urban-profile-page]")) renderProfile(data, apiUrl);
      if ($("[data-urban-classes-page]")) renderClasses(data);
    } catch (error) {
      const profileCard = $("[data-urban-profile-card]");
      const classesList = $("[data-classes-list]");
      const status = $("[data-classes-status]");
      if (profileCard) profileCard.replaceChildren(createEl("div", "empty-state", `โหลดข้อมูล profile ไม่สำเร็จ: ${error.message}`));
      if (classesList) classesList.replaceChildren(createEl("div", "empty-state", `โหลดข้อมูลคลาสไม่สำเร็จ: ${error.message}`));
      if (status) status.textContent = "ไม่สามารถโหลดข้อมูลได้";
      console.error(error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}());
