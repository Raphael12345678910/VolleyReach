export function normalizeConfig(value = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) value = {};
  const analyticsId = String(value.googleAnalyticsId || "").trim();
  const key = String(value.supabasePublishableKey || "").trim();
  let url = "";
  let publicKey = key.startsWith("sb_publishable_");
  if (!publicKey && key.split(".").length === 3) {
    try {
      const payload = JSON.parse(atob(key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      publicKey = payload.role === "anon";
    } catch { /* An invalid key must never activate accounts. */ }
  }
  try {
    const parsed = new URL(value.supabaseUrl);
    if (parsed.protocol === "https:" && !parsed.username && !parsed.password && !parsed.search && !parsed.hash && parsed.pathname === "/") url = parsed.origin;
  } catch { /* Keep the local workspace available without a service. */ }
  return {
    googleAnalyticsId: /^G-[A-Z0-9]{6,20}$/.test(analyticsId) ? analyticsId : "",
    supabaseUrl: url,
    supabasePublishableKey: publicKey ? key : "",
    googleSignIn: value.googleSignIn === true,
    appleSignIn: value.appleSignIn === true
  };
}

export async function loadConfig() {
  let runtime = {};
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}site-config.json`, { cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (response.ok) { const data = await response.json(); if (data && typeof data === "object" && !Array.isArray(data)) runtime = data; }
  } catch { /* Missing configuration must not prevent the app from opening. */ }
  return normalizeConfig({
    ...runtime,
    googleAnalyticsId: import.meta.env.VITE_GA_MEASUREMENT_ID || runtime.googleAnalyticsId,
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || runtime.supabaseUrl,
    supabasePublishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || runtime.supabasePublishableKey,
    googleSignIn: import.meta.env.VITE_AUTH_GOOGLE ? import.meta.env.VITE_AUTH_GOOGLE === "true" : runtime.googleSignIn,
    appleSignIn: import.meta.env.VITE_AUTH_APPLE ? import.meta.env.VITE_AUTH_APPLE === "true" : runtime.appleSignIn
  });
}
