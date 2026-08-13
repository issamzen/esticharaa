import { useEffect, useState } from "react";
import { Users, GraduationCap, MessagesSquare, Coins, Wallet, Banknote, Clock, CircleAlert } from "lucide-react";
import { supabase } from "../supabase";
import { Card, Stat, SparkBars } from "../ui";

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

  if (err) return <p className="text-sm text-red-600">خطأ: {err}</p>;
  if (!stats) return <p className="text-sm text-ink/50">جارٍ التحميل…</p>;

  const pendingTotal = stats.pending_questions + stats.pending_answers + stats.pending_orders + stats.pending_withdrawals + stats.pending_experts;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">نظرة عامة</h1>
        <p className="mt-1 text-sm text-ink/55">صحة المنصة في لمحة واحدة</p>
      </div>

      {pendingTotal > 0 && (
        <Card className="fade-up flex items-center gap-3 border-amber-300/50 bg-amber-50/80 p-4">
          <CircleAlert className="size-5 shrink-0 text-amber-600" />
          <p className="text-sm font-medium text-amber-800">
            لديك <b>{pendingTotal}</b> عنصرًا في انتظار المراجعة — أسئلة ({stats.pending_questions})، أجوبة ({stats.pending_answers})، طلبات شراء ({stats.pending_orders})، سحوبات ({stats.pending_withdrawals})، خبراء جدد ({stats.pending_experts})
          </p>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Users className="size-5" />} label="المستخدمون" value={stats.users} />
        <Stat icon={<GraduationCap className="size-5" />} label="خبراء معتمدون" value={stats.experts} />
        <Stat icon={<MessagesSquare className="size-5" />} label="الأسئلة" value={stats.questions} />
        <Stat icon={<Banknote className="size-5" />} label="الإيرادات (درهم)" value={stats.revenue_mad.toLocaleString("ar-MA")} accent />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Clock className="size-5" />} label="أجوبة تنتظر الموافقة" value={stats.pending_answers} alert />
        <Stat icon={<Coins className="size-5" />} label="طلبات شراء معلّقة" value={stats.pending_orders} alert />
        <Stat icon={<Wallet className="size-5" />} label="سحوبات معلّقة" value={stats.pending_withdrawals} alert />
        <Stat icon={<Coins className="size-5" />} label="توكن متداول" value={stats.tokens_in_circulation.toLocaleString("ar-MA")} accent />
      </div>

      <Card className="fade-up p-6">
        <h2 className="font-bold">التسجيلات — آخر 14 يومًا</h2>
        <div className="mt-5">
          <SparkBars data={stats.signups_14d} />
        </div>
      </Card>
    </div>
  );
}
