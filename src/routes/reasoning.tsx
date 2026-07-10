import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Panel, Chip, ProgressBar } from "@/components/panel";

export const Route = createFileRoute("/reasoning")({
  head: () => ({
    meta: [
      { title: "Reasoning Panel — Atlas Sanctum" },
      { name: "description", content: "Inspect every recommendation with confidence, evidence and trade-offs. Sanctum reasoning is inspectable, not opaque." },
      { property: "og:title", content: "Reasoning Panel — Atlas Sanctum" },
      { property: "og:description", content: "Confidence, evidence and trade-offs for every AI recommendation." },
    ],
  }),
  component: Reasoning,
});

type Rec = {
  id: string; title: string; conf: number;
  evidence: { name: string; weight: number }[];
  tradeoffs: { label: string; tone: "warn" | "ok" | "muted" }[];
  reasoning: string[];
  agents: string[];
};

const RECS: Rec[] = [
  { id: "r1", title: "Increase reservoir capacity by 15%", conf: 82,
    evidence: [
      { name: "Hydrology model H14", weight: 0.34 },
      { name: "Weather forecasts (72h)", weight: 0.21 },
      { name: "Historical demand · 12y", weight: 0.28 },
      { name: "Community consultation batch 41", weight: 0.17 },
    ],
    tradeoffs: [
      { label: "Higher capital cost", tone: "warn" },
      { label: "Improved resilience", tone: "ok" },
      { label: "6-week schedule impact", tone: "muted" },
    ],
    reasoning: [
      "Observed precipitation deficit persists into Q3",
      "Demand projected to grow 1.4% annually",
      "Simulation across 3 scenarios favors capacity expansion",
      "Ethics review shows no disproportionate community burden",
    ],
    agents: ["Restoration", "Economics", "Ethics", "Sentinel"],
  },
  { id: "r2", title: "Reroute logistics · Corridor B → C", conf: 74,
    evidence: [
      { name: "Weather ensemble (72h)", weight: 0.4 },
      { name: "Corridor congestion telemetry", weight: 0.35 },
      { name: "Fuel envelope", weight: 0.25 },
    ],
    tradeoffs: [
      { label: "+3h ETA", tone: "warn" },
      { label: "Lower weather exposure", tone: "ok" },
    ],
    reasoning: [
      "Storm cell projected to enter Corridor B window",
      "Corridor C fuel envelope acceptable",
      "Ethics: no impact to serviced population",
    ],
    agents: ["Logistics", "Sentinel", "Ethics"],
  },
];

function Reasoning() {
  const [sel, setSel] = useState<Rec>(RECS[0]);
  return (
    <AppShell>
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">
        <Panel title="Open Recommendations" code="RSN">
          <ul className="space-y-2">
            {RECS.map((r) => (
              <li key={r.id}>
                <button onClick={() => setSel(r)}
                  className={"w-full text-left panel-inset p-3 transition " +
                    (r.id === sel.id ? "border-primary/60 glow-primary" : "hover:border-border-strong")}>
                  <div className="text-sm">{r.title}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <ProgressBar value={r.conf} />
                    <span className="mono text-[10px] text-primary w-8 text-right">{r.conf}%</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-4">
          <Panel title={sel.title} code="REC"
            actions={<Chip tone="primary">confidence {sel.conf}%</Chip>}>
            <p className="text-sm text-foreground/90">
              This recommendation was synthesized by {sel.agents.join(" · ")} after reconciling evidence,
              simulating trajectories and applying constraint review.
            </p>
            <div className="mt-3 flex gap-2">
              <button className="mono text-[11px] uppercase tracking-wider px-3 py-1.5 rounded border border-primary/60 bg-primary/10 text-primary hover:bg-primary/20">
                Approve
              </button>
              <button className="mono text-[11px] uppercase tracking-wider px-3 py-1.5 rounded border border-border hover:bg-surface">
                Request changes
              </button>
              <button className="mono text-[11px] uppercase tracking-wider px-3 py-1.5 rounded border border-danger/40 text-danger hover:bg-danger/10">
                Reject
              </button>
            </div>
          </Panel>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Panel title="Evidence" code="EVD">
              <ul className="space-y-3">
                {sel.evidence.map((e) => (
                  <li key={e.name}>
                    <div className="flex justify-between text-sm">
                      <span>{e.name}</span>
                      <span className="mono text-[10px] text-primary">weight {(e.weight * 100).toFixed(0)}%</span>
                    </div>
                    <ProgressBar value={e.weight * 100} />
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Trade-offs" code="TRD">
              <ul className="space-y-2 text-sm">
                {sel.tradeoffs.map((t) => (
                  <li key={t.label} className="flex items-center gap-2">
                    <Chip tone={t.tone}>·</Chip>
                    <span className={t.tone === "warn" ? "text-accent" : t.tone === "ok" ? "text-ok" : ""}>{t.label}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          <Panel title="Reasoning trace" code="TRC">
            <ol className="space-y-2 text-sm">
              {sel.reasoning.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mono text-[10px] text-primary w-6">{String(i + 1).padStart(2, "0")}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
