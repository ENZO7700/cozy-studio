# Cozy AI Studio

A calm web studio for turning a short product brief into a live HTML preview — warm paper, ink type, terracotta accents, and `<cozy-app>` chrome.

**Loop:** write a brief → generate one self-contained HTML blob → preview it in a sandboxed `srcdoc` iframe → revise in place (starter stays) → copy or download a standalone `.html` file that opens via `file://`.

## Run locally

```bash
npm run dev
```

Open **[http://127.0.0.1:8080/studio](http://127.0.0.1:8080/studio)** for the studio. The landing page at `/` explains the loop and links to `/studio`.

## Environment

| Variable | Required | Purpose |
|----------|----------|---------|
| `MISTRAL_API_KEY` | Yes (online generate) | Primary model provider for brief → HTML |
| `MISTRAL_API_KEYS` | No | Comma-separated fallback keys (first wins) |
| `XAI_API_KEY` | No | Optional Grok fallback when Mistral is unavailable |

Without keys, the studio still runs: **offline** you get **Generate locally** (device-side templates in `cozy-app`); **online** a failed generate leaves an **empty canvas** — no silent swap to a local layout.

## Studio at `/studio`

| Control | What it does |
|---------|----------------|
| **Generate** | First pass: brief → HTML preview (online, Mistral/Grok) |
| **Upraviť** | Revise in place: keeps the current starter/HTML; patches from your change request |
| **Generate locally** | Offline-only: warm paper templates from the brief (no API) |
| **New** | Clears the session for a fresh brief |
| **⋯ menu** | **Source** (toggle code panel), **Copy** (standalone HTML), **.html** (download) |
| **Model** | Mistral model picker next to the brief (online + key present) |
| **Nav rail** | Starters, recents, search — **⌘K** / filter; clicking a recent restores its HTML |

Mobile uses three tabs: **Brief** / **Code** / **Preview**.

## Offline templates

When the browser is offline, **Generate locally** renders client-side templates (warm paper + `cozy-app` / cozy web components). Café, restaurant, and place briefs render as **place pages** (menu, hours, ambiance) — not kanban boards with Inbox/Doing/Done.

## What this repo is not

**[canvas.h4ck3d.me](https://canvas.h4ck3d.me) is a different product** — G0/G1/G2 pipeline, human-in-the-loop review, share links at `/a/:id`. That codebase is not this tree.

This repo does **not** ship (yet): share URLs, Stripe billing, canvas.h4ck3d.me integration, FileTree, bolt graft, or accounts/auth for saved projects.

Not Next.js, not Prisma, not OpenAI — TanStack Start + Vite on port 8080, Mistral (optional Grok) for generation.
