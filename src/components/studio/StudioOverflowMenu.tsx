import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, Code2, Copy, Download, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MISTRAL_MODELS, type MistralModelId } from "@/lib/ai/generate";
import { copyText, downloadHtml, slugFromTitle } from "@/lib/studio/export";
import { cn } from "@/lib/utils";

type StudioOverflowMenuProps = {
  html: string;
  title: string;
  showSource: boolean;
  onToggleSource: () => void;
  selectedModel: MistralModelId;
  onModelChange: (model: MistralModelId) => void;
  running: boolean;
  showModelPicker: boolean;
};

export function StudioOverflowMenu({
  html,
  title,
  showSource,
  onToggleSource,
  selectedModel,
  onModelChange,
  running,
  showModelPicker,
}: StudioOverflowMenuProps) {
  const [copied, setCopied] = useState(false);
  const disabled = !html.trim();

  async function onCopy() {
    if (disabled) return;
    const ok = await copyText(html);
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
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
            className={menuItemClass}
            onSelect={(e) => {
              e.preventDefault();
              onToggleSource();
            }}
          >
            <Code2 className="size-3.5" aria-hidden />
            {showSource ? "Hide source" : "Source"}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className={menuItemClass}
            disabled={disabled}
            onSelect={() => void onCopy()}
          >
            <Copy className="size-3.5" aria-hidden />
            {copied ? "Copied" : "Copy HTML"}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className={menuItemClass}
            disabled={disabled}
            onSelect={() => downloadHtml(slugFromTitle(title), html)}
          >
            <Download className="size-3.5" aria-hidden />
            Download .html
          </DropdownMenu.Item>
          {showModelPicker ? (
            <>
              <DropdownMenu.Separator className="my-1 h-px bg-border" />
              <DropdownMenu.Label className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-widest text-subtle">
                Model
              </DropdownMenu.Label>
              {MISTRAL_MODELS.map((model) => (
                <DropdownMenu.Item
                  key={model.id}
                  className={menuItemClass}
                  disabled={running}
                  onSelect={() => onModelChange(model.id)}
                >
                  <Check
                    className={cn(
                      "size-3.5",
                      selectedModel === model.id ? "opacity-100" : "opacity-0",
                    )}
                    aria-hidden
                  />
                  {model.label}
                </DropdownMenu.Item>
              ))}
            </>
          ) : null}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

const menuItemClass =
  "flex cursor-pointer select-none items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-fg outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-card";
