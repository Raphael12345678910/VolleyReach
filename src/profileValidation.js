export function parseInches(value) {
  const text = String(value || "").trim().toLowerCase().replaceAll("\u2032", "'").replaceAll("\u2033", '"');
  const feet = text.match(/^(\d+)\s*(?:'|ft|feet)\s*(\d+(?:\.\d+)?)?\s*(?:"|in|inches)?$/);
  if (feet) return Number(feet[1]) * 12 + Number(feet[2] || 0);
  const inches = text.match(/^(\d+(?:\.\d+)?)\s*("|in|inches|cm)?$/);
  return inches ? Number(inches[1]) / (inches[2] === "cm" ? 2.54 : 1) : NaN;
}

export function profileFieldIssue(key, value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (["athleteEmail", "coachEmail"].includes(key) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return "Enter a complete email address.";
  if (key === "gradYear" && (!/^\d{4}$/.test(text) || Number(text) < 2020 || Number(text) > new Date().getFullYear() + 10)) return "Enter a four-digit graduation year.";
  if (["gpaUW", "gpaWeighted"].includes(key) && (!/^\d(?:\.\d+)?$/.test(text) || Number(text) > (key === "gpaUW" ? 4 : 6))) return `Enter a GPA from 0 to ${key === "gpaUW" ? 4 : 6}.`;
  if (key === "jersey" && !/^\d{1,3}$/.test(text)) return "Enter your jersey number, such as 11.";
  const ranges = { height: [36, 100], vertical: [1, 65], standingReach: [40, 140], approachTouch: [50, 180] };
  if (ranges[key]) {
    const inches = parseInches(text);
    if (!Number.isFinite(inches) || inches < ranges[key][0] || inches > ranges[key][1]) return key === "height" ? 'Use feet and inches (6\'2"), inches (74 in), or centimeters (188 cm).' : `Enter a measurement from ${ranges[key][0]} to ${ranges[key][1]} inches.`;
  }
  if (["highlightVideo", "universityProfile", "fullMatchVideo"].includes(key)) {
    try { if (!["https:", "http:"].includes(new URL(text).protocol)) return "Use a full link beginning with https://."; }
    catch { return "Use a full link beginning with https://."; }
  }
  return "";
}
