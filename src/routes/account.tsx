import { createFileRoute } from "@tanstack/react-router";
import { AccountPage } from "@/components/studio/AccountPage";

export const Route = createFileRoute("/account")({
  component: AccountPage,
  ssr: false,
  head: () => ({
    meta: [{ title: "Account — Cozy AI Studio" }],
  }),
});
