import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`glass rounded-2xl shadow-sm ${className}`}>{children}</div>;
}

export function Stat({ icon, label, value, accent = false, alert = false }: { icon: ReactNode; label: string; value: string | number; accent?: boolean; alert?: boolean }) {
  return (
    <Card className="fade-up p-5">
      <div className="flex items-center gap-4">
        <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${accent ? "bg-brand-gold/15 text-brand-gold" : "bg-brand-dark/10 text-brand-dark"}`}>
          {icon}
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs text-ink/60">{label}</p>
          <p className="mt-0.5 text-2xl font-bold tracking-tight">
            {value}
            {alert && Number(value) > 0 ? <span className="ms-2 inline-block size-2 animate-pulse rounded-full bg-red-500 align-middle" /> : null}
          </p>
        </div>
      </div>
    </Card>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warning" | "danger" | "info" }) {
  const tones = {
    neutral: "bg-ink/8 text-ink/70",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-brand-teal/12 text-brand-teal",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export function Btn({ children, onClick, tone = "primary", small = false, disabled = false }: { children: ReactNode; onClick?: () => void; tone?: "primary" | "ghost" | "danger" | "gold"; small?: boolean; disabled?: boolean }) {
  const tones = {
    primary: "bg-brand-dark text-white hover:bg-brand-teal",
    ghost: "bg-ink/5 text-ink hover:bg-ink/10",
    danger: "bg-red-600/10 text-red-700 hover:bg-red-600/20",
    gold: "bg-brand-gold text-brand-dark hover:brightness-105",
  };
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-xl font-semibold transition disabled:opacity-40 ${small ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm"} ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

export function Empty({ text }: { text: string }) {
  return <p className="py-14 text-center text-sm text-ink/45">{text}</p>;
}

export function Th({ children }: { children: ReactNode }) {
  return <th className="px-4 py-3 text-start text-xs font-semibold text-ink/55">{children}</th>;
}
export function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-sm ${className}`}>{children}</td>;
}

export function SparkBars({ data }: { data: { day: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="flex h-28 items-end gap-1.5">
      {data.map((d) => (
        <div key={d.day} className="group relative flex h-full flex-1 items-end">
          <div
            className="w-full rounded-t-md bg-gradient-to-t from-brand-dark to-brand-teal transition-all group-hover:from-brand-teal group-hover:to-brand-gold"
            style={{ height: `${Math.max(6, (d.count / max) * 100)}%` }}
          />
          <span className="pointer-events-none absolute -top-7 start-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-1.5 py-0.5 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
            {d.count} — {new Date(d.day).toLocaleDateString("ar-MA", { day: "numeric", month: "short" })}
          </span>
        </div>
      ))}
    </div>
  );
}
