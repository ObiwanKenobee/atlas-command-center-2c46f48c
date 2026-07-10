import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Panel, Chip, Dot, ProgressBar } from "@/components/panel";

export const Route = createFileRoute("/governance")({
  head: () => ({
    meta: [
      { title: "Governance Console — Atlas Sanctum" },
      { name: "description", content: "Review AI recommendations, approve or reject actions, configure agent permissions, inspect audit logs and monitor system health." },
      { property: "og:title", content: "Governance Console — Atlas Sanctum" },
      { property: "og:description", content: "Human oversight and audit for every autonomous action." },
    ],
  }),
  component: Governance,
});

const PERMISSIONS = [
  { agent: "Sentinel", read: true, write: false, act: false },
  { agent: "Restoration", read: true, write: true, act: false },
  { agent: "Governance", read: true, write: true, act: false },
  { agent: "Logistics", read: true, write: true, act: true },
  { agent: "Economics", read: true, write: true, act: false },
  { agent: "Knowledge", read: true, write: true, act: false },
  { agent: "Ethics", read: true, write: false, act: false },
  { agent: "Health", read: true, write: true, act: false },
];

const AUDIT = [
  { t: "14:22:07", who: "OP", act: "approved", tgt: "Reroute · Corridor B" },
  { t: "14:12:44", who: "SYS", act: "ingested", tgt: "Sentinel-2 tile 34UEV" },
  { t: "13:41:02", who: "OP", act: "deferred", tgt: "Grid upgrade · Zone 4" },
  { t: "13:18:38", who: "AGT · Sentinel", act: "escalated", tgt: "Basin 07 signal → L2" },
  { t: "12:55:11", who: "OP", act: "ratified", tgt: "Restoration plan v3" },
  { t: "12:04:20", who: "AGT · Ethics", act: "flagged", tgt: "Constraint drift · #A-19" },
];

function Governance() {
  const [perms, setPerms] = useState(PERMISSIONS);
  return (
    <AppShell>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Approvals queue" code="APV" actions={<Chip tone="primary">3 pending</Chip>}>
          <ul className="space-y-3">
            {[
              { t: "Increase reservoir capacity · Basin 07", by: "Restoration · Economics", c: 82 },
              { t: "Reroute logistics · Corridor B → C", by: "Logistics · Sentinel", c: 74 },
              { t: "Publish policy digest #A-19", by: "Governance", c: 61 },
            ].map((a) => (
              <li key={a.t} className="panel-inset p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm">{a.t}</div>
                    <div className="mono text-[10px] text-muted-foreground">{a.by} · confidence {a.c}%</div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button className="mono text-[10px] uppercase px-2 py-1 rounded border border-primary/50 text-primary hover:bg-primary/10">approve</button>
                    <button className="mono text-[10px] uppercase px-2 py-1 rounded border border-border hover:bg-surface">defer</button>
                    <button className="mono text-[10px] uppercase px-2 py-1 rounded border border-danger/40 text-danger hover:bg-danger/10">reject</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="System Health" code="SYS">
          <div className="grid grid-cols-2 gap-3">
            <Health label="Uplink" value={99} tone="ok" />
            <Health label="Ingestion" value={94} tone="ok" />
            <Health label="Reasoning queue" value={62} tone="primary" />
            <Health label="Human review latency" value={78} tone="primary" />
            <Health label="Constraint drift" value={31} tone="warn" />
            <Health label="Ethics review backlog" value={22} tone="warn" />
          </div>
        </Panel>

        <Panel title="Agent Permissions" code="ACL" className="lg:col-span-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="label-eyebrow border-b border-border text-left">
                <th className="py-2 font-normal">Agent</th>
                <th className="py-2 font-normal text-center">Read</th>
                <th className="py-2 font-normal text-center">Write</th>
                <th className="py-2 font-normal text-center">Act</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {perms.map((p, i) => (
                <tr key={p.agent}>
                  <td className="py-2">{p.agent}</td>
                  {(["read", "write", "act"] as const).map((k) => (
                    <td key={k} className="py-2 text-center">
                      <button
                        onClick={() => setPerms((s) => s.map((r, j) => j === i ? { ...r, [k]: !r[k] } : r))}
                        className={"h-4 w-4 rounded-sm border grid place-items-center mx-auto " +
                          (p[k] ? "border-primary bg-primary/20 text-primary" : "border-border hover:border-border-strong")}>
                        {p[k] ? "✓" : ""}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="Audit Log" code="AUD">
          <ul className="text-sm divide-y divide-border">
            {AUDIT.map((a, i) => (
              <li key={i} className="grid grid-cols-[80px_1fr_auto] gap-3 py-2 items-center">
                <span className="mono text-[11px] text-muted-foreground">{a.t}</span>
                <div>
                  <span className="mono text-[10px] text-primary">{a.who}</span>
                  <span className="text-muted-foreground"> {a.act} </span>
                  <span>{a.tgt}</span>
                </div>
                <Dot tone={a.who.startsWith("OP") ? "ok" : "primary"} />
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}

function Health({ label, value, tone }: { label: string; value: number; tone: "ok" | "primary" | "warn" }) {
  return (
    <div className="panel-inset p-3">
      <div className="flex justify-between items-center">
        <span className="label-eyebrow">{label}</span>
        <span className={"mono text-[11px] " + (tone === "warn" ? "text-accent" : tone === "ok" ? "text-ok" : "text-primary")}>{value}%</span>
      </div>
      <div className="mt-2"><ProgressBar value={value} tone={tone === "warn" ? "warn" : tone === "ok" ? "ok" : "primary"} /></div>
    </div>
  );
}
