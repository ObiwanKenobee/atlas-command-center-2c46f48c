import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Panel, Chip, Dot } from "@/components/panel";
import { useLiveEvents } from "@/lib/live-store";

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

const FILTERS = ["All", "Data", "Anomaly", "Task", "Policy", "Signal", "Approved", "Decision", "Rejected"];

function Feed() {
  const [filter, setFilter] = useState("All");
  const events = useLiveEvents();
  const items = filter === "All" ? events : events.filter((e) => e.kind.toLowerCase() === filter.toLowerCase());
  const anomalies = events.filter((e) => e.kind === "ANOMALY").length;
  const tasks = events.filter((e) => e.kind === "TASK").length;
  const approvals = events.filter((e) => e.kind === "APPROVED").length;

  return (
    <AppShell>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <Panel title="Intelligence Stream" code="INT"
          actions={
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inset-0 rounded-full bg-ok animate-ping opacity-60" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-ok" />
                </span>
                <span className="mono text-[10px] uppercase text-ok/80">WS · LIVE</span>
              </span>
              <div className="flex flex-wrap gap-1">
                {FILTERS.map((f) => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={"mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm border " +
                      (filter === f ? "border-primary/60 text-primary bg-primary/10" : "border-border hover:border-border-strong")}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          }>
          <ol className="relative">
            {items.map((e) => (
              <li key={e.id} className="grid grid-cols-[60px_16px_1fr_auto] items-start gap-3 py-2 border-b border-border last:border-b-0 animate-in fade-in slide-in-from-top-1 duration-500">
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
              <Row label="Events buffered" value={String(events.length)} />
              <Row label="Anomalies" value={String(anomalies)} tone="warn" />
              <Row label="Tasks completed" value={String(tasks)} tone="ok" />
              <Row label="Approvals" value={String(approvals)} tone="primary" />
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
