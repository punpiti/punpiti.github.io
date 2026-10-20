window.KU_SITE_ANALYTICS = { enabled: true, measurementId: "G-BWX7PFH4XM" };
(function () {
  var cfg = window.KU_SITE_ANALYTICS;
  if (!cfg || !cfg.enabled || !cfg.measurementId) return;
  var script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(cfg.measurementId);
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", cfg.measurementId);
})();
