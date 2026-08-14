import { useEffect, useState } from "react";
import {
  Users, GraduationCap, MessagesSquare, Coins, Wallet, Banknote,
  Clock, CircleAlert, ArrowUpLeft, Activity, ShieldCheck, TrendingUp,
  Sparkles, ShoppingBag,
} from "lucide-react";
import { supabase } from "../supabase";
import { Card, SparkBars } from "../ui";

type Stats = {
  users: number; experts: number; pending_experts: number;
  questions: number; pending_questions: number; pending_answers: number;
  pending_orders: number; pending_withdrawals: number;
  tokens_in_circulation: number; revenue_mad: number;
  signups_14d: { day: string; count: number }[];
};

export function Overview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    supabase.rpc("admin_dashboard_stats").then(({ data, error }) => {
      if (error) setErr(error.message);
      else setStats(data as Stats);
    });
  }, []);

  if (err) return <Card className="border-red-200 bg-red-50 p-6 text-sm text-red-700">خطأ: {err}</Card>;
  if (!stats) return <OverviewSkeleton />;

  const pendingTotal = stats.pending_questions + stats.pending_answers + stats.pending_orders + stats.pending_withdrawals + stats.pending_experts;
  const totalSignups = stats.signups_14d.reduce((sum, item) => sum + item.count, 0);
  const queue = [
    { label: "أسئلة", value: stats.pending_questions, icon: MessagesSquare, tone: "bg-blue-50 text-blue-600" },
    { label: "أجوبة", value: stats.pending_answers, icon: Clock, tone: "bg-violet-50 text-violet-600" },
    { label: "شراء", value: stats.pending_orders, icon: ShoppingBag, tone: "bg-amber-50 text-amber-600" },
    { label: "سحب", value: stats.pending_withdrawals, icon: Wallet, tone: "bg-rose-50 text-rose-600" },
    { label: "خبراء", value: stats.pending_experts, icon: GraduationCap, tone: "bg-emerald-50 text-emerald-600" },
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-l from-brand-dark via-[#0f5e5b] to-brand-teal p-6 text-white shadow-xl shadow-brand-dark/10 sm:p-8">
        <div className="pointer-events-none absolute -start-20 -top-24 size-72 rounded-full bg-brand-gold/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 end-1/4 size-56 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/80">
              <Sparkles className="size-3 text-brand-gold" /> مركز قيادة المنصة
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">مرحبًا بك، كل شيء تحت السيطرة</h1>
            <p className="mt-2 max-w-xl text-sm leading-7 text-white/60">راقب النمو، راجع المحتوى، وأدر اقتصاد التوكن من مكان واحد.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur">
              <p className="text-[11px] text-white/55">إجمالي الانتظار</p>
              <p className="mt-1 text-3xl font-bold text-brand-gold">{pendingTotal}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur">
              <p className="text-[11px] text-white/55">تسجيلات 14 يومًا</p>
              <p className="mt-1 text-3xl font-bold">{totalSignups}</p>
            </div>
          </div>
        </div>
      </section>

      {pendingTotal > 0 && (
        <Card className="fade-up overflow-hidden border-amber-200 bg-gradient-to-l from-amber-50 to-white p-0">
          <div className="flex flex-wrap items-center gap-4 p-5">
            <span className="grid size-11 place-items-center rounded-2xl bg-amber-100 text-amber-700"><CircleAlert className="size-5" /></span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-amber-900">قائمة المراجعة تحتاج انتباهك</p>
              <p className="mt-1 text-xs text-amber-800/65">لديك {pendingTotal} عنصرًا ينتظر إجراءً إداريًا.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {queue.map((item) => (
                <div key={item.label} className="flex items-center gap-2 rounded-xl border border-black/5 bg-white px-3 py-2 shadow-sm">
                  <item.icon className="size-3.5 text-ink/45" />
                  <span className="text-xs text-ink/55">{item.label}</span>
                  <b className="text-sm">{item.value}</b>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Users} label="إجمالي المستخدمين" value={stats.users} detail={`${totalSignups} جديد خلال 14 يومًا`} tone="blue" />
        <Metric icon={GraduationCap} label="خبراء معتمدون" value={stats.experts} detail={`${stats.pending_experts} طلب اعتماد`} tone="emerald" />
        <Metric icon={MessagesSquare} label="إجمالي الأسئلة" value={stats.questions} detail={`${stats.pending_answers} جواب للمراجعة`} tone="violet" />
        <Metric icon={Banknote} label="الإيرادات" value={`${stats.revenue_mad.toLocaleString("ar-MA")} د.م`} detail="الطلبات المدفوعة" tone="gold" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <Card className="fade-up p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-brand-teal">نمو المجتمع</p>
              <h2 className="mt-1 text-lg font-bold">التسجيلات — آخر 14 يومًا</h2>
            </div>
            <span className="grid size-10 place-items-center rounded-xl bg-brand-teal/10 text-brand-teal"><TrendingUp className="size-4.5" /></span>
          </div>
          <div className="mt-7"><SparkBars data={stats.signups_14d} /></div>
          <div className="mt-5 flex items-center justify-between border-t border-ink/7 pt-4 text-xs text-ink/50">
            <span>إجمالي الفترة</span><b className="text-base text-brand-dark">{totalSignups} حسابًا</b>
          </div>
        </Card>

        <Card className="fade-up p-6 sm:p-7">
          <div className="flex items-center justify-between">
            <div><p className="text-xs font-semibold text-brand-teal">اقتصاد المنصة</p><h2 className="mt-1 text-lg font-bold">حالة التوكن</h2></div>
            <Coins className="size-5 text-brand-gold" />
          </div>
          <div className="mt-6 rounded-2xl bg-gradient-to-br from-brand-dark to-brand-teal p-5 text-white">
            <p className="text-[11px] text-white/55">توكن متداول حاليًا</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">{stats.tokens_in_circulation.toLocaleString("ar-MA")}</p>
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-3/4 rounded-full bg-brand-gold" /></div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <MiniStat icon={Coins} label="شراء معلّق" value={stats.pending_orders} />
            <MiniStat icon={Wallet} label="سحب معلّق" value={stats.pending_withdrawals} />
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-700">
            <ShieldCheck className="size-4" /> كل العمليات محمية بسجل تدقيق
          </div>
        </Card>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, detail, tone }: { icon: typeof Users; label: string; value: string | number; detail: string; tone: "blue" | "emerald" | "violet" | "gold" }) {
  const tones = {
    blue: "bg-blue-50 text-blue-600", emerald: "bg-emerald-50 text-emerald-600",
    violet: "bg-violet-50 text-violet-600", gold: "bg-amber-50 text-amber-600",
  };
  return (
    <Card className="group fade-up p-5 transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <span className={`grid size-11 place-items-center rounded-2xl ${tones[tone]}`}><Icon className="size-5" /></span>
        <ArrowUpLeft className="size-4 text-ink/20 transition group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-teal" />
      </div>
      <p className="mt-5 text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-1 text-xs font-semibold text-ink/60">{label}</p>
      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ink/40"><Activity className="size-3" /> {detail}</p>
    </Card>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: typeof Coins; label: string; value: number }) {
  return <div className="rounded-xl border border-ink/7 bg-white p-3"><Icon className="size-3.5 text-brand-teal" /><p className="mt-2 text-lg font-bold">{value}</p><p className="text-[10px] text-ink/45">{label}</p></div>;
}

function OverviewSkeleton() {
  return <div className="space-y-5"><div className="h-48 animate-pulse rounded-[2rem] bg-brand-dark/10" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[1,2,3,4].map((x) => <div key={x} className="h-36 animate-pulse rounded-2xl bg-white/70" />)}</div><div className="h-64 animate-pulse rounded-2xl bg-white/70" /></div>;
}
