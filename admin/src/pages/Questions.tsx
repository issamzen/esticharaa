import { useEffect, useState } from "react";
import { Check, X, Trash2, Eye, Lock, Save } from "lucide-react";
import { supabase } from "../supabase";
import { Card, Badge, Btn, Empty } from "../ui";

type Q = {
  id: string; title: string; body: string; tokens: number; status: string;is_anonymous:boolean;
  views: number; answers_count: number; created_at: string;
  profiles: { full_name: string } | null;
  categories: { name_ar: string } | null;
};
type A = {
  id: string; body: string; status: string; created_at: string;
  profiles: { full_name: string } | null;
  questions: { title: string } | null;
};

export function QuestionsPage() {
  const [tab, setTab] = useState<"questions" | "answers">("questions");
  const [questions, setQuestions] = useState<Q[]>([]);
  const [answers, setAnswers] = useState<A[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reasons, setReasons] = useState<{question:string[];answer:string[]}>({question:[],answer:[]});
  const [decision, setDecision] = useState<{type:"question"|"answer";id:string;title:string}|null>(null);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [savingDecision, setSavingDecision] = useState(false);

  async function load() {
    const [{ data: qs }, { data: as }, { data: moderation }] = await Promise.all([
      supabase.from("questions").select("id, title, body, tokens, status, is_anonymous, views, answers_count, created_at, profiles:user_id(full_name), categories(name_ar)").order("created_at", { ascending: false }).limit(200),
      supabase.from("answers").select("id, body, status, created_at, profiles:expert_id(full_name), questions(title)").eq("status", "pending").order("created_at", { ascending: false }).limit(200),
      supabase.from("settings").select("value").eq("key","moderation_reasons").single(),
    ]);
    setQuestions((qs as unknown as Q[]) ?? []);
    setAnswers((as as unknown as A[]) ?? []);
    if (moderation?.value) setReasons(moderation.value as {question:string[];answer:string[]});
  }
  useEffect(() => { load(); }, []);

  async function setQStatus(id: string, status: "published"|"closed") {
    const { error } = await supabase.rpc("moderate_question", { p_question_id:id,p_status:status,p_public_reason:"",p_internal_note:"" });
    if (error) alert(error.message);
    await load();
  }
  async function delQ(id: string) {
    if (!confirm("حذف هذا السؤال نهائيًا؟")) return;
    await supabase.from("questions").delete().eq("id", id);
    await load();
  }
  async function approveAnswer(id: string) {
    const { error } = await supabase.rpc("moderate_answer", { p_answer_id:id,p_decision:"approved",p_public_reason:"",p_internal_note:"" });
    if (error) alert(error.message);
    await load();
  }
  function openReject(type:"question"|"answer",id:string,title:string){setDecision({type,id,title});setReason("");setNote("")}
  async function submitRejection(){if(!decision||!reason.trim()){alert("اختر أو اكتب سبب الرفض");return}setSavingDecision(true);const{error}=decision.type==="question"?await supabase.rpc("moderate_question",{p_question_id:decision.id,p_status:"rejected",p_public_reason:reason.trim(),p_internal_note:note.trim()}):await supabase.rpc("moderate_answer",{p_answer_id:decision.id,p_decision:"rejected",p_public_reason:reason.trim(),p_internal_note:note.trim()});setSavingDecision(false);if(error){alert(error.message);return}setDecision(null);await load()}

  const pendingQ = questions.filter((q) => q.status === "pending").length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">الأسئلة والأجوبة</h1>
        <p className="mt-1 text-sm text-ink/55">مراجعة المحتوى قبل النشر — الموافقة على جواب تمنح الخبير توكن تلقائيًا</p>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab("questions")} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${tab === "questions" ? "bg-brand-dark text-white" : "bg-ink/5 text-ink/60"}`}>
          الأسئلة {pendingQ > 0 && <span className="ms-1 rounded-full bg-brand-gold px-1.5 text-xs text-brand-dark">{pendingQ}</span>}
        </button>
        <button onClick={() => setTab("answers")} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${tab === "answers" ? "bg-brand-dark text-white" : "bg-ink/5 text-ink/60"}`}>
          أجوبة تنتظر الموافقة {answers.length > 0 && <span className="ms-1 rounded-full bg-brand-gold px-1.5 text-xs text-brand-dark">{answers.length}</span>}
        </button>
      </div>

      {tab === "questions" && (
        <div className="space-y-3">
          {questions.map((q) => (
            <Card key={q.id} className="fade-up p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {q.status === "pending" && <Badge tone="warning">في الانتظار</Badge>}
                    {q.status === "published" && <Badge tone="success">منشور</Badge>}
                    {q.status === "rejected" && <Badge tone="danger">مرفوض</Badge>}
                    {q.status === "closed" && <Badge>مغلق</Badge>}
                    {q.categories && <Badge tone="info">{q.categories.name_ar}</Badge>}
                    {q.is_anonymous&&<Badge tone="neutral">مجهول للعموم</Badge>}
                    {q.tokens > 0 && <Badge tone="warning"><Lock className="me-1 inline size-3" />{q.tokens} توكن</Badge>}
                  </div>
                  <button onClick={() => setExpanded(expanded === q.id ? null : q.id)} className="mt-2 block text-start font-bold hover:text-brand-teal">
                    {q.title}
                  </button>
                  <p className="mt-1 text-xs text-ink/50">
                    بواسطة {q.profiles?.full_name ?? "—"} · {new Date(q.created_at).toLocaleDateString("ar-MA")} · <Eye className="inline size-3" /> {q.views} · {q.answers_count} إجابة
                  </p>
                  {expanded === q.id && <p className="mt-3 whitespace-pre-wrap rounded-xl bg-ink/4 p-4 text-sm leading-7 text-ink/75">{q.body}</p>}
                </div>
                <div className="flex shrink-0 gap-2">
                  {q.status === "pending" && (
                    <>
                      <Btn small onClick={() => setQStatus(q.id, "published")}><Check className="size-3.5" /> نشر</Btn>
                      <Btn small tone="danger" onClick={() => openReject("question",q.id,q.title)}><X className="size-3.5" /> رفض</Btn>
                    </>
                  )}
                  {q.status === "published" && <Btn small tone="ghost" onClick={() => setQStatus(q.id, "closed")}>إغلاق</Btn>}
                  <Btn small tone="danger" onClick={() => delQ(q.id)}><Trash2 className="size-3.5" /></Btn>
                </div>
              </div>
            </Card>
          ))}
          {questions.length === 0 && <Card><Empty text="لا توجد أسئلة بعد" /></Card>}
        </div>
      )}

      {tab === "answers" && (
        <div className="space-y-3">
          {answers.map((a) => (
            <Card key={a.id} className="fade-up p-5">
              <p className="text-xs text-ink/50">جواب على: <span className="font-semibold text-ink/80">{a.questions?.title ?? "—"}</span></p>
              <p className="mt-1 text-xs text-ink/50">الخبير: {a.profiles?.full_name ?? "—"} · {new Date(a.created_at).toLocaleDateString("ar-MA")}</p>
              <p className="mt-3 whitespace-pre-wrap rounded-xl bg-ink/4 p-4 text-sm leading-7 text-ink/75">{a.body}</p>
              <div className="mt-4 flex gap-2">
                <Btn small onClick={() => approveAnswer(a.id)}><Check className="size-3.5" /> موافقة + منح التوكن</Btn>
                <Btn small tone="danger" onClick={() => openReject("answer",a.id,a.questions?.title??"إجابة") }><X className="size-3.5" /> رفض</Btn>
              </div>
            </Card>
          ))}
          {answers.length === 0 && <Card><Empty text="لا توجد أجوبة في انتظار الموافقة 🎉" /></Card>}
        </div>
      )}
      {decision&&<div className="fixed inset-0 z-50 grid place-items-center bg-ink/35 p-4 backdrop-blur-sm" onMouseDown={e=>e.target===e.currentTarget&&setDecision(null)}><Card className="w-full max-w-lg p-6"><div className="flex items-start justify-between"><div><h2 className="text-lg font-bold">رفض {decision.type==="question"?"السؤال":"الإجابة"}</h2><p className="mt-1 line-clamp-2 text-xs text-ink/45">{decision.title}</p></div><button onClick={()=>setDecision(null)} className="rounded-lg bg-ink/5 p-2"><X className="size-4"/></button></div><div className="mt-5"><p className="text-xs font-semibold text-ink/60">سبب يظهر للمستخدم</p><div className="mt-2 flex flex-wrap gap-2">{reasons[decision.type].map(item=><button key={item} onClick={()=>setReason(item)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${reason===item?"bg-red-600 text-white":"bg-ink/5 text-ink/60"}`}>{item}</button>)}</div><textarea value={reason} onChange={e=>setReason(e.target.value)} rows={2} placeholder="أو اكتب سببًا واضحًا…" className="mt-3 w-full resize-none rounded-xl border border-ink/12 bg-white p-3 text-sm outline-none focus:border-red-400"/></div><label className="mt-4 block text-xs font-semibold text-ink/60">ملاحظة داخلية (لا تظهر للمستخدم)<textarea value={note} onChange={e=>setNote(e.target.value)} rows={2} className="mt-1.5 w-full resize-none rounded-xl border border-ink/12 bg-white p-3 text-sm"/></label><div className="mt-5 flex justify-end gap-2"><Btn tone="ghost" onClick={()=>setDecision(null)}>إلغاء</Btn><Btn tone="danger" disabled={savingDecision} onClick={submitRejection}><Save className="size-3.5"/>{savingDecision?"جارٍ الحفظ…":"تأكيد الرفض"}</Btn></div></Card></div>}
    </div>
  );
}
