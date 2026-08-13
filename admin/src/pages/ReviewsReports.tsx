import { useEffect, useState } from "react";
import { Star, Trash2, Check } from "lucide-react";
import { supabase } from "../supabase";
import { Card, Badge, Btn, Empty } from "../ui";

type Review = {
  id: string; rating: number; comment: string; created_at: string;
  expert: { full_name: string } | null;
  reviewer: { full_name: string } | null;
};
type Report = {
  id: string; target_type: string; reason: string; resolved: boolean; created_at: string;
  reporter: { full_name: string } | null;
};

export function ReviewsReportsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  async function load() {
    const [{ data: rv }, { data: rp }] = await Promise.all([
      supabase.from("reviews").select("id, rating, comment, created_at, expert:expert_id(full_name), reviewer:user_id(full_name)").order("created_at", { ascending: false }).limit(100),
      supabase.from("reports").select("id, target_type, reason, resolved, created_at, reporter:reporter_id(full_name)").order("created_at", { ascending: false }).limit(100),
    ]);
    setReviews((rv as unknown as Review[]) ?? []);
    setReports((rp as unknown as Report[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  async function delReview(id: string) {
    if (!confirm("حذف هذا التقييم؟")) return;
    await supabase.from("reviews").delete().eq("id", id);
    await load();
  }
  async function resolveReport(id: string) {
    await supabase.from("reports").update({ resolved: true }).eq("id", id);
    await load();
  }

  const TARGET_LABEL: Record<string, string> = { question: "سؤال", answer: "جواب", user: "مستخدم", message: "رسالة" };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">التقييمات والبلاغات</h1>
        <p className="mt-1 text-sm text-ink/55">إدارة تقييمات الخبراء ومعالجة بلاغات الإساءة</p>
      </div>

      <section className="space-y-3">
        <h2 className="font-bold">البلاغات {reports.filter((r) => !r.resolved).length > 0 && <Badge tone="danger">{reports.filter((r) => !r.resolved).length} غير معالَج</Badge>}</h2>
        {reports.map((r) => (
          <Card key={r.id} className={`fade-up flex flex-wrap items-center justify-between gap-3 p-4 ${r.resolved ? "opacity-55" : ""}`}>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Badge tone="info">{TARGET_LABEL[r.target_type] ?? r.target_type}</Badge>
                {r.resolved ? <Badge tone="success">معالَج</Badge> : <Badge tone="danger">جديد</Badge>}
              </div>
              <p className="mt-2 text-sm">{r.reason}</p>
              <p className="mt-1 text-xs text-ink/45">بلّغ عنه: {r.reporter?.full_name ?? "مجهول"} · {new Date(r.created_at).toLocaleDateString("ar-MA")}</p>
            </div>
            {!r.resolved && <Btn small onClick={() => resolveReport(r.id)}><Check className="size-3.5" /> تمت المعالجة</Btn>}
          </Card>
        ))}
        {reports.length === 0 && <Card><Empty text="لا توجد بلاغات 🎉" /></Card>}
      </section>

      <section className="space-y-3">
        <h2 className="font-bold">أحدث التقييمات</h2>
        <div className="grid gap-3 lg:grid-cols-2">
          {reviews.map((rv) => (
            <Card key={rv.id} className="fade-up p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`size-4 ${i < rv.rating ? "fill-amber-400 text-amber-400" : "text-ink/20"}`} />
                  ))}
                </div>
                <Btn small tone="danger" onClick={() => delReview(rv.id)}><Trash2 className="size-3.5" /></Btn>
              </div>
              {rv.comment && <p className="mt-2 text-sm leading-6 text-ink/75">{rv.comment}</p>}
              <p className="mt-2 text-xs text-ink/45">
                {rv.reviewer?.full_name ?? "—"} ← الخبير {rv.expert?.full_name ?? "—"} · {new Date(rv.created_at).toLocaleDateString("ar-MA")}
              </p>
            </Card>
          ))}
        </div>
        {reviews.length === 0 && <Card><Empty text="لا توجد تقييمات بعد" /></Card>}
      </section>
    </div>
  );
}
