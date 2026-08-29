# Source of truth

**Product:** Cozy AI Studio — brief → one HTML blob → `srcdoc` preview at `/studio` → revise in place → download standalone `.html`. Offline local templates; recents + search; honest fail online (empty canvas, not silent local layout).

**SoT branch:** `cursor/mistral-pro-models-bb86`

## Waves shipped (this branch)

| Wave | Summary |
|------|---------|
| CS-000 | Identity: `cozy-studio` |
| CS-001 | Online fail → empty canvas; no silent local layout when online |
| CS-002 | **New**; **⋯** = Source / Copy / `.html`; model picker next to brief |
| CS-010 | `/` landing: brief → HTML → revise → download; CTA to `/studio` |
| CS-100 | Revise keeps the current starter/HTML |
| CS-101 | CTA: Generate / Generate locally / Upraviť; nav rail = config only |
| CS-102 | Copy / `.html` export = standalone `file://`-safe HTML |
| CS-103 | Search / ⌘K: starters + recents; recent click restores HTML |
| CS-110 | Vertical terracotta ribbon removed |
| CS-200 | Offline templates in `cozy-app` |
| CS-201b | Café / place briefs → place page (menu, hours), not Inbox/Doing/Done |

## Frozen (not shipping on this branch)

Do not document or implement as live product:

- CS-202, CS-300
- Auth / accounts
- Stripe
- canvas.h4ck3d.me (G0 / HitL / `/a/:id` share)
- FileTree
- bolt graft
- Share URLs
