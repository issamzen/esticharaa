import { Link } from "@tanstack/react-router";
import { MessagesSquare } from "lucide-react";

const groups = [
  {
    title: "Explore",
    links: [
      { to: "/questions", label: "Questions" },
      { to: "/categories", label: "Categories" },
      { to: "/experts", label: "Experts" },
      { to: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Platform",
    links: [
      { to: "/tokens", label: "Token shop" },
      { to: "/pricing", label: "Pricing" },
      { to: "/ask", label: "Ask a question" },
      { to: "/become-expert", label: "Become an expert" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-card/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-semibold">
            <span className="grid size-8 place-items-center rounded-xl bg-brand text-primary-foreground">
              <MessagesSquare className="size-4" />
            </span>
            Estichara<span className="text-muted-foreground">.ma</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Morocco&apos;s marketplace for trusted answers. Ask anything, pay only for the answers
            that actually help you.
          </p>
        </div>
        {groups.map((group) => (
          <div key={group.title}>
            <h3 className="text-sm font-semibold">{group.title}</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {group.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/60 px-4 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Estichara.ma — Casablanca, Morocco. All rights reserved.
      </div>
    </footer>
  );
}