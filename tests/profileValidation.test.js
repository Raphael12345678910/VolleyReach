import test from "node:test";
import assert from "node:assert/strict";
import { parseInches, profileFieldIssue } from "../src/profileValidation.js";

test("measurement inputs accept inches, feet and centimeters", () => {
  assert.equal(parseInches("6'2\""), 74);
  assert.equal(parseInches("6\u20322\u2033"), 74);
  assert.equal(parseInches("97 in"), 97);
  assert.ok(Math.abs(parseInches("188 cm") - 74.0157) < .001);
});

test("invalid GPA, email and video links do not count toward a completed profile", () => {
  assert.ok(profileFieldIssue("gpaUW", "4.5"));
  assert.ok(profileFieldIssue("athleteEmail", "invalid"));
  assert.ok(profileFieldIssue("highlightVideo", "javascript:alert(1)"));
  assert.equal(profileFieldIssue("gpaWeighted", "4.5"), "");
  assert.equal(profileFieldIssue("highlightVideo", "https://example.com/highlights"), "");
});
