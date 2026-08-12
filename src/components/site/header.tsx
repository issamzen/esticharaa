import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, MessagesSquare, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "./theme-toggle";

const nav = [
  { to: "/questions", label: "Questions" },
  { to: "/categories", label: "Categories" },
  { to: "/experts", label: "Experts" },
  { to: "/tokens", label: "Token shop" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="grid size-8 place-items-center rounded-xl bg-brand text-primary-foreground">
            <MessagesSquare className="size-4" />
          </span>
          <span className="tracking-tight">
            Estichara<span className="text-muted-foreground">.ma</span>
          </span>
        </Link>

        <nav className="mx-auto hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              activeProps={{ className: "text-foreground bg-muted" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/tokens">
              <Coins className="size-4" /> Tokens
            </Link>
          </Button>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to="/ask">Ask a question</Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="mt-10 flex flex-col gap-1 px-4">
                {nav.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                    activeProps={{ className: "text-foreground bg-muted" }}
                  >
                    {item.label}
                  </Link>
                ))}
                <Button asChild className="mt-4">
                  <Link to="/ask" onClick={() => setOpen(false)}>
                    Ask a question
                  </Link>
                </Button>
                <Button asChild variant="outline" className="mt-2">
                  <Link to="/contact" onClick={() => setOpen(false)}>
                    Contact
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}