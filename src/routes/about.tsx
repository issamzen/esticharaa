import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site/layout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Estichara.ma — Trusted Answers for Morocco" },
      {
        name: "description",
        content:
          "Why we built a Moroccan question and answer marketplace where expertise is verified and fairly paid.",
      },
      { property: "og:title", content: "About Estichara.ma" },
      {
        property: "og:description",
        content: "Our mission, vision, team and partners.",
      },
    ],
  }),
  component: AboutPage,
});

const team = [
  { name: "Anas Berrada", role: "Co-founder & CEO", initials: "AB" },
  { name: "Sara Lahlou", role: "Co-founder & Head of Trust", initials: "SL" },
  { name: "Omar Idrissi", role: "Engineering", initials: "OI" },
  { name: "Rim Cherkaoui", role: "Expert relations", initials: "RC" },
];

function AboutPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="About"
        title="Good advice shouldn't depend on who you know"
        description="Estichara.ma turns scattered expertise into an accessible, verified and fairly paid marketplace for everyone in Morocco."
      />

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft">
            <h2 className="text-lg font-semibold">Mission</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Give every person in Morocco direct access to a qualified answer, in minutes, without
              relying on a family contact or a paid appointment they cannot afford.
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft">
            <h2 className="text-lg font-semibold">Vision</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              A national knowledge base written by practitioners, where each answer keeps helping
              long after it was written and keeps rewarding the person who wrote it.
            </p>
          </div>
        </div>

        <h2 className="mt-14 text-2xl font-semibold">Our team</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member) => (
            <div
              key={member.name}
              className="rounded-2xl border border-border/70 bg-card p-6 text-center shadow-soft"
            >
              <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand text-lg font-semibold text-primary-foreground">
                {member.initials}
              </span>
              <p className="mt-4 font-medium">{member.name}</p>
              <p className="text-xs text-muted-foreground">{member.role}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-14 text-2xl font-semibold">Partners</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {["Casablanca Bar Association", "Moroccan Medical Council", "Startup Maroc", "CMI"].map(
            (partner) => (
              <div
                key={partner}
                className="grid h-24 place-items-center rounded-2xl border border-border/70 bg-card px-4 text-center text-sm text-muted-foreground shadow-soft"
              >
                {partner}
              </div>
            ),
          )}
        </div>
      </section>
    </SiteLayout>
  );
}