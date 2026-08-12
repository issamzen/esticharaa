import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Paperclip, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { SiteLayout, PageHeader } from "@/components/site/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "@/data/platform";

export const Route = createFileRoute("/ask")({
  head: () => ({
    meta: [
      { title: "Ask a Question — Estichara.ma" },
      {
        name: "description",
        content:
          "Describe your situation and get answers from verified Moroccan professionals. Free or premium, you choose the token price.",
      },
      { property: "og:title", content: "Ask a Question — Estichara.ma" },
      { property: "og:description", content: "Post your question and reach the right expert." },
    ],
  }),
  component: AskPage,
});

const schema = z.object({
  title: z.string().trim().min(15, "Give your question at least 15 characters of context").max(160),
  body: z.string().trim().min(30, "Add a bit more detail so experts can answer precisely").max(4000),
  category: z.string().min(1, "Pick a category"),
});

const prices = ["Free", "5 tokens", "10 tokens", "20 tokens", "Custom"];

function AskPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [visibility, setVisibility] = useState("Public");
  const [price, setPrice] = useState("5 tokens");

  const submit = () => {
    const result = schema.safeParse({ title, body, category });
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    toast.success("Question ready to publish", {
      description: "Connect the backend to save it and charge tokens.",
    });
  };

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Ask"
        title="Describe your situation"
        description="The clearer the context, the faster a qualified expert can answer. Our assistant helps you sharpen the title and pick the right category."
      />

      <section className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft">
          <div className="space-y-6">
            <div>
              <Label htmlFor="title">Question title</Label>
              <Input
                id="title"
                value={title}
                maxLength={160}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="How do I register as a freelancer with CNSS?"
                className="mt-2 h-12"
              />
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-secondary">
                <Wand2 className="size-3.5" /> AI suggestion: add your city and your current status.
              </p>
            </div>

            <div>
              <Label htmlFor="body">Details</Label>
              <Textarea
                id="body"
                value={body}
                maxLength={4000}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Explain your situation, what you already tried, and what outcome you need."
                className="mt-2 min-h-40"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-2 w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.slug} value={c.slug}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Visibility</Label>
                <Select value={visibility} onValueChange={setVisibility}>
                  <SelectTrigger className="mt-2 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Public">Public</SelectItem>
                    <SelectItem value="Private Premium">Private premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Answer price</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {prices.map((p) => (
                  <Button
                    key={p}
                    type="button"
                    size="sm"
                    variant={price === p ? "default" : "outline"}
                    className="rounded-full"
                    onClick={() => setPrice(p)}
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              <Paperclip className="mx-auto size-5" />
              <p className="mt-2">Attach images or a PDF (max 10 MB)</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 rounded-xl bg-muted/60 p-4 text-xs text-muted-foreground">
              <Sparkles className="size-4 text-secondary" />
              Assistant checks for duplicates, suggests a category and recommends experts before you
              publish.
              <Badge variant="outline" className="ml-auto">
                Beta
              </Badge>
            </div>

            <Button size="lg" className="w-full" onClick={submit}>
              Publish question
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}