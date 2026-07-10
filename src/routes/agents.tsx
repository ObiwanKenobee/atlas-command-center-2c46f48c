import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Panel, Chip, Dot, ProgressBar } from "@/components/panel";

export const Route = createFileRoute("/agents")({
  head: () => ({
    meta: [
      { title: "Agent Hub — Atlas Sanctum" },
      { name: "description", content: "Specialized AI agents coordinating monitoring, restoration, governance, logistics, economics, knowledge, ethics and public health." },
      { property: "og:title", content: "Agent Hub — Atlas Sanctum" },
      { property: "og:description", content: "Coordinate specialized agents with confidence, evidence and suggested next steps." },
    ],
  }),
  component: AgentHub,
});

type Agent = {
  id: string; glyph: string; name: string; role: string; conf: number;
  status: "active" | "review" | "idle";
  tasks: string[]; evidence: string[]; next: string[];
};

const AGENTS: Agent[] = [
  { id: "sentinel", glyph: "🛡", name: "Sentinel", role: "Monitoring", conf: 0.94, status: "active",
    tasks: ["Scan satellite delta · pass 4/6", "Verify flood tile · Indus"],
    evidence: ["Sentinel-2 tile 34UEV", "MODIS thermal anomalies", "Ground sensor mesh 7"],
    next: ["Escalate Basin 07 signal to L2", "Request confirmation from Restoration"] },
  { id: "restoration", glyph: "🌱", name: "Restoration", role: "Planning", conf: 0.81, status: "active",
    tasks: ["Sequence Basin 07 phases", "Cost model v3"],
    evidence: ["Hydrology model H14", "Soil carbon dataset", "Community consultation notes"],
    next: ["Present phasing to Governance", "Reserve logistics window"] },
  { id: "governance", glyph: "🏛", name: "Governance", role: "Policy Analysis", conf: 0.72, status: "review",
    tasks: ["Review draft #A-19", "Assess constraint drift"],
    evidence: ["Precedent set 2019–2025", "Public feedback batch 41"],
    next: ["Request Ethics review", "Prepare operator brief"] },
  { id: "logistics", glyph: "📦", name: "Logistics", role: "Routing", conf: 0.88, status: "active",
    tasks: ["Reroute corridor B → C", "Estimate ETA envelope"],
    evidence: ["Weather forecast 72h", "Port congestion index"],
    next: ["Confirm reroute with operator", "Prepare fallback"] },
  { id: "economics", glyph: "💰", name: "Economics", role: "Resource Allocation", conf: 0.7, status: "active",
    tasks: ["Rebalance mission envelope", "Sensitivity sweep"],
    evidence: ["Budget ledger Q3", "Commodity index"],
    next: ["Draft reallocation memo"] },
  { id: "knowledge", glyph: "🧠", name: "Knowledge", role: "Memory", conf: 0.99, status: "active",
    tasks: ["Ingest IPCC WG2 delta", "Reconcile ontology"],
    evidence: ["Ontology diff 0.4.11", "Citation graph"],
    next: ["Publish updated summary"] },
  { id: "ethics", glyph: "⚖", name: "Ethics", role: "Constraint Review", conf: 0.66, status: "review",
    tasks: ["Review reroute impact", "Fairness audit"],
    evidence: ["Constraint set v7", "Impacted community registry"],
    next: ["Flag two concerns to operator"] },
  { id: "health", glyph: "🩺", name: "Health", role: "Public Health", conf: 0.78, status: "active",
    tasks: ["Vector surveillance", "Water quality"],
    evidence: ["Wastewater panel", "Clinic reports"],
    next: ["Coordinate with Restoration"] },
];

function AgentHub() {
  const [sel, setSel] = useState<Agent>(AGENTS[0]);
  return (
    <AppShell>
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
        <Panel title="Specialists" code="AGT" actions={<span className="mono text-[10px] text-muted-foreground">{AGENTS.length} online</span>}>
          <ul className="space-y-2">
            {AGENTS.map((a) => {
              const isSel = a.id === sel.id;
              return (
                <li key={a.id}>
                  <button
                    onClick={() => setSel(a)}
                    className={
                      "w-full text-left panel-inset p-3 flex items-start gap-3 transition-colors " +
                      (isSel ? "border-primary/60 glow-primary" : "hover:border-border-strong")
                    }
                  >
                    <span className="text-2xl leading-none">{a.glyph}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-sm">{a.name}</div>
                        <StatusChip s={a.status} />
                      </div>
                      <div className="text-[11px] text-muted-foreground">{a.role}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <ProgressBar value={a.conf * 100} tone={a.conf > 0.8 ? "ok" : "primary"} />
                        <span className="mono text-[10px] text-muted-foreground w-9 text-right">{Math.round(a.conf * 100)}%</span>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>

        <div className="space-y-4">
          <Panel
            title={`${sel.name} · ${sel.role}`}
            code={sel.id.toUpperCase()}
            actions={
              <div className="flex items-center gap-2">
                <StatusChip s={sel.status} />
                <Chip tone="primary">conf {Math.round(sel.conf * 100)}%</Chip>
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Column title="Current Tasks" items={sel.tasks} tone="primary" />
              <Column title="Supporting Evidence" items={sel.evidence} tone="muted" />
              <Column title="Suggested Next Steps" items={sel.next} tone="warn" />
            </div>
          </Panel>

          <Panel title="Recent Actions" code="LOG">
            <ol className="relative border-l border-border pl-4 space-y-4">
              {[
                { t: "Ingested new dataset", d: "12 min ago", by: "auto" },
                { t: "Escalated signal to operator", d: "38 min ago", by: sel.name },
                { t: "Refined model parameters", d: "1 h ago", by: sel.name },
                { t: "Coordinated with Restoration agent", d: "3 h ago", by: sel.name },
              ].map((e, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[19px] top-1 h-2 w-2 rounded-full bg-primary" />
                  <div className="flex items-center justify-between">
                    <div className="text-sm">{e.t}</div>
                    <div className="mono text-[10px] text-muted-foreground">{e.d}</div>
                  </div>
                  <div className="text-[11px] text-muted-foreground">by {e.by}</div>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}

function StatusChip({ s }: { s: Agent["status"] }) {
  if (s === "active") return <Chip tone="ok"><Dot tone="ok" /> active</Chip>;
  if (s === "review") return <Chip tone="warn"><Dot tone="warn" /> review</Chip>;
  return <Chip tone="muted">idle</Chip>;
}

function Column({ title, items, tone }: { title: string; items: string[]; tone: "primary" | "muted" | "warn" }) {
  return (
    <div className="panel-inset p-3">
      <div className="label-eyebrow mb-2">{title}</div>
      <ul className="space-y-2">
        {items.map((t, i) => (
          <li key={i} className="flex gap-2 text-sm">
            <Dot tone={tone} />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
