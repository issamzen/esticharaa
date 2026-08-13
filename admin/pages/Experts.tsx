import { useEffect, useState } from "react";
import { BadgeCheck, X, Pause, Star } from "lucide-react";
import { supabase } from "../supabase";
import { Card, Badge, Btn, Empty } from "../ui";

type Expert = {
  user_id: string; title: string; specialization: string; city: string;
  status: string; verified: boolean; rating: number; answered_count: number;
  earned_tokens: number;
  profiles: { full_name: string } | null;
};

const STATUS_BADGE: Record<string, { label: string; tone: "warning" | "success" | "danger" | "neutral" }> = {
  pending: { label: "في الانتظار", tone: "warning" },
  approved: { label: "معتمد", tone: "success" },
  rejected: { label: "مرفوض", tone: "danger" },
  suspended: { label: "موقوف", tone: "neutral" },
};

export function ExpertsPage() {
  const [rows, setRows] = useState<Expert[]>([]);
  const [tab, setTab] = useState<"pending" | "approved" | "all">("pending");

  async function load() {
    const { data } = await supabase
      .from("expert_profiles")
      .select("user_id, title, specialization, city, status, verified, rating, answered_count, earned_tokens, profiles(full_name)")
      .order("created_at", { ascending: false });
    setRows((data as unknown as Expert[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  async function setStatus(id: string, status: string, verified?: boolean) {
    const patch: Record<string, unknown> = { status };
    if (verified !== undefined) patch.verified = verified;
    await supabase.from("expert_profiles").update(patch).eq("user_id", id);
    if (status === "approved") await supabase.from("profiles").update({ role: "expert" }).eq("id", id);
    await load();
  }

  const filtered = rows.filter((r) => tab === "all" || r.status === tab);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">الخبراء</h1>
        <p className="mt-1 text-sm text-ink/55">اعتماد الطلبات الجديدة وإدارة الخبراء</p>
      </div>

      <div className="flex gap-2">
        {([["pending", "في الانتظار"], ["approved", "معتمدون"], ["all", "الكل"]] as const).map(([id, label]) => (
          <button
            key={id} onClick={() => setTab(id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${tab === id ? "bg-brand-dark text-white" : "bg-ink/5 text-ink/60 hover:bg-ink/10"}`}
          >
            {label} {id === "pending" && rows.filter((r) => r.status === "pending").length > 0 && (
              <span className="ms-1 rounded-full bg-brand-gold px-1.5 text-xs text-brand-dark">{rows.filter((r) => r.status === "pending").length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((e) => {
          const sb = STATUS_BADGE[e.status] ?? STATUS_BADGE.pending;
          return (
            <Card key={e.user_id} className="fade-up p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-bold">{e.profiles?.full_name ?? "—"}</p>
                    {e.verified && <BadgeCheck className="size-4 shrink-0 fill-brand-teal text-white" />}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-ink/60">{e.title} · {e.city}</p>
                  <p className="mt-0.5 text-xs text-ink/45">{e.specialization}</p>
                </div>
                <Badge tone={sb.tone}>{sb.label}</Badge>
              </div>

              <div className="mt-4 flex items-center gap-4 text-xs text-ink/55">
                <span className="inline-flex items-center gap-1"><Star className="size-3.5 fill-amber-400 text-amber-400" /> {e.rating || "—"}</span>
                <span>{e.answered_count} إجابة</span>
                <span>{e.earned_tokens} توكن مكتسب</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-ink/8 pt-4">
                {e.status !== "approved" && (
                  <Btn small onClick={() => setStatus(e.user_id, "approved", true)}>
                    <BadgeCheck className="size-3.5" /> اعتماد وتوثيق
                  </Btn>
                )}
                {e.status === "pending" && (
                  <Btn small tone="danger" onClick={() => setStatus(e.user_id, "rejected")}>
                    <X className="size-3.5" /> رفض
                  </Btn>
                )}
                {e.status === "approved" && (
                  <Btn small tone="ghost" onClick={() => setStatus(e.user_id, "suspended")}>
                    <Pause className="size-3.5" /> إيقاف مؤقت
                  </Btn>
                )}
              </div>
            </Card>
          );
        })}
      </div>
      {filtered.length === 0 && <Card><Empty text="لا توجد طلبات في هذه الفئة" /></Card>}
    </div>
  );
}
