// Simulated WebSocket bus for HUD-wide live data.
// Uses useSyncExternalStore for React subscriptions; safe on SSR.
import { useSyncExternalStore } from "react";

export type Tone = "primary" | "warn" | "danger" | "ok" | "muted";

export type LiveEvent = {
  id: string;
  time: string;
  kind: string;
  title: string;
  source: string;
  tone: Tone;
};

export type AuditEntry = {
  id: string;
  t: string;
  who: string;
  act: string;
  tgt: string;
};

const SEED_EVENTS: LiveEvent[] = [
  { id: "s1", time: "14:22", kind: "DATA", title: "Sentinel-2 tile 34UEV ingested", source: "Knowledge", tone: "primary" },
  { id: "s2", time: "14:20", kind: "ANOMALY", title: "Grid frequency drift · EU-N", source: "Energy · Sentinel", tone: "warn" },
  { id: "s3", time: "14:18", kind: "TASK", title: "Restoration completed Basin 07 phase-1 model", source: "Restoration", tone: "ok" },
  { id: "s4", time: "14:12", kind: "POLICY", title: "Draft #A-19 opened for review", source: "Governance", tone: "primary" },
  { id: "s5", time: "14:09", kind: "SIGNAL", title: "Vector surveillance flagged Region 4", source: "Health", tone: "danger" },
  { id: "s6", time: "14:03", kind: "APPROVED", title: "Operator approved reroute · Corridor B", source: "Logistics", tone: "ok" },
  { id: "s7", time: "13:57", kind: "DATA", title: "Wastewater panel updated · 12 clinics", source: "Health", tone: "primary" },
  { id: "s8", time: "13:41", kind: "DECISION", title: "Grid upgrade deferred · Zone 4", source: "Economics", tone: "muted" },
];

const SEED_AUDIT: AuditEntry[] = [
  { id: "a1", t: "14:22:07", who: "OP", act: "approved", tgt: "Reroute · Corridor B" },
  { id: "a2", t: "14:12:44", who: "SYS", act: "ingested", tgt: "Sentinel-2 tile 34UEV" },
  { id: "a3", t: "13:41:02", who: "OP", act: "deferred", tgt: "Grid upgrade · Zone 4" },
  { id: "a4", t: "13:18:38", who: "AGT · Sentinel", act: "escalated", tgt: "Basin 07 signal → L2" },
  { id: "a5", t: "12:55:11", who: "OP", act: "ratified", tgt: "Restoration plan v3" },
  { id: "a6", t: "12:04:20", who: "AGT · Ethics", act: "flagged", tgt: "Constraint drift · #A-19" },
];

let events: LiveEvent[] = SEED_EVENTS;
let audit: AuditEntry[] = SEED_AUDIT;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function uid() {
  return Math.random().toString(36).slice(2, 10);
}
function hhmm(d = new Date()) {
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}
function hhmmss(d = new Date()) {
  return `${hhmm(d)}:${String(d.getUTCSeconds()).padStart(2, "0")}`;
}

export const liveStore = {
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  getEvents: () => events,
  getAudit: () => audit,
  pushEvent(e: Omit<LiveEvent, "id" | "time"> & { time?: string }) {
    events = [{ id: uid(), time: e.time ?? hhmm(), ...e }, ...events].slice(0, 200);
    emit();
  },
  pushAudit(a: Omit<AuditEntry, "id" | "t"> & { t?: string }) {
    audit = [{ id: uid(), t: a.t ?? hhmmss(), ...a }, ...audit].slice(0, 200);
    emit();
  },
};

// Simulated WebSocket stream — client only.
const STREAM: Array<Omit<LiveEvent, "id" | "time">> = [
  { kind: "DATA", title: "MODIS thermal anomaly · pass 4/6", source: "Sentinel", tone: "primary" },
  { kind: "TASK", title: "Logistics computed reroute envelope", source: "Logistics", tone: "ok" },
  { kind: "SIGNAL", title: "Reservoir capacity nearing floor · Basin 07", source: "Infrastructure", tone: "warn" },
  { kind: "ANOMALY", title: "Wildfire cluster · Iberia re-ignition", source: "Sentinel", tone: "danger" },
  { kind: "DATA", title: "Wastewater panel updated · Region 4", source: "Health", tone: "primary" },
  { kind: "TASK", title: "Knowledge reconciled ontology diff 0.4.12", source: "Knowledge", tone: "ok" },
  { kind: "POLICY", title: "Ethics review appended to #A-19", source: "Ethics", tone: "primary" },
  { kind: "SIGNAL", title: "Vector surveillance escalated · Region 4", source: "Health", tone: "danger" },
  { kind: "DATA", title: "Grid frequency EU-N · 49.99 Hz", source: "Energy", tone: "primary" },
  { kind: "TASK", title: "Sentinel confirmed flood tile · Indus", source: "Sentinel", tone: "ok" },
];

export type LiveStatus = "idle" | "connecting" | "live" | "simulated" | "error";
let status: LiveStatus = "idle";
export const getLiveStatus = () => status;
function setStatus(s: LiveStatus) { status = s; emit(); }

let started = false;
let simTimeout: number | undefined;
let simInterval: number | undefined;
let ws: WebSocket | undefined;
let reconnectTimer: number | undefined;
let reconnectAttempt = 0;

function startSimulator() {
  if (simInterval) return;
  setStatus("simulated");
  const tick = () => {
    const e = STREAM[Math.floor(Math.random() * STREAM.length)];
    liveStore.pushEvent(e);
  };
  simTimeout = window.setTimeout(tick, 2500);
  simInterval = window.setInterval(tick, 6000);
}
function stopSimulator() {
  if (simTimeout) { window.clearTimeout(simTimeout); simTimeout = undefined; }
  if (simInterval) { window.clearInterval(simInterval); simInterval = undefined; }
}

function connectWs(url: string) {
  setStatus("connecting");
  try {
    ws = new WebSocket(url);
  } catch {
    setStatus("error");
    startSimulator();
    return;
  }
  ws.addEventListener("open", () => {
    reconnectAttempt = 0;
    stopSimulator();
    setStatus("live");
  });
  ws.addEventListener("message", (ev) => {
    try {
      const msg = JSON.parse(typeof ev.data === "string" ? ev.data : "");
      if (msg && typeof msg === "object" && "title" in msg && "kind" in msg) {
        liveStore.pushEvent({
          kind: String(msg.kind),
          title: String(msg.title),
          source: String(msg.source ?? "uplink"),
          tone: (msg.tone ?? "primary") as Tone,
          time: msg.time,
        });
      }
    } catch { /* ignore malformed frames */ }
  });
  ws.addEventListener("close", () => {
    setStatus("error");
    // Exponential backoff up to 30s, then fall back to simulator meanwhile.
    startSimulator();
    reconnectAttempt = Math.min(reconnectAttempt + 1, 6);
    const delay = Math.min(30_000, 1000 * 2 ** reconnectAttempt);
    reconnectTimer = window.setTimeout(() => connectWs(url), delay);
  });
  ws.addEventListener("error", () => { try { ws?.close(); } catch { /* noop */ } });
}

export function startLiveStream() {
  if (started || typeof window === "undefined") return;
  started = true;
  const url = (import.meta.env.VITE_SANCTUM_WS_URL as string | undefined)?.trim();
  if (url) connectWs(url);
  else startSimulator();
}

export function stopLiveStream() {
  stopSimulator();
  if (reconnectTimer) window.clearTimeout(reconnectTimer);
  try { ws?.close(); } catch { /* noop */ }
  ws = undefined;
  started = false;
  setStatus("idle");
}

export function useLiveStatus(): LiveStatus {
  return useSyncExternalStore(liveStore.subscribe, getLiveStatus, getLiveStatus);
}


export function useLiveEvents(): LiveEvent[] {
  return useSyncExternalStore(liveStore.subscribe, liveStore.getEvents, liveStore.getEvents);
}
export function useLiveAudit(): AuditEntry[] {
  return useSyncExternalStore(liveStore.subscribe, liveStore.getAudit, liveStore.getAudit);
}
