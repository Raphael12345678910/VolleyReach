import test from "node:test";
import assert from "node:assert/strict";
import { normalizeOutreach, normalizeStoredValue, parseProgressBackup } from "../src/storage.js";

test("profile updates preserve existing data and fill newly introduced fields", () => {
  const defaults = { name: "", gpaUW: "", schedule: [{ event: "", date: "" }] };
  assert.deepEqual(normalizeStoredValue({ name: "Alex", schedule: [{ event: "Fall tournament" }] }, defaults), { name: "Alex", gpaUW: "", schedule: [{ event: "Fall tournament", date: "" }] });
});

test("malformed saved shapes cannot crash the app", () => {
  assert.deepEqual(normalizeStoredValue(null, { name: "" }), { name: "" });
  assert.deepEqual(normalizeStoredValue({}, []), []);
  assert.deepEqual(normalizeStoredValue([null, "invalid", { schoolId: "mit" }], []), [{ schoolId: "mit" }]);
  assert.deepEqual(normalizeStoredValue({ school: null, valid: "research" }, {}), { valid: "research" });
});

test("backup validation rejects unrelated JSON and preserves valid progress", () => {
  assert.throws(() => parseProgressBackup('{"name":"Alex"}', {}));
  const data = { profile: { name: "Alex" }, saved: [{ schoolId: "mit" }], notes: { mit: "Research" }, answers: { size: 12 } };
  const restored = parseProgressBackup(JSON.stringify({ app: "VolleyReach", version: 1, data }), { profile: { name: "", gpaUW: "" }, saved: [], notes: {}, answers: {} });
  assert.equal(restored.profile.name, "Alex");
  assert.equal(restored.profile.gpaUW, "");
  assert.equal(restored.saved[0].schoolId, "mit");
  assert.deepEqual(restored.notes, data.notes);
});

test("outreach restore removes duplicates and prevents invalid counts", () => {
  const restored = normalizeOutreach([null, {}, { schoolId: "mit", sent: "oops", sentHistory: "wrong" }, { schoolId: "mit", sent: 12 }]);
  assert.equal(restored.length, 1);
  assert.equal(restored[0].sent, 0);
  assert.deepEqual(restored[0].sentHistory, []);
});
