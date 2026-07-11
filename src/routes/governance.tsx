import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Panel, Chip, Dot, ProgressBar } from "@/components/panel";
import { liveStore, useLiveAudit } from "@/lib/live-store";

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

type Approval = { id: string; t: string; by: string; c: number };
const INITIAL_APPROVALS: Approval[] = [
  { id: "ap1", t: "Increase reservoir capacity · Basin 07", by: "Restoration · Economics", c: 82 },
  { id: "ap2", t: "Reroute logistics · Corridor B → C", by: "Logistics · Sentinel", c: 74 },
  { id: "ap3", t: "Publish policy digest #A-19", by: "Governance", c: 61 },
];

function Governance() {
  const [perms, setPerms] = useState(PERMISSIONS);
  const [queue, setQueue] = useState<Approval[]>(INITIAL_APPROVALS);
  const audit = useLiveAudit();

  function decide(a: Approval, action: "approved" | "rejected" | "deferred") {
    setQueue((q) => q.filter((x) => x.id !== a.id));
    liveStore.pushAudit({ who: "OP · L3", act: action, tgt: a.t });
    const tone = action === "approved" ? "ok" : action === "rejected" ? "danger" : "muted";
    const kind = action === "approved" ? "APPROVED" : action === "rejected" ? "REJECTED" : "DECISION";
    liveStore.pushEvent({ kind, tone, title: `Operator ${action} · ${a.t}`, source: a.by });
  }

  return (
    <AppShell>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Approvals queue" code="APV" actions={<Chip tone="primary">{queue.length} pending</Chip>}>
          {queue.length === 0 ? (
            <div className="panel-inset p-6 text-center text-sm text-muted-foreground">
              Queue clear. All recommendations processed.
            </div>
          ) : (
            <ul className="space-y-3">
              {queue.map((a) => (
                <li key={a.id} className="panel-inset p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm">{a.t}</div>
                      <div className="mono text-[10px] text-muted-foreground">{a.by} · confidence {a.c}%</div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => decide(a, "approved")} className="mono text-[10px] uppercase px-2 py-1 rounded border border-primary/50 text-primary hover:bg-primary/10">approve</button>
                      <button onClick={() => decide(a, "deferred")} className="mono text-[10px] uppercase px-2 py-1 rounded border border-border hover:bg-surface">defer</button>
                      <button onClick={() => decide(a, "rejected")} className="mono text-[10px] uppercase px-2 py-1 rounded border border-danger/40 text-danger hover:bg-danger/10">reject</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
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

        <AuditPanel audit={audit} />
      </div>
    </AppShell>
  );
}

function AuditPanel({ audit }: { audit: ReturnType<typeof useLiveAudit> }) {
  const [q, setQ] = useState("");
  const [who, setWho] = useState("All");
  const [act, setAct] = useState("All");
  const [dir, setDir] = useState<"desc" | "asc">("desc");

  const whos = useMemo(() => ["All", ...Array.from(new Set(audit.map((a) => a.who))).sort()], [audit]);
  const acts = useMemo(() => ["All", ...Array.from(new Set(audit.map((a) => a.act))).sort()], [audit]);

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    const filtered = audit.filter((a) => {
      if (who !== "All" && a.who !== who) return false;
      if (act !== "All" && a.act !== act) return false;
      if (query && !`${a.who} ${a.act} ${a.tgt} ${a.t}`.toLowerCase().includes(query)) return false;
      return true;
    });
    const sorted = [...filtered].sort((a, b) => (a.t < b.t ? -1 : a.t > b.t ? 1 : 0));
    return dir === "desc" ? sorted.reverse() : sorted;
  }, [audit, q, who, act, dir]);

  function exportCsv() {
    const header = ["timestamp", "who", "action", "target"];
    const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const body = rows.map((a) => [a.t, a.who, a.act, a.tgt].map(esc).join(","));
    const csv = [header.join(","), ...body].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const link = document.createElement("a");
    link.href = url;
    link.download = `sanctum-audit-${stamp}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <Panel
      title="Audit Log"
      code="AUD"
      className="lg:col-span-2"
      actions={
        <div className="flex items-center gap-2">
          <Chip tone="muted">{rows.length} / {audit.length}</Chip>
          <button
            onClick={exportCsv}
            disabled={rows.length === 0}
            className="mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm border border-primary/60 text-primary hover:bg-primary/10 disabled:opacity-40 disabled:hover:bg-transparent"
          >
            export CSV
          </button>
        </div>
      }
    >
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search audit entries…"
          className="flex-1 min-w-[180px] panel-inset px-2.5 py-1.5 text-sm bg-transparent outline-none focus:border-primary/60"
        />
        <select value={who} onChange={(e) => setWho(e.target.value)}
          className="panel-inset px-2 py-1.5 text-[12px] bg-transparent outline-none focus:border-primary/60">
          {whos.map((w) => <option key={w} value={w} className="bg-panel">who: {w}</option>)}
        </select>
        <select value={act} onChange={(e) => setAct(e.target.value)}
          className="panel-inset px-2 py-1.5 text-[12px] bg-transparent outline-none focus:border-primary/60">
          {acts.map((a) => <option key={a} value={a} className="bg-panel">action: {a}</option>)}
        </select>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="label-eyebrow border-b border-border text-left">
            <th className="py-2 font-normal w-24">
              <button onClick={() => setDir((d) => d === "desc" ? "asc" : "desc")}
                className="inline-flex items-center gap-1 hover:text-primary">
                Time <span className="mono text-[9px]">{dir === "desc" ? "↓" : "↑"}</span>
              </button>
            </th>
            <th className="py-2 font-normal">Actor</th>
            <th className="py-2 font-normal">Action</th>
            <th className="py-2 font-normal">Target</th>
            <th className="py-2 font-normal w-6"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.length === 0 && (
            <tr><td colSpan={5} className="py-6 text-center text-muted-foreground text-sm">No entries match.</td></tr>
          )}
          {rows.map((a) => (
            <tr key={a.id} className="animate-in fade-in slide-in-from-top-1 duration-500">
              <td className="py-2 mono text-[11px] text-muted-foreground align-top">{a.t}</td>
              <td className="py-2 mono text-[10px] text-primary align-top">{a.who}</td>
              <td className="py-2 text-muted-foreground align-top">{a.act}</td>
              <td className="py-2 align-top">{a.tgt}</td>
              <td className="py-2 align-top"><Dot tone={a.who.startsWith("OP") ? "ok" : "primary"} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
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
