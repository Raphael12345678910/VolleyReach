import { test, expect } from "@playwright/test";

async function prepare(page, options = {}) {
  let googleRequests = 0;
  await page.route("**/site-config.json", (route) => route.fulfill({ json: { googleAnalyticsId: "G-TEST123456" } }));
  await page.route("https://www.googletagmanager.com/**", (route) => { googleRequests++; return route.fulfill({ contentType: "application/javascript", body: "/* Analytics isolated in tests. */" }); });
  await page.addInitScript(({ privacy }) => {
    window.__events = [];
    addEventListener("vr-analytics-event", (event) => window.__events.push(event.detail));
    if (privacy) Object.defineProperty(navigator, "globalPrivacyControl", { value: true });
  }, { privacy: options.privacy || false });
  return { requests: () => googleRequests };
}
const events = (page) => page.evaluate(() => window.__events);

test("no Google script or events load until consent, and rejecting preserves app access", async ({ page }) => {
  const traffic = await prepare(page);
  await page.goto("./");
  await expect(page.getByLabel("Analytics preferences")).toBeVisible();
  expect(traffic.requests()).toBe(0);
  expect(await events(page)).toEqual([]);
  await page.getByRole("button", { name: "No thanks", exact: true }).click();
  await page.goto("#/directory");
  await page.getByRole("textbox", { name: "Search programs" }).fill("MIT");
  await expect(page.locator(".r-directory-count")).toContainText("programs");
  expect(traffic.requests()).toBe(0);
  expect(await events(page)).toEqual([]);
});

test("consented navigation, searches, contact views and copies use safe event data", async ({ page, context, browserName }) => {
  const traffic = await prepare(page);
  if (browserName === "chromium") await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("?email=must-not-leak%40example.com#/landing");
  await page.getByRole("button", { name: "Allow analytics", exact: true }).click();
  await expect.poll(() => traffic.requests()).toBe(1);
  await page.locator(".v-hero-explore").click();
  await page.getByRole("textbox", { name: "Search programs" }).fill("Massachusetts Institute");
  await expect(page.locator(".school-card")).toHaveCount(1);
  await expect.poll(async () => (await events(page)).some((event) => event.name === "college_search")).toBe(true);
  await page.locator(".school-card-main").click();
  await page.getByRole("button", { name: "Copy coach email", exact: true }).first().click();
  await expect.poll(async () => (await events(page)).some((event) => event.name === "email_copied")).toBe(true);
  const recorded = await events(page);
  expect(recorded.some((event) => event.name === "view_coach_contacts")).toBe(true);
  expect(recorded.some((event) => event.name === "ui_click" && event.params.action === "find_college")).toBe(true);
  expect(recorded.filter((event) => event.name === "page_view").map((event) => event.params.route)).toEqual(["landing", "directory"]);
  const serialized = JSON.stringify(recorded);
  expect(serialized).not.toContain("must-not-leak");
  expect(serialized).not.toContain("Massachusetts Institute");
  expect(serialized).not.toContain("@");
  await page.getByRole("button", { name: "Cookie settings", exact: true }).click();
  await page.getByRole("button", { name: "No thanks", exact: true }).click();
  const count = (await events(page)).length;
  await page.getByRole("button", { name: "Add to list", exact: true }).click();
  expect((await events(page)).length).toBe(count);
});

test("internal sidebar navigation counts one page view and never includes profile values", async ({ page }) => {
  await prepare(page);
  await page.goto("#/profile");
  await page.getByRole("button", { name: "Allow analytics", exact: true }).click();
  await page.locator("#name").fill("Never Forward This Name");
  const opener = page.getByRole("button", { name: "Open navigation", exact: true });
  if (await opener.isVisible()) await opener.click();
  await page.getByRole("button", { name: "Find Schools", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Find programs");
  const recorded = await events(page);
  expect(recorded.filter((event) => event.name === "page_view").map((event) => event.params.route)).toEqual(["profile", "matches"]);
  expect(JSON.stringify(recorded)).not.toContain("Never Forward");
});

test("directory inputs wait for data and keep the first search after loading", async ({ page }) => {
  await prepare(page);
  let release;
  const ready = new Promise((resolve) => { release = resolve; });
  await page.route("**/data/coaches.json", async (route) => { await ready; await route.continue(); });
  await page.goto("#/directory");
  const input = page.getByRole("textbox", { name: "Search programs" });
  await expect(input).toBeDisabled();
  release();
  await expect(input).toBeEnabled();
  await input.fill("Massachusetts Institute");
  await expect(input).toHaveValue("Massachusetts Institute");
  await expect(page.locator(".school-card")).toHaveCount(1);
});

test("demo activity and browser privacy signals are excluded from analytics", async ({ page }) => {
  const traffic = await prepare(page);
  await page.goto("?demo=1#/home");
  await page.getByRole("button", { name: "Allow analytics", exact: true }).click();
  expect(traffic.requests()).toBe(0);
  expect(await events(page)).toEqual([]);
});

test("Global Privacy Control prevents analytics even with old consent", async ({ page }) => {
  const traffic = await prepare(page, { privacy: true });
  await page.addInitScript(() => localStorage.setItem("vr-analytics-consent", "granted"));
  await page.goto("#/home");
  await expect(page.locator("h1")).toBeVisible();
  expect(traffic.requests()).toBe(0);
  expect(await events(page)).toEqual([]);
});

test("every successful full-email copy is counted without the email or profile text", async ({ page, context, browserName }) => {
  await prepare(page);
  if (browserName === "chromium") await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("#/profile");
  await page.getByRole("button", { name: "Allow analytics", exact: true }).click();
  await page.evaluate(() => localStorage.setItem("vr3-profile", JSON.stringify({
    name: "Private Synthetic Athlete", gradYear: "2028", location: "California", athleteEmail: "private-athlete@example.com", phone: "310-555-0100",
    position: "Outside Hitter", playerRole: "Six-rotation", height: "6'2\"", vertical: "35 in", standingReach: "97 in", approachTouch: "132 in",
    club: "Private Team", clubTeam: "18-1", clubRole: "Starter", jersey: "11", highSchool: "Private School", schoolRole: "Captain",
    gpaUW: "3.8", gpaWeighted: "4.3", academicInterests: "Engineering", highlightVideo: "https://example.com/private-highlight", coachName: "Private Coach", coachEmail: "private-coach@example.com"
  })));
  await page.goto("#/email");
  await page.reload();
  await page.getByRole("button", { name: "Copy email", exact: true }).click();
  await expect(page.getByRole("button", { name: "Copied", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Copied", exact: true }).click();
  await expect.poll(async () => (await events(page)).filter((event) => event.name === "email_copied" && event.params.part === "full_email").length).toBe(2);
  const recorded = await events(page);
  expect(recorded.filter((event) => event.name === "email_copied" && event.params.part === "full_email")).toHaveLength(2);
  expect(JSON.stringify(recorded)).not.toContain("Private");
  expect(JSON.stringify(recorded)).not.toContain("private-");
  expect(JSON.stringify(recorded)).not.toContain("@");
});
