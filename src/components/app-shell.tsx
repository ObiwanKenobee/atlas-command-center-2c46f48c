import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { startLiveStream, useLiveEvents, useLiveStatus } from "@/lib/live-store";

type NavItem = { to: string; label: string; code: string; group: string };

const NAV: NavItem[] = [
  { to: "/", label: "Command Center", code: "CC-01", group: "Bridge" },
  { to: "/map", label: "Living World Map", code: "GEO-02", group: "Bridge" },
  { to: "/feed", label: "Intelligence Feed", code: "INT-03", group: "Bridge" },

  { to: "/agents", label: "Agent Hub", code: "AGT-04", group: "Coordination" },
  { to: "/missions", label: "Mission Workspace", code: "MSN-05", group: "Coordination" },
  { to: "/governance", label: "Governance", code: "GOV-06", group: "Coordination" },

  { to: "/knowledge", label: "Knowledge Graph", code: "KNW-07", group: "Reasoning" },
  { to: "/reasoning", label: "Reasoning Panel", code: "RSN-08", group: "Reasoning" },
  { to: "/simulator", label: "Strategy Simulator", code: "SIM-09", group: "Reasoning" },
  { to: "/memory", label: "Memory Library", code: "MEM-10", group: "Reasoning" },
];

function groupBy(items: NavItem[]) {
  const map = new Map<string, NavItem[]>();
  for (const i of items) {
    if (!map.has(i.group)) map.set(i.group, []);
    map.get(i.group)!.push(i);
  }
  return [...map.entries()];
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = NAV.find((n) => (n.to === "/" ? pathname === "/" : pathname.startsWith(n.to)));
  useEffect(() => { startLiveStream(); }, []);


  return (
    <div className="flex min-h-screen w-full text-foreground">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-panel/60 backdrop-blur">
        <div className="flex items-center gap-3 px-4 h-14 border-b border-border">
          <SanctumMark />
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-wide" style={{ fontFamily: "var(--font-display)" }}>
              Atlas Sanctum
            </div>
            <div className="mono text-[10px] text-muted-foreground">bridge · v0.1</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          {groupBy(NAV).map(([group, items]) => (
            <div key={group} className="px-3 py-2">
              <div className="label-eyebrow px-2 mb-1">{group}</div>
              <ul className="space-y-0.5">
                {items.map((n) => {
                  const isActive = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
                  return (
                    <li key={n.to}>
                      <Link
                        to={n.to}
                        className={
                          "group flex items-center justify-between rounded px-2 py-1.5 text-sm transition-colors " +
                          (isActive
                            ? "bg-primary/10 text-primary"
                            : "text-foreground/80 hover:bg-surface hover:text-foreground")
                        }
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={
                              "h-1.5 w-1.5 rounded-full " +
                              (isActive ? "bg-primary animate-pulse-dot" : "bg-border-strong")
                            }
                          />
                          {n.label}
                        </span>
                        <span className="mono text-[10px] text-muted-foreground group-hover:text-foreground/70">
                          {n.code}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-border p-3 space-y-2">
          <StatusRow label="Uplink" value="STABLE" tone="ok" />
          <StatusRow label="Agents" value="14 ACTIVE" tone="primary" />
          <StatusRow label="Ethics" value="2 REVIEW" tone="warn" />
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 h-14 border-b border-border bg-background/85 backdrop-blur flex items-center gap-4 px-4 md:px-6">
          <div className="flex items-center gap-2">
            <span className="mono text-[10px] text-muted-foreground">{active?.code ?? "SYS"}</span>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-sm font-semibold">{active?.label ?? "Sanctum"}</h1>
          </div>
          <div className="hidden md:flex flex-1 items-center gap-4 text-[11px] text-muted-foreground mono ml-4 overflow-hidden">
            <Ticker />
          </div>
          <div className="flex items-center gap-3">
            <ClockUTC />
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-ok animate-pulse-dot" />
              <span className="mono text-[11px]">OPERATOR · L3</span>
            </div>
          </div>
        </header>

        <main className="flex-1 min-w-0 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

function StatusRow({ label, value, tone }: { label: string; value: string; tone: "ok" | "warn" | "primary" }) {
  const toneCls =
    tone === "ok" ? "text-ok" : tone === "warn" ? "text-accent" : "text-primary";
  return (
    <div className="flex items-center justify-between text-[11px]">
      <span className="label-eyebrow">{label}</span>
      <span className={"mono " + toneCls}>{value}</span>
    </div>
  );
}

function SanctumMark() {
  return (
    <div className="relative h-8 w-8 rounded-md border border-primary/40 bg-primary/10 grid place-items-center glow-primary">
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2 L21 7 V17 L12 22 L3 17 V7 Z" />
        <path d="M12 6 L17 8.5 V15.5 L12 18 L7 15.5 V8.5 Z" opacity="0.6" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    </div>
  );
}

function Ticker() {
  const events = useLiveEvents();
  const items = events.slice(0, 12).map((e) => `${e.time} · ${e.kind} · ${e.title}`);
  const stream = items.length ? [...items, ...items] : ["Awaiting uplink…"];
  return (
    <div className="relative flex-1 overflow-hidden">
      <div className="flex items-center gap-2 mr-3 shrink-0">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inset-0 rounded-full bg-ok animate-ping opacity-60" />
          <span className="relative h-1.5 w-1.5 rounded-full bg-ok" />
        </span>
        <span className="mono text-[10px] uppercase text-ok/80">WS · LIVE</span>
      </div>
      <div className="flex gap-8 whitespace-nowrap" style={{ animation: "ticker 90s linear infinite" }}>
        {stream.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-primary" />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function ClockUTC() {
  const [now, setNow] = useState<string>("UTC --:--:--");
  useEffect(() => {
    const fmt = () => {
      const d = new Date();
      const h = String(d.getUTCHours()).padStart(2, "0");
      const m = String(d.getUTCMinutes()).padStart(2, "0");
      const s = String(d.getUTCSeconds()).padStart(2, "0");
      setNow(`UTC ${h}:${m}:${s}`);
    };
    fmt();
    const id = window.setInterval(fmt, 1000);
    return () => window.clearInterval(id);
  }, []);
  return <span className="mono text-[11px] text-muted-foreground">{now}</span>;
}
