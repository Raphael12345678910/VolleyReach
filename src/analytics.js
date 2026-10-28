const ROUTES = new Set(["landing", "home", "matches", "directory", "profile", "email", "outreach", "timeline", "jump", "signin", "signup", "forgot", "reset", "account", "privacy", "terms"]);
const EVENTS = new Set(["page_view", "ui_click", "navigation", "college_search", "view_coach_contacts", "coach_email_click", "school_saved", "email_copied", "copy_failed", "match_answer", "match_complete", "profile_saved", "profile_complete", "jump_clip_uploaded", "jump_result_saved", "login", "sign_up", "sign_up_requested", "auth_attempt", "auth_error", "password_reset_requested", "password_updated", "sign_out", "backup_downloaded", "backup_restored", "browser_progress_imported", "outreach_sent_logged", "outreach_sent_undone", "outreach_status_changed"]);
const PARAMS = new Set(["action", "route", "destination", "method", "school_id", "division", "region", "question", "field", "control", "part", "status", "result_count", "has_query", "complete", "page_location", "page_title", "page_referrer"]);
const CONTROL_ACTIONS = new Map([
  ["Find schools", "find_schools"], ["Find Schools", "find_schools"], ["Start matching", "find_schools"],
  ["View profile", "view_profile"], ["Complete profile", "complete_profile"], ["Open profile", "view_profile"], ["Complete my profile", "complete_profile"],
  ["Save profile", "save_profile"], ["Build an email", "build_email"], ["See email steps", "email_steps"], ["Create email", "create_email"],
  ["Open Jump Test", "open_jump_test"], ["Optional Jump Test", "open_jump_test"], ["Change filters", "change_match_filters"],
  ["Clear filters", "clear_filters"], ["Show more programs", "directory_show_more"], ["Previous", "quiz_previous"], ["Add event", "schedule_add"],
  ["Personal", "profile_personal"], ["Athletics", "profile_athletics"], ["Academics", "profile_academics"], ["Film & links", "profile_links"], ["Schedule", "profile_schedule"],
  ["Copy email", "copy_email"], ["Copy subject", "copy_subject"], ["Add school", "save_school"], ["Add to list", "save_school"],
  ["Add schools", "add_schools"], ["Email", "create_email"], ["Log sent", "outreach_log_sent"], ["Undo last sent log", "outreach_undo_sent"],
  ["Upload clip", "jump_upload"], ["Add as trial", "jump_add_trial"], ["Save to athletic profile", "jump_save"], ["Play", "jump_play"], ["Pause", "jump_pause"],
  ["Previous frame", "jump_previous_frame"], ["Next frame", "jump_next_frame"], ["Clear all markers", "jump_clear_markers"],
  ["Move marker left", "jump_marker_left"], ["Move marker right", "jump_marker_right"], ["Move marker up", "jump_marker_up"], ["Move marker down", "jump_marker_down"],
  ["Back up", "backup_download"], ["Restore", "backup_restore"], ["Restore backup", "backup_confirm_restore"], ["Remove event", "schedule_remove"],
  ["Search programs", "search_programs"], ["Division", "filter_division"], ["Region", "filter_region"], ["Video timeline", "jump_scrub"], ["Marker to fine-tune", "jump_fine_tune"],
  ["Open navigation", "open_navigation"], ["Close navigation", "close_navigation"], ["Retry cloud save", "retry_cloud_save"],
  ["Privacy", "privacy"], ["Terms", "terms"], ["Cookie settings", "cookie_settings"], ["Try again", "directory_retry"]
]);
const PROFILE_FIELDS = new Set(["name", "gradYear", "location", "athleteEmail", "phone", "position", "playerRole", "height", "vertical", "standingReach", "approachTouch", "gpaUW", "gpaWeighted", "satStatus", "satScore", "academicInterests", "club", "clubTeam", "clubRole", "highSchool", "schoolRole", "awards", "jersey", "universityProfile", "highlightVideo", "fullMatchVideo", "coachName", "coachEmail", "coachPhone"]);
let measurementId = "";
let installed = false;
let previousRoute = "";
let removeListeners = () => {};
export const CONSENT_KEY = "vr-analytics-consent";

export function analyticsRoute(hash = window.location.hash) {
  const candidate = hash.replace(/^#\/?/, "").split(/[?&]/)[0];
  return ROUTES.has(candidate) ? candidate : "landing";
}

export function privacySignal() {
  return navigator.globalPrivacyControl === true || navigator.doNotTrack === "1";
}

export function analyticsConsent() {
  if (privacySignal()) return "denied";
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : "unset";
  } catch { return "unset"; }
}

export function safeEventParams(input = {}) {
  return Object.fromEntries(Object.entries(input).filter(([key, value]) => {
    if (!PARAMS.has(key)) return false;
    if (typeof value === "boolean") return true;
    if (typeof value === "number") return Number.isFinite(value);
    if (typeof value !== "string") return false;
    if (key.startsWith("page_")) return true;
    return /^[a-zA-Z0-9_./-]{1,100}$/.test(value);
  }));
}

function mayTrack() {
  return Boolean(measurementId) && analyticsConsent() === "granted" && new URLSearchParams(location.search).get("demo") !== "1";
}

function tag(...args) { window.gtag?.(...args); }

function installTag() {
  if (installed || !mayTrack()) return;
  installed = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  tag("consent", "default", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
  tag("consent", "update", { analytics_storage: "granted" });
  tag("js", new Date());
  tag("config", measurementId, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    page_location: `${location.origin}${location.pathname}#/${analyticsRoute()}`,
    page_referrer: "",
    cookie_flags: "SameSite=Lax;Secure"
  });
  const script = document.createElement("script");
  script.id = "vr-google-analytics";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.append(script);
}

export function trackEvent(name, params = {}) {
  if (!EVENTS.has(name) || !mayTrack()) return false;
  installTag();
  const route = analyticsRoute();
  const payload = safeEventParams({ ...params, route });
  // Override, never forward query strings, OAuth codes, or arbitrary page titles.
  payload.page_location = `${location.origin}${location.pathname}#/${route}`;
  payload.page_title = `VolleyReach | ${route}`;
  payload.page_referrer = previousRoute ? `${location.origin}${location.pathname}#/${previousRoute}` : "";
  tag("event", name, payload);
  window.dispatchEvent(new CustomEvent("vr-analytics-event", { detail: { name, params: payload } }));
  return true;
}

export function trackPageView() {
  const route = analyticsRoute();
  if (trackEvent("page_view")) previousRoute = route;
}

export function setAnalyticsConsent(choice) {
  const next = choice === "granted" && !privacySignal() ? "granted" : "denied";
  try { localStorage.setItem(CONSENT_KEY, next); } catch { return false; }
  window[`ga-disable-${measurementId}`] = next !== "granted";
  if (next === "granted") {
    installTag();
    tag("consent", "update", { analytics_storage: "granted" });
    trackPageView();
  } else {
    tag("consent", "update", { analytics_storage: "denied" });
    for (const cookie of document.cookie.split(";")) {
      const name = cookie.split("=")[0].trim();
      if (!/^_ga(?:_|$)/.test(name)) continue;
      const domains = ["", location.hostname, `.${location.hostname}`];
      for (const domain of domains) document.cookie = `${name}=;Max-Age=0;path=/${domain ? `;domain=${domain}` : ""}`;
    }
  }
  window.dispatchEvent(new Event("vr-consent-change"));
  return true;
}

export function initializeAnalytics(config) {
  removeListeners();
  measurementId = config.googleAnalyticsId;
  const clicked = (event) => {
    const element = event.target.closest?.("button, a, select, input, textarea, [data-track]");
    if (!element || element.disabled || element.closest("[data-no-track]")) return;
    const field = PROFILE_FIELDS.has(element.id) ? element.id : /^schedule-(event|date|location|details)-\d+$/.test(element.id) ? `schedule_${element.id.split("-")[1]}` : undefined;
    const label = element.getAttribute("aria-label") || element.textContent?.trim();
    const action = element.dataset.track || element.closest("[data-track]")?.dataset.track || (field ? "profile_field" : CONTROL_ACTIONS.get(label) || "other");
    trackEvent("ui_click", { action, field, control: element.tagName.toLowerCase() });
  };
  const changed = (event) => { if (event.key === CONSENT_KEY) { window[`ga-disable-${measurementId}`] = !mayTrack(); window.dispatchEvent(new Event("vr-consent-change")); if (mayTrack()) { installTag(); tag("consent", "update", { analytics_storage: "granted" }); trackPageView(); } else tag("consent", "update", { analytics_storage: "denied" }); } };
  document.addEventListener("click", clicked, true);
  window.addEventListener("storage", changed);
  removeListeners = () => { document.removeEventListener("click", clicked, true); window.removeEventListener("storage", changed); };
  if (mayTrack()) installTag();
}
