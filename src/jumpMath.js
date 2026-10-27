const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function calculateJumpMeasurement(markers, referenceHeight, frame = {}) {
  const required = ["floor", "referenceLeft", "referenceRight", "standing", "peak"];
  if (required.some((key) => !markers[key])) return null;

  const left = markers.referenceLeft;
  const right = markers.referenceRight;
  const horizontalRun = right.x - left.x;
  if (Math.abs(horizontalRun) < 0.025) return null;

  const slope = (right.y - left.y) / horizontalRun;
  const referenceAtFloor = left.y + slope * (markers.floor.x - left.x);
  const referenceSpan = markers.floor.y - referenceAtFloor;
  if (referenceSpan < 0.08) return null;

  const correctForRoll = (point) => point.y - slope * (point.x - markers.floor.x);
  const inchesPerUnit = referenceHeight / referenceSpan;
  const standingTouch = (markers.floor.y - correctForRoll(markers.standing)) * inchesPerUnit;
  const peakTouch = (markers.floor.y - correctForRoll(markers.peak)) * inchesPerUnit;
  const vertical = peakTouch - standingTouch;

  const width = frame.width || 16;
  const height = frame.height || 9;
  const tiltDegrees = Math.abs(Math.atan2((right.y - left.y) * height, horizontalRun * width) * 180 / Math.PI);
  const referenceSeparation = Math.abs(horizontalRun);
  const spanPixels = referenceSpan * (frame.height || 720);
  const insideReference = markers.floor.x >= Math.min(left.x, right.x) - 0.04 && markers.floor.x <= Math.max(left.x, right.x) + 0.04;

  return {
    standingTouch,
    peakTouch,
    vertical,
    tiltDegrees,
    referenceSeparation,
    spanPixels,
    insideReference,
    validRange: vertical >= 5 && vertical <= 55 && standingTouch >= 55 && standingTouch <= 125 && peakTouch > standingTouch
  };
}

export function evaluateJumpSetup(measurement, setup, fps) {
  if (!measurement) return { score: 0, label: "Not ready", risk: "high", warnings: ["Place all five markers to check the setup."] };

  let score = 20;
  const warnings = [];
  if (setup.cameraStill) score += 15;
  else warnings.push("The phone moved between the standing reach and jump frames.");
  if (setup.squareCamera) score += 15;
  else warnings.push("Record straight toward the measurement plane, not from a side angle.");
  if (setup.samePlane) score += 20;
  else warnings.push("A single camera cannot correct depth when the athlete and reference are different distances away.");
  if (setup.fullBody) score += 10;
  else warnings.push("Keep the feet, fingertips, and full reference visible.");
  if (Number(fps) >= 60) score += 5;
  else warnings.push("60 fps or higher makes the peak frame easier to select.");
  if (measurement.referenceSeparation >= 0.28) score += 5;
  else warnings.push("Move the two reference points farther apart for a stronger tilt correction.");
  if (measurement.spanPixels >= 240) score += 5;
  else if (measurement.spanPixels >= 150) score += 3;
  else warnings.push("Move closer so the known height covers more of the video frame.");
  if (measurement.tiltDegrees <= 2) score += 5;
  else if (measurement.tiltDegrees <= 5) score += 2;
  else warnings.push("The reference is heavily tilted. Re-record with the phone level if possible.");
  if (!measurement.insideReference) warnings.push("Keep the athlete between, or very close to, the two calibration points.");
  if (!measurement.validRange) warnings.push("The result is outside a typical range. Recheck the standing and peak fingertip markers.");

  score = clamp(score, 0, 100);
  const risk = score >= 85 && measurement.validRange ? "low" : score >= 65 && measurement.validRange ? "medium" : "high";
  return { score, label: risk === "low" ? "Strong setup" : risk === "medium" ? "Usable setup" : "Retake recommended", risk, warnings };
}
