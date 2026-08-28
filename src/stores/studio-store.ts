import { create } from "zustand";
import { persist } from "zustand/middleware";

export type StudioMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

export type StudioProvider = "mistral" | "grok" | "local" | null;

type StudioState = {
  brief: string;
  title: string;
  code: string;
  html: string;
  messages: StudioMessage[];
  running: boolean;
  error: string | null;
  provider: StudioProvider;
  setBrief: (brief: string) => void;
  setRunning: (running: boolean) => void;
  pushUser: (text: string) => void;
  applyResult: (opts: {
    title: string;
    code: string;
    html: string;
    assistantText: string;
    provider: StudioProvider;
  }) => void;
  setError: (error: string | null) => void;
  hydratePreview: (opts: { title: string; code: string; html: string }) => void;
  restorePreview: (opts: {
    title: string;
    code: string;
    html: string;
    brief?: string;
  }) => void;
  reset: () => void;
  pushAssistant: (text: string) => void;
};

const empty = {
  brief: "",
  title: "Quiet landing",
  code: "",
  html: "",
  messages: [] as StudioMessage[],
  running: false,
  error: null as string | null,
  provider: null as StudioProvider,
};

export const useStudioStore = create<StudioState>()(
  persist(
    (set) => ({
      ...empty,
      setBrief: (brief) => set({ brief }),
      setRunning: (running) => set({ running }),
      setError: (error) => set({ error }),
      hydratePreview: ({ title, code, html }) =>
        set((s) => (s.html ? s : { title, code, html })),
      restorePreview: ({ title, code, html, brief = "" }) =>
        set({
          title,
          code,
          html,
          brief,
          running: false,
          error: null,
        }),
      reset: () => set(empty),
      pushUser: (text) =>
        set((s) => ({
          messages: [
            ...s.messages,
            { id: crypto.randomUUID(), role: "user" as const, text },
          ],
        })),
      pushAssistant: (text) =>
        set((s) => ({
          running: false,
          messages: [
            ...s.messages,
            {
              id: crypto.randomUUID(),
              role: "assistant" as const,
              text,
            },
          ].slice(-24),
        })),
      applyResult: ({ title, code, html, assistantText, provider }) =>
        set((s) => ({
          title,
          code,
          html,
          provider,
          running: false,
          error: null,
          messages: [
            ...s.messages,
            {
              id: crypto.randomUUID(),
              role: "assistant" as const,
              text: assistantText,
            },
          ].slice(-24),
        })),
    }),
    {
      name: "cozy-studio-v1",
      partialize: (s) => ({
        brief: s.brief,
        title: s.title,
        code: s.code,
        html: s.html,
        messages: s.messages,
        provider: s.provider,
      }),
    },
  ),
);
