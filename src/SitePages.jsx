import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, Eye, EyeOff, LockKeyhole, Mail, Menu, ShieldCheck, X } from "lucide-react";
import { accountError, authRedirect, useAuth } from "./auth";
import { analyticsConsent, privacySignal, setAnalyticsConsent, trackEvent } from "./analytics";
import { SiApple, SiGoogle } from "@icons-pack/react-simple-icons";

const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`;
export function go(route) { location.hash = `/${route}`; }

export function Brand({ light = false }) {
  return <a className="v-brand" href="#/landing" data-track="brand"><img src={asset(light ? "volleyreach-mark-light.svg" : "volleyreach-mark.svg")} alt="" /><span>VolleyReach</span></a>;
}

export function LandingPage() {
  const { user, client } = useAuth();
  const start = user || !client ? "#/home" : "#/signup";
  const [menu, setMenu] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const faqs = [
    ["Is VolleyReach really free?", "Yes. The recruiting workspace, school directory, email builder, outreach tracker and supporting Jump Test are free to use."],
    ["Will coaches find my profile here?", "Your workspace is private. VolleyReach helps you research programs and contact coaches yourself; it is not a public scouting network and does not promise recruiting offers."],
    ["Do I need an account?", client ? "You can explore and save in this browser without one. Create an account to save your profile, school list and outreach across devices. Your existing browser progress can be imported after signing in." : "You can use the entire recruiting workspace now. Progress saves in your browser, with a backup option in My Profile. Cross-device accounts are being connected."],
    ["How are the school matches chosen?", "Your competitive level, region and need for available coach emails filter the college directory. These are research starting points, not admissions odds, roster openings or evaluations of your playing ability."],
    ["What does the Jump Test measure?", "It estimates standing reach, highest touch and vertical from a carefully recorded video beside a net or basketball rim. It uses manual markers, cannot reconstruct 3D depth, and is not an official measurement."]
  ];
  return <div className="v-site">
    <header className="v-header"><Brand /><nav aria-label="Website navigation"><a href="#recruiting" onClick={(event) => { event.preventDefault(); document.getElementById("recruiting")?.scrollIntoView(); }} data-track="landing_tools">The recruiting toolkit</a><a href="#questions" onClick={(event) => { event.preventDefault(); document.getElementById("questions")?.scrollIntoView(); }} data-track="landing_faq">Questions</a></nav><div className="v-header-actions"><a className="v-login" href={user ? "#/account" : "#/signin"} data-track="sign_in">{user ? "My account" : "Log in"}</a><a className="v-button v-button-dark" href={start} data-track="get_started">{user ? "My workspace" : "Get started"}<ArrowUpRight size={17} /></a><button className="v-mobile-menu" aria-label={menu ? "Close website navigation" : "Open website navigation"} aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <X size={22} /> : <Menu size={22} />}</button></div></header>
    {menu ? <nav className="v-mobile-nav" aria-label="Mobile website navigation"><a href="#/home" data-track="open_workspace">Open workspace</a><a href="#/signin" data-track="sign_in">Log in</a><button onClick={() => { setMenu(false); document.getElementById("questions")?.scrollIntoView(); }}>Questions</button></nav> : null}
    <main id="landing-main">
      <section className="v-hero">
        <img className="v-hero-photo" src={asset("volleyreach-gym.jpg")} alt="A volleyball net on an indoor court" fetchPriority="high" />
        <div className="v-hero-shade" />
        <div className="v-hero-content"><span className="v-eyebrow"><i />For the next chapter of your game</span><h1>VolleyReach<span>College volleyball.<br />Within reach.</span></h1><p>Your game deserves a plan. Find programs, make the introduction, and keep your recruiting moving.</p><div className="v-hero-actions"><a className="v-button v-button-coral" href={start} data-track="hero_get_started">{user ? "Open my workspace" : "Start your recruiting journey"}<ArrowUpRight size={20} /></a><a className="v-hero-explore" href="#/directory" data-track="find_college">Explore colleges<ArrowRight size={17} /></a></div><small>Free to use. Built for men's volleyball.</small></div>
        <button className="v-hero-down" aria-label="Explore the recruiting toolkit" onClick={() => document.getElementById("recruiting")?.scrollIntoView()} data-track="landing_scroll"><ArrowDown size={20} /></button>
        <span className="v-hero-corner">YOUR NEXT CHAPTER / ON & OFF THE COURT</span>
      </section>
      <section className="v-facts" aria-label="The directory at a glance"><div><strong>293</strong><span>college programs<br />in the directory</span></div><div><strong>One</strong><span>profile for every<br />coach introduction</span></div><div><strong>$0</strong><span>to take the<br />next step</span></div><a href="#/directory" data-track="find_college">Find your starting point<ArrowUpRight size={21} /></a></section>
      <section className="v-toolkit" id="recruiting"><div className="v-section-head"><p className="v-eyebrow">THE RECRUITING TOOLKIT</p><h2>Less guesswork.<br />More next steps.</h2><p>You bring the ambition. Build a school list, tell your story, and follow through, all in one place.</p></div><div className="v-tool-rows">
        <a href="#/matches" className="v-tool-row" data-track="find_schools"><span>01</span><div><h3>Find your kind of program.</h3><p>Narrow real colleges by division, geography and available coach contacts. Save the ones worth a closer look.</p></div><ArrowUpRight size={26} /></a>
        <a href="#/profile" className="v-tool-row" data-track="build_profile"><span>02</span><div><h3>Put your whole game forward.</h3><p>Your academics, playing background, film and measurements. Complete the profile that powers your introduction.</p></div><ArrowUpRight size={26} /></a>
        <a href="#/email" className="v-tool-row" data-track="build_email"><span>03</span><div><h3>Make the first move.</h3><p>Turn your profile into a coach email. Add a genuine reason for that school, then track your outreach and follow-ups.</p></div><ArrowUpRight size={26} /></a>
      </div></section>
      <section className="v-directory-feature"><div><p className="v-eyebrow">REAL SCHOOLS. A CLEARER START.</p><h2>Your shortlist<br />starts with a search.</h2><p>Explore NCAA, NAIA and junior college pathways. Review the listed coaches and verify their details with each program before you reach out.</p><a href="#/directory" className="v-button v-button-dark" data-track="find_college">Find a college<ArrowUpRight size={18} /></a><small>Directory source imported August 29, 2026.<br />Program and contact details can change.</small></div><div className="v-program-sample"><div className="v-program-sample-head"><span>College Directory</span><span>293 programs</span></div>{[["MIT", "Massachusetts Institute of Technology", "Division III", "Massachusetts"], ["UCLA", "University of California, Los Angeles", "Division I", "California"], ["NYU", "New York University", "Division III", "New York"]].map(([short, school, division, state]) => <a key={short} href="#/directory" data-track="sample_program"><span className={`v-school-monogram v-school-${short.toLowerCase()}`}>{short}</span><span><strong>{school}</strong><small>{division} / {state}</small></span><ArrowUpRight size={18} /></a>)}<div className="v-program-sample-foot"><span>Examples from the directory</span><a href="#/directory" data-track="find_college">Explore all<ArrowRight size={15} /></a></div></div></section>
      <section className="v-faq" id="questions"><div><p className="v-eyebrow">A FEW THINGS TO KNOW</p><h2>Before the<br />first email.</h2></div><div>{faqs.map(([question, answer], index) => <div className="v-faq-item" key={question}><button aria-expanded={openFaq === index} aria-controls={`faq-${index}`} onClick={() => setOpenFaq(openFaq === index ? null : index)} data-track="faq_open">{question}<ChevronDown size={20} /></button><p id={`faq-${index}`} hidden={openFaq !== index}>{answer}</p></div>)}</div></section>
      <section className="v-final-cta"><p className="v-eyebrow">THE NEXT MOVE IS YOURS</p><h2>Your future team<br />is worth reaching for.</h2><a href="#/home" className="v-button v-button-coral" data-track="open_workspace">Open the free workspace<ArrowUpRight size={20} /></a><p>No promises of offers. Just a better way to put in the work.</p></section>
    </main><SiteFooter />
  </div>;
}

export function SiteFooter() {
  return <footer className="v-footer"><Brand /><span>Built for the next chapter.</span><div><a href="#/privacy">Privacy</a><a href="#/terms">Terms</a><button onClick={() => window.dispatchEvent(new Event("vr-open-privacy"))}>Cookie settings</button></div><small>© {new Date().getFullYear()} VolleyReach</small></footer>;
}

export function AuthPage({ mode = "signin" }) {
  const { client, user, config, recovery, finishRecovery, authIssue, clearIssue } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [agreed, setAgreed] = useState(false);
  const mounted = useRef(true);
  const signup = mode === "signup";
  const forgot = mode === "forgot";
  const reset = mode === "reset";
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const fail = (issue, method = "email") => { if (mounted.current) { setError(accountError(issue)); setBusy(false); trackEvent("auth_error", { method, action: mode }); } };
  const submit = async (event) => {
    event.preventDefault();
    if (busy || !client) return;
    clearIssue(); setError(""); setMessage("");
    if (signup && !agreed) { setError("Please confirm you are at least 13 and accept the terms and privacy notice."); return; }
    if (reset && (!user || !recovery)) { setError("Open the password reset link from your email in this browser first."); return; }
    if ((signup || reset) && password !== confirmation) { setError("The passwords do not match."); return; }
    setBusy(true);
    trackEvent("auth_attempt", { method: "email", action: mode });
    try {
      if (signup) {
        const { data, error: issue } = await client.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: authRedirect(), data: { terms_version: "2026-10-28", age_13_or_over: true } } });
        if (issue) throw issue;
        trackEvent(data.session ? "sign_up" : "sign_up_requested", { method: "email" });
        if (data.session) go("home");
        else if (mounted.current) { setPassword(""); setConfirmation(""); setMessage("Check your email for a confirmation link. Open it in this browser, then sign in. If you already have an account, use Log in."); }
      } else if (forgot) {
        const { error: issue } = await client.auth.resetPasswordForEmail(email.trim(), { redirectTo: authRedirect("recovery") });
        if (issue) throw issue;
        trackEvent("password_reset_requested", { method: "email" });
        if (mounted.current) setMessage("If an account uses that email, you will receive a reset link. Open it in this browser to choose a new password.");
      } else if (reset) {
        const { error: issue } = await client.auth.updateUser({ password });
        if (issue) throw issue;
        trackEvent("password_updated", { method: "email" });
        finishRecovery(); go("home");
      } else {
        const { error: issue } = await client.auth.signInWithPassword({ email: email.trim(), password });
        if (issue) throw issue;
        trackEvent("login", { method: "email" }); go("home");
      }
      if (mounted.current) setBusy(false);
    } catch (issue) { fail(issue); }
  };
  const oauth = async (provider) => {
    if (!client || busy) return;
    if (signup && !agreed) { setError("Please confirm you are at least 13 and accept the terms and privacy notice below."); return; }
    setBusy(true); setError(""); clearIssue();
    trackEvent("auth_attempt", { method: provider, action: mode });
    try {
      const { error: issue } = await client.auth.signInWithOAuth({ provider, options: { redirectTo: authRedirect(), scopes: provider === "google" ? "openid email profile" : "name email" } });
      if (issue) throw issue;
    } catch (issue) { fail(issue, provider); }
  };
  return <div className="v-auth-page"><header className="v-header"><Brand /><a href="#/landing" className="v-back"><ArrowLeft size={17} />Back to VolleyReach</a></header><main className="v-auth-layout"><div className="v-auth-image"><img src={asset("volleyreach-gym.jpg")} alt="An indoor volleyball court" /><div><span className="v-eyebrow">YOUR GAME. YOUR NEXT CHAPTER.</span><h2>A little more direction.<br />A lot more possibility.</h2></div></div><div className="v-auth-content"><span className="v-auth-symbol"><LockKeyhole size={24} /></span><p className="v-eyebrow">VOLLEYREACH</p><h1>{signup ? "Your next chapter starts here." : forgot ? "Reset your password." : reset ? "Choose a new password." : "Good to have you back."}</h1><p>{signup ? "Keep your profile, school list and outreach together, wherever you log in." : forgot ? "We will email you a secure link to get back in." : reset ? "Use a unique password you do not use on other sites." : "Pick up your recruiting where you left off."}</p>
      {!client ? <div className="v-auth-notice" role="status"><ShieldCheck size={20} /><span><strong>Accounts are being connected.</strong>You can still use the full workspace. Progress saves on this browser; My Profile has a backup option.</span></div> : null}
      {!forgot && !reset ? <><div className="v-social-buttons"><button type="button" disabled={busy || !client || !config.googleSignIn} onClick={() => oauth("google")} data-track="google_sign_in"><SiGoogle color="#4285F4" aria-hidden="true" />Continue with Google{!config.googleSignIn ? <small>Not connected yet</small> : null}</button><button type="button" disabled={busy || !client || !config.appleSignIn} onClick={() => oauth("apple")} data-track="apple_sign_in"><SiApple aria-hidden="true" />Continue with Apple{!config.appleSignIn ? <small>Not connected yet</small> : null}</button></div><div className="v-auth-divider"><span>or continue with email</span></div></> : null}
      {(error || authIssue) ? <p className="v-auth-error" role="alert">{error || authIssue}</p> : null}{message ? <p className="v-auth-success" role="status"><Check size={18} />{message}</p> : null}
      <form onSubmit={submit} className="v-auth-form" data-no-track>
        {!reset ? <label htmlFor="account-email">Email address<div><Mail size={17} /><input id="account-email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required maxLength={254} disabled={!client || busy} /></div></label> : null}
        {!forgot ? <><label htmlFor="account-password">{reset ? "New password" : "Password"}<div><input id="account-password" name="password" type={showPassword ? "text" : "password"} autoComplete={signup || reset ? "new-password" : "current-password"} minLength={signup || reset ? 12 : 1} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder={signup || reset ? "At least 12 characters" : "Enter your password"} disabled={!client || busy} /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>{signup || reset ? <label htmlFor="account-password-confirm">Confirm password<div><input id="account-password-confirm" name="password-confirm" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={12} maxLength={128} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Re-enter your password" disabled={!client || busy} /></div></label> : <a className="v-forgot" href="#/forgot">Forgot password?</a>}</> : null}
        {signup ? <label className="v-terms-checkbox"><input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} required disabled={!client || busy} /><span>I am at least 13 and agree to the <a href="#/terms" target="_blank" rel="noreferrer">Terms</a> and <a href="#/privacy" target="_blank" rel="noreferrer">Privacy notice</a>.</span></label> : null}
        <button className="v-button v-button-dark" type="submit" disabled={!client || busy || (reset && (!user || !recovery))}>{busy ? "Please wait..." : signup ? "Create account" : forgot ? "Send reset link" : reset ? "Save new password" : "Log in"}<ArrowRight size={18} /></button>
      </form>
      <p className="v-auth-switch">{signup ? <>Already have an account? <a href="#/signin">Log in</a></> : forgot || reset ? <a href="#/signin">Back to log in</a> : <>New to VolleyReach? <a href="#/signup">Create an account</a></>}</p><a href="#/home" className="v-guest-link" data-track="continue_guest">Continue without an account<ArrowRight size={15} /></a>
      {!signup && !forgot && !reset ? <p className="v-auth-terms">By continuing, you confirm you are at least 13 and agree to the <a href="#/terms" target="_blank" rel="noreferrer">Terms</a> and <a href="#/privacy" target="_blank" rel="noreferrer">Privacy notice</a>.</p> : null}
    </div></main></div>;
}

export function CookiePreferences({ config }) {
  const [choice, setChoice] = useState(analyticsConsent);
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const update = () => setChoice(analyticsConsent());
    const show = () => setOpen(true);
    window.addEventListener("vr-consent-change", update);
    window.addEventListener("vr-open-privacy", show);
    return () => { window.removeEventListener("vr-consent-change", update); window.removeEventListener("vr-open-privacy", show); };
  }, []);
  const choose = (value) => { if (!setAnalyticsConsent(value)) { setFailed(true); return; } setChoice(analyticsConsent()); setOpen(false); };
  if (!open && (!config.googleAnalyticsId || choice !== "unset")) return null;
  return <aside className="v-cookie-banner" aria-label="Analytics preferences" data-no-track><div><ShieldCheck size={21} /><span><strong>Help make VolleyReach better?</strong><p>Optional Google Analytics counts visits and actions, such as finding schools or copying an email. We do not send your profile, email text or sign-in details. You can change this choice anytime in Cookie settings.</p>{privacySignal() ? <small>Your browser privacy preference is respected. Analytics stays off.</small> : !config.googleAnalyticsId ? <small>Analytics is not connected yet. Your preference will still be saved.</small> : null}{failed ? <small role="alert">Your browser blocked saving this preference. Analytics remains off.</small> : null}</span></div><div><button onClick={() => choose("denied")}>No thanks</button><button onClick={() => choose("granted")} disabled={privacySignal()}>Allow analytics</button>{open ? <button className="v-cookie-close" aria-label="Close cookie settings" onClick={() => setOpen(false)}><X size={18} /></button> : null}</div></aside>;
}

export function PolicyPage({ terms = false }) {
  const { client, config } = useAuth();
  return <div className="v-site"><header className="v-header"><Brand /><a href="#/home" className="v-back">Open workspace<ArrowUpRight size={17} /></a></header><main className="v-policy"><p className="v-eyebrow">VOLLEYREACH / UPDATED OCTOBER 28, 2026</p><h1>{terms ? "Terms of use" : "Privacy notice"}</h1>{terms ? <><h2>A tool for your own recruiting work</h2><p>VolleyReach is a free educational recruiting organizer, intended for athletes age 13 and older. It does not guarantee admission, a roster spot, a scholarship or coach interest. School filters are not predictions of athletic or academic fit.</p><h2>Your responsibility</h2><p>Keep your information accurate, verify contacts on official school websites, and send respectful, individual outreach. Do not use the directory for spam, impersonation or bulk harvesting. You send emails from your own account.</p><h2>Measurements and availability</h2><p>Jump Test results are video-based estimates, not official athletic measurements or medical advice. Camera position and manual markers affect the result. The service may change or be interrupted. Download a backup of important progress.</p><h2>Your account</h2><p>Keep your password private and use an email you control. Do not upload other people's private information without permission. Signing out does not erase browser backups. The site owner can suspend misuse.</p></> : <><h2>Your workspace</h2><p>Without an account, your profile, school list, quiz answers, school research notes and outreach history are saved in this browser. Other visitors do not receive your progress when you share a link. My Profile lets you download a private backup.</p><h2>Accounts and cloud saving</h2><p>{client ? "Accounts are connected through Supabase. When signed in, your workspace is stored with your account so you can access it on other devices. Browser-only progress is not automatically added to an account; you choose whether to import it." : "Accounts are not yet connected. No athlete workspace is currently uploaded to a cloud account. Once connected, Supabase will handle sign-in and private account workspace storage."} Supabase handles passwords and sign-in tokens; passwords are never sent to Google Analytics. Google and Apple sign-in, when enabled, share the basic identity information needed to sign in, not access to your mailbox.</p><h2>Optional usage analytics</h2><p>{config.googleAnalyticsId ? "Google Analytics is configured, but loads only after you allow it." : "Google Analytics is not connected yet. When enabled, it will load only after you allow it."} Events count page visits and interactions, such as viewing coach contacts, saving a school and copying an email. Events may include the program identifier, the section visited, button action and result count. They do not include your name, email address, passwords, grades, measurements, search text, school notes or generated email text. There is no session recording or keystroke tracking. Google Analytics may use cookies and technical information about the browser after consent. Advertising signals are disabled.</p><h2>Your choices</h2><p>Declining analytics does not limit the app. Use Cookie settings to change your choice. Browser Do Not Track and Global Privacy Control signals keep analytics off. Ad blockers and declined consent mean usage counts will be incomplete.</p><h2>Video, contacts and backups</h2><p>Jump clips stay in the current browser tab; they are not uploaded by VolleyReach. Only measurements explicitly saved to the profile are included in progress. Public coach contact data may be out of date. Backups include athlete and coach contact information and should not be shared publicly.</p><h2>Access and deletion</h2><p>Clear this site's browser data to remove browser-only progress. When accounts are enabled, My account includes an option to delete the cloud workspace; this does not delete local copies or the sign-in account. For account deletion or questions, contact the VolleyReach project owner through the team or school that shared the app. Users under 13 should not create an account or enter personal details.</p></>}<div className="v-policy-actions"><a href={terms ? "#/privacy" : "#/terms"}>{terms ? "Privacy notice" : "Terms of use"}</a><button onClick={() => window.dispatchEvent(new Event("vr-open-privacy"))}>Cookie settings</button></div></main><SiteFooter /></div>;
}
