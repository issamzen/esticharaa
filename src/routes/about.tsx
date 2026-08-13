import { createFileRoute } from "@tanstack/react-router";
import { Eye, HeartHandshake, Sparkles, Users } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { usePageCopy } from "@/i18n/page-copy";
import { createPageSeo, pageHead } from "@/i18n/route-meta";

export const Route = createFileRoute("/about")({
  loader: ({ context }) => ({
    seo: createPageSeo(context.localeRouting.getLocale(), "about"),
  }),
  head: ({ loaderData }) => pageHead(loaderData?.seo),
  component: AboutPage,
});

const team = [
  { name: "Anas Berrada", initials: "AB" },
  { name: "Sara Lahlou", initials: "SL" },
  { name: "Omar Idrissi", initials: "OI" },
  { name: "Rim Cherkaoui", initials: "RC" },
];

function AboutPage() {
  const copy = usePageCopy().about;

  return (
    <SiteLayout>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid gap-5 lg:grid-cols-2">
          {[
            {
              icon: HeartHandshake,
              title: copy.missionTitle,
              text: copy.missionText,
            },
            { icon: Eye, title: copy.visionTitle, text: copy.visionText },
          ].map((item, index) => (
            <article
              key={item.title}
              className={`premium-card relative overflow-hidden p-7 sm:p-9 ${
                index === 0 ? "bg-primary text-primary-foreground" : ""
              }`}
            >
              <div className="absolute -end-16 -top-16 size-48 rounded-full bg-accent/15 blur-3xl" />
              <item.icon
                className={`relative size-7 ${index === 0 ? "text-accent" : "text-secondary"}`}
              />
              <h2 className="relative mt-8 text-2xl font-semibold">
                {item.title}
              </h2>
              <p
                className={`relative mt-4 max-w-xl text-sm leading-7 ${
                  index === 0
                    ? "text-primary-foreground/75"
                    : "text-muted-foreground"
                }`}
              >
                {item.text}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-20 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow inline-flex items-center gap-2">
              <Users className="size-4" /> {copy.teamTitle}
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold sm:text-4xl">
              {copy.teamDescription}
            </h2>
          </div>
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member, index) => (
            <article
              key={member.name}
              className="premium-card group p-6 text-center transition duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <span className="bg-brand mx-auto grid size-16 place-items-center rounded-3xl text-lg font-semibold text-primary-foreground shadow-lg">
                {member.initials}
              </span>
              <h3 className="mt-5 font-semibold">{member.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {copy.teamRoles[index]}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-20">
          <p className="eyebrow inline-flex items-center gap-2">
            <Sparkles className="size-4 text-accent" /> {copy.partnersTitle}
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {copy.partners.map((partner) => (
              <div
                key={partner}
                className="premium-card grid min-h-24 place-items-center px-5 text-center text-sm font-medium text-muted-foreground"
              >
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
