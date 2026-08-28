import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Code2, Eye, MessageSquare, PenLine, Send, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExportActions } from "@/components/studio/ExportActions";
import { LivePreview } from "@/components/studio/LivePreview";
import { StudioDesktopSplit } from "@/components/studio/StudioDesktopSplit";
import { ThinkingStatus } from "@/components/studio/ThinkingStatus";
import { cn } from "@/lib/utils";
import {
  DEFAULT_CREATE_MODEL,
  DEFAULT_REVISE_MODEL,
  generatePreview,
  getAiStatus,
  MISTRAL_MODELS,
  mistralModelLabel,
  type AiStatus,
  type MistralModelId,
} from "@/lib/ai/generate";
import { localPreviewHtml } from "@/lib/preview/local-templates";
import { STARTERS } from "@/lib/preview/starters";
import {
  clearOfflinePreview,
  persistOfflinePreview,
  readOfflinePreview,
} from "@/lib/pwa/offline";
import { useOnline } from "@/lib/pwa/use-online";
import { useStudioStore } from "@/stores/studio-store";

type MobilePanel = "chat" | "code" | "preview";

function providerLabel(status: AiStatus | null, used: string | null): string {
  if (used === "mistral") return "Mistral";
  if (used === "grok") return "Grok";
  if (used === "local") return "Local";
  if (status?.mistral) return "Mistral";
  if (status?.grok) return "Grok";
  return "Local";
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function StudioShell() {
  const brief = useStudioStore((s) => s.brief);
  const setBrief = useStudioStore((s) => s.setBrief);
  const running = useStudioStore((s) => s.running);
  const setRunning = useStudioStore((s) => s.setRunning);
  const pushUser = useStudioStore((s) => s.pushUser);
  const pushAssistant = useStudioStore((s) => s.pushAssistant);
  const applyResult = useStudioStore((s) => s.applyResult);
  const setError = useStudioStore((s) => s.setError);
  const resetStore = useStudioStore((s) => s.reset);
  const hydratePreview = useStudioStore((s) => s.hydratePreview);
  const error = useStudioStore((s) => s.error);
  const messages = useStudioStore((s) => s.messages);
  const html = useStudioStore((s) => s.html);
  const code = useStudioStore((s) => s.code);
  const title = useStudioStore((s) => s.title);
  const provider = useStudioStore((s) => s.provider);
  const [panel, setPanel] = useState<MobilePanel>("chat");
  const [showSource, setShowSource] = useState(false);
  const [status, setStatus] = useState<AiStatus | null>(null);
  const [selectedModel, setSelectedModel] = useState<MistralModelId>(DEFAULT_CREATE_MODEL);
  const online = useOnline();
  const thinkRef = useRef<HTMLDivElement>(null);
  const runId = useRef(0);

  useEffect(() => {
    void getAiStatus().then(setStatus);
  }, []);

  useEffect(() => {
    setSelectedModel(html ? DEFAULT_REVISE_MODEL : DEFAULT_CREATE_MODEL);
  }, [html]);

  useEffect(() => {
    if (!html) return;
    void persistOfflinePreview({ html, title, code });
  }, [html, title, code]);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled || useStudioStore.getState().html) return;
      void readOfflinePreview().then((saved) => {
        if (!cancelled && saved?.html && !useStudioStore.getState().html) {
          hydratePreview(saved);
          setPanel("preview");
        }
      });
    }, 80);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [hydratePreview]);

  useEffect(() => {
    if (!running) return;
    thinkRef.current?.scrollIntoView({ block: "nearest" });
  }, [running, messages.length]);

  function stop() {
    runId.current += 1;
    setRunning(false);
  }

  function reset() {
    runId.current += 1;
    resetStore();
    setShowSource(false);
    setPanel("chat");
    void clearOfflinePreview();
  }

  async function run(promptOverride?: string, opts?: { fresh?: boolean }) {
    const prompt = (promptOverride ?? brief).trim();
    if (!prompt || running) return;
    if (promptOverride) setBrief(prompt);
    const currentHtml = useStudioStore.getState().html;
    const revising = Boolean(currentHtml) && !opts?.fresh;
    const id = ++runId.current;
    setRunning(true);
    setError(null);
    pushUser(prompt);
    const started = Date.now();
    if (!online) {
      if (revising) {
        await sleep(Math.max(0, 700 - (Date.now() - started)));
        if (id !== runId.current) return;
        pushAssistant("Offline. Preview unchanged.");
        return;
      }
      const local = localPreviewHtml(prompt);
      await sleep(Math.max(0, 900 - (Date.now() - started)));
      if (id !== runId.current) return;
      applyResult({
        ...local,
        assistantText: "Offline. Local layout saved on this device.",
        provider: "local",
      });
      setBrief("");
      setPanel("preview");
      return;
    }
    try {
      const remote = await generatePreview({
        data: {
          prompt,
          html: revising ? currentHtml : "",
          model: selectedModel,
        },
      });
      if (id !== runId.current) return;
      if (remote.ok) {
        applyResult({
          title: remote.title,
          code: remote.code,
          html: remote.html,
          assistantText: revising
            ? "Updated the board."
            : remote.provider === "mistral"
              ? `Preview generated with ${mistralModelLabel(remote.model)}.`
              : "Preview generated with Grok.",
          provider: remote.provider,
        });
        setBrief("");
        setPanel("preview");
        return;
      }
      if (revising) {
        pushAssistant(`${remote.error}. Preview unchanged.`);
        setError(remote.error);
        return;
      }
      const local = localPreviewHtml(prompt);
      await sleep(Math.max(0, 720 - (Date.now() - started)));
      if (id !== runId.current) return;
      applyResult({
        ...local,
        assistantText: `${remote.error}. Local layout applied.`,
        provider: "local",
      });
      setBrief("");
      setPanel("preview");
    } catch (e) {
      if (id !== runId.current) return;
      const message = e instanceof Error ? e.message : "Generate failed";
      if (revising) {
        pushAssistant("Couldn't update. Preview unchanged.");
        setError(message);
        return;
      }
      const local = localPreviewHtml(prompt);
      await sleep(Math.max(0, 720 - (Date.now() - started)));
      if (id !== runId.current) return;
      applyResult({
        ...local,
        assistantText: "Generator unavailable. Local layout applied.",
        provider: "local",
      });
      setError(message);
      setBrief("");
      setPanel("preview");
    }
  }

  const sourceText = code || html;

  const chatPanel = (
    <>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        {messages.length === 0 && !running ? (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-muted">
              Describe a kanban, chat, habits grid, calendar, or notes tool.
              Generation runs on the server.
            </p>
            {!online ? (
              <p className="text-xs leading-relaxed text-subtle">
                Offline. Last preview stays on this device. Generate still
                builds a local layout.
              </p>
            ) : null}
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "break-words rounded-xl px-3 py-2 text-sm leading-relaxed",
                m.role === "user"
                  ? "ml-6 bg-accent text-accent-fg"
                  : "mr-6 border border-border bg-card text-fg",
              )}
            >
              {m.text}
            </div>
          ))
        )}
        {running ? (
          <div ref={thinkRef}>
            <ThinkingStatus
              brief={`${title} ${brief}`}
              mode={html ? "revise" : "create"}
            />
          </div>
        ) : null}
        {!running ? (
          <div className="flex flex-wrap gap-2">
            {STARTERS.map((s) => (
              <Button
                key={s.id}
                type="button"
                variant="outline"
                size="sm"
                disabled={running}
                onClick={() => void run(s.prompt, { fresh: true })}
              >
                {s.label}
              </Button>
            ))}
          </div>
        ) : null}
        {error ? <p className="text-xs text-muted">{error}</p> : null}
      </div>
      <form
        className="shrink-0 border-t border-border p-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (running) stop();
          else void run();
        }}
      >
        {online && status?.mistral ? (
          <div className="mb-2">
            <label
              htmlFor="mistral-model"
              className="mb-1 block text-xs uppercase tracking-wider text-subtle"
            >
              Model
            </label>
            <select
              id="mistral-model"
              name="mistral-model"
              value={selectedModel}
              disabled={running}
              onChange={(e) => setSelectedModel(e.target.value as MistralModelId)}
              className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              {MISTRAL_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <label className="sr-only" htmlFor="brief">
          Brief
        </label>
        <textarea
          id="brief"
          name="brief"
          rows={3}
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              if (!running) void run();
            }
          }}
          placeholder={
            html
              ? "Make the columns narrower…"
              : "A personal kanban for a digital assistant…"
          }
          className="min-h-20 w-full resize-none rounded-xl border border-border bg-card px-3 py-2.5 text-sm leading-relaxed text-fg placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        />
        <Button
          type="submit"
          className="mt-2 w-full"
          disabled={!running && !brief.trim()}
        >
          {running ? (
            <>
              Stop
              <Square className="size-3 fill-current" />
            </>
          ) : html ? (
            <>
              Upraviť
              <PenLine className="size-4" />
            </>
          ) : (
            <>
              {online ? "Generate" : "Generate locally"}
              <Send className="size-4" />
            </>
          )}
        </Button>
      </form>
    </>
  );

  const sourcePanel = (
    <>
      <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border pl-3 pr-1">
        <p className="min-w-0 truncate text-xs uppercase tracking-widest text-subtle">Source</p>
        <ExportActions html={sourceText} title={title} />
      </div>
      <pre className="min-h-0 flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-muted">
        {code || "Source appears after a generate."}
      </pre>
    </>
  );

  const previewPanel = (
    <>
      <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border pl-3 pr-1">
        <p className="min-w-0 truncate text-xs uppercase tracking-widest text-subtle">
          {running
            ? html
              ? "Upravujem"
              : "Premýšľanie"
            : online
              ? "Live preview"
              : "Saved preview"}
        </p>
        <ExportActions html={html} title={title} />
      </div>
      {html ? (
        <div className="relative min-h-0 flex-1">
          <LivePreview html={html} title={title} />
          {running ? (
            <div className="pointer-events-none absolute bottom-4 left-4">
              <ThinkingStatus
                brief={`${title} ${brief}`}
                variant="chip"
                mode={html ? "revise" : "create"}
              />
            </div>
          ) : null}
        </div>
      ) : running ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6">
          <ThinkingStatus brief={`${title} ${brief}`} variant="stage" mode="create" />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-sm text-muted">
            {online
              ? "Pick a starter or write a brief to fill this canvas."
              : "Offline. Generate a local layout, or reopen to restore the last preview."}
          </p>
          <ol className="max-w-xs space-y-1.5 text-left text-xs leading-relaxed text-subtle">
            <li>1. Brief or starter</li>
            <li>2. Generate on the server</li>
            <li>3. Revise without blanking the canvas</li>
          </ol>
        </div>
      )}
    </>
  );

  return (
    <div
      className="flex h-dvh flex-col bg-bg text-fg"
      data-studio-shell
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-surface px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/"
            className="inline-flex h-10 items-center font-serif text-base tracking-tight"
          >
            Cozy
          </Link>
          {html ? (
            <span className="hidden truncate text-xs text-muted sm:inline">{title}</span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {!online ? (
            <span className="rounded-full border border-border px-2 py-0.5 text-xs uppercase tracking-wider text-muted">
              Offline
            </span>
          ) : (
            <p className="hidden text-xs tracking-wide text-subtle sm:block">
              {providerLabel(status, provider)}
            </p>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="hidden lg:inline-flex"
            onClick={() => setShowSource((v) => !v)}
          >
            {showSource ? "Hide source" : "Source"}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => reset()}>
            New
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="flex min-h-0 flex-1 lg:hidden">
          <section
            className={cn(
              "flex min-h-0 w-full flex-col bg-surface",
              panel === "chat" ? "min-h-0 flex-1" : "hidden",
            )}
          >
            {chatPanel}
          </section>

          <section
            className={cn(
              "flex min-h-0 min-w-0 flex-col bg-canvas",
              panel === "code" ? "min-h-0 flex-1" : "hidden",
            )}
          >
            {sourcePanel}
          </section>

          <section
            className={cn(
              "flex min-h-0 min-w-0 flex-col bg-canvas",
              panel === "preview" ? "min-h-0 flex-1" : "hidden",
            )}
          >
            {previewPanel}
          </section>
        </div>

        <StudioDesktopSplit
          showSource={showSource}
          chat={chatPanel}
          source={sourcePanel}
          preview={previewPanel}
        />
      </div>

      <nav className="grid shrink-0 grid-cols-3 border-t border-border bg-surface lg:hidden">
        {(
          [
            ["chat", MessageSquare, "Brief"],
            ["code", Code2, "Code"],
            ["preview", Eye, "Preview"],
          ] as const
        ).map(([id, Icon, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setPanel(id)}
            aria-current={panel === id ? "page" : undefined}
            className={cn(
              "flex h-12 flex-col items-center justify-center gap-0.5 text-xs uppercase tracking-wider",
              panel === id ? "text-accent" : "text-muted",
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
