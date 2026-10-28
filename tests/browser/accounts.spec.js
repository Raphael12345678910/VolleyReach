import { test, expect } from "@playwright/test";

const config = { supabaseUrl: "https://volleyreach-test.supabase.co", supabasePublishableKey: "sb_publishable_volleyreach_test", googleSignIn: true, appleSignIn: true, googleAnalyticsId: "" };
const uid = "00000000-0000-4000-8000-000000000001";
const user = { id: uid, aud: "authenticated", role: "authenticated", email: "athlete@example.com", app_metadata: { provider: "email", providers: ["email"] }, user_metadata: {}, created_at: "2026-10-28T00:00:00Z", identities: [] };
function session(identity = user) {
  const expiry = Math.floor(Date.now() / 1000) + 3600;
  const token = [Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url"), Buffer.from(JSON.stringify({ sub: identity.id, aud: "authenticated", exp: expiry, role: "authenticated" })).toString("base64url"), "test-signature"].join(".");
  return { access_token: token, refresh_token: "test-refresh-token", token_type: "bearer", expires_in: 3600, expires_at: expiry, user: identity };
}
const empty = { profile: { name: "Cloud Athlete", schedule: [] }, saved: [], selectedSchoolId: "", answers: {}, notes: {} };

async function mockServices(page, options = {}) {
  const db = { data: options.cloud === undefined ? structuredClone(empty) : options.cloud, revision: options.cloud === null ? 0 : 1 };
  const calls = [];
  let failSave = Boolean(options.failSave);
  let conflict = Boolean(options.conflict);
  await page.route("**/site-config.json", (route) => route.fulfill({ json: { ...config, ...options.config } }));
  await page.route("https://volleyreach-test.supabase.co/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const body = request.postDataJSON();
    calls.push({ path: url.pathname, method: request.method(), body, url: url.href });
    if (request.method() === "OPTIONS") return route.fulfill({ status: 200, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" } });
    if (url.pathname.endsWith("/token")) {
      if (options.badLogin) return route.fulfill({ status: 400, json: { error_code: "invalid_credentials", msg: "Invalid login credentials" } });
      return route.fulfill({ json: session(options.identity || user) });
    }
    if (url.pathname.endsWith("/signup")) return route.fulfill({ json: user });
    if (url.pathname.endsWith("/recover")) return route.fulfill({ json: {} });
    if (url.pathname.endsWith("/logout")) return route.fulfill({ status: 204 });
    if (url.pathname.endsWith("/user")) return route.fulfill({ json: options.identity || user });
    if (url.pathname.endsWith("/save_workspace")) {
      if (failSave) return route.fulfill({ status: 503, json: { code: "connection_error", message: "Offline" } });
      if (conflict || body.expected_revision !== db.revision) { conflict = false; db.revision += 1; db.data = { ...db.data, profile: { name: "Other Device Athlete" } }; return route.fulfill({ status: 409, json: { code: "40001", message: "Conflict" } }); }
      db.data = body.workspace_data; db.revision += 1;
      return route.fulfill({ json: { revision: db.revision } });
    }
    if (url.pathname.endsWith("/athlete_workspaces")) {
      if (options.failLoad) return route.fulfill({ status: 403, json: { message: "Service not ready" } });
      if (request.method() === "DELETE") { db.data = null; db.revision = 0; return route.fulfill({ json: [{ user_id: uid }] }); }
      return route.fulfill({ json: db.data ? { data: db.data, revision: db.revision } : null });
    }
    if (url.pathname.endsWith("/authorize")) return route.fulfill({ contentType: "text/html", body: "<h1>Provider redirect</h1>" });
    return route.fulfill({ status: 404, json: { message: "Unexpected mock request" } });
  });
  return { db, calls, restoreSaving: () => { failSave = false; } };
}

async function login(page) {
  await page.goto("#/signin");
  await page.getByLabel("Email address", { exact: true }).fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill("synthetic-password-123");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page.locator(".r-topbar")).toContainText("Saved to your account");
}

test.beforeEach(async ({ page }) => {
  await page.context().route("**/site-config.json", (route) => route.fulfill({ json: {} }));
  page.__errors = [];
  page.on("pageerror", (error) => page.__errors.push(error.message));
});
test.afterEach(async ({ page }) => expect(page.__errors).toEqual([]));

test("landing and honest unconfigured account screens preserve guest access", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("VolleyReach");
  await page.locator(".v-hero-actions").getByRole("link", { name: "Start your recruiting journey" }).click();
  await expect(page.locator(".r-page h1")).toContainText("Build your recruiting profile");
  await page.goto("#/signup");
  await expect(page.getByRole("status")).toContainText("Accounts are being connected");
  await expect(page.getByRole("button", { name: "Create account", exact: true })).toBeDisabled();
  await page.getByRole("link", { name: "Continue without an account" }).click();
  await expect(page.locator(".r-page h1")).toContainText("Build your recruiting profile");
});

test("email login loads only the account workspace and changes survive reload", async ({ page }) => {
  const service = await mockServices(page);
  await page.goto("#/profile");
  await page.locator("#name").fill("Separate Guest Athlete");
  await login(page);
  await page.goto("#/profile");
  await expect(page.locator("#name")).toHaveValue("Cloud Athlete");
  await page.locator("#name").fill("Updated Account Athlete");
  await expect(page.locator(".r-topbar")).toContainText("Saved to your account");
  expect(service.db.data.profile.name).toBe("Updated Account Athlete");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("vr3-profile")).name)).toBe("Separate Guest Athlete");
  await page.reload();
  await expect(page.locator("#name")).toHaveValue("Updated Account Athlete");
  await page.goto("?demo=1#/account");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Account actions stay outside the demo.");
  await expect(page.getByRole("button", { name: "Delete saved workspace", exact: true })).toHaveCount(0);
  await page.getByRole("link", { name: "Leave demo and open my account" }).click();
  expect(page.url()).not.toContain("demo=1");
  await page.goto("#/account");
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("VolleyReach");
  await page.goto("#/profile");
  await expect(page.locator("#name")).toHaveValue("Separate Guest Athlete");
});

test("signup requires matching passwords and waits for email confirmation", async ({ page }) => {
  const service = await mockServices(page);
  await page.goto("#/signup");
  await page.getByLabel("Email address", { exact: true }).fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill("synthetic-password-123");
  await page.getByLabel("Confirm password", { exact: true }).fill("different-password-456");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Create account", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("passwords do not match");
  expect(service.calls.filter((call) => call.path.endsWith("/signup"))).toHaveLength(0);
  await page.getByLabel("Confirm password", { exact: true }).fill("synthetic-password-123");
  await page.getByRole("button", { name: "Create account", exact: true }).click();
  await expect(page.locator(".v-auth-success")).toContainText("Check your email");
  const call = service.calls.find((entry) => entry.path.endsWith("/signup"));
  expect(call.body.data.age_13_or_over).toBe(true);
  expect(new URL(call.url).searchParams.get("redirect_to")).toContain("/VolleyReach/?auth=callback");
  await expect(page.getByLabel("Password", { exact: true })).toHaveValue("");
});

test("failed login does not report success and password reset uses the correct callback", async ({ page }) => {
  const service = await mockServices(page, { badLogin: true });
  await page.goto("#/signin");
  await page.getByLabel("Email address", { exact: true }).fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("did not match");
  await page.getByRole("link", { name: "Forgot password?" }).click();
  await page.getByLabel("Email address", { exact: true }).fill(user.email);
  await page.getByRole("button", { name: "Send reset link", exact: true }).click();
  await expect(page.locator(".v-auth-success")).toContainText("If an account uses that email");
  expect(service.calls.find((call) => call.path.endsWith("/recover")).url).toContain("auth%3Drecovery");
});

test("Google and Apple OAuth requests use PKCE and an approved callback", async ({ page }) => {
  for (const provider of ["google", "apple"]) {
    await mockServices(page);
    await page.goto("#/signin");
    await page.getByRole("button", { name: `Continue with ${provider === "google" ? "Google" : "Apple"}`, exact: true }).click();
    await expect(page).toHaveURL(/\/auth\/v1\/authorize/);
    const url = new URL(page.url());
    expect(url.searchParams.get("provider")).toBe(provider);
    expect(url.searchParams.get("code_challenge_method")).toBe("s256");
    expect(url.searchParams.get("redirect_to")).toContain("/VolleyReach/?auth=callback");
  }
});

test("password reset callback exchanges its code and allows a new password", async ({ page }) => {
  const service = await mockServices(page);
  await page.goto("#/forgot");
  await page.getByLabel("Email address", { exact: true }).fill(user.email);
  await page.getByRole("button", { name: "Send reset link", exact: true }).click();
  await expect(page.locator(".v-auth-success")).toBeVisible();
  await page.goto("?auth=recovery&code=synthetic-code");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Choose a new password.");
  await page.getByLabel("New password", { exact: true }).fill("updated-synthetic-password-456");
  await page.getByLabel("Confirm password", { exact: true }).fill("updated-synthetic-password-456");
  await page.getByRole("button", { name: "Save new password", exact: true }).click();
  await expect(page.locator(".r-topbar")).toContainText("Saved to your account");
  expect(service.calls.some((call) => call.path.endsWith("/user") && call.method === "PUT" && call.body.password === "updated-synthetic-password-456")).toBe(true);
  expect(page.url()).not.toContain("code=");
});

test("invalid recovery links offer a new reset instead of trapping the visitor", async ({ page }) => {
  await mockServices(page);
  await page.goto("?auth=recovery");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Reset your password.");
  await expect(page.getByRole("alert")).toContainText("could not be verified");
  await expect(page.getByRole("button", { name: "Send reset link", exact: true })).toBeEnabled();
});

test("different accounts on one browser never inherit each other's profile", async ({ page }) => {
  const first = await mockServices(page);
  await login(page);
  await page.goto("#/profile");
  await page.locator("#name").fill("First Private Athlete");
  await expect.poll(() => first.db.data.profile.name).toBe("First Private Athlete");
  await page.goto("#/account");
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page.locator(".v-hero")).toBeVisible();
  await mockServices(page, { identity: { ...user, id: "00000000-0000-4000-8000-000000000002", email: "second@example.com" }, cloud: { ...empty, profile: { name: "Second Private Athlete" } } });
  await login(page);
  await page.goto("#/profile");
  await expect(page.locator("#name")).toHaveValue("Second Private Athlete");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("vr-account-00000000-0000-4000-8000-000000000001-profile")).name)).toBe("First Private Athlete");
});

test("browser data imports only after explicit confirmation", async ({ page }) => {
  const service = await mockServices(page);
  await page.goto("#/profile");
  await page.locator("#name").fill("Browser Athlete");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("vr3-profile"))?.name)).toBe("Browser Athlete");
  await page.evaluate(() => localStorage.setItem("vr2-match-answers", "{broken"));
  await login(page);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("vr3-profile"))?.name)).toBe("Browser Athlete");
  await page.goto("#/account");
  await expect(page.getByText(/separate browser-only workspace exists for Browser Athlete/)).toBeVisible();
  await page.getByRole("button", { name: "Review import" }).click();
  expect(service.db.data.profile.name).toBe("Cloud Athlete");
  await page.getByRole("button", { name: "Yes, replace my account progress" }).click();
  await expect.poll(() => service.db.data.profile.name).toBe("Browser Athlete");
});

test("offline save keeps a recoverable copy and retries without pretending it saved", async ({ page }) => {
  const service = await mockServices(page, { failSave: true });
  await login(page);
  await page.goto("#/profile");
  await page.locator("#name").fill("Offline Athlete");
  await expect(page.getByRole("alert")).toContainText("have not reached your account");
  expect(service.db.data.profile.name).toBe("Cloud Athlete");
  service.restoreSaving();
  await page.getByRole("button", { name: "Retry cloud save" }).click();
  await expect(page.locator(".r-topbar")).toContainText("Saved to your account");
  expect(service.db.data.profile.name).toBe("Offline Athlete");
});

test("concurrent device edits present a recoverable conflict instead of overwriting", async ({ page }) => {
  const service = await mockServices(page, { conflict: true });
  await login(page);
  await page.goto("#/profile");
  await page.locator("#name").fill("Local Unsynced Athlete");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Two copies need your attention.");
  expect(service.db.data.profile.name).toBe("Other Device Athlete");
  await page.getByRole("button", { name: "Keep this browser copy" }).click();
  await expect(page.locator("#name")).toHaveValue("Local Unsynced Athlete");
  await expect.poll(() => service.db.data.profile.name).toBe("Local Unsynced Athlete");
});

test("pending offline edits recover after reload and sync once connected", async ({ page }) => {
  const service = await mockServices(page, { failSave: true });
  await login(page);
  await page.goto("#/profile");
  await page.locator("#name").fill("Recovered Offline Athlete");
  await expect(page.getByRole("alert")).toContainText("have not reached your account");
  service.restoreSaving();
  page.once("dialog", (dialog) => dialog.accept());
  await page.reload();
  await expect(page.locator("#name")).toHaveValue("Recovered Offline Athlete");
  await expect.poll(() => service.db.data.profile.name).toBe("Recovered Offline Athlete");
});

test("cloud loading failure does not expose or overwrite guest progress", async ({ page }) => {
  await mockServices(page, { failLoad: true });
  await page.goto("#/signin");
  await page.getByLabel("Email address", { exact: true }).fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill("synthetic-password-123");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("could not load your account");
  await expect(page.locator("#name")).toHaveCount(0);
  await page.getByRole("button", { name: "Sign out and use browser-only", exact: true }).click();
  await expect(page.locator(".r-page h1")).toContainText("Build your recruiting profile");
});

test("field saves remain recoverable when the larger checkpoint write is blocked", async ({ page }) => {
  const service = await mockServices(page, { failSave: true });
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) { if (key.startsWith("vr-account-") && key.endsWith("-sync")) throw new DOMException("Full", "QuotaExceededError"); return original.call(this, key, value); };
  });
  await login(page);
  await page.goto("#/profile");
  await page.locator("#name").fill("Keep This Cached Athlete");
  await expect(page.getByRole("alert")).toContainText("have not reached your account");
  service.restoreSaving();
  page.once("dialog", (dialog) => dialog.accept());
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Two copies need your attention.");
  await page.getByRole("button", { name: "Keep this browser copy", exact: true }).click();
  await expect(page.locator("#name")).toHaveValue("Keep This Cached Athlete");
  await expect.poll(() => service.db.data.profile.name).toBe("Keep This Cached Athlete");
});

test("new account never silently absorbs guest data and confirmed deletion clears the account", async ({ page }) => {
  const service = await mockServices(page, { cloud: null });
  await page.goto("#/profile");
  await page.locator("#name").fill("Do Not Import Me");
  await login(page);
  await page.goto("#/profile");
  await expect(page.locator("#name")).toHaveValue("");
  await page.locator("#name").fill("Account To Clear");
  await expect.poll(() => service.db.data?.profile.name).toBe("Account To Clear");
  await page.goto("#/account");
  await page.getByRole("button", { name: "Delete saved workspace", exact: true }).click();
  await expect(page.getByRole("button", { name: "Delete my workspace", exact: true })).toBeDisabled();
  await page.getByLabel("Confirm workspace deletion").fill("DELETE");
  await page.getByRole("button", { name: "Delete my workspace", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("were cleared");
  expect(service.db.data).toBeNull();
  await page.goto("#/profile");
  await expect(page.locator("#name")).toHaveValue("");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("vr3-profile")).name)).toBe("Do Not Import Me");
});

test("landing, account and policy screens fit narrow viewports", async ({ page }) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["landing", "signup", "signin", "privacy", "terms"]) {
      await page.goto(`#/${route}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${width}: ${route}`).toBe(true);
    }
  }
});
