# Council Chamber — Design Spec

**Date:** 2026-03-20
**Status:** Approved
**Component:** council.html (The Council Chamber)

## Overview

A single-page web app hosted on GitHub Pages that sends tailored prompts to multiple AI models via OpenRouter and collects their responses. Part of the 5Mind Council system — the manual execution layer that pairs with a Claude Project for `/council` and `/verdict` workflows.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Copy format | Mirror Claude's `────` brief style | Seamless paste-back into `/verdict` — Claude reads it as a continuation |
| Skipped slots in copy | Omit | Claude already knows who it skipped; shorter paste, zero info loss |
| Settings input | Dropdown presets + custom text field | 95% covered by dropdown, never locked out for new models |
| File structure | Split files (HTML + CSS + JS) | JS will be 300+ lines; separation keeps it maintainable |
| Theme | Dark only | Matches Claude's UI; one theme = zero CSS complexity |
| Layout | Sequential vertical slots | Matches the top-to-bottom workflow of paste → fire → read |

## Page Structure

### Header
- "5Mind Council" title with version badge
- "Fire All" button (purple `#7c3aed`) — sends all non-empty slots in parallel
- Settings gear icon — opens settings panel

### Model Slots (×4, vertical stack)
Each slot is a self-contained card with:
- **Model badge** — colored label (Gemini blue `#4285f4`, DeepSeek cyan `#00b4d8`, GPT green `#10a37f`, Grok orange `#f97316`)
- **Model ID** — subtle text showing the OpenRouter model ID
- **Textarea** — for pasting the tailored prompt from Claude
- **Fire button** — individual send, colored to match model badge

### Slot States
| State | UI |
|-------|-----|
| **Empty** | Textarea with placeholder text, Fire button enabled |
| **Loading** | Textarea locked, spinner replaces Fire button, elapsed timer ticking |
| **Complete** | Response text replaces textarea, metadata line (response time + token count), green "Done" badge, Clear button to reset |
| **Error** | Red error message with API error text, Retry button |

### Footer
- "Copy All Results" button — only visible when ≥1 response exists

## API Layer

- **Endpoint:** `https://openrouter.ai/api/v1/chat/completions`
- **Auth:** Single OpenRouter API key stored in localStorage
- **Request format per slot:**
  ```json
  {
    "model": "google/gemini-2.5-pro",
    "messages": [{ "role": "user", "content": "<prompt text>" }]
  }
  ```
- **Fire All:** Sends all non-empty slots in parallel via `Promise.allSettled()`
- **No streaming** — waits for full response (result is copied, not read in real-time)
- **Headers:**
  ```
  Authorization: Bearer <api_key>
  Content-Type: application/json
  ```

## Settings Panel

- Slide-out panel from the right
- **API Key:** Masked input with show/hide toggle
- **Per-slot config:** Dropdown of preset models + "Custom" option that reveals a text field for any OpenRouter model ID
- **Save** persists to localStorage, **Cancel** discards changes
- Clicking outside the panel acts as Cancel (closes without saving)
- Opens automatically on first visit if no API key is set

### Preset Models Per Slot

| Slot | Default | Presets |
|------|---------|---------|
| Gemini | `google/gemini-2.5-pro` | `google/gemini-2.5-flash`, `google/gemini-2.0-pro` |
| DeepSeek | `deepseek/deepseek-chat` | `deepseek/deepseek-reasoner` |
| GPT | `openai/gpt-4o` | `openai/gpt-4o-mini`, `openai/o1` |
| Grok | `x-ai/grok-4-1-fast` | `x-ai/grok-4-1` |

## Copy All Results Format

```
📋 COUNCIL RESULTS

──── GEMINI 2.5 PRO ────
Response time: 3.2s | Tokens: 847

[response text]

──── DEEPSEEK V3 ────
Response time: 2.1s | Tokens: 612

[response text]
```

- Display name in copy output uses the slot `label` field (e.g. "GEMINI", "DEEPSEEK"). For custom models, uses the label as-is — the label is always the slot name regardless of which model ID is configured.
- Only includes slots that fired and received a response
- Failed slots included with error message
- Skipped/empty slots omitted entirely
- Copies to clipboard with a brief "Copied!" toast notification

## localStorage Schema

```json
{
  "openrouter_api_key": "sk-or-...",
  "council_slots": [
    { "id": "gemini", "label": "GEMINI", "model": "google/gemini-2.5-pro", "color": "#4285f4" },
    { "id": "deepseek", "label": "DEEPSEEK", "model": "deepseek/deepseek-chat", "color": "#00b4d8" },
    { "id": "gpt", "label": "GPT", "model": "openai/gpt-4o", "color": "#10a37f" },
    { "id": "grok", "label": "GROK", "model": "x-ai/grok-4-1-fast", "color": "#f97316" }
  ]
}
```

## File Structure

```
council.html            — HTML skeleton, semantic markup
assets/css/council.css  — Dark theme styles, responsive layout
assets/js/council.js    — All logic: API calls, localStorage, UI state, copy formatting
```

## Error Handling

| Scenario | Behavior |
|----------|----------|
| No API key set | Settings panel opens automatically on first visit |
| API call fails | Error state in that slot only, other slots unaffected |
| Network offline | Show error in slot, no automatic retry |
| Empty prompt + Fire | Skip that slot silently (no error) |
| Empty prompt + Fire All | Skip empty slots, fire only non-empty ones |
| Fire All with all slots empty | No-op — button does nothing |
| Invalid model ID | API returns error, shown in slot error state |

## Mobile Responsive

- Single column, full width below 768px
- Textareas expand to full width
- Fire All and Copy All buttons become full-width
- Settings panel becomes full-screen overlay
- Touch-friendly tap targets (min 44px)

## Out of Scope

- No Claude API integration or `sendPrompt()`
- No auto-fire or auto-send behavior
- No streaming responses
- No backend or database
- No user accounts
- No frameworks or build steps
- No keyboard shortcuts (v1)
- No response history or persistence
