import { createFileRoute } from "@tanstack/react-router";
import { StudioShell } from "@/components/studio/StudioShell";

type StudioSearch = {
  recent?: string;
};

export const Route = createFileRoute("/studio")({
  component: StudioPage,
  ssr: false,
  validateSearch: (search: Record<string, unknown>): StudioSearch => ({
    recent: typeof search.recent === "string" ? search.recent : undefined,
  }),
  head: () => ({
    meta: [{ title: "Studio — Cozy AI Studio" }],
  }),
});

function StudioPage() {
  const { recent } = Route.useSearch();
  return <StudioShell openRecentId={recent} />;
}
