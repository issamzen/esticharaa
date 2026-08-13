import { useEffect, useState } from "react";
import { Save, Coins, Award, Wallet, ArrowLeftRight, Wrench } from "lucide-react";
import { supabase } from "../supabase";
import { Card, Btn } from "../ui";

const FIELDS = [
  { key: "award_per_answer", label: "توكن يكسبه الخبير عن كل جواب معتمد", icon: Award, type: "number" },
  { key: "best_answer_bonus", label: "بونص أفضل جواب", icon: Coins, type: "number" },
  { key: "min_payout_tokens", label: "الحد الأدنى للسحب (توكن)", icon: Wallet, type: "number" },
  { key: "token_to_mad", label: "قيمة التوكن عند السحب (درهم)", icon: ArrowLeftRight, type: "number" },
] as const;

export function SettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [maintenance, setMaintenance] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from("settings").select("key, value").then(({ data }) => {
      const v: Record<string, string> = {};
      (data ?? []).forEach((row) => {
        if (row.key === "maintenance_mode") setMaintenance(row.value === true || row.value === "true");
        else v[row.key] = String(row.value);
      });
      setValues(v);
    });
  }, []);

  async function save() {
    for (const f of FIELDS) {
      await supabase.from("settings").update({ value: values[f.key] }).eq("key", f.key);
    }
    await supabase.from("settings").update({ value: maintenance }).eq("key", "maintenance_mode");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">إعدادات المنصة</h1>
        <p className="mt-1 text-sm text-ink/55">قواعد اقتصاد التوكن وحالة الموقع</p>
      </div>

      <Card className="fade-up space-y-5 p-6">
        {FIELDS.map((f) => (
          <div key={f.key} className="flex items-center gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-dark/8 text-brand-dark">
              <f.icon className="size-4.5" />
            </span>
            <label className="flex-1 text-sm font-medium">{f.label}</label>
            <input
              type="number" step="0.1" dir="ltr"
              value={values[f.key] ?? ""}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              className="w-28 rounded-xl border border-ink/15 bg-white px-3 py-2 text-center text-sm font-bold outline-none focus:border-brand-teal"
            />
          </div>
        ))}

        <div className="flex items-center gap-4 border-t border-ink/8 pt-5">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-600">
            <Wrench className="size-4.5" />
          </span>
          <label className="flex-1 text-sm font-medium">وضع الصيانة (يخفي الموقع عن الزوار)</label>
          <button
            onClick={() => setMaintenance(!maintenance)}
            className={`relative h-7 w-12 rounded-full transition ${maintenance ? "bg-brand-teal" : "bg-ink/20"}`}
          >
            <span className={`absolute top-1 size-5 rounded-full bg-white shadow transition-all ${maintenance ? "start-6" : "start-1"}`} />
          </button>
        </div>

        <div className="flex items-center gap-3 border-t border-ink/8 pt-5">
          <Btn onClick={save}><Save className="size-4" /> حفظ الإعدادات</Btn>
          {saved && <span className="text-sm font-semibold text-emerald-600">تم الحفظ ✓</span>}
        </div>
      </Card>
    </div>
  );
}
