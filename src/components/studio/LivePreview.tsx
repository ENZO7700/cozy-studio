import { useEffect, useRef } from "react";
import { injectCozyElements } from "@/lib/preview/cozy-elements";
import { applyPreviewHtml } from "@/lib/preview/dom-patch";

export function LivePreview({ html, title }: { html: string; title: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const applied = useRef("");

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe || !html) return;
    if (applied.current === html) return;

    const prev = applied.current;
    applied.current = html;
    const next = injectCozyElements(html);

    if (!prev) {
      iframe.dataset.patch = "reloaded";
      iframe.dataset.patchReason = "first";
      iframe.srcdoc = next;
      return;
    }

    applyPreviewHtml(iframe, next, prev);
  }, [html]);

  return (
    <iframe
      ref={ref}
      title={title}
      sandbox="allow-scripts allow-same-origin allow-forms"
      className="h-full min-h-0 w-full border-0 bg-fg"
      data-preview="live"
    />
  );
}
