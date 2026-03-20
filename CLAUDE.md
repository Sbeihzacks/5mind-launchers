# CLAUDE.md

## Project Overview

**Name:** 5Mind Launchers

**Description:** A single-page web app that sends tailored prompts to multiple AI models via OpenRouter and collects their responses for synthesis.

**Stack:** Pure HTML + CSS + vanilla JavaScript. No frameworks, no build step, no backend. Hosted on GitHub Pages.

**Main Features:**
- API key management (localStorage)
- 4 model slots (Gemini, DeepSeek, GPT-4o, Grok)
- Fire All button
- Response cards with timing/tokens
- Copy All Results formatted for Claude paste-back
- Settings panel for model swapping

## Project Structure

```
5mind-launchers/
├── index.html          # Landing / main entry point
├── council.html        # Council view
├── assets/
│   ├── css/            # Stylesheets
│   └── js/             # JavaScript modules
└── docs/               # Documentation
```

## Key Conventions

- **Vanilla JS only** — no frameworks or build tools.
- **Single responsibility per function** — each function does one thing.
- **All API calls go through OpenRouter** — no direct model provider endpoints.
- **API keys stored in localStorage only** — never in source code.
- **Mobile-responsive design** — works on all screen sizes.
- **Semantic HTML** — use proper elements for structure and meaning.

## Three-Tier Boundaries

### Always Do
- Test in browser before committing.
- Validate API key existence before calls.
- Sanitize user input.
- Use HTTPS for all API calls.
- Keep single-file simplicity where possible.

### Ask First
- Adding new dependencies or libraries.
- Changing the OpenRouter endpoint.
- Adding new model slots beyond 4.
- Modifying localStorage schema.
- Any auto-fire or auto-send behavior.

### Never Do
- Commit API keys or secrets.
- Add `sendPrompt()` or any Claude integration.
- Add frameworks or build steps.
- Fire API calls without explicit user click.
- Store keys in code or HTML attributes.

## Agent Model Assignment

| Model  | Role                                      |
|--------|-------------------------------------------|
| haiku  | File reading, searching, fact-gathering   |
| sonnet | Writing code, tests, moderate tasks       |
| opus   | Architecture, security, complex decisions |

## Active Plan

See `PROJECT_PLAN.md`.

## Skills in Use

- frontend-design
- brainstorming
- verification-before-completion
- test-driven-development
