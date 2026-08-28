import { createServerFn } from "@tanstack/react-start";
import { injectCozyElements } from "@/lib/preview/cozy-elements";

export type AiProvider = "mistral" | "grok";

export type GenerateResult =
  | {
      ok: true;
      title: string;
      html: string;
      code: string;
      provider: AiProvider;
      model: string;
    }
  | { ok: false; error: string };

export type AiStatus = {
  mistral: boolean;
  grok: boolean;
};

const WC =
  " A Cozy Web Components runtime is already injected (do not redefine, no CDNs). Prefer: <cozy-app kicker heading lede>, <cozy-board>, <cozy-column name>, <cozy-card priority>, <cozy-chip>, <cozy-btn variant=ghost type=submit>, <cozy-msg role=user|assistant>. Put copy in light DOM (slots). Native inputs are fine inside <cozy-app>. Column titles live only on cozy-column name — do not nest a second heading with the same label.";

const CREATE_SYSTEM =
  "You generate a single self-contained HTML document for the user's brief (kanban, chat, habits, calendar, notes, or landing). Output ONLY a complete HTML file (doctype through </html>). No markdown. Warm paper background #f4efe6, ink text #1c1915, terracotta #c45c38 for primary actions. Vanilla JS only. Wrap localStorage in try/catch. No Tailwind, no CDNs, no external scripts, no Node APIs, no Vite." +
  WC;

const REVISE_SYSTEM =
  "You revise an existing self-contained HTML document. Apply the user's change request. Output ONLY a complete HTML file (doctype through </html>). No markdown. Keep warm paper background #f4efe6, ink text #1c1915, terracotta #c45c38. Vanilla JS only. Wrap localStorage in try/catch. No Tailwind, no CDNs, no external scripts, no Node APIs, no Vite. Preserve structure and working behavior unless the user asks to change it. Keep Cozy custom elements (<cozy-*>) if present; do not strip the data-cozy-elements script.";

function extractHtml(text: string): string | null {
  const fenced = text.match(/```html\s*([\s\S]*?)```/i);
  const raw = (fenced?.[1] ?? text).trim();
  if (/<!DOCTYPE html>/i.test(raw) || /<html[\s>]/i.test(raw)) return raw;
  if (/<body[\s>]/i.test(raw)) {
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/></head>${raw}</html>`;
  }
  return null;
}

function titleFromHtml(html: string): string {
  return html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() || "Generated preview";
}

function mistralKey(): string | null {
  const multi = (process.env.MISTRAL_API_KEYS ?? "").split(",")[0]?.trim();
  const single = (process.env.MISTRAL_API_KEY ?? process.env.MISTRAL_KEY ?? "").trim();
  return multi || single || null;
}

function formatProviderError(name: string, status: number, raw: string): string {
  if (status === 401 || status === 403) return `${name} auth failed (${status}). Check the API key.`;
  if (status === 402) return `${name} quota/billing issue (402).`;
  if (status === 429) return `${name} rate limit (429).`;
  if (status === 404) return `${name} model not found (404).`;
  const msg = raw.replace(/\s+/g, " ").trim().slice(0, 180);
  return `${name} error ${status}${msg ? `: ${msg}` : ""}`;
}

async function complete(opts: {
  url: string;
  key: string;
  model: string;
  system: string;
  prompt: string;
  maxTokens: number;
}): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  try {
    const res = await fetch(opts.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${opts.key}`,
      },
      signal: AbortSignal.timeout(90_000),
      body: JSON.stringify({
        model: opts.model,
        max_tokens: opts.maxTokens,
        temperature: 0.35,
        messages: [
          { role: "system", content: opts.system },
          { role: "user", content: opts.prompt },
        ],
      }),
    });
    const raw = await res.text();
    if (!res.ok) {
      return { ok: false, error: formatProviderError(opts.model, res.status, raw) };
    }
    const body = JSON.parse(raw) as {
      choices?: { message?: { content?: string } }[];
    };
    return { ok: true, text: body.choices?.[0]?.message?.content ?? "" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "request failed";
    if (/abort|timeout/i.test(msg)) {
      return { ok: false, error: `${opts.model} timed out` };
    }
    return { ok: false, error: `${opts.model} ${msg}` };
  }
}

function pack(text: string, provider: AiProvider, model: string): GenerateResult {
  const extracted = extractHtml(text);
  if (!extracted) return { ok: false, error: `${provider} did not return HTML` };
  const html = injectCozyElements(extracted);
  return {
    ok: true,
    title: titleFromHtml(html),
    html,
    code: html,
    provider,
    model,
  };
}

export const getAiStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<AiStatus> => ({
    mistral: Boolean(mistralKey()),
    grok: Boolean(process.env.XAI_API_KEY),
  }),
);

export const generatePreview = createServerFn({ method: "POST" })
  .validator((input: { prompt: string; html?: string }) => ({
    prompt: String(input?.prompt ?? "").slice(0, 4000),
    html: String(input?.html ?? "").slice(0, 16000),
  }))
  .handler(async ({ data }): Promise<GenerateResult> => {
    const revising = Boolean(data.html);
    const system = revising ? REVISE_SYSTEM : CREATE_SYSTEM;
    const prompt = revising
      ? `Change request:\n${data.prompt || "Tighten the layout."}\n\nCurrent HTML:\n${data.html}`
      : data.prompt || "A calm personal studio landing page.";
    const errors: string[] = [];

    const mk = mistralKey();
    if (mk) {
      const mistral = await complete({
        url: "https://api.mistral.ai/v1/chat/completions",
        key: mk,
        model: "codestral-latest",
        system,
        prompt,
        maxTokens: 4096,
      });
      if (mistral.ok) {
        const packed = pack(mistral.text, "mistral", "codestral-latest");
        if (packed.ok) return packed;
        errors.push(packed.error);
      } else {
        errors.push(mistral.error);
      }
    }

    const xai = process.env.XAI_API_KEY;
    if (xai) {
      const grok = await complete({
        url: "https://api.x.ai/v1/chat/completions",
        key: xai,
        model: "grok-4.5",
        system,
        prompt,
        maxTokens: 4096,
      });
      if (grok.ok) {
        const packed = pack(grok.text, "grok", "grok-4.5");
        if (packed.ok) return packed;
        errors.push(packed.error);
      } else {
        errors.push(grok.error);
      }
    }

    return {
      ok: false,
      error: errors[0] || "No AI provider is configured",
    };
  });
