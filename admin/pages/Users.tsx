import { useEffect, useState } from "react";
import { Search, Ban, CircleCheck, Coins } from "lucide-react";
import { supabase } from "../supabase";
import { Card, Badge, Btn, Empty, Th, Td } from "../ui";

type Profile = {
  id: string; full_name: string; role: string; city: string | null;
  tokens_balance: number; is_banned: boolean; created_at: string;
};

export function UsersPage() {
  const [rows, setRows] = useState<Profile[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState("");

  async function load() {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, role, city, tokens_balance, is_banned, created_at")
      .order("created_at", { ascending: false })
      .limit(300);
    setRows(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function toggleBan(u: Profile) {
    setBusy(u.id);
    await supabase.from("profiles").update({ is_banned: !u.is_banned }).eq("id", u.id);
    await load(); setBusy("");
  }

  async function adjustTokens(u: Profile) {
    const v = prompt(`تعديل رصيد «${u.full_name}» — أدخل رقمًا موجبًا للإضافة أو سالبًا للخصم:`, "50");
    if (!v) return;
    const amount = parseInt(v, 10);
    if (isNaN(amount) || amount === 0) return;
    setBusy(u.id);
    const { error } = await supabase.rpc("adjust_tokens", { p_user_id: u.id, p_amount: amount, p_note: "تعديل يدوي من لوحة التحكم" });
    if (error) alert(error.message);
    await load(); setBusy("");
  }

  const filtered = rows.filter((r) => r.full_name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">المستخدمون</h1>
          <p className="mt-1 text-sm text-ink/55">{rows.length} مستخدمًا مسجلًا</p>
        </div>
        <div className="relative">
          <Search className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث بالاسم…"
            className="w-64 rounded-xl border border-ink/15 bg-white py-2.5 pe-9 ps-4 text-sm outline-none focus:border-brand-teal"
          />
        </div>
      </div>

      <Card className="fade-up overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="border-b border-ink/8">
            <tr><Th>الاسم</Th><Th>الدور</Th><Th>المدينة</Th><Th>الرصيد</Th><Th>الحالة</Th><Th>إجراءات</Th></tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {filtered.map((u) => (
              <tr key={u.id} className="transition hover:bg-brand-cream/30">
                <Td className="font-semibold">{u.full_name || "—"}</Td>
                <Td>
                  {u.role === "admin" ? <Badge tone="info">مشرف</Badge>
                    : u.role === "expert" ? <Badge tone="success">خبير</Badge>
                    : <Badge>مستخدم</Badge>}
                </Td>
                <Td className="text-ink/60">{u.city ?? "—"}</Td>
                <Td><span className="font-bold text-brand-dark">{u.tokens_balance}</span> <span className="text-xs text-ink/50">توكن</span></Td>
                <Td>{u.is_banned ? <Badge tone="danger">محظور</Badge> : <Badge tone="success">نشط</Badge>}</Td>
                <Td>
                  <div className="flex gap-2">
                    <Btn small tone="ghost" disabled={busy === u.id} onClick={() => adjustTokens(u)}>
                      <Coins className="size-3.5" /> رصيد
                    </Btn>
                    <Btn small tone={u.is_banned ? "primary" : "danger"} disabled={busy === u.id} onClick={() => toggleBan(u)}>
                      {u.is_banned ? <><CircleCheck className="size-3.5" /> رفع الحظر</> : <><Ban className="size-3.5" /> حظر</>}
                    </Btn>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <Empty text="لا يوجد مستخدمون بعد" />}
      </Card>
    </div>
  );
}
