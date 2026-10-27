import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

const profile = {
  name: "Alex Rivera", gradYear: "2028", location: "California", athleteEmail: "alex@example.com", phone: "310-555-0100",
  position: "Outside Hitter", playerRole: "Six-rotation", height: "6'2\"", vertical: "35 in", standingReach: "97 in", approachTouch: "132 in",
  club: "Pacific Volleyball", clubTeam: "18-1", clubRole: "Starter", jersey: "11", highSchool: "Westview High", schoolRole: "Captain",
  gpaUW: "3.8", gpaWeighted: "4.3", academicInterests: "Engineering", highlightVideo: "https://example.com/highlights", coachName: "Taylor Morgan", coachEmail: "coach@example.com",
  schedule: [{ event: "Fall Invitational", date: "November 15", location: "Anaheim", details: "9 AM, Court 12" }]
};
const mit = "massachusetts-institute-of-technology-mit";

async function seed(page, data = {}) {
  await page.goto("#/home");
  await page.evaluate((entries) => { for (const [key, value] of Object.entries(entries)) localStorage.setItem(key, JSON.stringify(value)); }, data);
  await page.reload();
}

test.beforeEach(async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.__errors = errors;
});
test.afterEach(async ({ page }) => { expect(page.__errors).toEqual([]); });

test("new visitor starts blank, typing saves immediately, and share links preserve returning progress", async ({ page, browser }) => {
  await page.goto("?fresh=1#/profile");
  await expect(page.locator("#name")).toHaveValue("");
  await page.locator("#name").fill("Alex Rivera");
  await page.locator("#gradYear").fill("2028");
  await page.reload();
  await expect(page.locator("#name")).toHaveValue("Alex Rivera");
  await page.goto("?fresh=1#/profile");
  await expect(page.locator("#name")).toHaveValue("Alex Rivera");
  const other = await browser.newContext();
  const otherPage = await other.newPage();
  await otherPage.goto(page.url());
  await expect(otherPage.locator("#name")).toHaveValue("");
  await other.close();
});

test("existing profiles survive older schema markers and newly introduced fields", async ({ page }) => {
  await seed(page, { "vr3-profile": { name: "Returning Player", gradYear: "2028" } });
  await page.evaluate(() => localStorage.setItem("vr-profile-schema", "old"));
  await page.goto("#/profile");
  await expect(page.locator("#name")).toHaveValue("Returning Player");
  await page.reload();
  await expect(page.locator("#name")).toHaveValue("Returning Player");
});

test("demo profile, notes and quiz answers are isolated from a real visitor", async ({ page }) => {
  await seed(page, { "vr3-profile": profile, "vr2-school-notes": { [mit]: "My real school research" }, "vr2-match-answers": { division: "d3" } });
  await page.goto("?demo=1#/profile");
  await expect(page.locator("#name")).toHaveValue("Jordan Lee");
  await page.locator("#name").fill("Demo Edit");
  await page.goto("?demo=1#/email");
  await page.getByRole("textbox", { name: "Why this school?" }).fill("Demo-only research");
  await page.goto("#/profile");
  await expect(page.locator("#name")).toHaveValue("Alex Rivera");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("vr2-school-notes")))).toEqual({ [mit]: "My real school research" });
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("vr2-match-answers")))).toEqual({ division: "d3" });
});

test("incomplete profiles gate the email builder and tasks open the missing field", async ({ page }) => {
  await page.goto("#/email");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("First, complete your profile");
  await page.getByRole("button", { name: "Complete my profile" }).click();
  await expect(page.locator("#name")).toBeFocused();
});

test("complete profile and optional schedule appear in the email, research persists, and copying works", async ({ page, context, browserName }) => {
  if (browserName === "chromium") await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await seed(page, { "vr3-profile": profile, "vr2-selected-school": mit });
  await page.goto("#/email");
  const email = page.locator(".r-email-preview pre");
  await expect(email).toContainText("Alex Rivera");
  await expect(email).toContainText("Fall Invitational");
  await expect(email).toContainText("Court 12");
  await expect(email).toContainText("Jersey: #11");
  await expect(email).toContainText("alex@example.com | 310-555-0100");
  await page.getByRole("textbox", { name: "Why this school?" }).fill("your engineering program and volleyball culture are a strong fit.");
  await page.reload();
  await expect(email).toContainText("your engineering program");
  await page.getByText("Upcoming schedule", { exact: true }).click();
  await expect(email).not.toContainText("Fall Invitational");
  await expect(email).toContainText("Jersey: #11");
  await page.getByRole("button", { name: "Copy email", exact: true }).click();
  await expect(page.getByRole("button", { name: "Copied", exact: true })).toBeVisible();
  if (browserName === "chromium") expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("Alex Rivera");
});

test("saved schedule edits flow into the email builder", async ({ page }) => {
  await seed(page, { "vr3-profile": profile, "vr2-selected-school": mit });
  await page.goto("#/profile");
  await page.locator(".r-profile-tabs").getByRole("button", { name: "Schedule", exact: true }).click();
  await page.locator("#schedule-event-0").fill("Updated Club Tournament");
  await page.getByRole("button", { name: "Save profile", exact: true }).click();
  await page.goto("#/email");
  await expect(page.locator(".r-email-preview pre")).toContainText("Updated Club Tournament");
});

test("directory filters, expansion, save and full pagination work", async ({ page }) => {
  await page.goto("#/directory");
  await expect(page.locator(".school-card")).toHaveCount(30);
  await page.getByRole("button", { name: "Show more programs" }).click();
  await expect(page.locator(".school-card")).toHaveCount(60);
  await page.getByRole("textbox", { name: "Search programs" }).fill("Massachusetts Institute");
  await expect(page.locator(".school-card")).toHaveCount(1);
  await page.locator(".school-card-main").click();
  await expect(page.locator(".coach-list a").first()).toHaveAttribute("href", /^mailto:/);
  await page.getByRole("button", { name: "Add to list", exact: true }).click();
  await page.reload();
  await page.getByRole("textbox", { name: "Search programs" }).fill("Massachusetts Institute");
  await page.locator(".school-card-main").click();
  await expect(page.getByRole("button", { name: "Saved", exact: true })).toBeVisible();
  await page.getByRole("textbox", { name: "Search programs" }).fill("not-a-college-12345");
  await expect(page.getByText("No programs match this search.")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.locator(".school-card")).toHaveCount(30);
});

test("quiz returns actual filtered schools and remembers the results", async ({ page }) => {
  await page.goto("#/matches");
  await page.getByRole("button", { name: /Division III only/ }).click();
  await page.getByRole("button", { name: /Nationwide/ }).click();
  await page.getByRole("button", { name: /email-ready only/ }).click();
  await page.getByRole("button", { name: /Focused list/ }).click();
  await expect(page.locator(".school-card")).toHaveCount(12);
  await expect(page.locator(".school-card").first()).toContainText("Division III");
  await page.reload();
  await expect(page.locator(".school-card")).toHaveCount(12);
});

test("outreach logging, undo and due-date counts persist", async ({ page }) => {
  const entries = [
    { schoolId: mit, status: "Saved", sent: 0, followup: "2020-01-01", lastSent: "" },
    { schoolId: "adrian-college", status: "Saved", sent: 0, followup: "2099-01-01", lastSent: "" }
  ];
  await seed(page, { "vr2-outreach": entries });
  await page.goto("#/outreach");
  await expect(page.locator(".r-outreach-summary > div").nth(2).locator("strong")).toHaveText("1");
  const row = page.locator(".r-outreach-row").first();
  await row.getByRole("button", { name: "Log sent" }).click();
  await expect(row.locator(".r-sent-count strong")).toHaveText("1");
  await row.getByRole("button", { name: "Undo last sent log" }).click();
  await expect(row.locator(".r-sent-count strong")).toHaveText("0");
  await page.reload();
  await expect(row.locator(".r-sent-count strong")).toHaveText("0");
});

test("backup and restore preserve all progress across browser contexts", async ({ page, browser }) => {
  await seed(page, { "vr3-profile": profile, "vr2-match-answers": { division: "d3" }, "vr2-school-notes": { [mit]: "My research" }, "vr2-outreach": [{ schoolId: mit, status: "Sent", sent: 2 }] });
  await page.goto("#/profile");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Back up", exact: true }).click();
  const download = await downloadPromise;
  const buffer = await readFile(await download.path());
  const other = await browser.newContext();
  const target = await other.newPage();
  await target.goto(page.url());
  await target.locator('.r-progress-tools input[type="file"]').setInputFiles({ name: "progress.json", mimeType: "application/json", buffer });
  await target.getByRole("button", { name: "Restore backup", exact: true }).click();
  await expect(target.locator("#name")).toHaveValue("Alex Rivera");
  expect(await target.evaluate(() => JSON.parse(localStorage.getItem("vr2-school-notes")))).toEqual({ [mit]: "My research" });
  await target.reload();
  await expect(target.locator("#name")).toHaveValue("Alex Rivera");
  await other.close();
});

test("blocked storage warns clearly and keeps the current form usable", async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException("Blocked", "SecurityError"); }; });
  await page.goto("#/profile");
  await expect(page.getByRole("alert")).toContainText("could not save");
  await page.locator("#name").fill("Unsaved Athlete");
  await page.getByRole("button", { name: "Save profile", exact: true }).click();
  await expect(page.getByRole("button", { name: "Saved", exact: true })).toHaveCount(0);
  await expect(page.locator("#name")).toHaveValue("Unsaved Athlete");
});

test("same-browser tabs receive saved profile updates", async ({ page, context }) => {
  await page.goto("#/profile");
  const second = await context.newPage();
  await second.goto(page.url());
  await page.locator("#name").fill("Updated in another tab");
  await expect(second.locator("#name")).toHaveValue("Updated in another tab");
  await second.close();
});

test("invalid backups leave the current profile untouched", async ({ page }) => {
  await page.goto("#/profile");
  await page.locator("#name").fill("Keep My Profile");
  await page.locator('.r-progress-tools input[type="file"]').setInputFiles({ name: "wrong.json", mimeType: "application/json", buffer: Buffer.from('{"not":"a backup"}') });
  await expect(page.locator(".r-progress-tools")).toContainText("Choose a VolleyReach progress backup");
  await expect(page.locator("#name")).toHaveValue("Keep My Profile");
});

test("directory failure has a working retry", async ({ page }) => {
  let fail = true;
  await page.route("**/data/coaches.json", (route) => fail ? route.fulfill({ status: 503, body: "Unavailable" }) : route.continue());
  await page.goto("#/directory");
  await expect(page.getByRole("alert")).toContainText("could not load");
  fail = false;
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page.locator(".school-card")).toHaveCount(30);
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("corrupt saved data does not crash the app", async ({ page }) => {
  await seed(page, { "vr3-profile": null, "vr2-outreach": {}, "vr2-school-notes": null });
  await page.evaluate(() => localStorage.setItem("vr2-match-answers", "{broken"));
  await page.goto("#/profile");
  await expect(page.locator("#name")).toHaveValue("");
  await page.goto("#/outreach");
  await expect(page.getByText("Your outreach list is empty.")).toBeVisible();
});

test("all eight routes fit the viewport and required assets load", async ({ page }) => {
  for (const route of ["home", "matches", "directory", "profile", "email", "outreach", "timeline", "jump"]) {
    await page.goto(`#/${route}`);
    await expect(page.locator("h1")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), route).toBe(true);
  }
  await page.goto("#/home");
  const background = await page.locator(".r-home-photo").evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(background).toContain("/VolleyReach/assets/volleyreach-gym.jpg");
  const response = await page.request.get("assets/volleyreach-gym.jpg");
  expect(response.ok()).toBe(true);
});

test("filled workspaces fit narrow phone and tablet widths", async ({ page }) => {
  await seed(page, { "vr3-profile": profile });
  for (const width of [320, 768, 1024]) {
    await page.setViewportSize({ width, height: 960 });
    for (const route of ["directory", "jump", "profile", "email"]) {
      await page.goto(`#/${route}`);
      await expect(page.locator("h1")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${width}: ${route}`).toBe(true);
    }
  }
});

test("keyboard skip link and mobile menu keep navigation usable", async ({ page }) => {
  await page.goto("#/profile");
  await page.getByRole("link", { name: "Skip to content" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  expect(new URL(page.url()).hash).toBe("#/profile");
  const opener = page.getByRole("button", { name: "Open navigation", exact: true });
  if (await opener.isVisible()) {
    await opener.click();
    await expect(opener).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(opener).toHaveAttribute("aria-expanded", "false");
    await expect(opener).toBeFocused();
  }
});

test("jump test cannot save the example, and upload, frame stepping, markers and profile saving work", async ({ page }) => {
  await page.goto("#/jump");
  await expect(page.getByRole("button", { name: "Save to athletic profile" })).toBeDisabled();
  await page.locator('.r-jump-upload input[type="file"]').setInputFiles("tests/fixtures/calibration.mp4");
  await expect(page.locator(".r-marker-buttons button").first()).toBeEnabled();
  await page.getByRole("button", { name: "Next frame", exact: true }).click();
  await expect.poll(() => page.locator("video").evaluate((video) => video.currentTime)).toBeGreaterThan(0);
  const stage = page.locator(".r-jump-stage");
  const bounds = await stage.boundingBox();
  for (const [x, y] of [[.5, .92], [.2, .42], [.8, .42], [.5, .4], [.5, .24]]) {
    await stage.click({ position: { x: bounds.width * x, y: bounds.height * y } });
  }
  await expect(page.locator(".r-jump-point")).toHaveCount(5);
  const peakBefore = await page.locator(".r-jump-point.peak").evaluate((el) => parseFloat(el.style.top));
  await page.getByRole("button", { name: "Move marker up", exact: true }).click();
  await expect.poll(() => page.locator(".r-jump-point.peak").evaluate((el) => parseFloat(el.style.top))).toBeLessThan(peakBefore);
  await page.getByRole("button", { name: "Move marker down", exact: true }).click();
  await expect(page.getByRole("button", { name: "Save to athletic profile" })).toBeDisabled();
  for (const label of await page.locator(".r-quality-check").all()) await label.click();
  await expect(page.getByRole("button", { name: "Save to athletic profile" })).toBeEnabled();
  await page.getByRole("button", { name: "Add as trial", exact: true }).click();
  await expect(page.locator(".r-trial-panel > span")).toHaveCount(1);
  await page.getByRole("button", { name: "Save to athletic profile" }).click();
  await expect(page.getByRole("button", { name: "Added to your profile" })).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("vr3-profile")));
  // Touch coordinates are rounded to displayed pixels on a small video.
  expect(Math.abs(parseFloat(saved.vertical) - 30.6)).toBeLessThan(1);
  expect(parseFloat(saved.approachTouch) - parseFloat(saved.standingReach)).toBeCloseTo(parseFloat(saved.vertical), 0);
  await page.getByRole("button", { name: /Basketball rim/ }).click();
  await expect(page.getByRole("button", { name: "Save to athletic profile" })).toBeDisabled();
  await expect(page.locator(".r-reference-chip")).toContainText("10 ft");
});
