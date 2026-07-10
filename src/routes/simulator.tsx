import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Panel, Chip, ProgressBar } from "@/components/panel";

export const Route = createFileRoute("/simulator")({
  head: () => ({
    meta: [
      { title: "Strategy Simulator — Atlas Sanctum" },
      { name: "description", content: "Explore scenarios before acting. Sanctum surfaces assumptions, projected impacts, confidence levels and alternative strategies." },
      { property: "og:title", content: "Strategy Simulator — Atlas Sanctum" },
      { property: "og:description", content: "Test scenarios and inspect projected impacts, confidence and alternatives." },
    ],
  }),
  component: Simulator,
});

const SCENARIOS = [
  "What if drought persists for another 6 months?",
  "What if we defer grid upgrade in Zone 4 by 12 months?",
  "What if humanitarian corridor B closes for 2 weeks?",
  "What if reservoir capacity is expanded by 15%?",
];

function Simulator() {
  const [q, setQ] = useState(SCENARIOS[0]);
  const [horizon, setHorizon] = useState(6);
  const [severity, setSeverity] = useState(60);

  const impact = Math.min(95, Math.round((severity / 100) * (horizon * 8 + 20)));

  return (
    <AppShell>
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
        <Panel title="Scenario Builder" code="SIM">
          <div className="space-y-4">
            <div>
              <div className="label-eyebrow mb-1">Query</div>
              <textarea
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full h-24 panel-inset p-2 text-sm bg-transparent outline-none focus:border-primary/60"
              />
            </div>
            <div>
              <div className="label-eyebrow mb-1">Suggested scenarios</div>
              <div className="space-y-1">
                {SCENARIOS.map((s) => (
                  <button key={s} onClick={() => setQ(s)}
                    className="w-full text-left text-[12px] px-2 py-1 rounded hover:bg-surface border border-transparent hover:border-border">
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex justify-between label-eyebrow mb-1"><span>Horizon</span><span className="mono">{horizon} months</span></div>
              <input type="range" min={1} max={24} value={horizon} onChange={(e) => setHorizon(+e.target.value)} className="w-full accent-primary" />
            </div>
            <div>
              <div className="flex justify-between label-eyebrow mb-1"><span>Severity</span><span className="mono">{severity}</span></div>
              <input type="range" min={0} max={100} value={severity} onChange={(e) => setSeverity(+e.target.value)} className="w-full accent-primary" />
            </div>
            <button className="w-full mono text-[11px] uppercase tracking-wider px-3 py-2 rounded border border-primary/60 bg-primary/10 text-primary hover:bg-primary/20 glow-primary">
              Run Simulation
            </button>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title="Projection" code="PRJ" actions={<Chip tone="primary">3 pathways</Chip>}>
            <ProjectionChart severity={severity} horizon={horizon} />
          </Panel>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Panel title="Assumptions" code="ASM">
              <ul className="text-[12px] space-y-1.5">
                <li>· Precipitation deficit continues at present rate</li>
                <li>· Demand grows at 1.4% annual</li>
                <li>· Reservoir inflows follow model H14</li>
                <li>· No new policy interventions</li>
              </ul>
            </Panel>
            <Panel title="Projected Impact" code="IMP">
              <div className="space-y-3">
                <ImpactRow label="Agricultural yield" value={-impact / 2} tone="warn" />
                <ImpactRow label="Water stress" value={impact} tone="danger" />
                <ImpactRow label="Displacement risk" value={impact - 20} tone="warn" />
                <ImpactRow label="Grid demand" value={impact / 3} tone="primary" />
              </div>
            </Panel>
            <Panel title="Confidence" code="CNF">
              <div className="space-y-2 text-sm">
                <Conf label="Hydrology" value={82} />
                <Conf label="Demand" value={74} />
                <Conf label="Climate priors" value={66} />
                <Conf label="Behavioral" value={51} />
              </div>
            </Panel>
          </div>

          <Panel title="Alternative Strategies" code="ALT">
            <ul className="space-y-2">
              {[
                { t: "Expand reservoir capacity +15%", c: 82, e: "Cost ↑ · Resilience ↑" },
                { t: "Demand-response tariffs (Zone 4)", c: 71, e: "Cost neutral · Equity concerns" },
                { t: "Aquifer recharge program", c: 63, e: "Slow onset · Durable" },
                { t: "Import corridor · Region 9", c: 48, e: "Fast · High volatility" },
              ].map((s) => (
                <li key={s.t} className="panel-inset p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm">{s.t}</div>
                    <div className="mono text-[10px] text-muted-foreground">{s.e}</div>
                  </div>
                  <Chip tone="primary">conf {s.c}%</Chip>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}

function ImpactRow({ label, value, tone }: { label: string; value: number; tone: "warn" | "danger" | "primary" }) {
  const abs = Math.min(100, Math.abs(Math.round(value)));
  const sign = value >= 0 ? "+" : "−";
  const color = tone === "danger" ? "text-danger" : tone === "warn" ? "text-accent" : "text-primary";
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className={"mono " + color}>{sign}{abs}%</span>
      </div>
      <ProgressBar value={abs} tone={tone === "primary" ? "primary" : "warn"} />
    </div>
  );
}

function Conf({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm"><span>{label}</span><span className="mono text-primary">{value}%</span></div>
      <ProgressBar value={value} />
    </div>
  );
}

function ProjectionChart({ severity, horizon }: { severity: number; horizon: number }) {
  const W = 600, H = 200, pad = 24;
  const pts = 24;
  const paths = [1, 0.6, 0.3].map((factor, idx) => {
    const arr = Array.from({ length: pts + 1 }, (_, i) => {
      const t = i / pts;
      const decay = 1 - Math.exp(-t * (horizon / 12) * factor);
      const y = 100 - decay * (severity / 100) * 80 * factor;
      return [pad + (W - 2 * pad) * t, pad + (H - 2 * pad) * (1 - y / 100)];
    });
    return { d: arr.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" "), idx };
  });
  const colors = ["oklch(0.68 0.22 25)", "oklch(0.82 0.16 75)", "oklch(0.82 0.14 195)"];
  const labels = ["No action", "Moderate response", "Full mitigation"];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-56">
      <defs>
        <pattern id="chart-grid" width="40" height="20" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V20" fill="none" stroke="oklch(0.82 0.14 195 / 8%)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect x={pad} y={pad} width={W - 2 * pad} height={H - 2 * pad} fill="url(#chart-grid)" stroke="oklch(0.3 0.02 220 / 60%)" />
      {paths.map((p, i) => (
        <path key={i} d={p.d} stroke={colors[i]} strokeWidth="1.6" fill="none" />
      ))}
      {labels.map((l, i) => (
        <g key={i} transform={`translate(${W - 150},${pad + 12 + i * 16})`}>
          <rect width="10" height="2" y="4" fill={colors[i]} />
          <text x="16" y="8" fontSize="10" fill="oklch(0.94 0.01 200)" fontFamily="var(--font-mono)">{l}</text>
        </g>
      ))}
      <text x={pad} y={H - 8} fontSize="9" fill="oklch(0.66 0.02 210)" fontFamily="var(--font-mono)">t=0</text>
      <text x={W - pad - 30} y={H - 8} fontSize="9" fill="oklch(0.66 0.02 210)" fontFamily="var(--font-mono)">t={horizon}mo</text>
    </svg>
  );
}
