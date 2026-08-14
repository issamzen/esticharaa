import { useEffect, useMemo, useState } from "react";
import { History, Search, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "../supabase";
import { Card, Badge, Empty } from "../ui";

type AuditRow = {
  id: number; admin_id: string | null; action: string; table_name: string;
  record_id: string | null; old_data: unknown; new_data: unknown; created_at: string;
};

const TABLE_LABELS: Record<string, string> = {
  profiles: "المستخدمون", questions: "الأسئلة", answers: "الأجوبة", orders: "الطلبات",
  withdrawals: "السحوبات", settings: "الإعدادات", expert_profiles: "الخبراء",
  categories: "التصنيفات", token_packs: "باقات التوكن", support_threads: "الدعم",
};
const ACTION_META: Record<string, { label: string; tone: "success" | "warning" | "danger" }> = {
  insert: { label: "إضافة", tone: "success" }, update: { label: "تعديل", tone: "warning" }, delete: { label: "حذف", tone: "danger" },
};

export function AuditLogsPage() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [query, setQuery] = useState("");
  const [table, setTable] = useState("all");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.from("admin_audit_logs").select("id, admin_id, action, table_name, record_id, old_data, new_data, created_at")
      .order("created_at", { ascending: false }).limit(500)
      .then(({ data, error }) => { if (error) setError(error.message); else setRows((data as AuditRow[]) ?? []); });
  }, []);

  const filtered = useMemo(() => rows.filter((row) =>
    (table === "all" || row.table_name === table) &&
    (!query || `${row.record_id ?? ""} ${row.admin_id ?? ""} ${row.table_name}`.toLowerCase().includes(query.toLowerCase()))
  ), [rows, table, query]);

  return (
    <div className="space-y-5">
      <div><h1 className="flex items-center gap-2 text-2xl font-bold"><History className="size-6 text-brand-teal" /> سجل الإدارة</h1><p className="mt-1 text-sm text-ink/55">سجل غير قابل للتعديل لكل الإجراءات الحساسة التي ينفذها المشرفون</p></div>
      {error && <Card className="border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}<br/><b>شغّل migration 08 في Supabase أولًا.</b></Card>}
      <Card className="p-4"><div className="flex flex-wrap gap-3"><div className="relative min-w-60 flex-1"><Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink/35" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="بحث بالمعرّف أو المشرف…" className="w-full rounded-xl border border-ink/12 bg-white py-2.5 pe-3 ps-10 text-sm outline-none focus:border-brand-teal" /></div><select value={table} onChange={(e) => setTable(e.target.value)} className="rounded-xl border border-ink/12 bg-white px-4 py-2.5 text-sm outline-none"><option value="all">كل الأقسام</option>{Object.entries(TABLE_LABELS).map(([id,label]) => <option key={id} value={id}>{label}</option>)}</select></div></Card>
      <Card className="overflow-hidden p-0">
        <div className="divide-y divide-ink/6">
          {filtered.map((row) => {
            const meta = ACTION_META[row.action] ?? ACTION_META.update;
            return <div key={row.id}>
              <button onClick={() => setExpanded(expanded === row.id ? null : row.id)} className="flex w-full items-center gap-4 p-4 text-start transition hover:bg-ink/[.025]">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-dark/8 text-brand-dark"><ShieldCheck className="size-4" /></span>
                <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><Badge tone={meta.tone}>{meta.label}</Badge><b className="text-sm">{TABLE_LABELS[row.table_name] ?? row.table_name}</b>{row.record_id && <code className="truncate text-[10px] text-ink/40" dir="ltr">{row.record_id}</code>}</div><p className="mt-1 text-[11px] text-ink/40"><span dir="ltr">{row.admin_id?.slice(0, 8) ?? "system"}</span> · {new Date(row.created_at).toLocaleString("ar-MA")}</p></div>
                {expanded === row.id ? <ChevronUp className="size-4 text-ink/35" /> : <ChevronDown className="size-4 text-ink/35" />}
              </button>
              {expanded === row.id && <div className="grid gap-3 bg-ink/[.025] p-4 md:grid-cols-2"><JsonPanel title="قبل" value={row.old_data} /><JsonPanel title="بعد" value={row.new_data} /></div>}
            </div>;
          })}
          {filtered.length === 0 && !error && <Empty text="لا توجد عمليات مطابقة" />}
        </div>
      </Card>
    </div>
  );
}

function JsonPanel({ title, value }: { title: string; value: unknown }) {
  return <div className="min-w-0"><p className="mb-1.5 text-xs font-semibold text-ink/50">{title}</p><pre className="max-h-72 overflow-auto rounded-xl bg-[#0c2f2f] p-3 text-[10px] leading-5 text-emerald-100" dir="ltr">{value ? JSON.stringify(value, null, 2) : "—"}</pre></div>;
}
