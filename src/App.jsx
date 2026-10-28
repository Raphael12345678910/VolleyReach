import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useAuth } from "./auth";
import { AuthPage, CookiePreferences, LandingPage, PolicyPage, go } from "./SitePages";
import { analyticsRoute, trackEvent, trackPageView } from "./analytics";
import "./site.css";
const RecruitApp = lazy(() => import("./RecruitApp"));

export default function App({ config }) {
  const auth = useAuth();
  const [route, setRoute] = useState(() => analyticsRoute());
  const callback = useRef(new URLSearchParams(location.search).has("auth") || new URLSearchParams(location.search).has("code"));
  useEffect(() => {
    const update = () => setRoute(analyticsRoute());
    window.addEventListener("hashchange", update);
    window.addEventListener("popstate", update);
    window.addEventListener("vr-route-change", update);
    update();
    return () => { window.removeEventListener("hashchange", update); window.removeEventListener("popstate", update); window.removeEventListener("vr-route-change", update); };
  }, []);
  const previousView = useRef("");
  useEffect(() => {
    const renderedRoute = auth.recovery ? "reset" : route;
    document.title = renderedRoute === "landing" ? "VolleyReach | College volleyball, within reach" : `VolleyReach | ${renderedRoute === "signin" ? "Log in" : renderedRoute[0].toUpperCase() + renderedRoute.slice(1)}`;
    if (auth.loading || previousView.current === renderedRoute) return;
    previousView.current = renderedRoute;
    trackPageView();
  }, [route, auth.recovery, auth.loading]);
  useEffect(() => {
    if (auth.loading) return;
    if (auth.recovery) { if (route !== "reset") go("reset"); return; }
    if (auth.user && (["signin", "signup"].includes(route) || callback.current)) {
      if (callback.current) trackEvent("login", { method: ["google", "apple"].includes(auth.user.app_metadata?.provider) ? auth.user.app_metadata.provider : "email_confirmation" });
      callback.current = false; go("home");
    }
  }, [auth.loading, auth.user, auth.recovery, route]);
  let page;
  if (auth.loading) page = <div className="v-loading" role="status">Opening your workspace...</div>;
  else if (auth.recovery || ["signin", "signup", "forgot", "reset"].includes(route) || (route === "account" && !auth.user)) page = <AuthPage key={auth.recovery ? "reset" : route} mode={auth.recovery ? "reset" : route === "account" ? "signin" : route} />;
  else if (route === "landing") page = <LandingPage />;
  else if (route === "privacy" || route === "terms") page = <PolicyPage terms={route === "terms"} />;
  else page = <Suspense fallback={<div className="v-loading" role="status">Opening the recruiting workspace...</div>}><RecruitApp key={auth.user?.id || "guest"} /></Suspense>;
  return <>{page}<CookiePreferences config={config} /></>;
}
