import { useEffect, useRef, useState } from "react";
import { ArrowRight, Download, LogOut, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";
import { useAuth, accountError, authRedirect } from "./auth";
import { trackEvent } from "./analytics";
import { go } from "./SitePages";
import { normalizeWorkspace } from "./workspaceSync";
import { normalizeOutreach, normalizeStoredValue } from "./storage";

export function workspaceKeys(userId, demo = false) {
  if (demo) return { profile: "vr-demo-profile", saved: "vr-demo-outreach", selectedSchoolId: "vr-demo-selected-school", answers: "vr-demo-match-answers", notes: "vr-demo-school-notes" };
  if (userId) return Object.fromEntries(["profile", "saved", "selectedSchoolId", "answers", "notes"].map((key) => [key, `vr-account-${userId}-${key === "saved" ? "outreach" : key}`]));
  return { profile: "vr3-profile", saved: "vr2-outreach", selectedSchoolId: "vr2-selected-school", answers: "vr2-match-answers", notes: "vr2-school-notes" };
}

function browserProgress(defaults) {
  try {
    const data = Object.fromEntries(Object.entries(workspaceKeys()).map(([key, storageKey]) => {
      let value;
      try { value = JSON.parse(localStorage.getItem(storageKey)); } catch { /* One damaged category must not hide the rest of the profile. */ }
      return [key, key === "saved" ? normalizeOutreach(value) : normalizeStoredValue(value, defaults[key])];
    }));
    const progress = normalizeWorkspace(data, defaults);
    return progress.profile.name || progress.saved.length || Object.keys(progress.notes).length ? progress : null;
  } catch { return null; }
}

export default function AccountPage({ sync, defaults, apply, backup, saveProgress }) {
  const { client, user } = useAuth();
  const [browserCopy, setBrowserCopy] = useState(() => browserProgress(defaults));
  const originalDefaults = useRef(defaults);
  useEffect(() => {
    const refresh = () => setBrowserCopy(browserProgress(originalDefaults.current));
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("vr-storage-status", refresh);
    refresh();
    return () => { window.removeEventListener("focus", refresh); window.removeEventListener("storage", refresh); window.removeEventListener("vr-storage-status", refresh); };
  }, []);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteWord, setDeleteWord] = useState("");
  const signOut = async () => {
    if (busy) return;
    setBusy(true); setMessage("");
    saveProgress();
    if (!(await sync.flush())) { setMessage("Cloud saving has not finished. Retry saving or download a backup before signing out."); setBusy(false); return; }
    const { error } = await client.auth.signOut({ scope: "local" });
    if (error) { setMessage(accountError(error)); setBusy(false); return; }
    trackEvent("sign_out"); go("landing");
  };
  const reset = async () => {
    setBusy(true); setMessage("");
    try {
      const { error } = await client.auth.resetPasswordForEmail(user.email, { redirectTo: authRedirect("recovery") });
      if (error) throw error;
      setMessage("Password reset requested. Check your email and open the link in this browser.");
      trackEvent("password_reset_requested", { method: "email" });
    } catch (error) { setMessage(accountError(error)); }
    setBusy(false);
  };
  const erase = async () => {
    if (deleteWord !== "DELETE" || busy) return;
    setBusy(true); setMessage("");
    const deleted = await sync.erase();
    if (deleted) { setConfirmDelete(false); setDeleteWord(""); setMessage("The cloud workspace and its local account copy were cleared. Your sign-in account still exists; browser-only progress and downloaded backups are unchanged."); }
    else setMessage("The workspace could not be deleted. Retry syncing first. Your progress has not been cleared.");
    setBusy(false);
  };
  return <div className="r-page"><div className="r-page-header"><div><p className="r-eyebrow">My account</p><h1>Your recruiting, wherever you are.</h1><p>Your account workspace is separate from browser-only and demo progress.</p></div></div><section className="r-account-section"><h2>Signed in</h2><p>{user.email}</p><p>Cloud status: <strong>{sync.status === "saved" ? "Saved to your account" : sync.status === "saving" ? "Saving changes..." : "Needs attention. A browser copy is kept on this device."}</strong></p><div><button className="r-button r-button-secondary" disabled={busy} onClick={signOut} data-track="sign_out"><LogOut size={16} />Sign out</button><button className="r-button r-button-secondary" disabled={busy} onClick={reset} data-track="reset_password">Reset password</button><button className="r-button r-button-secondary" onClick={backup} data-track="backup_download"><Download size={16} />Back up progress</button><button className="r-button r-button-secondary" onClick={sync.flush} disabled={busy || sync.status === "saving"} data-track="sync_retry"><RefreshCw size={16} />Sync now</button></div></section>
    {browserCopy && !imported ? <section className="r-account-section"><h2>Bring your browser progress with you</h2><p>A separate browser-only workspace exists{browserCopy.profile.name ? ` for ${browserCopy.profile.name}` : ""}. Import it only if it is yours. It will replace the profile, school list and outreach currently saved to this account.</p>{importing ? <div><button className="r-button" onClick={() => { apply(browserCopy); setImporting(false); setImported(true); trackEvent("browser_progress_imported"); }}>Yes, replace my account progress</button><button className="r-button r-button-secondary" onClick={() => setImporting(false)}>Cancel</button></div> : <button className="r-button r-button-secondary" onClick={() => setImporting(true)} data-track="import_browser_progress">Review import<ArrowRight size={16} /></button>}</section> : null}
    <section className="r-account-section"><h2>Your data stays yours</h2><p>Download a backup before clearing data or changing devices while offline. Clips are not uploaded. Account copies are kept on this device for interrupted saves, so use a personal device for private information.</p><div><a href="#/privacy" className="r-text-link"><ShieldCheck size={16} />Privacy notice</a></div></section><section className="r-account-section"><h2>Delete saved workspace</h2><p>This removes your cloud workspace and this account's local progress on this device. It does not delete your sign-in account, browser-only profile, other device caches or downloaded backups. Your account will start blank the next time it loads from the cloud.</p>{confirmDelete ? <div><label>Type DELETE to confirm <input aria-label="Confirm workspace deletion" value={deleteWord} onChange={(event) => setDeleteWord(event.target.value)} autoComplete="off" /></label><button className="r-button" disabled={deleteWord !== "DELETE" || busy} onClick={erase}>Delete my workspace</button><button className="r-button r-button-secondary" onClick={() => setConfirmDelete(false)} disabled={busy}>Cancel</button></div> : <button className="r-button r-button-secondary" onClick={() => setConfirmDelete(true)} data-track="delete_workspace_review"><Trash2 size={16} />Delete saved workspace</button>}</section>{message ? <div className="r-app-notice" role="status">{message}</div> : null}</div>;
}
