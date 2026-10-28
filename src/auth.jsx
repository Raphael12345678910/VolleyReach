import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const AuthContext = createContext(null);
let client;
export function authRedirect(mode = "callback") {
  return `${location.origin}${import.meta.env.BASE_URL}?auth=${mode}`;
}

export function accountError(error) {
  const code = error?.code || "";
  if (code === "invalid_credentials") return "That email and password did not match. Try again or reset your password.";
  if (code === "email_not_confirmed") return "Check your inbox and confirm your email before signing in.";
  if (code === "weak_password") return "Use a longer password with a mix of letters, numbers, and symbols.";
  if (["over_email_send_rate_limit", "over_request_rate_limit"].includes(code) || error?.status === 429) return "Too many attempts. Please wait a few minutes before trying again.";
  if (code === "user_already_exists") return "Try signing in, or use the password reset option.";
  if (code === "same_password") return "Choose a different password from your current one.";
  if (code === "otp_expired" || code === "flow_state_expired" || code === "flow_state_not_found") return "This link has expired or was opened in a different browser. Request a new link and open it here.";
  return "We could not complete that request. Check your connection and try again. If it continues, contact the site owner.";
}

export function AuthProvider({ config, children }) {
  if (!client && config.supabaseUrl && config.supabasePublishableKey) {
    client = createClient(config.supabaseUrl, config.supabasePublishableKey, {
      auth: { flowType: "pkce", detectSessionInUrl: true, persistSession: true, autoRefreshToken: true, storageKey: "vr-auth" }
    });
  }
  const service = client || null;
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(Boolean(service));
  const [authIssue, setAuthIssue] = useState("");
  const [recovery, setRecovery] = useState(() => new URLSearchParams(location.search).get("auth") === "recovery");
  useEffect(() => {
    if (!service) return;
    let mounted = true;
    const { data: { subscription } } = service.auth.onAuthStateChange((event, next) => {
      if (!mounted) return;
      setSession(next);
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
      if (event === "SIGNED_OUT") setRecovery(false);
    });
    service.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      setSession(data.session);
      if (error) setAuthIssue(accountError(error));
      const url = new URL(location.href);
      const providerError = url.searchParams.has("error") || url.hash.includes("error=");
      if (providerError) setAuthIssue("Sign-in was cancelled or the link could not be verified. Please try again.");
      const returning = url.searchParams.has("auth") || url.searchParams.has("code");
      const invalidRecovery = url.searchParams.get("auth") === "recovery" && !data.session;
      if (invalidRecovery) { setRecovery(false); setAuthIssue("This password reset link could not be verified. Request another link and open it in this browser."); }
      if (!url.hash.startsWith("#/")) url.hash = "";
      if (providerError || error || (returning && !data.session)) url.hash = invalidRecovery ? "/forgot" : "/signin";
      for (const key of ["auth", "code", "error", "error_code", "error_description"]) url.searchParams.delete(key);
      history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
      window.dispatchEvent(new Event("vr-route-change"));
      setLoading(false);
    }).catch(() => { if (mounted) { setLoading(false); setAuthIssue("We could not check your account. Your local progress is still safe."); } });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, [service]);
  const value = useMemo(() => ({ client: service, session, user: session?.user || null, loading, recovery, finishRecovery: () => setRecovery(false), authIssue, clearIssue: () => setAuthIssue(""), config }), [service, session, loading, recovery, authIssue, config]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
