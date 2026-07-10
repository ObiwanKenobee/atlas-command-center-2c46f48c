import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  code,
  actions,
  children,
  className,
  padded = true,
}: {
  title?: string;
  code?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={cn("panel relative overflow-hidden", className)}>
      {(title || code || actions) && (
        <header className="flex items-center justify-between border-b border-border px-4 h-10 bg-surface/40">
          <div className="flex items-center gap-2 min-w-0">
            {code && <span className="mono text-[10px] text-primary/80">{code}</span>}
            {title && (
              <h2 className="text-[13px] font-semibold tracking-wide truncate" style={{ fontFamily: "var(--font-display)" }}>
                {title}
              </h2>
            )}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </header>
      )}
      <div className={padded ? "p-4" : ""}>{children}</div>
      <CornerBrackets />
    </section>
  );
}

function CornerBrackets() {
  const base = "absolute h-2 w-2 border-primary/60";
  return (
    <>
      <span className={cn(base, "top-1 left-1 border-t border-l")} />
      <span className={cn(base, "top-1 right-1 border-t border-r")} />
      <span className={cn(base, "bottom-1 left-1 border-b border-l")} />
      <span className={cn(base, "bottom-1 right-1 border-b border-r")} />
    </>
  );
}

export function Metric({
  label,
  value,
  unit,
  tone = "default",
  trend,
  sublabel,
}: {
  label: string;
  value: string | number;
  unit?: string;
  tone?: "default" | "ok" | "warn" | "danger" | "primary";
  trend?: number[];
  sublabel?: string;
}) {
  const toneCls =
    tone === "ok" ? "text-ok" :
    tone === "warn" ? "text-accent" :
    tone === "danger" ? "text-danger" :
    tone === "primary" ? "text-primary" : "text-foreground";
  return (
    <div className="panel-inset p-3 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="label-eyebrow">{label}</span>
        {trend && <Spark data={trend} />}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={cn("text-2xl font-semibold tabular-nums", toneCls)} style={{ fontFamily: "var(--font-display)" }}>
          {value}
        </span>
        {unit && <span className="mono text-[11px] text-muted-foreground">{unit}</span>}
      </div>
      {sublabel && <span className="text-[11px] text-muted-foreground">{sublabel}</span>}
    </div>
  );
}

export function Spark({ data, width = 60, height = 18 }: { data: number[]; width?: number; height?: number }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const points = data.map((v, i) => `${i * step},${height - ((v - min) / range) * height}`).join(" ");
  return (
    <svg width={width} height={height} className="text-primary/80">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function Chip({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "ok" | "warn" | "danger" | "primary" | "muted";
}) {
  const map: Record<string, string> = {
    default: "bg-surface text-foreground border-border",
    ok: "bg-ok/10 text-ok border-ok/30",
    warn: "bg-accent/10 text-accent border-accent/30",
    danger: "bg-danger/10 text-danger border-danger/30",
    primary: "bg-primary/10 text-primary border-primary/30",
    muted: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span className={cn("mono inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[10px] uppercase tracking-wider", map[tone])}>
      {children}
    </span>
  );
}

export function Dot({ tone = "primary" }: { tone?: "ok" | "warn" | "danger" | "primary" | "muted" }) {
  const map: Record<string, string> = {
    ok: "bg-ok", warn: "bg-accent", danger: "bg-danger", primary: "bg-primary", muted: "bg-border-strong",
  };
  return <span className={cn("inline-block h-1.5 w-1.5 rounded-full", map[tone])} />;
}

export function ProgressBar({ value, tone = "primary" }: { value: number; tone?: "primary" | "ok" | "warn" }) {
  const bar = tone === "ok" ? "bg-ok" : tone === "warn" ? "bg-accent" : "bg-primary";
  return (
    <div className="h-1.5 w-full bg-surface-2 rounded-sm overflow-hidden">
      <div className={cn("h-full", bar)} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
