import test from "node:test";
import assert from "node:assert/strict";
import { normalizeConfig } from "../src/config.js";
import { safeEventParams } from "../src/analytics.js";

test("configuration only accepts public keys and safe service origins", () => {
  const valid = normalizeConfig({ googleAnalyticsId: "G-TEST123456", supabaseUrl: "https://test.supabase.co", supabasePublishableKey: "sb_publishable_test", googleSignIn: true });
  assert.equal(valid.supabaseUrl, "https://test.supabase.co");
  assert.equal(valid.googleAnalyticsId, "G-TEST123456");
  const admin = `e30.${btoa(JSON.stringify({ role: "service_role" }))}.example`;
  assert.equal(normalizeConfig({ supabasePublishableKey: admin }).supabasePublishableKey, "");
  assert.equal(normalizeConfig({ supabasePublishableKey: "sb_secret_test" }).supabasePublishableKey, "");
  assert.equal(normalizeConfig({ supabaseUrl: "https://evil.example/?secret=abc" }).supabaseUrl, "");
  assert.equal(normalizeConfig({ supabaseUrl: "http://test.supabase.co" }).supabaseUrl, "");
  assert.equal(normalizeConfig({ googleAnalyticsId: '<script>alert(1)</script>' }).googleAnalyticsId, "");
  assert.equal(normalizeConfig(null).googleAnalyticsId, "");
});

test("analytics discards personal fields and untrusted free text", () => {
  assert.deepEqual(safeEventParams({ email: "athlete@example.com", name: "Alex", password: "test", search: "MIT", action: "copy_email", school_id: "mit", result_count: 3, field: "contains@email.com", method: "email" }), { action: "copy_email", school_id: "mit", result_count: 3, method: "email" });
});
