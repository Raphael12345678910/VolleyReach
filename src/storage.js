import { useCallback, useEffect, useRef, useState } from "react";

const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const statuses = new Set(["Saved", "Researching", "Drafting", "Sent", "Followed up", "Replied", "Closed"]);

export function normalizeOutreach(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value.filter((item) => {
    if (!isRecord(item) || typeof item.schoolId !== "string" || !item.schoolId || seen.has(item.schoolId)) return false;
    seen.add(item.schoolId);
    return true;
  }).slice(0, 1000).map((item) => ({
    schoolId: item.schoolId,
    status: statuses.has(item.status) ? item.status : "Saved",
    sent: Number.isFinite(Number(item.sent)) ? Math.min(100000, Math.max(0, Math.floor(Number(item.sent)))) : 0,
    followup: typeof item.followup === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item.followup) ? item.followup : "",
    lastSent: typeof item.lastSent === "string" ? item.lastSent : "",
    sentHistory: Array.isArray(item.sentHistory) ? item.sentHistory.filter(isRecord).slice(-100).map((entry) => ({
      sent: Number.isFinite(Number(entry.sent)) ? Math.max(0, Math.floor(Number(entry.sent))) : 0,
      status: statuses.has(entry.status) ? entry.status : "Saved",
      lastSent: typeof entry.lastSent === "string" ? entry.lastSent : ""
    })) : []
  }));
}

export function normalizeStoredValue(value, fallback) {
  if (Array.isArray(fallback)) {
    if (!Array.isArray(value)) return fallback;
    return value.filter(isRecord).slice(0, 1000).map((item) => fallback[0] ? normalizeStoredValue(item, fallback[0]) : item);
  }
  if (isRecord(fallback)) {
    if (!isRecord(value)) return fallback;
    if (!Object.keys(fallback).length) return Object.fromEntries(Object.entries(value).filter(([, item]) => typeof item === "string" || typeof item === "number"));
    return Object.fromEntries(Object.entries(fallback).map(([key, defaultValue]) => [key, normalizeStoredValue(value[key], defaultValue)]));
  }
  return typeof value === typeof fallback ? value : fallback;
}

function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    return key.endsWith("outreach") ? normalizeOutreach(parsed) : normalizeStoredValue(parsed, fallback);
  } catch {
    return fallback;
  }
}

export function persistValue(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("vr-storage-status", { detail: { key, saved: true } }));
    return true;
  } catch {
    window.dispatchEvent(new CustomEvent("vr-storage-status", { detail: { key, saved: false } }));
    return false;
  }
}

export function useStoredState(key, fallback) {
  const defaults = useRef(fallback);
  const [value, setValue] = useState(() => read(key, fallback));
  const latest = useRef(value);

  const update = useCallback((action) => {
    const next = typeof action === "function" ? action(latest.current) : action;
    latest.current = next;
    setValue(next);
    persistValue(key, next);
  }, [key]);

  useEffect(() => {
    const receive = (event) => {
      if (event.storageArea !== window.localStorage || (event.key !== key && event.key !== null)) return;
      const next = read(key, defaults.current);
      latest.current = next;
      setValue(next);
    };
    window.addEventListener("storage", receive);
    return () => window.removeEventListener("storage", receive);
  }, [key]);

  return [value, update];
}

export function parseProgressBackup(raw, defaults) {
  const backup = JSON.parse(raw);
  if (!isRecord(backup) || backup.app !== "VolleyReach" || backup.version !== 1 || !isRecord(backup.data) || !isRecord(backup.data.profile) || !Array.isArray(backup.data.saved)) {
    throw new Error("Choose a VolleyReach progress backup (.json).");
  }
  return Object.fromEntries(Object.entries(defaults).map(([key, fallback]) => [key, key === "saved" ? normalizeOutreach(backup.data[key]) : normalizeStoredValue(backup.data[key], fallback)]));
}
