import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Panel, Chip } from "@/components/panel";

export const Route = createFileRoute("/memory")({
  head: () => ({
    meta: [
      { title: "Memory Library — Atlas Sanctum" },
      { name: "description", content: "A searchable repository of previous missions, decisions, documents, lessons learned, policies and datasets, linked to the knowledge graph." },
      { property: "og:title", content: "Memory Library — Atlas Sanctum" },
      { property: "og:description", content: "Search the archived reasoning, decisions and datasets of the Sanctum." },
    ],
  }),
  component: MemoryLibrary,
});

type Item = { title: string; kind: string; when: string; tags: string[]; excerpt: string };

const ITEMS: Item[] = [
  { title: "Basin 07 restoration · after-action review", kind: "mission", when: "2026-06-14", tags: ["water", "restoration", "basin-07"],
    excerpt: "Phase-1 planting exceeded survival target. Sensor mesh calibration remains the primary risk to Phase-2." },
  { title: "Corridor B reroute decision", kind: "decision", when: "2026-07-08", tags: ["logistics", "weather"],
    excerpt: "Operator approved reroute to Corridor C during 72h weather envelope. Downstream impact contained." },
  { title: "IPCC WG2 summary · Sanctum digest", kind: "document", when: "2026-05-30", tags: ["climate", "evidence"],
    excerpt: "Integrated regional projections into Drought Model. Confidence uplift +3.1% across three basins." },
  { title: "Grid balancing pilot · Iberia", kind: "mission", when: "2026-04-11", tags: ["energy", "grid"],
    excerpt: "Demand-response protocol 14 held frequency within 0.03 Hz across evening peaks." },
  { title: "Policy #A-19 draft · governance", kind: "policy", when: "2026-07-01", tags: ["governance"],
    excerpt: "Proposed constraint update on autonomous logistics rerouting. Awaiting Ethics review." },
  { title: "Wastewater surveillance dataset", kind: "dataset", when: "2026-07-09", tags: ["health"],
    excerpt: "12 clinic panels, weekly cadence, geohash-precision 5. Sanctum-native ingestion enabled." },
  { title: "Lesson: over-reliance on single satellite pass", kind: "lesson", when: "2026-03-22", tags: ["monitoring"],
    excerpt: "Sensor triangulation now required before any L2 escalation. Reduced false-positive rate by 41%." },
];

const KINDS = ["all", "mission", "decision", "document", "policy", "dataset", "lesson"];

function MemoryLibrary() {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("all");
  const items = useMemo(() => {
    return ITEMS.filter((i) => (kind === "all" || i.kind === kind) &&
      (q.trim() === "" || (i.title + i.excerpt + i.tags.join(" ")).toLowerCase().includes(q.toLowerCase())));
  }, [q, kind]);

  return (
    <AppShell>
      <div className="space-y-4">
        <Panel title="Search Memory" code="MEM">
          <div className="flex flex-col md:flex-row gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search missions, decisions, documents…"
              className="flex-1 panel-inset px-3 py-2 text-sm bg-transparent outline-none focus:border-primary/60"
            />
            <div className="flex flex-wrap gap-1">
              {KINDS.map((k) => (
                <button key={k} onClick={() => setKind(k)}
                  className={"mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm border " +
                    (kind === k ? "border-primary/60 text-primary bg-primary/10" : "border-border hover:border-border-strong")}>
                  {k}
                </button>
              ))}
            </div>
          </div>
        </Panel>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((i) => (
            <Panel key={i.title} title={i.title} code={i.kind.toUpperCase()}
              actions={<span className="mono text-[10px] text-muted-foreground">{i.when}</span>}>
              <p className="text-sm text-foreground/90">{i.excerpt}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {i.tags.map((t) => <Chip key={t} tone="muted">#{t}</Chip>)}
              </div>
            </Panel>
          ))}
          {items.length === 0 && (
            <div className="mono text-[11px] text-muted-foreground">no results</div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
