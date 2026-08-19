import { useEffect, useState } from "react";
import {
  FolderTree,
  Plus,
  Pencil,
  Eye,
  EyeOff,
  Trash2,
  X,
  Save,
  GripVertical,
} from "lucide-react";
import { supabase } from "../supabase";
import { Card, Badge, Btn, Empty } from "../ui";

type Category = {
  id: string;
  slug: string;
  name_ar: string;
  name_fr: string;
  name_en: string;
  icon: string;
  sort: number;
  active: boolean;
  description_ar: string;
  description_fr: string;
  description_en: string;
  expert_audience_ids: string[];
  min_reward_tokens: number;
  questions: { count: number }[];
};

type Audience = {
  id: string;
  label_ar: string;
  active: boolean;
};

const EMPTY: Omit<Category, "id" | "questions"> = {
  slug: "",
  name_ar: "",
  name_fr: "",
  name_en: "",
  icon: "Sparkles",
  sort: 0,
  active: true,
  description_ar: "",
  description_fr: "",
  description_en: "",
  expert_audience_ids: [],
  min_reward_tokens: 0,
};

export function CategoriesPage() {
  const [rows, setRows] = useState<Category[]>([]);
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [editing, setEditing] = useState<
    Omit<Category, "questions"> | null
  >(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const [{ data, error }, { data: settings }] = await Promise.all([
      supabase
        .from("categories")
        .select(
          "id,slug,name_ar,name_fr,name_en,icon,sort,active,description_ar,description_fr,description_en,expert_audience_ids,min_reward_tokens,questions(count)",
        )
        .order("sort"),
      supabase
        .from("settings")
        .select("value")
        .eq("key", "expert_audiences")
        .single(),
    ]);

    if (error) {
      alert(`${error.message}\nRun migration 09 first.`);
      return;
    }

    setRows((data as unknown as Category[]) ?? []);

    setAudiences(
      (((settings?.value as Audience[]) ?? []).filter(
        (item) => item.active,
      )),
    );
  }

  useEffect(() => {
    load();
  }, []);

  function newCategory() {
    setEditing({
      id: "",
      ...EMPTY,
      sort: rows.length + 1,
    });
  }

  async function save() {
    if (
      !editing ||
      !editing.slug.trim() ||
      !editing.name_ar.trim()
    ) {
      alert("الرمز والاسم العربي مطلوبان");
      return;
    }

    setSaving(true);

    const payload = {
      ...editing,
      slug: editing.slug
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-"),
      name_ar: editing.name_ar.trim(),
    };

    const { id, ...values } = payload;

    const { error } = id
      ? await supabase
          .from("categories")
          .update(values)
          .eq("id", id)
      : await supabase.from("categories").insert(values);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    setEditing(null);
    await load();
  }

  async function toggle(item: Category) {
    const { error } = await supabase
      .from("categories")
      .update({ active: !item.active })
      .eq("id", item.id);

    if (error) {
      alert(error.message);
      return;
    }

    await load();
  }

  async function remove(item: Category) {
    if ((item.questions?.[0]?.count ?? 0) > 0) {
      alert(
        "لا يمكن حذف تصنيف يحتوي على أسئلة. عطّله بدلًا من ذلك.",
      );
      return;
    }

    if (!confirm(`حذف تصنيف «${item.name_ar}»؟`)) {
      return;
    }

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", item.id);

    if (error) {
      alert(error.message);
      return;
    }

    await load();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <FolderTree className="size-6 text-brand-teal" />
            إدارة التصنيفات
          </h1>

          <p className="mt-1 text-sm text-ink/55">
            الأسماء والترجمات والترتيب والفئات المهنية والمكافأة
            المقترحة
          </p>
        </div>

        <Btn onClick={newCategory}>
          <Plus className="size-4" />
          تصنيف جديد
        </Btn>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((item) => (
          <Card
            key={item.id}
            className={`group p-5 transition hover:-translate-y-0.5 hover:shadow-lg ${
              !item.active ? "opacity-55" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-brand-teal/10 text-brand-teal">
                <FolderTree className="size-5" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="truncate font-bold">
                    {item.name_ar}
                  </h2>

                  {item.active ? (
                    <Badge tone="success">مفعّل</Badge>
                  ) : (
                    <Badge>مخفي</Badge>
                  )}
                </div>

                <p
                  className="mt-0.5 text-xs text-ink/40"
                  dir="ltr"
                >
                  /{item.slug}
                </p>
              </div>

              <GripVertical className="size-4 text-ink/20" />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Mini
                label="الأسئلة"
                value={item.questions?.[0]?.count ?? 0}
              />
              <Mini label="الترتيب" value={item.sort} />
              <Mini
                label="أقل مكافأة"
                value={item.min_reward_tokens}
              />
            </div>

            {item.expert_audience_ids.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {item.expert_audience_ids.map((id) => (
                  <span
                    key={id}
                    className="rounded-full bg-ink/5 px-2 py-1 text-[10px] text-ink/55"
                  >
                    {audiences.find((audience) => audience.id === id)
                      ?.label_ar ?? id}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 flex gap-2 border-t border-ink/7 pt-3">
              <Btn
                small
                tone="ghost"
                onClick={() => setEditing({ ...item })}
              >
                <Pencil className="size-3.5" />
                تعديل
              </Btn>

              <Btn
                small
                tone="ghost"
                onClick={() => toggle(item)}
              >
                {item.active ? (
                  <EyeOff className="size-3.5" />
                ) : (
                  <Eye className="size-3.5" />
                )}

                {item.active ? "إخفاء" : "إظهار"}
              </Btn>

              <Btn
                small
                tone="danger"
                onClick={() => remove(item)}
              >
                <Trash2 className="size-3.5" />
              </Btn>
            </div>
          </Card>
        ))}

        {rows.length === 0 && (
          <Card className="md:col-span-2 xl:col-span-3">
            <Empty text="لا توجد تصنيفات" />
          </Card>
        )}
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-ink/30 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setEditing(null);
            }
          }}
        >
          <div className="h-full w-full max-w-2xl overflow-y-auto bg-paper p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  {editing.id
                    ? "تعديل التصنيف"
                    : "تصنيف جديد"}
                </h2>

                <p className="mt-1 text-xs text-ink/45">
                  يظهر التغيير في الموقع مباشرة بعد الحفظ
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-xl bg-ink/5 p-2"
                aria-label="إغلاق"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <Field
                label="الاسم بالعربية"
                value={editing.name_ar}
                onChange={(value) =>
                  setEditing({
                    ...editing,
                    name_ar: value,
                  })
                }
              />

              <Field
                label="Slug (لاتيني)"
                value={editing.slug}
                dir="ltr"
                onChange={(value) =>
                  setEditing({
                    ...editing,
                    slug: value,
                  })
                }
              />

              <Field
                label="الاسم بالفرنسية"
                value={editing.name_fr}
                dir="ltr"
                onChange={(value) =>
                  setEditing({
                    ...editing,
                    name_fr: value,
                  })
                }
              />

              <Field
                label="الاسم بالإنجليزية"
                value={editing.name_en}
                dir="ltr"
                onChange={(value) =>
                  setEditing({
                    ...editing,
                    name_en: value,
                  })
                }
              />

              <Field
                label="اسم الأيقونة"
                value={editing.icon}
                dir="ltr"
                onChange={(value) =>
                  setEditing({
                    ...editing,
                    icon: value,
                  })
                }
              />

              <NumberField
                label="الترتيب"
                value={editing.sort}
                onChange={(value) =>
                  setEditing({
                    ...editing,
                    sort: value,
                  })
                }
              />

              <NumberField
                label="أقل مكافأة مقترحة"
                value={editing.min_reward_tokens}
                onChange={(value) =>
                  setEditing({
                    ...editing,
                    min_reward_tokens: value,
                  })
                }
              />
            </div>

            <div className="mt-4 space-y-3">
              <Area
                label="وصف عربي"
                value={editing.description_ar}
                onChange={(value) =>
                  setEditing({
                    ...editing,
                    description_ar: value,
                  })
                }
              />

              <Area
                label="Description française"
                value={editing.description_fr}
                dir="ltr"
                onChange={(value) =>
                  setEditing({
                    ...editing,
                    description_fr: value,
                  })
                }
              />

              <Area
                label="English description"
                value={editing.description_en}
                dir="ltr"
                onChange={(value) =>
                  setEditing({
                    ...editing,
                    description_en: value,
                  })
                }
              />
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold text-ink/60">
                الفئات المهنية المرتبطة
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {audiences.map((audience) => {
                  const selected =
                    editing.expert_audience_ids.includes(
                      audience.id,
                    );

                  return (
                    <button
                      type="button"
                      key={audience.id}
                      onClick={() =>
                        setEditing({
                          ...editing,
                          expert_audience_ids: selected
                            ? editing.expert_audience_ids.filter(
                                (id) => id !== audience.id,
                              )
                            : [
                                ...editing.expert_audience_ids,
                                audience.id,
                              ],
                        })
                      }
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                        selected
                          ? "bg-brand-teal text-white"
                          : "bg-white text-ink/55"
                      }`}
                    >
                      {audience.label_ar} {selected ? "✓" : "+"}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="mt-5 flex items-center gap-3 rounded-xl bg-white p-4 text-sm font-semibold">
              <input
                type="checkbox"
                checked={editing.active}
                onChange={(event) =>
                  setEditing({
                    ...editing,
                    active: event.target.checked,
                  })
                }
              />

              التصنيف مفعّل
            </label>

            <div className="sticky bottom-0 mt-7 flex justify-end gap-2 border-t border-ink/8 bg-paper/90 py-4 backdrop-blur">
              <Btn
                tone="ghost"
                onClick={() => setEditing(null)}
              >
                إلغاء
              </Btn>

              <Btn disabled={saving} onClick={save}>
                <Save className="size-4" />
                {saving ? "جارٍ الحفظ…" : "حفظ التصنيف"}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Mini({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-ink/[.035] p-2">
      <b>{value}</b>
      <p className="text-[9px] text-ink/40">{label}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  dir,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  dir?: "ltr";
}) {
  return (
    <label className="text-xs font-semibold text-ink/60">
      {label}

      <input
        dir={dir}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 w-full rounded-xl border border-ink/12 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="text-xs font-semibold text-ink/60">
      {label}

      <input
        type="number"
        min="0"
        dir="ltr"
        value={value}
        onChange={(event) =>
          onChange(Number(event.target.value) || 0)
        }
        className="mt-1.5 w-full rounded-xl border border-ink/12 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
      />
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
  dir,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  dir?: "ltr";
}) {
  return (
    <label className="block text-xs font-semibold text-ink/60">
      {label}

      <textarea
        dir={dir}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={2}
        className="mt-1.5 w-full resize-none rounded-xl border border-ink/12 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-teal"
      />
    </label>
  );
}
