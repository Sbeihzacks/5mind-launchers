# 5Mind Launchers — Project Plan

Project context: A single-page web app (council.html) hosted on GitHub Pages that sends tailored prompts to multiple AI models via OpenRouter and collects responses. Pure HTML + CSS + vanilla JS, no frameworks, no backend.

## Goal

Build a clean, functional web app ("The Council Chamber") that lets users paste AI-model-specific prompts, fire them to multiple models via OpenRouter, and copy formatted results back into Claude for synthesis.

## V1 Scope

- Single HTML page (council.html) with inline or linked CSS/JS
- API key management via localStorage (OpenRouter single key)
- 4 model slots: Gemini 2.5 Pro, DeepSeek V3, GPT-4o, Grok 4.1
- Each slot: text input area + individual Fire button
- "Fire All" button to send all prompts simultaneously
- Response cards showing: model answer, response time, token count
- "Copy All Results" button — formats all responses into a clean block for pasting back into Claude
- Settings panel to swap model IDs (any OpenRouter model)
- Mobile-responsive layout
- GitHub Pages deployment ready

## Out of Scope

- No Claude API integration or sendPrompt()
- No auto-fire or auto-send behavior
- No backend or database
- No user accounts or authentication
- No framework (React, Vue, etc.)
- No build step (webpack, vite, etc.)
- No launcher/shortcut app (deferred)
- No multi-project Claude prompt management

## Current Status: Step 1 Complete

Web app built and deployed to https://sbeihzacks.github.io/5mind-launchers/council.html

## Build Order

1. **Step 1 — Build the web app** (council.html with OpenRouter integration, 4 slots, Copy All)
2. **Step 2 — Write the Claude Project system prompt** (/council and /verdict logic)
3. **Step 3 — Test full loop** (one real question end-to-end)
4. **Step 4 — Live with it for 2 weeks** (daily use, observe what works)
5. **Step 5 — Expand** (second project, phone launcher, only if proven)

## Next Steps

1. Set up project structure (HTML skeleton, CSS, JS files)
2. Implement OpenRouter API integration with single-key auth
3. Build the 4 model slots UI with Fire/Fire All buttons
4. Implement response cards and Copy All Results formatting

## Failed Approaches

(empty — fresh start)
