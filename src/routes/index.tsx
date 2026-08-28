import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Eye, PenLine, Send } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main className="min-h-dvh bg-bg text-fg">
      <header className="flex h-12 items-center justify-between border-b border-border px-5 sm:px-8">
        <Link
          to="/"
          className="inline-flex h-10 items-center font-serif text-lg tracking-tight"
        >
          Cozy
        </Link>
        <Link to="/studio" className={buttonVariants({ size: "sm" })}>
          Open Studio
        </Link>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pt-16">
        <div>
          <p className="mb-4 text-xs uppercase tracking-widest text-muted">
            Brief to preview
          </p>
          <h1 className="font-serif text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
            A quiet studio for shipping product surfaces.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Write a brief. Get one HTML preview. Revise in place, then download
            the .html file.
          </p>
          <div className="mt-10">
            <Link
              to="/studio"
              className={cn(buttonVariants(), "h-12 px-6 pr-5")}
            >
              Open Studio
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
        <img
          src="/og.jpg"
          alt="Desk lamp over a paper studio"
          className="aspect-[5/4] h-auto w-full rounded-3xl border border-border object-cover"
        />
      </section>

      <ul className="mx-auto grid max-w-6xl gap-4 px-5 pb-20 sm:grid-cols-3 sm:px-8">
        {[
          {
            icon: PenLine,
            title: "Brief",
            body: "Describe the page in one paragraph.",
          },
          {
            icon: Eye,
            title: "Preview",
            body: "One self-contained HTML preview in a sandboxed iframe.",
          },
          {
            icon: Send,
            title: "Revise & download",
            body: "Edit the brief to revise in place, then copy or download .html.",
          },
        ].map((item) => (
          <li key={item.title}>
            <Link
              to="/studio"
              className="block rounded-3xl border border-border bg-surface p-5 transition-colors duration-150 hover:bg-card"
            >
              <item.icon className="mb-3 size-4 text-accent" />
              <h2 className="text-sm font-semibold">{item.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">{item.body}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
