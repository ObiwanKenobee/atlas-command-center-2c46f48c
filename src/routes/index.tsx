import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Panel, Metric, Chip, Dot, ProgressBar } from "@/components/panel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Command Center — Atlas Sanctum" },
      { name: "description", content: "Global system status, active missions, alerts, agent activity and AI recommendations across the Atlas Sanctum bridge." },
      { property: "og:title", content: "Command Center — Atlas Sanctum" },
      { property: "og:description", content: "Observe global systems and coordinate the response from a single bridge." },
    ],
  }),
  component: CommandCenter,
});

const sparks = {
  earth: [88, 89, 91, 90, 92, 91, 92],
  water: [70, 69, 68, 67, 66, 65, 64],
  energy: [50, 55, 60, 62, 68, 74, 78],
  food: [80, 81, 79, 82, 83, 84, 84],
};

function CommandCenter() {
  return (
    <AppShell>
      <div className="space-y-6">
        {/* Hero status strip */}
        <section className="panel relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-40" style={{ background: "radial-gradient(600px 200px at 10% 0%, oklch(0.82 0.14 195 / 20%), transparent)" }} />
          <div className="relative p-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="mono text-[11px] text-primary mb-2 flex items-center gap-2">
                <Dot tone="primary" /> BRIDGE ONLINE · SYNCH 99.7%
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                Observe · Understand · Decide · Coordinate · Learn
              </h1>
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
                14 specialized agents are active across 6 domains. 3 recommendations require operator review. Global earth-health index is holding steady.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Chip tone="ok">All Subsystems</Chip>
              <Chip tone="warn">3 Advisories</Chip>
              <Chip tone="primary">2 Awaiting Approval</Chip>
            </div>
          </div>
        </section>

        {/* Domain metrics */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Metric label="Earth Health" value="92" unit="%" tone="ok" trend={sparks.earth} sublabel="composite index" />
          <Metric label="Infrastructure" value="Stable" tone="ok" sublabel="12 regions nominal" />
          <Metric label="Water Systems" value="3" unit="warnings" tone="warn" trend={sparks.water} sublabel="Basin 07, 12, 19" />
          <Metric label="Agriculture" value="Healthy" tone="ok" sublabel="yield forecast +2.1%" />
          <Metric label="Energy" value="Optimizing" tone="primary" trend={sparks.energy} sublabel="grid balancing" />
          <Metric label="Active Agents" value="14" tone="primary" sublabel="6 domains" />
          <Metric label="Knowledge Graph" value="Connected" tone="ok" sublabel="8.4M edges" />
          <Metric label="Memory" value="Updated" tone="ok" sublabel="2 min ago" />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Alerts */}
          <Panel title="Active Alerts" code="ALR" className="lg:col-span-1">
            <ul className="space-y-3">
              {[
                { t: "Drought signal · Basin 07", s: "Sentinel · confidence 0.81", tone: "warn" as const },
                { t: "Grid frequency drift · EU-North", s: "Energy · auto-mitigating", tone: "primary" as const },
                { t: "Vector outbreak risk · Region 4", s: "Health · surveillance up", tone: "danger" as const },
                { t: "Reservoir capacity nearing floor", s: "Infrastructure · 6d runway", tone: "warn" as const },
              ].map((a, i) => (
                <li key={i} className="flex gap-3">
                  <Dot tone={a.tone} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm">{a.t}</div>
                    <div className="text-[11px] text-muted-foreground mono">{a.s}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          {/* Missions */}
          <Panel title="Active Missions" code="MSN" className="lg:col-span-1"
            actions={<span className="mono text-[10px] text-muted-foreground">6 IN FLIGHT</span>}>
            <ul className="space-y-3">
              {[
                { name: "Restore Watershed 07", pct: 68 },
                { name: "Coastal Resilience · Delta B", pct: 41 },
                { name: "Grid Balancing · Iberia", pct: 82 },
                { name: "Humanitarian Corridor · East", pct: 27 },
              ].map((m) => (
                <li key={m.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate">{m.name}</span>
                    <span className="mono text-[11px] text-muted-foreground">{m.pct}%</span>
                  </div>
                  <ProgressBar value={m.pct} />
                </li>
              ))}
            </ul>
          </Panel>

          {/* Recommendations */}
          <Panel title="AI Recommendations" code="RSN" className="lg:col-span-1"
            actions={<Chip tone="primary">3 pending</Chip>}>
            <ul className="space-y-3">
              {[
                { t: "Increase reservoir capacity by 15%", c: 82, d: "Hydrology · demand · climate" },
                { t: "Reroute logistics Corridor B → C", c: 74, d: "Weather · risk model" },
                { t: "Defer grid upgrade · Zone 4", c: 61, d: "Economics · demand forecast" },
              ].map((r) => (
                <li key={r.t} className="panel-inset p-3">
                  <div className="text-sm">{r.t}</div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground mono">
                    <span>{r.d}</span>
                    <span className="text-primary">conf {r.c}%</span>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Panel title="Agent Activity" code="AGT" className="lg:col-span-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left label-eyebrow border-b border-border">
                  <th className="py-2 font-normal">Agent</th>
                  <th className="py-2 font-normal">Current Task</th>
                  <th className="py-2 font-normal text-right">Conf.</th>
                  <th className="py-2 font-normal text-right">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  ["🛡", "Sentinel", "Scanning satellite delta", 0.94, "12s"],
                  ["🌱", "Restoration", "Planning Basin 07 phasing", 0.81, "1m"],
                  ["🏛", "Governance", "Reviewing policy #A-19", 0.72, "3m"],
                  ["📦", "Logistics", "Rerouting corridor B", 0.88, "5m"],
                  ["💰", "Economics", "Reallocating envelope", 0.7, "8m"],
                  ["🧠", "Knowledge", "Ingesting IPCC WG2", 0.99, "9m"],
                ].map(([icon, name, task, conf, upd]) => (
                  <tr key={name as string} className="hover:bg-surface/40">
                    <td className="py-2 flex items-center gap-2">
                      <span className="text-base">{icon as string}</span>
                      <span className="font-medium">{name as string}</span>
                    </td>
                    <td className="py-2 text-muted-foreground">{task as string}</td>
                    <td className="py-2 text-right mono text-primary">{((conf as number) * 100).toFixed(0)}%</td>
                    <td className="py-2 text-right mono text-muted-foreground">{upd as string}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel title="Recent Decisions" code="LOG">
            <ul className="space-y-3">
              {[
                { t: "Approved reroute · Corridor B", by: "OP · 14:03", tone: "ok" as const },
                { t: "Deferred grid upgrade · Zone 4", by: "OP · 13:41", tone: "muted" as const },
                { t: "Escalated Basin 07 to L2", by: "AGT · 13:18", tone: "warn" as const },
                { t: "Ratified restoration plan v3", by: "OP · 12:55", tone: "primary" as const },
              ].map((d, i) => (
                <li key={i} className="flex gap-3">
                  <Dot tone={d.tone} />
                  <div>
                    <div className="text-sm">{d.t}</div>
                    <div className="mono text-[11px] text-muted-foreground">{d.by}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
