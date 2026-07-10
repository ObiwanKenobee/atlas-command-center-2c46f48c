import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Panel, Chip, Dot, ProgressBar, Metric } from "@/components/panel";

export const Route = createFileRoute("/missions")({
  head: () => ({
    meta: [
      { title: "Mission Workspace — Atlas Sanctum" },
      { name: "description", content: "Plan, execute and track initiatives. Each mission surfaces progress, risks, stakeholders, budget and AI recommendations." },
      { property: "og:title", content: "Mission Workspace — Atlas Sanctum" },
      { property: "og:description", content: "Coordinate missions with AI-summarized progress and proposed actions." },
    ],
  }),
  component: Missions,
});

type Mission = {
  id: string; name: string; pct: number; risks: number; budget: string;
  stakeholders: number; recommendation: string; status: "active" | "planning" | "review";
  blockers: string[]; milestones: { t: string; done: boolean }[];
};

const MISSIONS: Mission[] = [
  { id: "m1", name: "Restore Watershed 07", pct: 68, risks: 2, budget: "Available", stakeholders: 12,
    recommendation: "Expand restoration upstream to lock in dry-season yield.", status: "active",
    blockers: ["Awaiting land-use approval, Zone 3", "Sensor calibration pending"],
    milestones: [
      { t: "Baseline survey", done: true },
      { t: "Phase 1 planting", done: true },
      { t: "Sensor mesh v2", done: false },
      { t: "Community MOU", done: false },
    ]},
  { id: "m2", name: "Coastal Resilience · Delta B", pct: 41, risks: 4, budget: "Constrained", stakeholders: 21,
    recommendation: "Defer breakwater section; prioritize mangrove corridor first.", status: "planning",
    blockers: ["Cost overrun estimate", "Ethics review open"],
    milestones: [{ t: "Bathymetry", done: true }, { t: "Design v2", done: true }, { t: "Permit", done: false }] },
  { id: "m3", name: "Grid Balancing · Iberia", pct: 82, risks: 1, budget: "Available", stakeholders: 6,
    recommendation: "Enable demand-response protocol 14 during evening peak.", status: "active",
    blockers: ["Regulator sign-off"],
    milestones: [{ t: "Pilot", done: true }, { t: "Rollout", done: true }, { t: "Audit", done: false }] },
  { id: "m4", name: "Humanitarian Corridor · East", pct: 27, risks: 5, budget: "Under review", stakeholders: 34,
    recommendation: "Split into two convoys; use Corridor C for the second wave.", status: "review",
    blockers: ["Security window narrow", "Weather variance"],
    milestones: [{ t: "Assessment", done: true }, { t: "Route lock", done: false }] },
];

function Missions() {
  const [sel, setSel] = useState<Mission>(MISSIONS[0]);
  return (
    <AppShell>
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
        <Panel title="Missions" code="MSN" actions={<Chip tone="primary">4 tracked</Chip>}>
          <ul className="space-y-2">
            {MISSIONS.map((m) => (
              <li key={m.id}>
                <button onClick={() => setSel(m)}
                  className={"w-full text-left panel-inset p-3 transition " +
                    (m.id === sel.id ? "border-primary/60 glow-primary" : "hover:border-border-strong")}>
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-sm">{m.name}</div>
                    <StatusPill s={m.status} />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <ProgressBar value={m.pct} tone={m.pct > 60 ? "ok" : "primary"} />
                    <span className="mono text-[10px] text-muted-foreground w-8 text-right">{m.pct}%</span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground mono">
                    <span>{m.risks} risks</span>
                    <span>· {m.stakeholders} stakeholders</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-4">
          <Panel title={sel.name} code="WSP" actions={<StatusPill s={sel.status} />}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Metric label="Progress" value={`${sel.pct}%`} tone={sel.pct > 60 ? "ok" : "primary"} />
              <Metric label="Risks" value={sel.risks} tone={sel.risks > 2 ? "warn" : "ok"} />
              <Metric label="Budget" value={sel.budget} tone={sel.budget === "Available" ? "ok" : "warn"} />
              <Metric label="Stakeholders" value={sel.stakeholders} tone="primary" />
            </div>
          </Panel>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Panel title="Milestones" code="MST">
              <ul className="space-y-2">
                {sel.milestones.map((m, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className={"h-4 w-4 rounded-sm border grid place-items-center " + (m.done ? "border-ok bg-ok/20 text-ok" : "border-border")}>
                        {m.done ? "✓" : ""}
                      </span>
                      <span className={m.done ? "text-muted-foreground line-through" : ""}>{m.t}</span>
                    </span>
                    <span className="mono text-[10px] text-muted-foreground">{m.done ? "DONE" : "OPEN"}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Blockers" code="BLK">
              <ul className="space-y-2 text-sm">
                {sel.blockers.map((b, i) => (
                  <li key={i} className="flex gap-2">
                    <Dot tone="warn" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          <Panel title="AI Recommendation" code="RSN"
            actions={<Chip tone="primary">conf 82%</Chip>}>
            <div className="text-base">{sel.recommendation}</div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="panel-inset p-3">
                <div className="label-eyebrow mb-1">Evidence</div>
                <ul className="text-[12px] space-y-1 text-foreground/90">
                  <li>Hydrology model H14</li>
                  <li>Historical yield · 12y</li>
                  <li>Community consultation batch 41</li>
                </ul>
              </div>
              <div className="panel-inset p-3">
                <div className="label-eyebrow mb-1">Trade-offs</div>
                <ul className="text-[12px] space-y-1 text-foreground/90">
                  <li className="text-accent">Higher cost (+11%)</li>
                  <li className="text-ok">Improved resilience</li>
                  <li>6-week schedule impact</li>
                </ul>
              </div>
              <div className="panel-inset p-3">
                <div className="label-eyebrow mb-1">Proposed by</div>
                <div className="text-[12px]">Restoration · Economics · Ethics</div>
                <div className="mt-2 flex gap-2">
                  <button className="mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm border border-primary/50 text-primary hover:bg-primary/10">Approve</button>
                  <button className="mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm border border-border hover:bg-surface">Discuss</button>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}

function StatusPill({ s }: { s: Mission["status"] }) {
  if (s === "active") return <Chip tone="ok">active</Chip>;
  if (s === "planning") return <Chip tone="primary">planning</Chip>;
  return <Chip tone="warn">review</Chip>;
}
