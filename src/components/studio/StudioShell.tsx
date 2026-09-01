import { useEffect, useRef, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Link } from "@tanstack/react-router";
import { Code2, Eye, MessageSquare, MoreHorizontal, PenLine, Send, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExportActions } from "@/components/studio/ExportActions";
import { FileChip, StudioFilesPanel } from "@/components/studio/StudioFilesPanel";
import { LivePreview } from "@/components/studio/LivePreview";
import { PreviewPulseSkeleton } from "@/components/studio/PreviewPulseSkeleton";
import { StarterConfigCanvas } from "@/components/studio/StarterConfigCanvas";
import { StudioDesktopSplit } from "@/components/studio/StudioDesktopSplit";
import { StudioNavRail } from "@/components/studio/StudioNavRail";
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
import {
  composeStarterPrompt,
  getStarterById,
  type Starter,
} from "@/lib/preview/starters";
import {
  addRecent,
  loadRecents,
  loadStarredIds,
  toggleStarred,
  type StudioRecent,
} from "@/lib/studio/recents";
import {
  loadProfile,
  saveProfile,
  touchProfileActivity,
  type StudioProfile,
} from "@/lib/studio/profile";
import { fileRefs, listStudioFiles } from "@/lib/studio/files";
import { shouldApplyLocalPreviewOnFailure } from "@/lib/studio/run-failure";
import {
  clearOfflinePreview,
  persistOfflinePreview,
  readOfflinePreview,
} from "@/lib/pwa/offline";
import { useOnline } from "@/lib/pwa/use-online";
import { useStudioStore } from "@/stores/studio-store";

const LAST_STARTER_KEY = "cozy-studio-last-starter";

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
  const restorePreview = useStudioStore((s) => s.restorePreview);
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
  const [railCollapsed, setRailCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [lastStarterId, setLastStarterId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LAST_STARTER_KEY);
    } catch {
      return null;
    }
  });
  const [recents, setRecents] = useState<StudioRecent[]>(() => loadRecents());
  const [starredIds, setStarredIds] = useState<Set<string>>(() => loadStarredIds());
  const [profile, setProfile] = useState<StudioProfile>(() => loadProfile());
  const [configStarterId, setConfigStarterId] = useState<string | null>(null);
  const [selectedAddonIds, setSelectedAddonIds] = useState<Set<string>>(() => new Set());
  const [activeFile, setActiveFile] = useState<string | null>(null);
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

  useEffect(() => {
    const files = listStudioFiles(html, code);
    if (!files.length) return;
    setActiveFile((current) => {
      if (current && files.some((f) => f.name === current)) return current;
      return files[0]!.name;
    });
  }, [html, code]);

  function stop() {
    runId.current += 1;
    setRunning(false);
  }

  function openStudioFile(name: string) {
    setActiveFile(name);
    setShowSource(true);
    setPanel("code");
  }

  function reset() {
    runId.current += 1;
    resetStore();
    setShowSource(false);
    setPanel("chat");
    setMobileNavOpen(false);
    setConfigStarterId(null);
    setSelectedAddonIds(new Set());
    setActiveFile(null);
    void clearOfflinePreview();
  }

  function syncBriefFromConfig(starterId: string, addonIds: ReadonlySet<string>) {
    const starter = getStarterById(starterId);
    if (!starter) return;
    setBrief(composeStarterPrompt(starter, addonIds));
  }

  function pickStarter(starter: Starter) {
    setLastStarterId(starter.id);
    try {
      localStorage.setItem(LAST_STARTER_KEY, starter.id);
    } catch {
      /* private mode */
    }
    setMobileNavOpen(false);
    setConfigStarterId(starter.id);
    setSelectedAddonIds(new Set());
    syncBriefFromConfig(starter.id, new Set());
    setPanel("preview");
  }

  function toggleConfigAddon(addonId: string) {
    if (!configStarterId) return;
    setSelectedAddonIds((prev) => {
      const next = new Set(prev);
      if (next.has(addonId)) next.delete(addonId);
      else next.add(addonId);
      syncBriefFromConfig(configStarterId, next);
      return next;
    });
  }

  function resetConfigSelection() {
    if (!configStarterId) return;
    setSelectedAddonIds(new Set());
    syncBriefFromConfig(configStarterId, new Set());
  }

  function generateFromConfig() {
    const starter = configStarterId ? getStarterById(configStarterId) : undefined;
    if (!starter || running) return;
    const prompt = composeStarterPrompt(starter, selectedAddonIds);
    setBrief(prompt);
    setConfigStarterId(null);
    setSelectedAddonIds(new Set());
    void run(prompt, { fresh: true });
  }

  function recordGeneration(opts: {
    title: string;
    code: string;
    html: string;
    brief: string;
  }) {
    setRecents(addRecent(opts));
    setProfile(touchProfileActivity({ generated: true }));
  }

  function recordReviseActivity() {
    setProfile(touchProfileActivity());
  }

  function openRecent(recent: StudioRecent) {
    setMobileNavOpen(false);
    setConfigStarterId(null);
    setSelectedAddonIds(new Set());
    if (recent.html) {
      restorePreview({
        title: recent.title,
        code: recent.code,
        html: recent.html,
        brief: recent.brief,
      });
      setActiveFile("index.html");
      setPanel("preview");
      return;
    }
    if (recent.brief.trim()) {
      void run(recent.brief, { fresh: true });
    }
  }

  function toggleStar(id: string) {
    setStarredIds(toggleStarred(id));
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
      if (!shouldApplyLocalPreviewOnFailure(online, revising)) {
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
        files: fileRefs(local.html, local.code),
      });
      setActiveFile("index.html");
      if (revising) {
        recordReviseActivity();
      } else {
        recordGeneration({
          title: local.title,
          code: local.code,
          html: local.html,
          brief: prompt,
        });
      }
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
          files: fileRefs(remote.html, remote.code),
        });
        setActiveFile("index.html");
        if (!revising) {
          recordGeneration({
            title: remote.title,
            code: remote.code,
            html: remote.html,
            brief: prompt,
          });
        } else {
          recordReviseActivity();
        }
        setBrief("");
        setPanel("preview");
        return;
      }
      if (revising) {
        pushAssistant(`${remote.error}. Preview unchanged.`);
        setError(remote.error);
        return;
      }
      pushAssistant(remote.error);
      setError(remote.error);
    } catch (e) {
      if (id !== runId.current) return;
      const message = e instanceof Error ? e.message : "Generate failed";
      if (revising) {
        pushAssistant("Couldn't update. Preview unchanged.");
        setError(message);
        return;
      }
      pushAssistant(message);
      setError(message);
    }
  }

  const studioFiles = listStudioFiles(html, code);

  const navRailProps = {
    collapsed: railCollapsed,
    onCollapsedChange: setRailCollapsed,
    mobileOpen: mobileNavOpen,
    onMobileOpenChange: setMobileNavOpen,
    lastStarterId,
    recents,
    starredIds,
    running,
    onStarter: pickStarter,
    onRecent: openRecent,
    onToggleStar: toggleStar,
    profile,
    onProfileChange: (patch: Partial<StudioProfile>) => setProfile(saveProfile(patch)),
    previewHtml: html,
    previewTitle: title,
  };

  const chatPanel = (
    <>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:flex-row">
        <StudioNavRail {...navRailProps} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
            {messages.length === 0 && !running ? (
              <p className="text-sm text-subtle">Brief below, or pick a starter.</p>
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
                  {m.role === "assistant" && m.files?.length
                    ? m.files.map((f) => (
                        <FileChip key={f.name} name={f.name} onClick={() => openStudioFile(f.name)} />
                      ))
                    : null}
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
            {error ? <p className="text-xs text-muted">{error}</p> : null}
          </div>
        </div>
      </div>
      <form
        className="shrink-0 border-t border-border p-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (running) stop();
          else void run();
        }}
      >
        <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
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
        </div>
      </form>
    </>
  );

  const sourcePanel = (
    <StudioFilesPanel
      files={studioFiles}
      activeFile={activeFile}
      onSelectFile={setActiveFile}
      header={
        <div className="flex h-12 shrink-0 items-center border-b border-border pl-3 pr-1">
          <p className="min-w-0 truncate text-xs uppercase tracking-widest text-subtle">Code</p>
        </div>
      }
    />
  );

  const configStarter = configStarterId ? getStarterById(configStarterId) : undefined;

  const previewPanel = (
    <>
      <div className="flex h-12 shrink-0 items-center border-b border-border pl-3 pr-1">
        <p className="min-w-0 truncate text-xs uppercase tracking-widest text-subtle">
          {running
            ? html
              ? "Upravujem"
              : "Premýšľanie"
            : configStarter
              ? "Configure"
              : online
                ? "Live preview"
                : "Saved preview"}
        </p>
      </div>
      {configStarter && !running ? (
        <StarterConfigCanvas
          starter={configStarter}
          selectedAddonIds={selectedAddonIds}
          running={running}
          online={online}
          onToggleAddon={toggleConfigAddon}
          onResetSelection={resetConfigSelection}
          onGenerate={generateFromConfig}
        />
      ) : html ? (
        <LivePreview html={html} title={title} />
      ) : running ? (
        <PreviewPulseSkeleton />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-sm text-muted">
            {online
              ? "Pick a starter from the menu or write a brief to fill this canvas."
              : "Offline. Generate a local layout, or reopen to restore the last preview."}
          </p>
          <ol className="max-w-xs space-y-1.5 text-left text-xs leading-relaxed text-subtle">
            <li>1. Choose a starter and add-ons</li>
            <li>2. Click Generate on the canvas</li>
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
            <span className="min-w-0 truncate text-xs text-muted">{title}</span>
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
          <Button type="button" variant="ghost" size="sm" onClick={() => reset()}>
            New
          </Button>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button type="button" variant="ghost" size="sm" aria-label="More actions">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={6}
                className="z-50 min-w-[11rem] overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-lg"
              >
                <DropdownMenu.Item
                  className="flex cursor-pointer select-none items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-fg outline-none data-[highlighted]:bg-card"
                  onSelect={(e) => {
                    e.preventDefault();
                    setShowSource((v) => !v);
                  }}
                >
                  <Code2 className="size-3.5" aria-hidden />
                  {showSource ? "Hide source" : "Source"}
                </DropdownMenu.Item>
                <div className="border-t border-border p-1">
                  <ExportActions html={html} title={title} />
                </div>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
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
