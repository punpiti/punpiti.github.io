(function () {
  const PERSON_ID = "360009";
  const PROFILE_SLUG = "Punpiti_Piamsa_nga";
  const ANALYSIS_PATH = `/api/public/profile/${PERSON_ID}?sections=analysis`;
  const LOCAL_API = `http://127.0.0.1:8000${ANALYSIS_PATH}`;
  const DEPLOY_API = `https://urban.cpe.ku.ac.th${ANALYSIS_PATH}`;
  const MAX_TOPICS = 8;

  const container = document.querySelector("[data-home-topics]");
  if (!container) return;

  const lang = container.dataset.lang === "en" ? "en" : "th";

  function getApiUrl() {
    const override = new URLSearchParams(window.location.search).get("api");
    if (override) return override;

    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0") return LOCAL_API;
    if (host === "urban.cpe.ku.ac.th") return `${window.location.origin}${ANALYSIS_PATH}`;
    return DEPLOY_API;
  }

  function topicUrl() {
    return `https://urban.cpe.ku.ac.th/p/${PROFILE_SLUG}?lang=${lang}&mode=user_profile#research-output-themes`;
  }

  function chipFor(topic) {
    const label = topic.label || topic.display_name;
    if (!label) return null;
    const link = document.createElement("a");
    link.href = topicUrl();
    link.rel = "noopener";
    link.append(document.createTextNode(label));
    if (topic.count) {
      const count = document.createElement("span");
      count.className = "topic-chip-count";
      count.textContent = topic.count;
      link.append(count);
    }
    return link;
  }

  async function load() {
    const response = await fetch(getApiUrl(), { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Topic request failed (${response.status})`);
    const payload = await response.json();
    const openAlex = payload?.analysis?.openalex || {};
    const topics = openAlex.topics?.length ? openAlex.topics : openAlex.concepts || [];
    const chips = topics.slice(0, MAX_TOPICS).map(chipFor).filter(Boolean);
    if (!chips.length) return;
    container.replaceChildren(...chips);
  }

  // The markup already carries the last known topics, so a failed request
  // simply leaves that static list in place.
  load().catch(() => {});
})();
