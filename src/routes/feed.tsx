import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Panel, Chip, Dot } from "@/components/panel";

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
      { title: "Intelligence Feed — Atlas Sanctum" },
      { name: "description", content: "A continuously updating stream of new data, detected anomalies, completed agent tasks, policy changes, environmental indicators and operator approvals." },
      { property: "og:title", content: "Intelligence Feed — Atlas Sanctum" },
      { property: "og:description", content: "Situational awareness across every subsystem in one stream." },
    ],
  }),
  component: Feed,
});

type Event = { time: string; kind: string; title: string; source: string; tone: "primary" | "warn" | "danger" | "ok" | "muted" };

const EVENTS: Event[] = [
  { time: "14:22", kind: "DATA", title: "Sentinel-2 tile 34UEV ingested", source: "Knowledge", tone: "primary" },
  { time: "14:20", kind: "ANOMALY", title: "Grid frequency drift · EU-N", source: "Energy · Sentinel", tone: "warn" },
  { time: "14:18", kind: "TASK", title: "Restoration completed Basin 07 phase-1 model", source: "Restoration", tone: "ok" },
  { time: "14:12", kind: "POLICY", title: "Draft #A-19 opened for review", source: "Governance", tone: "primary" },
  { time: "14:09", kind: "SIGNAL", title: "Vector surveillance flagged Region 4", source: "Health", tone: "danger" },
  { time: "14:03", kind: "APPROVED", title: "Operator approved reroute · Corridor B", source: "Logistics", tone: "ok" },
  { time: "13:57", kind: "DATA", title: "Wastewater panel updated · 12 clinics", source: "Health", tone: "primary" },
  { time: "13:41", kind: "DECISION", title: "Grid upgrade deferred · Zone 4", source: "Economics", tone: "muted" },
  { time: "13:30", kind: "ANOMALY", title: "Reservoir capacity nearing floor", source: "Infrastructure", tone: "warn" },
  { time: "13:18", kind: "SIGNAL", title: "Escalated Basin 07 to L2", source: "Sentinel", tone: "warn" },
  { time: "12:55", kind: "APPROVED", title: "Ratified restoration plan v3", source: "Governance", tone: "ok" },
  { time: "12:40", kind: "DATA", title: "MODIS thermal anomalies · pass 3/6", source: "Sentinel", tone: "primary" },
];

const FILTERS = ["All", "Data", "Anomaly", "Task", "Policy", "Signal", "Approved", "Decision"];

function Feed() {
  const [filter, setFilter] = useState("All");
  const items = filter === "All" ? EVENTS : EVENTS.filter((e) => e.kind.toLowerCase() === filter.toLowerCase());
  return (
    <AppShell>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <Panel title="Intelligence Stream" code="INT"
          actions={
            <div className="flex flex-wrap gap-1">
              {FILTERS.map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={"mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm border " +
                    (filter === f ? "border-primary/60 text-primary bg-primary/10" : "border-border hover:border-border-strong")}>
                  {f}
                </button>
              ))}
            </div>
          }>
          <ol className="relative">
            {items.map((e, i) => (
              <li key={i} className="grid grid-cols-[60px_16px_1fr_auto] items-start gap-3 py-2 border-b border-border last:border-b-0">
                <span className="mono text-[11px] text-muted-foreground pt-1">{e.time}</span>
                <span className="pt-1"><Dot tone={e.tone} /></span>
                <div className="min-w-0">
                  <div className="text-sm">{e.title}</div>
                  <div className="mono text-[10px] text-muted-foreground">{e.source}</div>
                </div>
                <Chip tone={e.tone}>{e.kind}</Chip>
              </li>
            ))}
          </ol>
        </Panel>

        <div className="space-y-4">
          <Panel title="Stream Vitals" code="VIT">
            <div className="space-y-2 text-sm">
              <Row label="Events / min" value="34" />
              <Row label="Anomalies · 1h" value="6" tone="warn" />
              <Row label="Tasks completed · 1h" value="21" tone="ok" />
              <Row label="Approvals pending" value="2" tone="primary" />
            </div>
          </Panel>

          <Panel title="Subscriptions" code="SUB">
            <ul className="text-sm space-y-2">
              {["Basin 07 signals", "Grid frequency EU-N", "Policy #A-19", "Restoration missions"].map((s) => (
                <li key={s} className="flex items-center justify-between">
                  <span>{s}</span>
                  <span className="mono text-[10px] text-primary">ON</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "primary" | "warn" | "ok" }) {
  const t = tone === "warn" ? "text-accent" : tone === "ok" ? "text-ok" : tone === "primary" ? "text-primary" : "";
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={"mono " + t}>{value}</span>
    </div>
  );
}
