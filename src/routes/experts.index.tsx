import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { ExpertCard } from "@/components/site/expert-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { experts } from "@/data/platform";

const professions = ["All", ...new Set(experts.map((e) => e.specialization))];

export const Route = createFileRoute("/experts/")({
  head: () => ({
    meta: [
      { title: "Expert Directory — Estichara.ma" },
      {
        name: "description",
        content:
          "Browse verified Moroccan doctors, lawyers, accountants and consultants answering real questions every day.",
      },
      { property: "og:title", content: "Expert Directory — Estichara.ma" },
      {
        property: "og:description",
        content: "Verified professionals ranked by rating, response time and answers delivered.",
      },
    ],
  }),
  component: ExpertsPage,
});

function ExpertsPage() {
  const [query, setQuery] = useState("");
  const [profession, setProfession] = useState("All");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const visible = useMemo(
    () =>
      experts.filter(
        (e) =>
          (profession === "All" || e.specialization === profession) &&
          (!verifiedOnly || e.verified) &&
          (e.name.toLowerCase().includes(query.toLowerCase()) ||
            e.title.toLowerCase().includes(query.toLowerCase()) ||
            e.city.toLowerCase().includes(query.toLowerCase())),
      ),
    [query, profession, verifiedOnly],
  );

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Experts"
        title="People who actually know"
        description="Doctors, lawyers, accountants, consultants and practitioners — each verified against their diplomas and professional records."
      >
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, profession or city…"
            className="h-12 rounded-full pl-10"
          />
        </div>
      </PageHeader>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap gap-2">
          {professions.map((p) => (
            <Button
              key={p}
              size="sm"
              variant={profession === p ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setProfession(p)}
            >
              {p}
            </Button>
          ))}
          <Button
            size="sm"
            variant={verifiedOnly ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setVerifiedOnly((v) => !v)}
          >
            Verified only
          </Button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((expert) => (
            <ExpertCard key={expert.slug} expert={expert} />
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}