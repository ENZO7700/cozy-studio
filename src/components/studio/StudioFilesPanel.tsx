import type { ReactNode } from "react";
import { FileCode2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StudioFileEntry } from "@/lib/studio/files";

export function FileChip({
  name,
  onClick,
}: {
  name: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "mt-2 inline-flex max-w-full items-center gap-1.5 rounded-lg border border-border bg-surface px-2 py-1",
        "font-mono text-xs text-fg transition-colors hover:border-accent/50 hover:bg-card",
      )}
    >
      <FileCode2 className="size-3.5 shrink-0 text-accent" aria-hidden />
      <span className="truncate">{name}</span>
    </button>
  );
}

export function StudioFilesPanel({
  files,
  activeFile,
  onSelectFile,
  header,
}: {
  files: StudioFileEntry[];
  activeFile: string | null;
  onSelectFile: (name: string) => void;
  header: ReactNode;
}) {
  const active = files.find((f) => f.name === activeFile) ?? files[0];
  const activeName = active?.name ?? null;

  return (
    <>
      {header}
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-36 shrink-0 flex-col border-r border-border bg-surface sm:w-40">
          <p className="px-3 py-2 text-[10px] font-medium uppercase tracking-widest text-subtle">
            Files
          </p>
          <ul className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
            {files.length === 0 ? (
              <li className="px-1 py-2 text-xs text-subtle">No files yet.</li>
            ) : (
              files.map((f) => (
                <li key={f.name}>
                  <button
                    type="button"
                    onClick={() => onSelectFile(f.name)}
                    aria-current={activeName === f.name ? "true" : undefined}
                    className={cn(
                      "flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left font-mono text-xs transition-colors",
                      activeName === f.name
                        ? "bg-accent/15 text-accent"
                        : "text-muted hover:bg-card hover:text-fg",
                    )}
                  >
                    <FileCode2 className="size-3.5 shrink-0" aria-hidden />
                    <span className="truncate">{f.name}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </aside>
        <pre className="min-h-0 min-w-0 flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-muted">
          {active?.content ?? "Source appears after a generate."}
        </pre>
      </div>
    </>
  );
}
