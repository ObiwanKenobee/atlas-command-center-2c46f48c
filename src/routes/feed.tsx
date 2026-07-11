import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Panel, Chip, Dot } from "@/components/panel";
import { useLiveEvents, useLiveStatus } from "@/lib/live-store";

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
  const [source, setSource] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [autoscroll, setAutoscroll] = useState(true);
  const events = useLiveEvents();
  const status = useLiveStatus();

  const sources = useMemo(() => {
    const set = new Set<string>();
    for (const e of events) set.add(e.source);
    return ["All", ...[...set].sort()];
  }, [events]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => {
      if (filter !== "All" && e.kind.toLowerCase() !== filter.toLowerCase()) return false;
      if (source !== "All" && e.source !== source) return false;
      if (q && !`${e.title} ${e.source} ${e.kind}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [events, filter, source, query]);

  const anomalies = events.filter((e) => e.kind === "ANOMALY").length;
  const tasks = events.filter((e) => e.kind === "TASK").length;
  const approvals = events.filter((e) => e.kind === "APPROVED").length;

  const statusBadge =
    status === "live" ? { cls: "bg-ok", text: "text-ok/80", label: "WS · LIVE" } :
    status === "connecting" ? { cls: "bg-primary", text: "text-primary/80", label: "WS · CONNECTING" } :
    status === "simulated" ? { cls: "bg-accent", text: "text-accent/80", label: "WS · SIM" } :
    status === "error" ? { cls: "bg-danger", text: "text-danger/80", label: "WS · RETRY" } :
    { cls: "bg-border-strong", text: "text-muted-foreground", label: "WS · IDLE" };

  return (
    <AppShell>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <Panel title="Intelligence Stream" code="INT"
          actions={
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className={"absolute inset-0 rounded-full animate-ping opacity-60 " + statusBadge.cls} />
                  <span className={"relative h-1.5 w-1.5 rounded-full " + statusBadge.cls} />
                </span>
                <span className={"mono text-[10px] uppercase " + statusBadge.text}>{statusBadge.label}</span>
              </span>
              <label className="mono text-[10px] uppercase text-muted-foreground flex items-center gap-1 cursor-pointer">
                <input type="checkbox" checked={autoscroll} onChange={(e) => setAutoscroll(e.target.checked)} className="accent-primary" />
                auto
              </label>
            </div>
          }>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events, sources, kinds…"
                className="w-full panel-inset px-2.5 py-1.5 text-sm bg-transparent outline-none focus:border-primary/60"
              />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 mono text-[10px] text-muted-foreground hover:text-foreground">×</button>
              )}
            </div>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="panel-inset px-2 py-1.5 text-[12px] bg-transparent outline-none focus:border-primary/60"
            >
              {sources.map((s) => <option key={s} value={s} className="bg-panel">{s}</option>)}
            </select>
          </div>
          <div className="mb-3 flex flex-wrap gap-1">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={"mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm border " +
                  (filter === f ? "border-primary/60 text-primary bg-primary/10" : "border-border hover:border-border-strong")}>
                {f}
              </button>
            ))}
          </div>
          <div className="mono text-[10px] text-muted-foreground mb-2">
            {items.length} of {events.length} events
            {(filter !== "All" || source !== "All" || query) && (
              <button onClick={() => { setFilter("All"); setSource("All"); setQuery(""); }}
                className="ml-2 text-primary hover:underline">clear filters</button>
            )}
          </div>
          <ol className={"relative " + (autoscroll ? "" : "max-h-[60vh] overflow-y-auto")}>
            {items.length === 0 && (
              <li className="panel-inset p-6 text-center text-sm text-muted-foreground">
                No events match. Adjust filters or wait for the next uplink packet.
              </li>
            )}
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
