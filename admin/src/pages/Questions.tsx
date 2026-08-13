import { useEffect, useState } from "react";
import { Check, X, Trash2, Eye, Lock } from "lucide-react";
import { supabase } from "../supabase";
import { Card, Badge, Btn, Empty } from "../ui";

type Q = {
  id: string; title: string; body: string; tokens: number; status: string;
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

  async function load() {
    const [{ data: qs }, { data: as }] = await Promise.all([
      supabase.from("questions")
        .select("id, title, body, tokens, status, views, answers_count, created_at, profiles:user_id(full_name), categories(name_ar)")
        .order("created_at", { ascending: false }).limit(200),
      supabase.from("answers")
        .select("id, body, status, created_at, profiles:expert_id(full_name), questions(title)")
        .eq("status", "pending")
        .order("created_at", { ascending: false }).limit(200),
    ]);
    setQuestions((qs as unknown as Q[]) ?? []);
    setAnswers((as as unknown as A[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  async function setQStatus(id: string, status: string) {
    await supabase.from("questions").update({ status }).eq("id", id);
    await load();
  }
  async function delQ(id: string) {
    if (!confirm("حذف هذا السؤال نهائيًا؟")) return;
    await supabase.from("questions").delete().eq("id", id);
    await load();
  }
  async function approveAnswer(id: string) {
    const { error } = await supabase.rpc("approve_answer", { p_answer_id: id });
    if (error) alert(error.message);
    await load();
  }
  async function rejectAnswer(id: string) {
    await supabase.from("answers").update({ status: "rejected" }).eq("id", id);
    await load();
  }

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
                      <Btn small tone="danger" onClick={() => setQStatus(q.id, "rejected")}><X className="size-3.5" /> رفض</Btn>
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
                <Btn small tone="danger" onClick={() => rejectAnswer(a.id)}><X className="size-3.5" /> رفض</Btn>
              </div>
            </Card>
          ))}
          {answers.length === 0 && <Card><Empty text="لا توجد أجوبة في انتظار الموافقة 🎉" /></Card>}
        </div>
      )}
    </div>
  );
}
