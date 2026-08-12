import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageCircle, Phone } from "lucide-react";
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
import { faqs } from "@/data/platform";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Support — Estichara.ma" },
      {
        name: "description",
        content:
          "Reach the Estichara.ma team for support on tokens, payouts, expert verification or partnerships.",
      },
      { property: "og:title", content: "Contact & Support — Estichara.ma" },
      { property: "og:description", content: "Support, partnerships and expert verification help." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  message: z.string().trim().min(10, "Tell us a little more").max(1000),
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const submit = () => {
    const result = schema.safeParse({ name, email, message });
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    toast.success("Message ready to send", {
      description: "Connect the backend to deliver it to support.",
    });
    setMessage("");
  };

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Contact"
        title="We answer people who answer people"
        description="Support for tokens, payouts, verification and partnerships. Average first reply under 4 hours on business days."
      />

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-14 lg:grid-cols-[1fr_340px]">
        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                maxLength={100}
                onChange={(e) => setName(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                maxLength={255}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              maxLength={1000}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-2 min-h-40"
            />
          </div>
          <Button className="mt-6" onClick={submit}>
            Send message
          </Button>
        </div>

        <aside className="space-y-4">
          {[
            { icon: Mail, label: "support@estichara.ma", note: "General & billing support" },
            { icon: MessageCircle, label: "Live chat", note: "Mon–Fri, 9:00–18:00" },
            { icon: Phone, label: "+212 5 22 00 00 00", note: "Casablanca office" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft"
            >
              <item.icon className="size-4 text-secondary" />
              <p className="mt-3 font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.note}</p>
            </div>
          ))}
        </aside>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-16">
        <h2 className="text-2xl font-semibold">Before you write</h2>
        <Accordion type="single" collapsible className="mt-4">
          {faqs.slice(0, 4).map((faq) => (
            <AccordionItem key={faq.q} value={faq.q}>
              <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </SiteLayout>
  );
}