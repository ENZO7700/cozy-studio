export function PinnedPreview({ html }: { html: string }) {
  if (!html.trim()) {
    return (
      <div className="flex size-full items-center justify-center bg-canvas text-xs text-subtle">
        —
      </div>
    );
  }
  return (
    <iframe
      title=""
      sandbox=""
      srcDoc={html}
      className="pointer-events-none size-full origin-top-left scale-[0.22]"
      style={{ width: "455%", height: "455%" }}
      tabIndex={-1}
    />
  );
}
