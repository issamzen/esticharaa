import { useState, type ChangeEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageCircle, Phone, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { usePageCopy } from "@/i18n/page-copy";
import { createPageSeo, pageHead } from "@/i18n/route-meta";
import { getHomeFaqs } from "@/i18n/home-content";

export const Route = createFileRoute("/contact")({
  loader: ({ context }) => ({
    seo: createPageSeo(context.localeRouting.getLocale(), "contact"),
  }),
  head: ({ loaderData }) => pageHead(loaderData?.seo),
  component: ContactPage,
});

function ContactPage() {
  const copy = usePageCopy().contact;
  const { t } = useTranslation();
  const faqs = getHomeFaqs(t).slice(0, 4);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function submit() {
    const schema = z.object({
      name: z.string().trim().min(2, copy.validationName).max(100),
      email: z.string().trim().email(copy.validationEmail).max(255),
      message: z.string().trim().min(10, copy.validationMessage).max(1000),
    });
    const result = schema.safeParse({ name, email, message });
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? copy.validationGeneric);
      return;
    }
    toast.success(copy.success, { description: copy.successDescription });
    setMessage("");
  }

  const contacts = [
    {
      icon: Mail,
      label: "support@estichara.ma",
      note: copy.support,
      ltr: true,
    },
    {
      icon: MessageCircle,
      label: copy.liveChat,
      note: copy.liveChatHours,
      ltr: false,
    },
    { icon: Phone, label: "+212 5 22 00 00 00", note: copy.office, ltr: true },
  ];

  return (
    <SiteLayout>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_340px] lg:py-20">
        <div className="premium-card p-5 sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">{copy.name}</Label>
              <Input
                id="name"
                value={name}
                maxLength={100}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setName(event.target.value)
                }
                className="mt-2 h-11 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="email">{copy.email}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                maxLength={255}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setEmail(event.target.value)
                }
                className="mt-2 h-11 rounded-xl"
              />
            </div>
          </div>
          <div className="mt-5">
            <Label htmlFor="message">{copy.message}</Label>
            <Textarea
              id="message"
              value={message}
              maxLength={1000}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                setMessage(event.target.value)
              }
              className="mt-2 min-h-44 rounded-xl"
            />
          </div>
          <Button className="mt-6 rounded-xl" onClick={submit}>
            <Send className="size-4" /> {copy.send}
          </Button>
        </div>

        <aside className="space-y-4">
          {contacts.map((item) => (
            <article key={item.label} className="premium-card p-5">
              <span className="grid size-10 place-items-center rounded-xl bg-secondary/10 text-secondary">
                <item.icon className="size-4" />
              </span>
              <p
                className="mt-4 font-semibold"
                data-ltr={item.ltr ? "" : undefined}
              >
                {item.label}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{item.note}</p>
            </article>
          ))}
        </aside>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <h2 className="text-2xl font-semibold sm:text-3xl">{copy.before}</h2>
        <Accordion type="single" collapsible className="mt-5">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.q} value={`faq-${index}`}>
              <AccordionTrigger className="text-start hover:no-underline hover:text-primary">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="leading-7 text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </SiteLayout>
  );
}
