import { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Home,
  LayoutGrid,
  Menu,
  MessageSquare,
  Plus,
  Search,
  Star,
  StickyNote,
  TableProperties,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { StudioRecent } from "@/lib/studio/recents";
import { STARTERS, type Starter } from "@/lib/preview/starters";

const STARTER_ICONS: Record<string, typeof LayoutGrid> = {
  kanban: LayoutGrid,
  chat: MessageSquare,
  habits: TableProperties,
  calendar: Calendar,
  notes: StickyNote,
};

type StudioNavRailProps = {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
  lastStarterId: string | null;
  recents: StudioRecent[];
  starredIds: Set<string>;
  running: boolean;
  onNew: () => void;
  onStarter: (starter: Starter) => void;
  onRecent: (recent: StudioRecent) => void;
  onToggleStar: (id: string) => void;
};

function NavMark({ compact }: { compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", compact && "justify-center")}>
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card font-serif text-sm text-accent"
        aria-hidden
      >
        C
      </span>
      {!compact ? (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-fg">Cozy Studio</p>
          <p className="truncate text-[10px] uppercase tracking-widest text-subtle">Generate</p>
        </div>
      ) : null}
    </div>
  );
}

function StarterRow({
  starter,
  active,
  collapsed,
  disabled,
  onClick,
}: {
  starter: Starter;
  active: boolean;
  collapsed: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = STARTER_ICONS[starter.id] ?? LayoutGrid;
  return (
    <button
      type="button"
      disabled={disabled}
      title={collapsed ? starter.label : undefined}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
        collapsed && "justify-center px-1.5",
        active
          ? "bg-accent/15 text-accent"
          : "text-muted hover:bg-card hover:text-fg",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      {!collapsed ? <span className="truncate">{starter.label}</span> : null}
    </button>
  );
}

function RailBody({
  collapsed,
  lastStarterId,
  recents,
  starredIds,
  running,
  onNew,
  onStarter,
  onRecent,
  onToggleStar,
  onSearchOpen,
}: {
  collapsed: boolean;
  lastStarterId: string | null;
  recents: StudioRecent[];
  starredIds: Set<string>;
  running: boolean;
  onNew: () => void;
  onStarter: (starter: Starter) => void;
  onRecent: (recent: StudioRecent) => void;
  onToggleStar: (id: string) => void;
  onSearchOpen: () => void;
}) {
  const sortedRecents = useMemo(() => {
    const starred = recents.filter((r) => starredIds.has(r.id));
    const rest = recents.filter((r) => !starredIds.has(r.id));
    return [...starred, ...rest];
  }, [recents, starredIds]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-2">
      <nav className="space-y-0.5" aria-label="Studio">
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm",
            collapsed && "justify-center px-1.5",
            "bg-card text-fg",
          )}
          aria-current="page"
        >
          <Home className="size-4 shrink-0" aria-hidden />
          {!collapsed ? <span>Studio</span> : null}
        </button>
        <button
          type="button"
          onClick={onSearchOpen}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-muted transition-colors hover:bg-card hover:text-fg",
            collapsed && "justify-center px-1.5",
          )}
        >
          <Search className="size-4 shrink-0" aria-hidden />
          {!collapsed ? (
            <>
              <span className="flex-1 truncate text-left">Search</span>
              <kbd className="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-subtle sm:inline">
                ⌘K
              </kbd>
            </>
          ) : null}
        </button>
        <button
          type="button"
          disabled={running}
          onClick={onNew}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-muted transition-colors hover:bg-card hover:text-fg",
            collapsed && "justify-center px-1.5",
            running && "opacity-50",
          )}
        >
          <Plus className="size-4 shrink-0" aria-hidden />
          {!collapsed ? <span>New</span> : null}
        </button>
      </nav>

      <div>
        {!collapsed ? (
          <p className="mb-1.5 px-2 text-[10px] font-medium uppercase tracking-widest text-subtle">
            Starters
          </p>
        ) : null}
        <div className="space-y-0.5">
          {STARTERS.map((s) => (
            <StarterRow
              key={s.id}
              starter={s}
              active={lastStarterId === s.id}
              collapsed={collapsed}
              disabled={running}
              onClick={() => onStarter(s)}
            />
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1">
        {!collapsed ? (
          <p className="mb-1.5 px-2 text-[10px] font-medium uppercase tracking-widest text-subtle">
            Recents
          </p>
        ) : null}
        {sortedRecents.length === 0 ? (
          !collapsed ? (
            <p className="px-2 text-xs text-subtle">No recent previews yet.</p>
          ) : null
        ) : (
          <ul className="space-y-0.5">
            {sortedRecents.map((r) => (
              <li key={r.id} className="group flex items-center gap-0.5">
                <button
                  type="button"
                  disabled={running}
                  title={collapsed ? r.title : undefined}
                  onClick={() => onRecent(r)}
                  className={cn(
                    "min-w-0 flex-1 truncate rounded-lg px-2 py-1.5 text-left text-sm text-muted transition-colors hover:bg-card hover:text-fg",
                    collapsed && "px-1.5 text-center",
                    running && "opacity-50",
                  )}
                >
                  {collapsed ? (
                    <span className="font-serif text-xs text-accent">{r.title.charAt(0)}</span>
                  ) : (
                    r.title
                  )}
                </button>
                {!collapsed ? (
                  <button
                    type="button"
                    aria-label={starredIds.has(r.id) ? "Unstar" : "Star"}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStar(r.id);
                    }}
                    className={cn(
                      "rounded-md p-1 text-subtle opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100",
                      starredIds.has(r.id) && "text-accent opacity-100",
                    )}
                  >
                    <Star
                      className="size-3.5"
                      fill={starredIds.has(r.id) ? "currentColor" : "none"}
                    />
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function StudioSearchPalette({
  open,
  onOpenChange,
  onPick,
  running,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (starter: Starter) => void;
  running: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return STARTERS;
    return STARTERS.filter(
      (s) => s.label.toLowerCase().includes(q) || s.prompt.toLowerCase().includes(q),
    );
  }, [query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-bg/70 p-4 pt-[max(1rem,env(safe-area-inset-top))]"
      role="presentation"
      onClick={() => onOpenChange(false)}
    >
      <div
        role="dialog"
        aria-label="Search starters"
        className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-surface shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search className="size-4 text-subtle" aria-hidden />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter starters…"
            className="min-w-0 flex-1 bg-transparent py-3 text-sm text-fg placeholder:text-subtle focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Escape") onOpenChange(false);
              if (e.key === "Enter" && filtered[0] && !running) {
                onPick(filtered[0]);
                onOpenChange(false);
              }
            }}
          />
          <button
            type="button"
            aria-label="Close search"
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1 text-subtle hover:text-fg"
          >
            <X className="size-4" />
          </button>
        </div>
        <ul className="max-h-64 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <li className="px-2 py-3 text-sm text-subtle">No matching starters.</li>
          ) : (
            filtered.map((s) => {
              const Icon = STARTER_ICONS[s.id] ?? LayoutGrid;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    disabled={running}
                    onClick={() => {
                      onPick(s);
                      onOpenChange(false);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm text-fg hover:bg-card disabled:opacity-50"
                  >
                    <Icon className="size-4 text-accent" aria-hidden />
                    <span>{s.label}</span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}

export function StudioNavRail(props: StudioNavRailProps) {
  const {
    collapsed,
    onCollapsedChange,
    mobileOpen,
    onMobileOpenChange,
    ...bodyProps
  } = props;
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "k") return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT" || tag === "SELECT") return;
      e.preventDefault();
      setSearchOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const rail = (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-border bg-surface",
        collapsed ? "w-[52px]" : "w-[220px]",
        "border-r",
        mobileOpen
          ? "fixed inset-y-0 left-0 z-50 flex w-[min(220px,85vw)] shadow-xl lg:static lg:z-auto lg:shadow-none"
          : "hidden lg:flex",
        collapsed ? "lg:w-[52px]" : "lg:w-[220px]",
      )}
      aria-label="Studio navigation"
    >
      <div
        className={cn(
          "flex shrink-0 items-center border-b border-border p-2",
          collapsed ? "flex-col gap-1" : "justify-between gap-1",
        )}
      >
        <NavMark compact={collapsed} />
        <button
          type="button"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => onCollapsedChange(!collapsed)}
          className="rounded-md p-1 text-subtle hover:bg-card hover:text-fg"
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      </div>
      <RailBody
        {...bodyProps}
        collapsed={collapsed}
        onSearchOpen={() => setSearchOpen(true)}
      />
      <StudioSearchPalette
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onPick={bodyProps.onStarter}
        running={bodyProps.running}
      />
    </aside>
  );

  return (
    <>
      <button
        type="button"
        aria-label="Open studio menu"
        onClick={() => onMobileOpenChange(true)}
        className="flex h-10 shrink-0 items-center gap-2 border-b border-border px-3 text-sm text-muted lg:hidden"
      >
        <Menu className="size-4" />
        <span>Starters & recents</span>
      </button>

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-bg/60 lg:hidden"
          onClick={() => onMobileOpenChange(false)}
        />
      ) : null}

      {rail}
    </>
  );
}
