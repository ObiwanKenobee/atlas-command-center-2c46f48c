import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Panel, Chip, Dot } from "@/components/panel";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Living World Map — Atlas Sanctum" },
      { name: "description", content: "Interactive planetary map showing disasters, restoration, infrastructure, logistics, weather, biodiversity, food, energy and humanitarian missions." },
      { property: "og:title", content: "Living World Map — Atlas Sanctum" },
      { property: "og:description", content: "Zoom from planetary to local scale across all Sanctum data layers." },
    ],
  }),
  component: LivingMap,
});

const LAYERS = [
  { id: "disasters", name: "Disasters", tone: "danger" as const, count: 7 },
  { id: "restoration", name: "Restoration", tone: "ok" as const, count: 24 },
  { id: "infra", name: "Infrastructure", tone: "primary" as const, count: 138 },
  { id: "logistics", name: "Logistics", tone: "primary" as const, count: 41 },
  { id: "weather", name: "Weather", tone: "muted" as const, count: 6 },
  { id: "biodiversity", name: "Biodiversity", tone: "ok" as const, count: 19 },
  { id: "food", name: "Food Systems", tone: "warn" as const, count: 33 },
  { id: "energy", name: "Energy", tone: "primary" as const, count: 62 },
  { id: "humanitarian", name: "Humanitarian", tone: "warn" as const, count: 12 },
];

// Fixed pins so the demo is stable
const PINS = [
  { x: 22, y: 42, type: "disasters", label: "Wildfire cluster · Iberia", tone: "danger" as const },
  { x: 55, y: 30, type: "weather", label: "Anticyclone · Siberia", tone: "muted" as const },
  { x: 70, y: 55, type: "food", label: "Yield anomaly · S. Asia", tone: "warn" as const },
  { x: 40, y: 65, type: "restoration", label: "Congo restoration node", tone: "ok" as const },
  { x: 82, y: 72, type: "biodiversity", label: "Reef sensor grid", tone: "ok" as const },
  { x: 18, y: 70, type: "humanitarian", label: "Corridor · Amazon E", tone: "warn" as const },
  { x: 30, y: 30, type: "energy", label: "Grid balancing · EU-N", tone: "primary" as const },
  { x: 64, y: 45, type: "disasters", label: "Flood advisory · Indus", tone: "danger" as const },
  { x: 12, y: 45, type: "logistics", label: "Port congestion · NY", tone: "primary" as const },
  { x: 88, y: 40, type: "infra", label: "Data center uplink", tone: "primary" as const },
];

function LivingMap() {
  const [active, setActive] = useState<Record<string, boolean>>(
    Object.fromEntries(LAYERS.map((l) => [l.id, true]))
  );

  return (
    <AppShell>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-4">
        {/* Layers */}
        <Panel title="Layers" code="LYR">
          <div className="space-y-1">
            {LAYERS.map((l) => (
              <label
                key={l.id}
                className="flex items-center justify-between gap-3 px-2 py-1.5 rounded hover:bg-surface cursor-pointer"
              >
                <span className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={active[l.id]}
                    onChange={(e) => setActive((s) => ({ ...s, [l.id]: e.target.checked }))}
                    className="accent-primary"
                  />
                  <Dot tone={l.tone} /> {l.name}
                </span>
                <span className="mono text-[10px] text-muted-foreground">{l.count}</span>
              </label>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-border">
            <div className="label-eyebrow mb-2">Scale</div>
            <input type="range" min={0} max={100} defaultValue={40} className="w-full accent-primary" />
            <div className="mono text-[10px] text-muted-foreground flex justify-between mt-1">
              <span>PLANET</span><span>REGION</span><span>LOCAL</span>
            </div>
          </div>
        </Panel>

        {/* Map */}
        <Panel
          title="Planetary View"
          code="GEO"
          padded={false}
          actions={
            <div className="flex items-center gap-2">
              <Chip tone="primary">Live</Chip>
              <span className="mono text-[10px] text-muted-foreground">MERCATOR · REV 2026-07</span>
            </div>
          }
        >
          <div className="relative aspect-[2/1] w-full overflow-hidden bg-[oklch(0.13_0.015_220)]">
            {/* Grid graticule */}
            <svg viewBox="0 0 200 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <defs>
                <pattern id="grat" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M10 0H0V10" fill="none" stroke="oklch(0.82 0.14 195 / 10%)" strokeWidth="0.2" />
                </pattern>
              </defs>
              <rect width="200" height="100" fill="url(#grat)" />
              {/* stylized continents */}
              <g fill="oklch(0.82 0.14 195 / 12%)" stroke="oklch(0.82 0.14 195 / 45%)" strokeWidth="0.4">
                <path d="M20 30 Q30 22 45 26 L55 40 Q52 55 40 58 L28 55 Q18 45 20 30 Z" />
                <path d="M60 22 Q90 18 120 26 L140 34 Q150 50 138 62 L110 66 Q80 62 70 50 Q58 40 60 22 Z" />
                <path d="M45 62 Q55 62 60 72 L58 88 Q50 92 42 85 Q40 74 45 62 Z" />
                <path d="M148 66 Q160 60 172 68 L178 82 Q170 90 158 86 Q148 78 148 66 Z" />
                <path d="M172 34 Q184 28 192 38 L190 50 Q182 54 174 48 Q170 42 172 34 Z" />
              </g>
              {/* scan sweep */}
              <g>
                <line x1="0" y1="0" x2="200" y2="0" stroke="oklch(0.82 0.14 195 / 60%)" strokeWidth="0.3">
                  <animate attributeName="y1" values="0;100;0" dur="8s" repeatCount="indefinite" />
                  <animate attributeName="y2" values="0;100;0" dur="8s" repeatCount="indefinite" />
                </line>
              </g>
            </svg>

            {/* Pins */}
            {PINS.filter((p) => active[p.type]).map((p, i) => (
              <div
                key={i}
                className="absolute -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                <div className="relative">
                  <span className={`block h-2 w-2 rounded-full ring-2 ring-offset-2 ring-offset-transparent ${toneRing(p.tone)}`} />
                  <span className={`absolute inset-0 rounded-full ${toneBg(p.tone)} animate-ping opacity-60`} />
                </div>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 hidden group-hover:block panel px-2 py-1 whitespace-nowrap text-[11px] z-10">
                  {p.label}
                </div>
              </div>
            ))}

            {/* HUD corners */}
            <div className="absolute top-2 left-2 mono text-[10px] text-primary/70">LAT 00°00′ · LON 00°00′</div>
            <div className="absolute top-2 right-2 mono text-[10px] text-muted-foreground">ZOOM 2.4×</div>
            <div className="absolute bottom-2 right-2 mono text-[10px] text-muted-foreground">14 SIGNALS · 8 LAYERS</div>
          </div>
        </Panel>

        {/* Detail */}
        <Panel title="Signal Detail" code="SIG">
          <div className="space-y-3">
            <div className="panel-inset p-3">
              <div className="mono text-[10px] text-accent">ADVISORY</div>
              <div className="text-sm mt-1">Wildfire cluster · Iberia</div>
              <div className="text-[11px] text-muted-foreground mt-1">Sentinel-2 · 2 hr ago</div>
              <div className="mt-2 text-[11px]">
                Cluster contained at 78%. Two agents (Sentinel, Logistics) coordinating suppression corridors.
              </div>
            </div>
            <div className="panel-inset p-3">
              <div className="mono text-[10px] text-warn text-accent">FORECAST</div>
              <div className="text-sm mt-1">Yield anomaly · S. Asia</div>
              <div className="text-[11px] text-muted-foreground mt-1">Agriculture · 6 hr ago</div>
              <div className="mt-2 text-[11px]">
                Precipitation deficit projected. Restoration + Economics drafting mitigation envelope.
              </div>
            </div>
            <div className="panel-inset p-3">
              <div className="mono text-[10px] text-primary">TRACE</div>
              <div className="text-sm mt-1">Grid balancing · EU-N</div>
              <div className="mt-2 text-[11px]">
                Frequency delta &lt; 0.02 Hz. Auto-stabilizing via demand-response protocol 14.
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}

function toneRing(t: string) {
  return {
    danger: "bg-danger ring-danger/40",
    warn: "bg-accent ring-accent/40",
    ok: "bg-ok ring-ok/40",
    primary: "bg-primary ring-primary/40",
    muted: "bg-border-strong ring-border-strong/40",
  }[t] || "bg-primary ring-primary/40";
}
function toneBg(t: string) {
  return {
    danger: "bg-danger", warn: "bg-accent", ok: "bg-ok", primary: "bg-primary", muted: "bg-border-strong",
  }[t] || "bg-primary";
}
