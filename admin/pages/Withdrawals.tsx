import { useEffect, useState } from "react";
import { Check, X, Banknote } from "lucide-react";
import { supabase } from "../supabase";
import { Card, Badge, Btn, Empty, Th, Td } from "../ui";

type W = {
  id: string; tokens: number; amount_mad: number; method: string;
  payout_details: string; status: string; created_at: string;
  profiles: { full_name: string } | null;
};

export function WithdrawalsPage() {
  const [rows, setRows] = useState<W[]>([]);

  async function load() {
    const { data } = await supabase
      .from("withdrawals")
      .select("id, tokens, amount_mad, method, payout_details, status, created_at, profiles:expert_id(full_name)")
      .order("created_at", { ascending: false }).limit(200);
    setRows((data as unknown as W[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  async function decide(id: string, status: "approved" | "paid" | "rejected") {
    const note = status === "rejected" ? (prompt("سبب الرفض:", "") ?? "") : "";
    const { error } = await supabase.rpc("decide_withdrawal", { p_id: id, p_status: status, p_note: note });
    if (error) alert(error.message);
    await load();
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">طلبات السحب</h1>
        <p className="mt-1 text-sm text-ink/55">التوكن محجوز مسبقًا — الرفض يعيد الرصيد للخبير تلقائيًا</p>
      </div>

      <Card className="fade-up overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead className="border-b border-ink/8">
            <tr><Th>الخبير</Th><Th>التوكن</Th><Th>المبلغ</Th><Th>الطريقة</Th><Th>تفاصيل الدفع</Th><Th>الحالة</Th><Th>إجراء</Th></tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {rows.map((w) => (
              <tr key={w.id} className="transition hover:bg-brand-cream/30">
                <Td className="font-semibold">{w.profiles?.full_name ?? "—"}</Td>
                <Td>{w.tokens.toLocaleString("ar-MA")}</Td>
                <Td className="font-bold text-brand-dark">{w.amount_mad} د.م</Td>
                <Td className="text-ink/60">{w.method === "bank_transfer" ? "تحويل بنكي" : w.method}</Td>
                <Td className="max-w-40 truncate text-xs text-ink/50">{w.payout_details || "—"}</Td>
                <Td>
                  {w.status === "pending" && <Badge tone="warning">معلّق</Badge>}
                  {w.status === "approved" && <Badge tone="info">موافَق عليه</Badge>}
                  {w.status === "paid" && <Badge tone="success">تم الدفع</Badge>}
                  {w.status === "rejected" && <Badge tone="danger">مرفوض</Badge>}
                </Td>
                <Td>
                  <div className="flex gap-2">
                    {w.status === "pending" && (
                      <>
                        <Btn small onClick={() => decide(w.id, "approved")}><Check className="size-3.5" /> موافقة</Btn>
                        <Btn small tone="danger" onClick={() => decide(w.id, "rejected")}><X className="size-3.5" /> رفض</Btn>
                      </>
                    )}
                    {w.status === "approved" && (
                      <Btn small tone="gold" onClick={() => decide(w.id, "paid")}><Banknote className="size-3.5" /> تم التحويل</Btn>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <Empty text="لا توجد طلبات سحب" />}
      </Card>
    </div>
  );
}
