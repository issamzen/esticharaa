import { useEffect, useState } from "react";
import { Check, X, Banknote, Trash2, Copy } from "lucide-react";
import { supabase } from "../supabase";
import { Card, Badge, Btn, Empty, Th, Td } from "../ui";

type W = {
  id: string; tokens: number; amount_mad: number; method: string;
  payout_details: string; status: string; admin_note: string; created_at: string;
  profiles: { full_name: string; role: string } | null;
};

export function WithdrawalsPage() {
  const [rows, setRows] = useState<W[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "paid" | "rejected">("all");

  async function load() {
    const { data } = await supabase
      .from("withdrawals")
      .select("id, tokens, amount_mad, method, payout_details, status, admin_note, created_at, profiles:expert_id(full_name, role)")
      .order("created_at", { ascending: false }).limit(300);
    setRows((data as unknown as W[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  async function decide(id: string, status: "approved" | "paid" | "rejected") {
    if (status === "rejected") {
      const note = prompt("سبب الرفض (سيُسترجع التوكن لرصيد المستخدم):", "");
      if (note === null) return;
      const { error } = await supabase.rpc("decide_withdrawal", { p_id: id, p_status: status, p_note: note });
      if (error) alert(error.message);
    } else {
      const { error } = await supabase.rpc("decide_withdrawal", { p_id: id, p_status: status, p_note: "" });
      if (error) alert(error.message);
    }
    await load();
  }

  async function deleteRow(w: W) {
    if (!["paid", "rejected"].includes(w.status)) {
      alert("يمكن حذف السجلات المنتهية فقط (مدفوعة أو مرفوضة). عالج الطلب أولًا.");
      return;
    }
    if (!confirm(`حذف سجل التحويل نهائيًا؟\n(${w.profiles?.full_name} — ${w.amount_mad} د.م)`)) return;
    const { error } = await supabase.from("withdrawals").delete().eq("id", w.id);
    if (error) alert(error.message);
    await load();
  }

  function copyDetails(w: W) {
    navigator.clipboard.writeText(w.payout_details);
    alert("نُسخت تفاصيل الدفع ✓");
  }

  const visible = filter === "all" ? rows : rows.filter((r) => r.status === filter);
  const totalPendingMad = rows.filter((r) => r.status === "pending" || r.status === "approved")
    .reduce((s, r) => s + Number(r.amount_mad), 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">التحويلات المالية</h1>
          <p className="mt-1 text-sm text-ink/55">طلبات تحويل التوكن إلى أموال — من المستخدمين والخبراء</p>
        </div>
        {totalPendingMad > 0 && (
          <Badge tone="warning">مستحقات قيد الانتظار: {totalPendingMad.toLocaleString("ar-MA")} د.م</Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {([["all", "الكل"], ["pending", "معلّق"], ["approved", "موافَق"], ["paid", "مدفوع"], ["rejected", "مرفوض"]] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${filter === id ? "bg-brand-teal text-white" : "bg-ink/5 text-ink/60 hover:bg-ink/10"}`}
          >
            {label} ({id === "all" ? rows.length : rows.filter((r) => r.status === id).length})
          </button>
        ))}
      </div>

      <Card className="fade-up overflow-x-auto">
        <table className="w-full min-w-[820px]">
          <thead className="border-b border-ink/8">
            <tr><Th>المستخدم</Th><Th>التوكن</Th><Th>المبلغ</Th><Th>الطريقة</Th><Th>تفاصيل الاستلام</Th><Th>الحالة</Th><Th>إجراء</Th></tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {visible.map((w) => (
              <tr key={w.id} className="transition hover:bg-brand-cream/30">
                <Td className="font-semibold">
                  {w.profiles?.full_name ?? "—"}
                  {w.profiles?.role === "expert" && <Badge tone="info">خبير</Badge>}
                </Td>
                <Td>{w.tokens.toLocaleString("ar-MA")}</Td>
                <Td className="font-bold text-brand-dark">{w.amount_mad} د.م</Td>
                <Td className="text-ink/60">{w.method === "bank_transfer" ? "تحويل بنكي" : w.method === "cash" ? "كاش" : w.method}</Td>
                <Td className="max-w-44">
                  <button onClick={() => copyDetails(w)} className="flex items-center gap-1.5 text-xs text-ink/60 hover:text-brand-teal" title="نسخ">
                    <Copy className="size-3 shrink-0" />
                    <span className="truncate" dir="ltr">{w.payout_details || "—"}</span>
                  </button>
                </Td>
                <Td>
                  {w.status === "pending" && <Badge tone="warning">معلّق</Badge>}
                  {w.status === "approved" && <Badge tone="info">موافَق عليه</Badge>}
                  {w.status === "paid" && <Badge tone="success">تم الدفع</Badge>}
                  {w.status === "rejected" && <Badge tone="danger">مرفوض</Badge>}
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-1.5">
                    {w.status === "pending" && (
                      <>
                        <Btn small onClick={() => decide(w.id, "approved")}><Check className="size-3.5" /> موافقة</Btn>
                        <Btn small tone="danger" onClick={() => decide(w.id, "rejected")}><X className="size-3.5" /> رفض</Btn>
                      </>
                    )}
                    {w.status === "approved" && (
                      <>
                        <Btn small tone="gold" onClick={() => decide(w.id, "paid")}><Banknote className="size-3.5" /> تم التحويل</Btn>
                        <Btn small tone="danger" onClick={() => decide(w.id, "rejected")}><X className="size-3.5" /> رفض</Btn>
                      </>
                    )}
                    {["paid", "rejected"].includes(w.status) && (
                      <Btn small tone="danger" onClick={() => deleteRow(w)}><Trash2 className="size-3.5" /></Btn>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && <Empty text="لا توجد طلبات في هذه الفئة" />}
      </Card>

      <Card className="fade-up border-brand-gold/30 bg-brand-gold/5 p-5">
        <p className="text-sm leading-7 text-ink/70">
          🛡️ <b>سير العمل:</b> «موافقة» = قبول الطلب (حوّل الأموال يدويًا للمستخدم) ثم «تم التحويل» بعد إتمام العملية ·
          «رفض» يعيد التوكن تلقائيًا لرصيد المستخدم ·
          سعر الصرف والحد الأدنى في «إعدادات المنصة» ·
          الحذف متاح فقط للسجلات المنتهية
        </p>
      </Card>
    </div>
  );
}
