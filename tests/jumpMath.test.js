import test from "node:test";
import assert from "node:assert/strict";
import { calculateJumpMeasurement, evaluateJumpSetup, summarizeJumpTrials } from "../src/jumpMath.js";

const markers = {
  floor: { x: .5, y: .9 },
  referenceLeft: { x: .2, y: .4 },
  referenceRight: { x: .8, y: .4 },
  standing: { x: .5, y: .4 },
  peak: { x: .5, y: .25 }
};
const setup = { samePlane: true, cameraStill: true, squareCamera: true, fullBody: true };

test("known-height calibration yields a 30-inch vertical and consistent touch heights", () => {
  const result = calculateJumpMeasurement(markers, 100, { width: 1280, height: 720 });
  assert.equal(result.standingTouch, 100);
  assert.equal(result.peakTouch, 130);
  assert.equal(result.vertical, 30);
});

test("camera-roll correction is invariant to which reference endpoint was placed first", () => {
  const slope = .12;
  const tilted = Object.fromEntries(Object.entries(markers).map(([key, point]) => [key, { x: point.x, y: point.y + slope * (point.x - .5) }]));
  tilted.peak = { x: .65, y: .25 + slope * .15 };
  const result = calculateJumpMeasurement(tilted, 100, { width: 1280, height: 720 });
  const reversed = calculateJumpMeasurement({ ...tilted, referenceLeft: tilted.referenceRight, referenceRight: tilted.referenceLeft }, 100, { width: 1280, height: 720 });
  assert.ok(Math.abs(result.vertical - 30) < 1e-8);
  assert.equal(result.tiltDegrees, reversed.tiltDegrees);
  assert.equal(result.vertical, reversed.vertical);
});

test("missing or degenerate calibration cannot produce an estimate", () => {
  assert.equal(calculateJumpMeasurement({}, 100), null);
  assert.equal(calculateJumpMeasurement({ ...markers, referenceRight: markers.referenceLeft }, 100), null);
  assert.equal(calculateJumpMeasurement(markers, NaN), null);
});

test("unconfirmed depth or moving camera cannot get a strong quality score", () => {
  const result = calculateJumpMeasurement(markers, 100, { width: 1280, height: 720 });
  for (const key of ["samePlane", "squareCamera", "cameraStill"]) {
    const quality = evaluateJumpSetup(result, { ...setup, [key]: false }, 60);
    assert.equal(quality.risk, "high");
    assert.ok(quality.score < 60);
  }
});

test("repeated-trial medians preserve vertical = approach touch minus standing reach", () => {
  const result = summarizeJumpTrials([{ vertical: 30, stand: 97 }, { vertical: 40, stand: 98 }, { vertical: 32, stand: 99 }]);
  assert.deepEqual(result, { vertical: 32, stand: 98, peak: 130 });
});
