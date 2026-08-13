import { useEffect, useState } from "react";
import { Check, X, Package, Plus, Pencil } from "lucide-react";
import { supabase } from "../supabase";
import { Card, Badge, Btn, Empty, Th, Td } from "../ui";

type Order = {
  id: string; tokens: number; bonus: number; price_mad: number; method: string;
  status: string; reference: string; created_at: string;
  profiles: { full_name: string } | null;
};
type Pack = { id: string; name_ar: string; tokens: number; bonus: number; price_mad: number; popular: boolean; active: boolean; sort: number };

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [tab, setTab] = useState<"orders" | "packs">("orders");

  async function load() {
    const [{ data: os }, { data: ps }] = await Promise.all([
      supabase.from("orders").select("id, tokens, bonus, price_mad, method, status, reference, created_at, profiles(full_name)").order("created_at", { ascending: false }).limit(200),
      supabase.from("token_packs").select("*").order("sort"),
    ]);
    setOrders((os as unknown as Order[]) ?? []);
    setPacks(ps ?? []);
  }
  useEffect(() => { load(); }, []);

  async function confirmOrder(id: string) {
    const note = prompt("ملاحظة التأكيد (اختياري) — مثال: تحويل بنكي مستلم:", "") ?? "";
    const { error } = await supabase.rpc("confirm_order", { p_order_id: id, p_note: note });
    if (error) alert(error.message);
    await load();
  }
  async function cancelOrder(id: string) {
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", id);
    await load();
  }

  async function editPack(p?: Pack) {
    const name = prompt("اسم الباقة:", p?.name_ar ?? "باقة جديدة"); if (!name) return;
    const tokens = parseInt(prompt("عدد التوكن:", String(p?.tokens ?? 100)) ?? "0", 10); if (!tokens) return;
    const bonus = parseInt(prompt("توكن إضافي (بونص):", String(p?.bonus ?? 0)) ?? "0", 10);
    const price = parseFloat(prompt("السعر بالدرهم:", String(p?.price_mad ?? 99)) ?? "0"); if (!price) return;
    if (p) await supabase.from("token_packs").update({ name_ar: name, tokens, bonus, price_mad: price }).eq("id", p.id);
    else await supabase.from("token_packs").insert({ name_ar: name, tokens, bonus, price_mad: price, sort: packs.length + 1 });
    await load();
  }
  async function togglePack(p: Pack) {
    await supabase.from("token_packs").update({ active: !p.active }).eq("id", p.id);
    await load();
  }

  const pending = orders.filter((o) => o.status === "pending");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">الطلبات والتوكن</h1>
        <p className="mt-1 text-sm text-ink/55">تأكيد الدفع يضيف التوكن لرصيد المستخدم تلقائيًا</p>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab("orders")} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${tab === "orders" ? "bg-brand-dark text-white" : "bg-ink/5 text-ink/60"}`}>
          طلبات الشراء {pending.length > 0 && <span className="ms-1 rounded-full bg-brand-gold px-1.5 text-xs text-brand-dark">{pending.length}</span>}
        </button>
        <button onClick={() => setTab("packs")} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${tab === "packs" ? "bg-brand-dark text-white" : "bg-ink/5 text-ink/60"}`}>
          باقات التوكن
        </button>
      </div>

      {tab === "orders" && (
        <Card className="fade-up overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="border-b border-ink/8">
              <tr><Th>المستخدم</Th><Th>التوكن</Th><Th>السعر</Th><Th>الطريقة</Th><Th>المرجع</Th><Th>الحالة</Th><Th>إجراء</Th></tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {orders.map((o) => (
                <tr key={o.id} className="transition hover:bg-brand-cream/30">
                  <Td className="font-semibold">{o.profiles?.full_name ?? "—"}</Td>
                  <Td>{o.tokens}{o.bonus > 0 && <span className="text-xs text-brand-teal"> +{o.bonus}</span>}</Td>
                  <Td className="font-bold">{o.price_mad} د.م</Td>
                  <Td className="text-ink/60">{o.method === "bank_transfer" ? "تحويل بنكي" : o.method}</Td>
                  <Td className="text-xs text-ink/50" >{o.reference || "—"}</Td>
                  <Td>
                    {o.status === "pending" && <Badge tone="warning">معلّق</Badge>}
                    {o.status === "paid" && <Badge tone="success">مدفوع</Badge>}
                    {o.status === "cancelled" && <Badge tone="danger">ملغى</Badge>}
                  </Td>
                  <Td>
                    {o.status === "pending" && (
                      <div className="flex gap-2">
                        <Btn small onClick={() => confirmOrder(o.id)}><Check className="size-3.5" /> تأكيد الدفع</Btn>
                        <Btn small tone="danger" onClick={() => cancelOrder(o.id)}><X className="size-3.5" /></Btn>
                      </div>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <Empty text="لا توجد طلبات بعد" />}
        </Card>
      )}

      {tab === "packs" && (
        <div className="space-y-4">
          <Btn onClick={() => editPack()}><Plus className="size-4" /> باقة جديدة</Btn>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {packs.map((p) => (
              <Card key={p.id} className={`fade-up p-5 ${!p.active ? "opacity-50" : ""}`}>
                <div className="flex items-center justify-between">
                  <Package className="size-5 text-brand-teal" />
                  {p.popular && <Badge tone="warning">الأكثر شيوعًا</Badge>}
                </div>
                <p className="mt-3 font-bold">{p.name_ar}</p>
                <p className="mt-1 text-2xl font-bold text-brand-dark">{p.tokens.toLocaleString("ar-MA")} <span className="text-xs font-normal text-ink/50">توكن</span></p>
                {p.bonus > 0 && <p className="text-xs text-brand-teal">+{p.bonus} بونص</p>}
                <p className="mt-2 font-semibold">{p.price_mad} د.م</p>
                <div className="mt-4 flex gap-2 border-t border-ink/8 pt-3">
                  <Btn small tone="ghost" onClick={() => editPack(p)}><Pencil className="size-3.5" /> تعديل</Btn>
                  <Btn small tone={p.active ? "danger" : "primary"} onClick={() => togglePack(p)}>{p.active ? "تعطيل" : "تفعيل"}</Btn>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
