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
const SETTING_LABELS: Record<string, string> = {
  award_per_answer: "مكافأة الإجابة", best_answer_bonus: "مكافأة أفضل جواب",
  min_payout_tokens: "الحد الأدنى للسحب", token_to_mad: "سعر تحويل التوكن",
  maintenance_mode: "وضع الصيانة", content_access_rules: "قواعد عرض المحتوى",
  expert_audiences: "فئات الخبراء", platform_limits: "حدود الاستخدام والحماية",
  site_branding: "هوية الموقع", site_colors: "ألوان الموقع", site_nav: "قائمة الموقع",
  site_footer: "روابط التذييل", payment_methods: "وسائل الدفع",
};
const STATUS_LABELS: Record<string, string> = {
  pending: "قيد المراجعة", published: "منشور", rejected: "مرفوض", closed: "مغلق",
  approved: "مقبول", paid: "مدفوع", cancelled: "ملغى", open: "مفتوح",
  waiting_user: "بانتظار المستخدم", resolved: "تم الحل", suspended: "موقوف",
};

type JsonRecord = Record<string, unknown>;
function asRecord(value: unknown): JsonRecord { return value && typeof value === "object" ? value as JsonRecord : {}; }
function text(value: unknown, fallback = "—") { return value === null || value === undefined || value === "" ? fallback : String(value); }
function compactValue(value: unknown) {
  if (typeof value === "object" && value !== null) return "إعدادات متعددة";
  if (typeof value === "boolean") return value ? "مفعّل" : "متوقف";
  return text(value);
}

function describeAudit(row: AuditRow, adminName: string) {
  const old = asRecord(row.old_data);
  const next = asRecord(row.new_data);
  const targetName = text(next.full_name ?? old.full_name, "المستخدم");
  const title = text(next.title ?? old.title, "السجل");

  if (row.table_name === "settings") {
    const key = text(next.key ?? old.key, row.record_id ?? "إعداد");
    const label = SETTING_LABELS[key] ?? key;
    return row.action === "insert"
      ? `${adminName} أضاف إعداد «${label}»`
      : `${adminName} عدّل «${label}» من ${compactValue(old.value)} إلى ${compactValue(next.value)}`;
  }
  if (row.table_name === "profiles") {
    if (old.tokens_balance !== next.tokens_balance && next.tokens_balance !== undefined) {
      const difference = Number(next.tokens_balance) - Number(old.tokens_balance ?? 0);
      return difference >= 0
        ? `${adminName} أضاف ${difference} توكن إلى رصيد ${targetName}`
        : `${adminName} خصم ${Math.abs(difference)} توكن من رصيد ${targetName}`;
    }
    if (old.is_banned !== next.is_banned) return `${adminName} ${next.is_banned ? "حظر" : "رفع الحظر عن"} المستخدم ${targetName}`;
    if (old.role !== next.role) return `${adminName} غيّر دور ${targetName} من ${text(old.role)} إلى ${text(next.role)}`;
    if (row.action === "delete") return `${adminName} حذف حساب ${targetName}`;
    return `${adminName} عدّل بيانات المستخدم ${targetName}`;
  }
  if (row.table_name === "questions") {
    if (old.status !== next.status) return `${adminName} غيّر حالة السؤال «${title}» من ${STATUS_LABELS[text(old.status)] ?? text(old.status)} إلى ${STATUS_LABELS[text(next.status)] ?? text(next.status)}`;
    if (row.action === "delete") return `${adminName} حذف السؤال «${title}»`;
    return `${adminName} عدّل السؤال «${title}»`;
  }
  if (row.table_name === "answers") {
    if (old.status !== next.status) return `${adminName} ${next.status === "approved" ? "وافق على" : next.status === "rejected" ? "رفض" : "حدّث"} إجابة خبير`;
    if (row.action === "delete") return `${adminName} حذف إجابة`;
    return `${adminName} عدّل إجابة`;
  }
  if (row.table_name === "expert_profiles") {
    if (old.status !== next.status) return `${adminName} غيّر حالة ملف خبير من ${STATUS_LABELS[text(old.status)] ?? text(old.status)} إلى ${STATUS_LABELS[text(next.status)] ?? text(next.status)}`;
    if (JSON.stringify(old.audience_ids) !== JSON.stringify(next.audience_ids)) return `${adminName} عدّل الفئات المهنية المسندة إلى خبير`;
    return `${adminName} عدّل ملف خبير`;
  }
  if (row.table_name === "orders") {
    if (old.status !== next.status) return `${adminName} غيّر حالة طلب شراء إلى ${STATUS_LABELS[text(next.status)] ?? text(next.status)}`;
    return `${adminName} عدّل طلب شراء توكن`;
  }
  if (row.table_name === "withdrawals") {
    if (old.status !== next.status) return `${adminName} غيّر حالة طلب سحب إلى ${STATUS_LABELS[text(next.status)] ?? text(next.status)}`;
    return `${adminName} عدّل طلب سحب`;
  }
  if (row.table_name === "support_threads") {
    if (old.status !== next.status) return `${adminName} غيّر حالة مشكلة المستخدم «${title}» إلى ${STATUS_LABELS[text(next.status)] ?? text(next.status)}`;
    return `${adminName} تابع مشكلة مستخدم «${title}»`;
  }
  if (row.table_name === "categories") return `${adminName} ${row.action === "insert" ? "أضاف" : row.action === "delete" ? "حذف" : "عدّل"} تصنيفًا في الموقع`;
  if (row.table_name === "token_packs") return `${adminName} ${row.action === "insert" ? "أضاف" : row.action === "delete" ? "حذف" : "عدّل"} باقة توكن`;
  return `${adminName} نفّذ عملية ${ACTION_META[row.action]?.label ?? row.action} في ${TABLE_LABELS[row.table_name] ?? row.table_name}`;
}

export function AuditLogsPage() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [query, setQuery] = useState("");
  const [table, setTable] = useState("all");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [adminNames, setAdminNames] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase.from("admin_audit_logs").select("id, admin_id, action, table_name, record_id, old_data, new_data, created_at")
      .order("created_at", { ascending: false }).limit(500)
      .then(async ({ data, error }) => {
        if (error) { setError(error.message); return; }
        const loaded = (data as AuditRow[]) ?? [];
        setRows(loaded);
        const ids = [...new Set(loaded.map((row) => row.admin_id).filter(Boolean))] as string[];
        if (ids.length > 0) {
          const { data: admins } = await supabase.from("profiles").select("id, full_name").in("id", ids);
          setAdminNames(Object.fromEntries((admins ?? []).map((admin) => [admin.id, admin.full_name || "مشرف"])));
        }
      });
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
            const adminName = row.admin_id ? (adminNames[row.admin_id] ?? `مشرف ${row.admin_id.slice(0, 8)}`) : "النظام";
            const description = describeAudit(row, adminName);
            return <div key={row.id}>
              <button onClick={() => setExpanded(expanded === row.id ? null : row.id)} className="flex w-full items-center gap-4 p-4 text-start transition hover:bg-ink/[.025]">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-dark/8 text-brand-dark"><ShieldCheck className="size-4.5" /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold leading-6 text-ink">{description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2"><Badge tone={meta.tone}>{meta.label}</Badge><span className="text-[11px] font-medium text-ink/50">{TABLE_LABELS[row.table_name] ?? row.table_name}</span><span className="text-[11px] text-ink/35">· {new Date(row.created_at).toLocaleString("ar-MA")}</span></div>
                </div>
                {expanded === row.id ? <ChevronUp className="size-4 text-ink/35" /> : <ChevronDown className="size-4 text-ink/35" />}
              </button>
              {expanded === row.id && <div className="bg-ink/[.025] p-4"><div className="mb-3 rounded-xl border border-brand-teal/15 bg-brand-teal/5 p-3 text-xs leading-6 text-ink/65"><b>ملخص العملية:</b> {description}<br/><span className="text-ink/40">معرّف السجل: <span dir="ltr">{row.record_id ?? "—"}</span></span></div><details><summary className="cursor-pointer text-xs font-semibold text-brand-teal">عرض التفاصيل التقنية الكاملة</summary><div className="mt-3 grid gap-3 md:grid-cols-2"><JsonPanel title="البيانات قبل العملية" value={row.old_data} /><JsonPanel title="البيانات بعد العملية" value={row.new_data} /></div></details></div>}
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
