import { useEffect, useState } from "react";
import { Search, Ban, CircleCheck, Coins, Trash2, ShieldCheck } from "lucide-react";
import { supabase } from "../supabase";
import { Card, Badge, Btn, Empty, Th, Td } from "../ui";

type Profile = {
  id: string; full_name: string; role: string; city: string | null;
  tokens_balance: number; is_banned: boolean; created_at: string;
};

const ROLE_LABEL: Record<string, string> = {
  user: "مستخدم",
  expert: "خبير",
  admin: "مشرف",
};

const ERROR_MESSAGES: Record<string, string> = {
  CANNOT_DEMOTE_SELF: "لا يمكنك إزالة صلاحياتك عن نفسك",
  LAST_ADMIN: "لا يمكن إزالة آخر مشرف في المنصة",
  CANNOT_DELETE_SELF: "لا يمكنك حذف حسابك الخاص",
  CANNOT_DELETE_ADMIN: "لا يمكن حذف مشرف — أزل صلاحياته أولًا",
  CANNOT_BAN_SELF: "لا يمكنك حظر نفسك",
  CANNOT_BAN_ADMIN: "لا يمكن حظر مشرف — أزل صلاحياته أولًا",
  ADMIN_ONLY: "هذه العملية للمشرفين فقط",
};

function friendlyError(message: string) {
  for (const [key, label] of Object.entries(ERROR_MESSAGES)) {
    if (message.includes(key)) return label;
  }
  return message;
}

export function UsersPage() {
  const [rows, setRows] = useState<Profile[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState("");
  const [me, setMe] = useState<string>("");

  async function load() {
    const { data: session } = await supabase.auth.getSession();
    setMe(session.session?.user.id ?? "");
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, role, city, tokens_balance, is_banned, created_at")
      .order("created_at", { ascending: false })
      .limit(300);
    setRows(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function toggleBan(u: Profile) {
    if (!u.is_banned && !confirm(`حظر «${u.full_name}»؟\nسيُسجَّل خروجه فورًا ولن يستطيع الدخول أو القيام بأي إجراء.`)) return;
    setBusy(u.id);
    const { error } = await supabase.rpc("admin_set_ban", { p_user_id: u.id, p_banned: !u.is_banned });
    if (error) alert(friendlyError(error.message));
    await load(); setBusy("");
  }

  async function adjustTokens(u: Profile) {
    const v = prompt(`تعديل رصيد «${u.full_name}» — أدخل رقمًا موجبًا للإضافة أو سالبًا للخصم:`, "50");
    if (!v) return;
    const amount = parseInt(v, 10);
    if (isNaN(amount) || amount === 0) return;
    setBusy(u.id);
    const { error } = await supabase.rpc("adjust_tokens", { p_user_id: u.id, p_amount: amount, p_note: "تعديل يدوي من لوحة التحكم" });
    if (error) alert(friendlyError(error.message));
    await load(); setBusy("");
  }

  async function changeRole(u: Profile, role: string) {
    if (role === u.role) return;
    const confirmMsg =
      role === "admin"
        ? `⚠️ منح «${u.full_name}» صلاحيات المشرف الكاملة؟\nسيتمكن من دخول لوحة التحكم هذه والتحكم في كل شيء.`
        : `تغيير دور «${u.full_name}» إلى «${ROLE_LABEL[role]}»؟`;
    if (!confirm(confirmMsg)) { await load(); return; }
    setBusy(u.id);
    const { error } = await supabase.rpc("admin_set_role", { p_user_id: u.id, p_role: role });
    if (error) alert(friendlyError(error.message));
    await load(); setBusy("");
  }

  async function deleteUser(u: Profile) {
    const typed = prompt(
      `⚠️ حذف نهائي!\nسيُحذف حساب «${u.full_name}» وكل بياناته (أسئلة، رسائل، رصيد ${u.tokens_balance} توكن).\nهذا الإجراء لا يمكن التراجع عنه.\n\nاكتب: حذف`,
    );
    if (typed !== "حذف") return;
    setBusy(u.id);
    const { error } = await supabase.rpc("admin_delete_user", { p_user_id: u.id });
    if (error) alert(friendlyError(error.message));
    await load(); setBusy("");
  }

  const filtered = rows.filter((r) => r.full_name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">المستخدمون</h1>
          <p className="mt-1 text-sm text-ink/55">{rows.length} مستخدمًا — تحكم كامل: الأدوار، الرصيد، الحظر، الحذف</p>
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
        <table className="w-full min-w-[760px]">
          <thead className="border-b border-ink/8">
            <tr><Th>الاسم</Th><Th>الدور</Th><Th>المدينة</Th><Th>الرصيد</Th><Th>الحالة</Th><Th>إجراءات</Th></tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {filtered.map((u) => (
              <tr key={u.id} className="transition hover:bg-brand-cream/30">
                <Td className="font-semibold">
                  {u.full_name || "—"}
                  {u.id === me && <span className="ms-2 text-[10px] text-brand-teal">(أنت)</span>}
                </Td>
                <Td>
                  <div className="flex items-center gap-1.5">
                    {u.role === "admin" && <ShieldCheck className="size-3.5 text-brand-gold" />}
                    <select
                      value={u.role}
                      disabled={busy === u.id || u.id === me}
                      onChange={(e) => changeRole(u, e.target.value)}
                      className={`rounded-lg border px-2 py-1 text-xs font-semibold outline-none transition disabled:opacity-50 ${
                        u.role === "admin"
                          ? "border-brand-gold/40 bg-brand-gold/10 text-brand-dark"
                          : u.role === "expert"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-ink/15 bg-white text-ink/70"
                      }`}
                    >
                      <option value="user">مستخدم</option>
                      <option value="expert">خبير</option>
                      <option value="admin">مشرف</option>
                    </select>
                  </div>
                </Td>
                <Td className="text-ink/60">{u.city ?? "—"}</Td>
                <Td><span className="font-bold text-brand-dark">{u.tokens_balance}</span> <span className="text-xs text-ink/50">توكن</span></Td>
                <Td>{u.is_banned ? <Badge tone="danger">محظور</Badge> : <Badge tone="success">نشط</Badge>}</Td>
                <Td>
                  <div className="flex gap-1.5">
                    <Btn small tone="ghost" disabled={busy === u.id} onClick={() => adjustTokens(u)}>
                      <Coins className="size-3.5" /> رصيد
                    </Btn>
                    <Btn small tone={u.is_banned ? "primary" : "ghost"} disabled={busy === u.id || u.id === me} onClick={() => toggleBan(u)}>
                      {u.is_banned ? <><CircleCheck className="size-3.5" /> رفع الحظر</> : <><Ban className="size-3.5" /> حظر</>}
                    </Btn>
                    <Btn small tone="danger" disabled={busy === u.id || u.id === me || u.role === "admin"} onClick={() => deleteUser(u)}>
                      <Trash2 className="size-3.5" />
                    </Btn>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <Empty text="لا يوجد مستخدمون بعد" />}
      </Card>

      <Card className="fade-up border-brand-gold/30 bg-brand-gold/5 p-5">
        <p className="text-sm leading-7 text-ink/70">
          🛡️ <b>قواعد الأمان المدمجة:</b> لا يمكنك تعديل دورك أو حذف نفسك ·
          لا يمكن إزالة آخر مشرف · لحذف مشرف يجب أولًا تحويله إلى مستخدم عادي ·
          الحذف نهائي ويشمل كل بيانات المستخدم (يتطلب كتابة «حذف» للتأكيد)
        </p>
      </Card>
    </div>
  );
}
