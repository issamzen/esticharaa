import { useEffect, useState } from "react";
import { Headphones, MessageSquareText, Send, Loader2, CheckCircle2, UserRound, ShieldCheck, Inbox, LockKeyhole, Trash2, RotateCcw } from "lucide-react";
import { supabase } from "../supabase";
import { Card, Empty, Badge, Btn } from "../ui";

type Conv = { id: string; last_message_at: string; user: { full_name: string } | null; expert: { full_name: string } | null };
type Msg = { id: string; body: string; sender_id: string; created_at: string };
type SupportThread = {
  id: string; user_id: string; subject: string; status: string; priority: string; last_message_at: string;
  profiles: { full_name: string } | null;
};
type SupportMsg = Msg & { read_at: string | null };

export function MessagesPage() {
  const [tab, setTab] = useState<"support" | "monitoring">("support");
  const [adminId, setAdminId] = useState("");
  const [threads, setThreads] = useState<SupportThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<SupportThread | null>(null);
  const [supportMsgs, setSupportMsgs] = useState<SupportMsg[]>([]);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [supportError, setSupportError] = useState("");
  const [convs, setConvs] = useState<Conv[]>([]);
  const [selected, setSelected] = useState<Conv | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);

  async function loadThreads() {
    const { data, error } = await supabase.from("support_threads")
      .select("id, user_id, subject, status, priority, last_message_at, profiles:user_id(full_name)")
      .order("last_message_at", { ascending: false }).limit(200);
    if (error) {
      setSupportError(error.message);
      setThreads([]);
      return;
    }
    setSupportError("");
    setThreads((data as unknown as SupportThread[]) ?? []);
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAdminId(data.user?.id ?? ""));
    loadThreads();
    supabase.from("conversations")
      .select("id, last_message_at, user:user_id(full_name), expert:expert_id(full_name)")
      .order("last_message_at", { ascending: false }).limit(100)
      .then(({ data }) => setConvs((data as unknown as Conv[]) ?? []));
  }, []);

  useEffect(() => {
    if (!selectedThread) return;
    supabase.from("support_messages").select("id, body, sender_id, read_at, created_at")
      .eq("thread_id", selectedThread.id).order("created_at")
      .then(async ({ data }) => {
        setSupportMsgs((data as SupportMsg[]) ?? []);
        await supabase.from("support_messages").update({ read_at: new Date().toISOString() })
          .eq("thread_id", selectedThread.id).is("read_at", null);
      });
  }, [selectedThread?.id]);

  useEffect(() => {
    if (!selected) return;
    supabase.from("messages").select("id, body, sender_id, created_at")
      .eq("conversation_id", selected.id).order("created_at")
      .then(({ data }) => setMsgs(data ?? []));
  }, [selected]);

  async function sendReply() {
    if (!selectedThread || !reply.trim()) return;
    setBusy(true);
    const { error } = await supabase.rpc("reply_support_thread", { p_thread_id: selectedThread.id, p_body: reply.trim() });
    setBusy(false);
    if (error) { alert(error.message); return; }
    setReply("");
    const { data } = await supabase.from("support_messages").select("id, body, sender_id, read_at, created_at")
      .eq("thread_id", selectedThread.id).order("created_at");
    setSupportMsgs((data as SupportMsg[]) ?? []);
    await loadThreads();
  }

  async function setStatus(status: string) {
    if (!selectedThread) return;
    const { error } = await supabase.from("support_threads").update({ status }).eq("id", selectedThread.id);
    if (error) { alert(error.message); return; }
    const next = { ...selectedThread, status };
    setSelectedThread(next);
    setThreads((items) => items.map((item) => item.id === next.id ? next : item));
  }

  async function closeThread() {
    if (!selectedThread) return;
    const note = prompt("ملاحظة الإغلاق للمستخدم (اختيارية):", "تم توضيح الطلب وإغلاق المحادثة.");
    if (note === null) return;
    const { error } = await supabase.rpc("admin_close_support_thread", { p_thread_id:selectedThread.id, p_note:note });
    if (error) { alert(error.message); return; }
    const next={...selectedThread,status:"closed"};setSelectedThread(next);await loadThreads();
  }
  async function reopenThread() {
    if (!selectedThread) return;
    const { error } = await supabase.rpc("admin_reopen_support_thread", { p_thread_id:selectedThread.id });
    if (error) { alert(error.message); return; }
    const next={...selectedThread,status:"open"};setSelectedThread(next);await loadThreads();
  }
  async function deleteThread() {
    if (!selectedThread) return;
    const typed=prompt(`حذف نهائي للمحادثة «${selectedThread.subject}» وكل رسائلها؟\nاكتب: حذف`);
    if (typed!=="حذف") return;
    const { error }=await supabase.rpc("admin_delete_support_thread",{p_thread_id:selectedThread.id});
    if(error){alert(error.message.includes("CLOSE_THREAD_BEFORE_DELETE")?"أغلق المحادثة أولًا قبل حذفها.":error.message);return}
    setSelectedThread(null);setSupportMsgs([]);await loadThreads();
  }

  const openCount = threads.filter((thread) => thread.status === "open").length;
  const statusMeta: Record<string, { label: string; tone: "warning" | "success" | "neutral" | "info" }> = {
    open: { label: "مفتوحة", tone: "warning" }, waiting_user: { label: "بانتظار المستخدم", tone: "info" },
    resolved: { label: "تم الحل", tone: "success" }, closed: { label: "مغلقة", tone: "neutral" },
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-2xl font-bold tracking-tight">مركز الرسائل</h1><p className="mt-1 text-sm text-ink/55">دعم المستخدمين ومراقبة محادثات المنصة</p></div>
        <div className="flex rounded-xl border border-ink/8 bg-white p-1 shadow-sm">
          <button onClick={() => setTab("support")} className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${tab === "support" ? "bg-brand-dark text-white" : "text-ink/55 hover:bg-ink/5"}`}>
            دعم الإدارة {openCount > 0 && <span className="ms-1 rounded-full bg-brand-gold px-1.5 text-[10px] text-brand-dark">{openCount}</span>}
          </button>
          <button onClick={() => setTab("monitoring")} className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${tab === "monitoring" ? "bg-brand-dark text-white" : "text-ink/55 hover:bg-ink/5"}`}>مراقبة المحادثات</button>
        </div>
      </div>

      {tab === "support" && supportError && (
        <Card className="border-red-200 bg-red-50 p-5 text-red-800">
          <p className="font-bold">تعذر تحميل رسائل الإدارة</p>
          <p className="mt-1 text-xs leading-6">{supportError}</p>
          <p className="mt-2 text-xs font-semibold">شغّل ملف <span dir="ltr">admin/supabase/06-support-messaging.sql</span> كاملًا في Supabase SQL Editor، ثم حدّث الصفحة.</p>
        </Card>
      )}

      {tab === "support" ? (
        <div className="grid min-h-[620px] gap-4 lg:grid-cols-[350px_1fr]">
          <Card className="fade-up overflow-hidden p-0">
            <div className="border-b border-ink/7 p-4"><div className="flex items-center gap-2"><Inbox className="size-4 text-brand-teal" /><b className="text-sm">صندوق الدعم</b><span className="ms-auto text-xs text-ink/40">{threads.length}</span></div></div>
            <div className="max-h-[560px] space-y-1 overflow-y-auto p-2">
              {threads.map((thread) => {
                const meta = statusMeta[thread.status] ?? statusMeta.open;
                return <button key={thread.id} onClick={() => setSelectedThread(thread)} className={`w-full rounded-xl p-3 text-start transition ${selectedThread?.id === thread.id ? "bg-brand-dark text-white shadow-md" : "hover:bg-ink/5"}`}>
                  <div className="flex items-center gap-2"><span className={`size-2 rounded-full ${thread.status === "open" ? "bg-amber-400" : thread.status === "waiting_user" ? "bg-blue-400" : "bg-emerald-400"}`} /><p className="min-w-0 flex-1 truncate text-sm font-semibold">{thread.subject}</p></div>
                  <p className={`mt-1.5 truncate text-xs ${selectedThread?.id === thread.id ? "text-white/60" : "text-ink/50"}`}>{thread.profiles?.full_name ?? "مستخدم"}</p>
                  <div className={`mt-2 flex items-center justify-between text-[10px] ${selectedThread?.id === thread.id ? "text-white/45" : "text-ink/35"}`}><span>{meta.label}</span><span>{new Date(thread.last_message_at).toLocaleDateString("ar-MA")}</span></div>
                </button>;
              })}
              {threads.length === 0 && <Empty text="لا توجد طلبات دعم" />}
            </div>
          </Card>

          <Card className="fade-up flex min-h-[620px] flex-col overflow-hidden p-0">
            {!selectedThread ? <div className="grid flex-1 place-items-center"><div className="text-center text-ink/35"><Headphones className="mx-auto size-12" /><p className="mt-4 text-sm">اختر رسالة للرد عليها</p></div></div> : <>
              <div className="flex flex-wrap items-center gap-3 border-b border-ink/7 p-5">
                <span className="grid size-11 place-items-center rounded-2xl bg-brand-teal/10 text-brand-teal"><UserRound className="size-5" /></span>
                <div className="min-w-0 flex-1"><h2 className="truncate font-bold">{selectedThread.subject}</h2><p className="mt-0.5 text-xs text-ink/45">{selectedThread.profiles?.full_name ?? "مستخدم"}</p></div>
                <Badge tone={(statusMeta[selectedThread.status] ?? statusMeta.open).tone}>{(statusMeta[selectedThread.status] ?? statusMeta.open).label}</Badge>
                {!['resolved','closed'].includes(selectedThread.status) && <Btn small tone="ghost" onClick={() => setStatus("resolved")}><CheckCircle2 className="size-3.5" /> تم الحل</Btn>}
                {selectedThread.status!=="closed"&&<Btn small tone="ghost" onClick={closeThread}><LockKeyhole className="size-3.5"/> إغلاق</Btn>}
                {selectedThread.status==="closed"&&<><Btn small tone="ghost" onClick={reopenThread}><RotateCcw className="size-3.5"/> إعادة فتح</Btn><Btn small tone="danger" onClick={deleteThread}><Trash2 className="size-3.5"/> حذف نهائي</Btn></>}
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto bg-ink/[.018] p-5">
                {supportMsgs.map((message) => {
                  const mine = message.sender_id === adminId;
                  return <div key={message.id} className={`flex ${mine ? "justify-start" : "justify-end"}`}><div className={`max-w-[78%] rounded-2xl px-4 py-3 ${mine ? "rounded-es-md bg-brand-dark text-white" : "rounded-ee-md border border-ink/8 bg-white"}`}><div className="mb-1 flex items-center gap-1.5 text-[10px] opacity-55">{mine ? <ShieldCheck className="size-3" /> : <UserRound className="size-3" />}{mine ? "الإدارة" : selectedThread.profiles?.full_name}</div><p className="whitespace-pre-wrap text-sm leading-6">{message.body}</p><p className="mt-1 text-[9px] opacity-40">{new Date(message.created_at).toLocaleString("ar-MA")}</p></div></div>;
                })}
              </div>
              {selectedThread.status !== "closed" && <div className="border-t border-ink/7 bg-white p-4"><div className="flex gap-2"><textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={2} maxLength={4000} placeholder="اكتب رد الإدارة…" className="min-h-12 flex-1 resize-none rounded-xl border border-ink/12 bg-paper/40 px-3 py-2 text-sm outline-none focus:border-brand-teal" /><button onClick={sendReply} disabled={busy || !reply.trim()} className="grid size-12 shrink-0 place-items-center self-end rounded-xl bg-brand-dark text-white transition hover:bg-brand-teal disabled:opacity-40">{busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}</button></div></div>}
            </>}
          </Card>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <Card className="fade-up max-h-[560px] overflow-y-auto p-2">
            {convs.map((c) => <button key={c.id} onClick={() => setSelected(c)} className={`block w-full rounded-xl px-4 py-3 text-start transition ${selected?.id === c.id ? "bg-brand-dark text-white" : "hover:bg-ink/5"}`}><p className="truncate text-sm font-semibold">{c.user?.full_name ?? "؟"} ⇄ {c.expert?.full_name ?? "؟"}</p><p className={`mt-0.5 text-xs ${selected?.id === c.id ? "text-white/60" : "text-ink/45"}`}>{new Date(c.last_message_at).toLocaleString("ar-MA")}</p></button>)}
            {convs.length === 0 && <Empty text="لا توجد محادثات بعد" />}
          </Card>
          <Card className="fade-up flex max-h-[560px] flex-col p-5">
            {!selected ? <div className="grid flex-1 place-items-center text-ink/40"><div className="text-center"><MessageSquareText className="mx-auto size-10" /><p className="mt-3 text-sm">اختر محادثة لعرضها</p></div></div> : <div className="space-y-3 overflow-y-auto">{msgs.map((m) => <div key={m.id} className="rounded-xl bg-ink/4 p-3"><p className="whitespace-pre-wrap text-sm leading-6">{m.body}</p><p className="mt-1 text-[10px] text-ink/40">{new Date(m.created_at).toLocaleString("ar-MA")}</p></div>)}{msgs.length === 0 && <Empty text="محادثة فارغة" />}</div>}
          </Card>
        </div>
      )}
    </div>
  );
}
