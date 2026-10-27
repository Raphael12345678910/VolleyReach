import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  workers: 2,
  retries: 0,
  timeout: 30000,
  use: {
    baseURL: "http://127.0.0.1:4177/VolleyReach/",
    reducedMotion: "reduce",
    screenshot: "only-on-failure",
    trace: "retain-on-failure"
  },
  projects: [
    { name: "desktop", use: { channel: process.env.PLAYWRIGHT_CHROMIUM_CHANNEL || "chrome", viewport: { width: 1440, height: 1000 } } },
    { name: "phone", use: { channel: process.env.PLAYWRIGHT_CHROMIUM_CHANNEL || "chrome", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: "safari-phone", use: { browserName: "webkit", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } }
  ],
  webServer: {
    command: "npm run preview -- --port 4177 --strictPort",
    url: "http://127.0.0.1:4177/VolleyReach/",
    reuseExistingServer: false
  }
});
