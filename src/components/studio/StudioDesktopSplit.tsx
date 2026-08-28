import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export const SPLIT_STORAGE_ID = "cozy-studio-split";

const MIN_PANE = 8;
const MAX_PANE = 92;

const DEFAULT_2 = [22, 78] as const;
const DEFAULT_3 = [18, 42, 40] as const;

function normalizeSizes(raw: number[], count: 2 | 3): number[] {
  const defaults = count === 2 ? [...DEFAULT_2] : [...DEFAULT_3];
  if (raw.length !== count) return defaults;
  const clamped = raw.map((n) => Math.min(MAX_PANE, Math.max(MIN_PANE, n)));
  const sum = clamped.reduce((a, b) => a + b, 0);
  if (sum <= 0) return defaults;
  return clamped.map((n) => (n / sum) * 100);
}

function loadSizes(count: 2 | 3): number[] {
  const defaults = count === 2 ? [...DEFAULT_2] : [...DEFAULT_3];
  try {
    const stored = localStorage.getItem(SPLIT_STORAGE_ID);
    if (!stored) return defaults;

    const parsed: unknown = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.length === count && parsed.every((n) => typeof n === "number")) {
      return normalizeSizes(parsed as number[], count);
    }

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const o = parsed as Record<string, number>;
      if (count === 2 && typeof o.chat === "number" && typeof o.preview === "number") {
        return normalizeSizes([o.chat, o.preview], 2);
      }
      if (
        count === 3 &&
        typeof o.chat === "number" &&
        typeof o.source === "number" &&
        typeof o.preview === "number"
      ) {
        return normalizeSizes([o.chat, o.source, o.preview], 3);
      }
    }
  } catch {
    /* ignore corrupt storage */
  }
  return defaults;
}

function saveSizes(sizes: number[]) {
  try {
    localStorage.setItem(SPLIT_STORAGE_ID, JSON.stringify(sizes));
  } catch {
    /* quota / private mode */
  }
}

function adjustPair(sizes: number[], index: number, deltaPct: number): number[] {
  const next = [...sizes];
  const pairSum = next[index]! + next[index + 1]!;
  let left = next[index]! + deltaPct;
  let right = next[index + 1]! - deltaPct;

  left = Math.min(MAX_PANE, Math.max(MIN_PANE, left));
  right = pairSum - left;
  if (right < MIN_PANE) {
    right = MIN_PANE;
    left = pairSum - right;
  } else if (right > MAX_PANE) {
    right = MAX_PANE;
    left = pairSum - right;
  }

  left = Math.min(MAX_PANE, Math.max(MIN_PANE, left));
  right = pairSum - left;

  next[index] = left;
  next[index + 1] = right;
  return next;
}

function SplitHandle({
  active,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onKeyDown,
}: {
  active: boolean;
  onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      className={cn(
        "relative z-10 -mx-1.5 flex w-3 shrink-0 items-stretch touch-none",
        "cursor-col-resize select-none",
        "before:absolute before:inset-y-0 before:left-1/2 before:w-px before:-translate-x-1/2 before:bg-border before:transition-colors",
        active
          ? "before:bg-accent"
          : "hover:before:bg-accent/70 focus-visible:before:bg-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
      )}
    />
  );
}

function SplitPane({
  widthPct,
  className,
  children,
}: {
  widthPct: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn("flex min-h-0 min-w-0 flex-col overflow-hidden", className)}
      style={{ flex: `0 0 ${widthPct}%`, maxWidth: `${widthPct}%` }}
    >
      {children}
    </div>
  );
}

export function StudioDesktopSplit({
  showSource,
  chat,
  source,
  preview,
}: {
  showSource: boolean;
  chat: ReactNode;
  source: ReactNode;
  preview: ReactNode;
}) {
  const count = showSource ? 3 : 2;
  const containerRef = useRef<HTMLDivElement>(null);
  const [sizes, setSizes] = useState<number[]>(() => loadSizes(count as 2 | 3));
  const sizesRef = useRef(sizes);
  sizesRef.current = sizes;

  const dragRef = useRef<{ index: number; startX: number; startSizes: number[] } | null>(null);
  const [activeHandle, setActiveHandle] = useState<number | null>(null);

  useEffect(() => {
    const loaded = loadSizes(count as 2 | 3);
    setSizes(loaded);
    sizesRef.current = loaded;
  }, [count]);

  const beginDrag = useCallback(
    (index: number) => (e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = { index, startX: e.clientX, startSizes: [...sizesRef.current] };
      setActiveHandle(index);
    },
    [],
  );

  const onHandlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      const el = containerRef.current;
      if (!drag || !el) return;
      const width = el.getBoundingClientRect().width;
      if (width <= 0) return;
      const deltaPct = ((e.clientX - drag.startX) / width) * 100;
      const next = adjustPair(drag.startSizes, drag.index, deltaPct);
      sizesRef.current = next;
      setSizes(next);
    },
    [],
  );

  const endDrag = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setActiveHandle(null);
    saveSizes(sizesRef.current);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  }, []);

  const onHandleKeyDown = useCallback(
    (index: number) => (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      const delta = e.key === "ArrowLeft" ? -1 : 1;
      setSizes((prev) => {
        const next = adjustPair(prev, index, delta);
        sizesRef.current = next;
        saveSizes(next);
        return next;
      });
    },
    [],
  );

  const handleProps = (index: number) => ({
    active: activeHandle === index,
    onPointerDown: beginDrag(index),
    onPointerMove: onHandlePointerMove,
    onPointerUp: endDrag,
    onKeyDown: onHandleKeyDown(index),
  });

  return (
    <div
      ref={containerRef}
      className="hidden min-h-0 h-full w-full min-w-0 flex-1 lg:flex"
    >
      <SplitPane widthPct={sizes[0]!} className="bg-surface">
        {chat}
      </SplitPane>

      <SplitHandle {...handleProps(0)} />

      {showSource ? (
        <>
          <SplitPane widthPct={sizes[1]!} className="bg-canvas">
            {source}
          </SplitPane>
          <SplitHandle {...handleProps(1)} />
        </>
      ) : null}

      <SplitPane widthPct={sizes[showSource ? 2 : 1]!} className="bg-canvas">
        {preview}
      </SplitPane>
    </div>
  );
}
