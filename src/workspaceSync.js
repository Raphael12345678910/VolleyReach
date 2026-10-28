import { useCallback, useEffect, useRef, useState } from "react";
import { parseProgressBackup } from "./storage";

export function normalizeWorkspace(data, defaults) {
  return parseProgressBackup(JSON.stringify({ app: "VolleyReach", version: 1, data }), defaults);
}

export async function fetchWorkspace(client, userId) {
  const { data, error } = await client.from("athlete_workspaces").select("data,revision").eq("user_id", userId).maybeSingle().abortSignal(AbortSignal.timeout(12000));
  if (error) throw error;
  return data;
}

export async function commitWorkspace(client, data, revision) {
  const { data: result, error } = await client.rpc("save_workspace", { workspace_data: data, expected_revision: revision }).abortSignal(AbortSignal.timeout(12000));
  if (error) throw error;
  if (!Number.isSafeInteger(result?.revision)) throw new Error("Unexpected save response");
  return result.revision;
}

export function useWorkspaceSync({ client, userId, enabled, progress, apply, defaults }) {
  const [status, setStatus] = useState(enabled ? "loading" : "local");
  const [conflict, setConflict] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const state = useRef({ alive: true, ready: false, busy: false, revision: 0, synced: "", latest: progress, pending: false });
  const applyRef = useRef(apply);
  applyRef.current = apply;
  const defaultsRef = useRef(defaults);
  const metadataKey = `vr-account-${userId}-sync`;
  const checkpoint = useCallback((data, revision, pending) => {
    try { localStorage.setItem(metadataKey, JSON.stringify({ data, revision, pending })); } catch { /* Main workspace saving reports storage failures separately. */ }
  }, [metadataKey]);
  const flushRef = useRef(null);

  const flush = useCallback(async () => {
    const current = state.current;
    if (!enabled || !current.ready || current.busy) return !current.pending;
    if (!current.pending) return true;
    current.busy = true;
    setStatus("saving");
    try {
      while (current.pending && current.alive && current.ready) {
        const snapshot = current.latest;
        const encoded = JSON.stringify(snapshot);
        const revision = await commitWorkspace(client, snapshot, current.revision);
        current.revision = revision;
        current.synced = encoded;
        current.pending = JSON.stringify(current.latest) !== encoded;
        checkpoint(current.latest, revision, current.pending);
        if (!current.alive) return false;
      }
      if (current.alive) setStatus("saved");
      return true;
    } catch (error) {
      if (!current.alive) return false;
      if (error.code === "40001") {
        try {
          const remote = await fetchWorkspace(client, userId);
          if (!current.alive) return false;
          current.ready = false;
          setConflict(remote || { revision: 0, data: defaultsRef.current });
          setStatus("conflict");
        } catch { setStatus("error"); }
      } else setStatus("error");
      return false;
    } finally { current.busy = false; }
  }, [enabled, client, userId, checkpoint]);
  flushRef.current = flush;

  useEffect(() => {
    if (!enabled) return;
    const current = state.current;
    current.alive = true;
    current.ready = false;
    let cancelled = false;
    setStatus("loading");
    fetchWorkspace(client, userId).then((remote) => {
      if (cancelled) return;
      let checkpointData;
      try { checkpointData = JSON.parse(localStorage.getItem(metadataKey)); } catch { /* No recoverable checkpoint. */ }
      const revision = remote?.revision || 0;
      const cloud = remote ? normalizeWorkspace(remote.data, defaultsRef.current) : defaultsRef.current;
      // Field saves can succeed even if the larger recovery checkpoint cannot fit.
      const local = JSON.stringify(current.latest);
      const checkpointChanged = checkpointData && local !== JSON.stringify(normalizeWorkspace(checkpointData.data, defaultsRef.current));
      const orphanedCopy = !checkpointData && local !== JSON.stringify(defaultsRef.current) && local !== JSON.stringify(cloud);
      if (checkpointChanged || orphanedCopy) checkpointData = { data: current.latest, revision: checkpointData?.revision || 0, pending: true };
      if (checkpointData?.pending && checkpointData.revision !== revision) {
        current.latest = normalizeWorkspace(checkpointData.data, defaultsRef.current);
        current.pending = true;
        applyRef.current(current.latest);
        setConflict(remote || { revision: 0, data: cloud });
        setStatus("conflict");
        return;
      }
      const restored = checkpointData?.pending ? normalizeWorkspace(checkpointData.data, defaultsRef.current) : cloud;
      current.revision = revision;
      current.latest = restored;
      current.synced = JSON.stringify(restored);
      current.pending = Boolean(checkpointData?.pending);
      applyRef.current(restored);
      current.ready = true;
      checkpoint(restored, revision, current.pending);
      setStatus(current.pending ? "saving" : "saved");
      if (current.pending) window.setTimeout(() => flushRef.current(), 0);
    }).catch(() => { if (!cancelled) setStatus("load-error"); });
    return () => { cancelled = true; current.alive = false; current.ready = false; };
  }, [enabled, client, userId, metadataKey, checkpoint, attempt]);

  const encoded = JSON.stringify(progress);
  useEffect(() => {
    const current = state.current;
    if (!enabled || !current.ready || encoded === current.synced) return;
    current.latest = progress;
    current.pending = true;
    checkpoint(progress, current.revision, true);
    setStatus("saving");
    const timer = window.setTimeout(() => flushRef.current(), 650);
    return () => window.clearTimeout(timer);
  }, [enabled, encoded, checkpoint]);

  useEffect(() => {
    if (!enabled) return;
    const retry = () => flushRef.current();
    const preventLoss = (event) => { if (state.current.pending) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("online", retry);
    window.addEventListener("beforeunload", preventLoss);
    return () => { window.removeEventListener("online", retry); window.removeEventListener("beforeunload", preventLoss); };
  }, [enabled]);

  const resolve = (useLocal) => {
    if (!conflict) return;
    const current = state.current;
    const chosen = useLocal ? current.latest : normalizeWorkspace(conflict.data, defaultsRef.current);
    current.revision = conflict.revision;
    current.latest = chosen;
    current.synced = JSON.stringify(chosen);
    current.pending = useLocal;
    applyRef.current(chosen);
    checkpoint(chosen, current.revision, useLocal);
    current.ready = true;
    setConflict(null);
    setStatus(useLocal ? "saving" : "saved");
    if (useLocal) window.setTimeout(() => flushRef.current(), 0);
  };
  const erase = async () => {
    if (!(await flush())) return false;
    const current = state.current;
    current.ready = false;
    try {
      const { data, error } = await client.from("athlete_workspaces").delete().eq("user_id", userId).eq("revision", current.revision).select("user_id");
      if (error || (current.revision > 0 && !data?.length)) { current.ready = true; return false; }
      current.latest = defaultsRef.current;
      current.revision = 0;
      current.synced = JSON.stringify(current.latest);
      current.pending = false;
      applyRef.current(current.latest);
      checkpoint(current.latest, 0, false);
      current.ready = true;
      setStatus("saved");
      return true;
    } catch { current.ready = true; return false; }
  };
  return { status, conflict, flush, resolve, erase, retry: () => setAttempt((value) => value + 1) };
}
