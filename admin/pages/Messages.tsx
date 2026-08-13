import { useEffect, useState } from "react";
import { MessageSquareText } from "lucide-react";
import { supabase } from "../supabase";
import { Card, Empty } from "../ui";

type Conv = {
  id: string; last_message_at: string;
  user: { full_name: string } | null;
  expert: { full_name: string } | null;
};
type Msg = { id: string; body: string; sender_id: string; created_at: string };

export function MessagesPage() {
  const [convs, setConvs] = useState<Conv[]>([]);
  const [selected, setSelected] = useState<Conv | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);

  useEffect(() => {
    supabase.from("conversations")
      .select("id, last_message_at, user:user_id(full_name), expert:expert_id(full_name)")
      .order("last_message_at", { ascending: false }).limit(100)
      .then(({ data }) => setConvs((data as unknown as Conv[]) ?? []));
  }, []);

  useEffect(() => {
    if (!selected) return;
    supabase.from("messages")
      .select("id, body, sender_id, created_at")
      .eq("conversation_id", selected.id)
      .order("created_at")
      .then(({ data }) => setMsgs(data ?? []));
  }, [selected]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">الرسائل</h1>
        <p className="mt-1 text-sm text-ink/55">مراقبة المحادثات بين المستخدمين والخبراء (للإشراف وحل النزاعات)</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="fade-up max-h-[560px] overflow-y-auto p-2">
          {convs.map((c) => (
            <button
              key={c.id} onClick={() => setSelected(c)}
              className={`block w-full rounded-xl px-4 py-3 text-start transition ${selected?.id === c.id ? "bg-brand-dark text-white" : "hover:bg-ink/5"}`}
            >
              <p className="truncate text-sm font-semibold">{c.user?.full_name ?? "؟"} ⇄ {c.expert?.full_name ?? "؟"}</p>
              <p className={`mt-0.5 text-xs ${selected?.id === c.id ? "text-white/60" : "text-ink/45"}`}>
                {new Date(c.last_message_at).toLocaleString("ar-MA")}
              </p>
            </button>
          ))}
          {convs.length === 0 && <Empty text="لا توجد محادثات بعد" />}
        </Card>

        <Card className="fade-up flex max-h-[560px] flex-col p-5">
          {!selected ? (
            <div className="grid flex-1 place-items-center text-ink/40">
              <div className="text-center">
                <MessageSquareText className="mx-auto size-10" />
                <p className="mt-3 text-sm">اختر محادثة لعرضها</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto">
              {msgs.map((m) => (
                <div key={m.id} className="rounded-xl bg-ink/4 p-3">
                  <p className="whitespace-pre-wrap text-sm leading-6">{m.body}</p>
                  <p className="mt-1 text-[10px] text-ink/40">{new Date(m.created_at).toLocaleString("ar-MA")}</p>
                </div>
              ))}
              {msgs.length === 0 && <Empty text="محادثة فارغة" />}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
