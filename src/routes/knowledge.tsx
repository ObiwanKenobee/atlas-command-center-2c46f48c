import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Panel, Chip } from "@/components/panel";

export const Route = createFileRoute("/knowledge")({
  head: () => ({
    meta: [
      { title: "Knowledge Graph — Atlas Sanctum" },
      { name: "description", content: "Visualize relationships between concepts, explore linked evidence, and trace reasoning paths across the Sanctum knowledge graph." },
      { property: "og:title", content: "Knowledge Graph — Atlas Sanctum" },
      { property: "og:description", content: "Explore linked concepts, inspect evidence and trace reasoning." },
    ],
  }),
  component: KnowledgeGraph,
});

type Node = { id: string; x: number; y: number; group: string };
type Edge = { a: string; b: string; kind: string };

const NODES: Node[] = [
  { id: "Water", x: 50, y: 50, group: "core" },
  { id: "Agriculture", x: 25, y: 25, group: "system" },
  { id: "Energy", x: 78, y: 30, group: "system" },
  { id: "Population", x: 82, y: 70, group: "system" },
  { id: "Climate", x: 20, y: 78, group: "system" },
  { id: "Basin 07", x: 12, y: 50, group: "place" },
  { id: "Reservoir Capacity", x: 50, y: 12, group: "lever" },
  { id: "IPCC WG2", x: 90, y: 50, group: "source" },
  { id: "Drought Model", x: 40, y: 88, group: "model" },
];

const EDGES: Edge[] = [
  { a: "Water", b: "Agriculture", kind: "supplies" },
  { a: "Water", b: "Energy", kind: "cools" },
  { a: "Water", b: "Population", kind: "sustains" },
  { a: "Water", b: "Climate", kind: "cycles" },
  { a: "Water", b: "Basin 07", kind: "locates" },
  { a: "Water", b: "Reservoir Capacity", kind: "governed by" },
  { a: "Climate", b: "IPCC WG2", kind: "evidence" },
  { a: "Climate", b: "Drought Model", kind: "informs" },
  { a: "Drought Model", b: "Agriculture", kind: "predicts" },
  { a: "Population", b: "Agriculture", kind: "demands" },
];

function KnowledgeGraph() {
  const [sel, setSel] = useState("Water");
  const neighbors = useMemo(() => {
    const ns = new Set<string>();
    for (const e of EDGES) {
      if (e.a === sel) ns.add(e.b);
      if (e.b === sel) ns.add(e.a);
    }
    return ns;
  }, [sel]);

  return (
    <AppShell>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        <Panel title="Concept Graph" code="KNW" padded={false}
          actions={<Chip tone="primary">{NODES.length} nodes · {EDGES.length} edges</Chip>}>
          <div className="relative aspect-[4/3] w-full">
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <pattern id="kg-grid" width="5" height="5" patternUnits="userSpaceOnUse">
                  <path d="M5 0H0V5" fill="none" stroke="oklch(0.82 0.14 195 / 8%)" strokeWidth="0.15" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#kg-grid)" />
              {EDGES.map((e, i) => {
                const A = NODES.find((n) => n.id === e.a)!;
                const B = NODES.find((n) => n.id === e.b)!;
                const active = e.a === sel || e.b === sel;
                return (
                  <g key={i}>
                    <line x1={A.x} y1={A.y} x2={B.x} y2={B.y}
                      stroke={active ? "oklch(0.82 0.14 195 / 90%)" : "oklch(0.82 0.14 195 / 22%)"}
                      strokeWidth={active ? 0.4 : 0.2} />
                    {active && (
                      <text x={(A.x + B.x) / 2} y={(A.y + B.y) / 2 - 1} fontSize="1.6"
                        fill="oklch(0.66 0.02 210)" textAnchor="middle" fontFamily="var(--font-mono)">
                        {e.kind}
                      </text>
                    )}
                  </g>
                );
              })}
              {NODES.map((n) => {
                const isSel = n.id === sel;
                const isNb = neighbors.has(n.id);
                return (
                  <g key={n.id} onClick={() => setSel(n.id)} className="cursor-pointer">
                    <circle cx={n.x} cy={n.y} r={isSel ? 2.8 : 2}
                      fill={isSel ? "oklch(0.82 0.14 195)" : isNb ? "oklch(0.82 0.16 75)" : "oklch(0.3 0.02 220)"}
                      stroke="oklch(0.94 0.01 200 / 60%)" strokeWidth="0.2" />
                    <text x={n.x} y={n.y - 3.5} fontSize="2.2" textAnchor="middle"
                      fill="oklch(0.94 0.01 200)" fontFamily="var(--font-display)">
                      {n.id}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="absolute bottom-2 left-2 mono text-[10px] text-muted-foreground">
              CLICK NODE TO EXPLORE · {sel}
            </div>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title={sel} code="NODE">
            <div className="text-[11px] text-muted-foreground mono mb-2">group · {NODES.find(n => n.id === sel)?.group}</div>
            <p className="text-sm text-foreground/90 mb-3">
              Central node in {neighbors.size} relationships. Evidence and reasoning surfaces below.
            </p>
            <div className="label-eyebrow mb-1">Linked concepts</div>
            <div className="flex flex-wrap gap-1.5">
              {[...neighbors].map((n) => (
                <button key={n} onClick={() => setSel(n)}
                  className="mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm border border-border hover:border-primary hover:text-primary">
                  {n}
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Evidence" code="EVD">
            <ul className="space-y-2 text-sm">
              {[
                "IPCC WG2 Chapter 4 · hydrological cycle",
                "Basin 07 sensor mesh · 2019–2026",
                "Regional demand ledger Q3",
                "Historical drought registry · UNEP",
              ].map((e, i) => (
                <li key={i} className="panel-inset px-2 py-1.5 flex justify-between items-center">
                  <span>{e}</span>
                  <span className="mono text-[10px] text-primary">DOC</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Reasoning path" code="TRC">
            <ol className="space-y-2 text-sm">
              {[
                "Observed precipitation deficit in Basin 07",
                "Retrieved hydrology + demand priors",
                "Simulated 90-day trajectory · 3 scenarios",
                "Selected reservoir-capacity lever",
                "Estimated impact · resilience ↑, cost ↑",
              ].map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mono text-[10px] text-primary w-4">{i + 1}.</span>
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
