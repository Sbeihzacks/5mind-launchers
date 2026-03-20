# Council Chamber Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build council.html — a single-page web app that sends prompts to multiple AI models via OpenRouter and formats results for Claude paste-back.

**Architecture:** Three files: `council.html` (semantic markup), `assets/css/council.css` (dark theme, responsive), `assets/js/council.js` (all logic). No frameworks, no build step. OpenRouter REST API via `fetch()`. State managed in localStorage + DOM.

**Tech Stack:** Vanilla HTML5, CSS3, JavaScript (ES2020+). OpenRouter API. GitHub Pages hosting.

**Spec:** `docs/superpowers/specs/2026-03-20-council-chamber-design.md`

---

## File Structure

| File | Responsibility |
|------|---------------|
| `council.html` | Semantic HTML skeleton — header, 4 slot containers, footer, settings panel overlay |
| `assets/css/council.css` | Dark theme, slot card styles, states (empty/loading/complete/error), settings panel, responsive breakpoints |
| `assets/js/council.js` | localStorage management, API calls via OpenRouter, slot state machine, Fire/Fire All logic, Copy All formatting, settings panel behavior |

---

### Task 1: HTML Skeleton

**Files:**
- Create: `council.html`

- [ ] **Step 1: Create council.html with full semantic structure**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>5Mind Council</title>
  <link rel="stylesheet" href="assets/css/council.css">
</head>
<body>
  <header class="header">
    <div class="header-left">
      <h1 class="header-title">5Mind Council</h1>
      <span class="header-version">v1</span>
    </div>
    <div class="header-right">
      <button id="fire-all-btn" class="btn btn-fire-all">Fire All</button>
      <button id="settings-btn" class="btn btn-icon" aria-label="Settings">&#9881;</button>
    </div>
  </header>

  <main class="slots" id="slots-container">
    <!-- Slots rendered by JS -->
  </main>

  <footer class="footer" id="footer">
    <button id="copy-all-btn" class="btn btn-copy-all" style="display:none;">Copy All Results</button>
  </footer>

  <!-- Settings Panel Overlay -->
  <div class="settings-overlay" id="settings-overlay">
    <div class="settings-panel" id="settings-panel">
      <div class="settings-header">
        <h2>Settings</h2>
        <button id="settings-close-btn" class="btn btn-icon" aria-label="Close">&times;</button>
      </div>
      <div class="settings-body" id="settings-body">
        <!-- Rendered by JS -->
      </div>
      <div class="settings-footer">
        <button id="settings-cancel-btn" class="btn btn-secondary">Cancel</button>
        <button id="settings-save-btn" class="btn btn-primary">Save</button>
      </div>
    </div>
  </div>

  <script src="assets/js/council.js"></script>
</body>
</html>
```

- [ ] **Step 2: Open in browser to verify blank page loads without errors**

Open `council.html` in browser. Check console — should be zero errors (CSS/JS 404s are expected at this point).

- [ ] **Step 3: Commit**

```bash
git add council.html
git commit -m "feat: add council.html skeleton with semantic structure"
```

---

### Task 2: Dark Theme CSS

**Files:**
- Create: `assets/css/council.css`

- [ ] **Step 1: Create the CSS file with full dark theme**

```css
/* === Reset & Base === */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg-primary: #1a1a2e;
  --bg-card: #16213e;
  --bg-input: #0d1528;
  --bg-surface: #2a2a4a;
  --text-primary: #e0e0e0;
  --text-secondary: #888;
  --text-muted: #666;
  --border: #2a2a4a;
  --accent-purple: #7c3aed;
  --accent-green: #4ade80;
  --accent-red: #ef4444;
  --color-gemini: #4285f4;
  --color-deepseek: #00b4d8;
  --color-gpt: #10a37f;
  --color-grok: #f97316;
  --radius: 8px;
  --radius-sm: 4px;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
  padding: 0 16px;
  max-width: 800px;
  margin: 0 auto;
}

/* === Header === */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--border);
  margin-bottom: 20px;
}

.header-left { display: flex; align-items: center; gap: 12px; }
.header-title { font-size: 20px; font-weight: 700; color: #fff; }
.header-version { font-size: 12px; color: var(--text-muted); background: var(--bg-surface); padding: 2px 8px; border-radius: var(--radius-sm); }
.header-right { display: flex; gap: 12px; align-items: center; }

/* === Buttons === */
.btn {
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: opacity 0.15s;
}
.btn:hover { opacity: 0.85; }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-fire-all { background: var(--accent-purple); color: #fff; padding: 8px 16px; }
.btn-icon { background: var(--bg-surface); color: var(--text-secondary); padding: 8px 12px; font-size: 18px; }
.btn-fire { color: #fff; padding: 6px 14px; font-size: 13px; }
.btn-copy-all { background: var(--bg-surface); color: var(--text-primary); border: 1px solid #3a3a5a; padding: 10px 24px; }
.btn-primary { background: var(--accent-purple); color: #fff; padding: 8px 20px; }
.btn-secondary { background: var(--bg-surface); color: var(--text-secondary); padding: 8px 20px; }
.btn-clear { background: transparent; color: var(--text-muted); padding: 4px 10px; font-size: 12px; border: 1px solid var(--border); }
.btn-retry { background: transparent; color: var(--accent-red); padding: 4px 10px; font-size: 12px; border: 1px solid var(--accent-red); }

/* === Slot Cards === */
.slots { display: flex; flex-direction: column; gap: 12px; }

.slot-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
}

.slot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.slot-info { display: flex; align-items: center; gap: 8px; }
.slot-badge { color: #fff; padding: 2px 8px; border-radius: var(--radius-sm); font-size: 12px; font-weight: 600; }
.slot-model-id { color: var(--text-muted); font-size: 12px; }

.slot-actions { display: flex; align-items: center; gap: 8px; }
.slot-meta { color: var(--text-muted); font-size: 11px; }
.slot-status-done { background: #1a3a2a; color: var(--accent-green); padding: 2px 8px; border-radius: var(--radius-sm); font-size: 11px; }
.slot-status-error { background: #3a1a1a; color: var(--accent-red); padding: 2px 8px; border-radius: var(--radius-sm); font-size: 11px; }

.slot-textarea {
  width: 100%;
  min-height: 80px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 13px;
  line-height: 1.5;
  resize: vertical;
}
.slot-textarea::placeholder { color: var(--text-muted); }
.slot-textarea:focus { outline: none; border-color: #4a4a6a; }
.slot-textarea:disabled { opacity: 0.6; }

.slot-response {
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px;
  color: #c0c0c0;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 400px;
  overflow-y: auto;
}

.slot-error {
  background: #1a0d0d;
  border: 1px solid #3a1a1a;
  border-radius: var(--radius-sm);
  padding: 10px;
  color: var(--accent-red);
  font-size: 13px;
}

/* === Loading Spinner === */
.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid var(--text-muted);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.slot-timer { color: var(--text-muted); font-size: 11px; }

/* === Footer === */
.footer { display: flex; justify-content: center; padding: 16px 0 32px; }

/* === Settings Panel === */
.settings-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 100;
}
.settings-overlay.open { display: block; }

.settings-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 380px;
  height: 100vh;
  background: var(--bg-card);
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  z-index: 101;
  transform: translateX(100%);
  transition: transform 0.2s ease;
}
.settings-overlay.open .settings-panel { transform: translateX(0); }

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}
.settings-header h2 { font-size: 18px; color: #fff; }

.settings-body { flex: 1; overflow-y: auto; padding: 20px; }

.settings-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid var(--border);
}

.settings-group { margin-bottom: 24px; }
.settings-label { display: block; font-size: 13px; color: var(--text-secondary); margin-bottom: 6px; }
.settings-input {
  width: 100%;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 8px 10px;
  color: var(--text-primary);
  font-size: 13px;
}
.settings-input:focus { outline: none; border-color: #4a4a6a; }

.settings-select {
  width: 100%;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 8px 10px;
  color: var(--text-primary);
  font-size: 13px;
  appearance: auto;
}

.settings-slot { margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
.settings-slot-title { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }

.api-key-wrapper { position: relative; }
.api-key-toggle {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 12px;
}

/* === Toast === */
.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--accent-green);
  color: #000;
  padding: 8px 20px;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 600;
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 200;
}
.toast.show { opacity: 1; }

/* === Responsive === */
@media (max-width: 768px) {
  body { padding: 0 12px; }
  .header { flex-wrap: wrap; gap: 12px; }
  .btn-fire-all { width: 100%; text-align: center; order: 3; }
  .btn-copy-all { width: 100%; }
  .btn, .settings-select, .settings-input { min-height: 44px; }
  .settings-panel { width: 100%; }
}
```

- [ ] **Step 2: Open council.html in browser — verify dark background, header visible, no layout errors**

- [ ] **Step 3: Commit**

```bash
git add assets/css/council.css
git commit -m "feat: add dark theme CSS with all slot states and responsive layout"
```

---

### Task 3: Core JavaScript — Storage & Slot Rendering

**Files:**
- Create: `assets/js/council.js`

- [ ] **Step 1: Create council.js with storage defaults, slot config, and DOM rendering**

```javascript
'use strict';

// === Default slot configuration ===
const DEFAULT_SLOTS = [
  { id: 'gemini', label: 'GEMINI', model: 'google/gemini-2.5-pro', color: '#4285f4' },
  { id: 'deepseek', label: 'DEEPSEEK', model: 'deepseek/deepseek-chat', color: '#00b4d8' },
  { id: 'gpt', label: 'GPT', model: 'openai/gpt-4o', color: '#10a37f' },
  { id: 'grok', label: 'GROK', model: 'x-ai/grok-4-1-fast', color: '#f97316' },
];

const PRESET_MODELS = {
  gemini: ['google/gemini-2.5-pro', 'google/gemini-2.5-flash', 'google/gemini-2.0-pro'],
  deepseek: ['deepseek/deepseek-chat', 'deepseek/deepseek-reasoner'],
  gpt: ['openai/gpt-4o', 'openai/gpt-4o-mini', 'openai/o1'],
  grok: ['x-ai/grok-4-1-fast', 'x-ai/grok-4-1'],
};

// === State ===
const slotStates = {};  // { slotId: { status: 'empty'|'loading'|'complete'|'error', response: '', time: 0, tokens: 0, error: '' } }

// === Storage ===
function getApiKey() {
  return localStorage.getItem('openrouter_api_key') || '';
}

function setApiKey(key) {
  localStorage.setItem('openrouter_api_key', key);
}

function getSlots() {
  const stored = localStorage.getItem('council_slots');
  return stored ? JSON.parse(stored) : DEFAULT_SLOTS;
}

function saveSlots(slots) {
  localStorage.setItem('council_slots', JSON.stringify(slots));
}

// === Slot Rendering ===
function initSlotState(slotId) {
  if (!slotStates[slotId]) {
    slotStates[slotId] = { status: 'empty', response: '', time: 0, tokens: 0, error: '' };
  }
}

function renderSlot(slot) {
  const state = slotStates[slot.id];
  const card = document.createElement('div');
  card.className = 'slot-card';
  card.id = `slot-${slot.id}`;

  let bodyHTML = '';
  let actionsHTML = '';

  if (state.status === 'empty') {
    bodyHTML = `<textarea class="slot-textarea" id="prompt-${slot.id}" placeholder="Paste ${escapeHTML(slot.label)} prompt here..."></textarea>`;
    actionsHTML = `<button class="btn btn-fire" style="background:${slot.color}" onclick="fireSlot('${slot.id}')">Fire</button>`;
  } else if (state.status === 'loading') {
    bodyHTML = `<textarea class="slot-textarea" id="prompt-${slot.id}" disabled></textarea>`;
    actionsHTML = `<span class="spinner" style="border-color:${slot.color};border-top-color:transparent"></span><span class="slot-timer" id="timer-${slot.id}">0.0s</span>`;
  } else if (state.status === 'complete') {
    bodyHTML = `<div class="slot-response">${escapeHTML(state.response)}</div>`;
    actionsHTML = `<span class="slot-meta">${state.time}s · ${state.tokens} tokens</span><span class="slot-status-done">Done</span><button class="btn btn-clear" onclick="clearSlot('${slot.id}')">Clear</button>`;
  } else if (state.status === 'error') {
    bodyHTML = `<div class="slot-error">${escapeHTML(state.error)}</div>`;
    actionsHTML = `<span class="slot-status-error">Error</span><button class="btn btn-retry" onclick="retrySlot('${slot.id}')">Retry</button><button class="btn btn-clear" onclick="clearSlot('${slot.id}')">Clear</button>`;
  }

  card.innerHTML = `
    <div class="slot-header">
      <div class="slot-info">
        <span class="slot-badge" style="background:${slot.color}">${slot.label}</span>
        <span class="slot-model-id">${escapeHTML(slot.model)}</span>
      </div>
      <div class="slot-actions">${actionsHTML}</div>
    </div>
    ${bodyHTML}
  `;
  return card;
}

function renderAllSlots() {
  const container = document.getElementById('slots-container');
  const slots = getSlots();

  // Preserve textarea values before re-render
  const prompts = {};
  slots.forEach(s => {
    const el = document.getElementById('prompt-' + s.id);
    if (el) prompts[s.id] = el.value;
  });

  container.innerHTML = '';
  slots.forEach(slot => {
    initSlotState(slot.id);
    container.appendChild(renderSlot(slot));
    // Restore textarea value (safe — sets via .value, not innerHTML)
    const state = slotStates[slot.id];
    if (prompts[slot.id] && (state.status === 'empty' || state.status === 'loading')) {
      const el = document.getElementById('prompt-' + slot.id);
      if (el) el.value = prompts[slot.id];
    }
  });
  updateCopyButton();
}

function updateCopyButton() {
  const hasResults = Object.values(slotStates).some(s => s.status === 'complete');
  document.getElementById('copy-all-btn').style.display = hasResults ? 'block' : 'none';
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// === Settings stub (replaced in Task 6) ===
function openSettings() { console.warn('Settings not yet implemented'); }
function closeSettings() {}

// === Init ===
document.addEventListener('DOMContentLoaded', () => {
  renderAllSlots();
  if (!getApiKey()) {
    openSettings();
  }
});
```

- [ ] **Step 2: Open council.html in browser — verify 4 slots render with correct colors, labels, model IDs, and textareas**

- [ ] **Step 3: Commit**

```bash
git add assets/js/council.js
git commit -m "feat: add core JS with storage, slot config, and DOM rendering"
```

---

### Task 4: API Integration — Fire & Fire All

**Files:**
- Modify: `assets/js/council.js`

- [ ] **Step 1: Add the OpenRouter API call function and fire logic**

Append to `council.js`:

```javascript
// === API ===
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function callOpenRouter(model, prompt) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('No API key set. Open Settings to add your OpenRouter key.');

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error: ${res.status}`);
  }

  return res.json();
}

// === Fire Logic ===
async function fireSlot(slotId) {
  const promptEl = document.getElementById('prompt-' + slotId);
  const prompt = promptEl?.value?.trim();
  if (!prompt) return;

  const slots = getSlots();
  const slot = slots.find(s => s.id === slotId);
  if (!slot) return;

  // Set loading state
  slotStates[slotId] = { status: 'loading', response: '', time: 0, tokens: 0, error: '', prompt: prompt };
  renderAllSlots();

  // Start timer
  const startTime = performance.now();
  const timerEl = document.getElementById('timer-' + slotId);
  const timerInterval = setInterval(() => {
    if (timerEl) timerEl.textContent = ((performance.now() - startTime) / 1000).toFixed(1) + 's';
  }, 100);

  try {
    const data = await callOpenRouter(slot.model, prompt);
    clearInterval(timerInterval);
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
    const content = data.choices?.[0]?.message?.content || '(empty response)';
    const tokens = data.usage?.total_tokens || 0;

    slotStates[slotId] = { status: 'complete', response: content, time: elapsed, tokens: tokens, error: '', prompt: prompt };
  } catch (err) {
    clearInterval(timerInterval);
    slotStates[slotId] = { status: 'error', response: '', time: 0, tokens: 0, error: err.message, prompt: prompt };
  }

  renderAllSlots();
}

async function fireAll() {
  const slots = getSlots();
  const toFire = slots.filter(s => {
    const el = document.getElementById('prompt-' + s.id);
    return el && el.value.trim();
  });
  if (toFire.length === 0) return;  // No-op if all empty
  await Promise.allSettled(toFire.map(s => fireSlot(s.id)));
}

function clearSlot(slotId) {
  slotStates[slotId] = { status: 'empty', response: '', time: 0, tokens: 0, error: '' };
  renderAllSlots();
}

function retrySlot(slotId) {
  const saved = slotStates[slotId]?.prompt;
  slotStates[slotId] = { status: 'empty', response: '', time: 0, tokens: 0, error: '' };
  renderAllSlots();
  if (saved) {
    const el = document.getElementById('prompt-' + slotId);
    if (el) el.value = saved;
    fireSlot(slotId);
  }
}
```

- [ ] **Step 2: Wire Fire All button in the DOMContentLoaded handler**

Add to the `DOMContentLoaded` listener in council.js:

```javascript
document.getElementById('fire-all-btn').addEventListener('click', fireAll);
```

- [ ] **Step 3: Test manually — paste a prompt into one slot, click Fire, verify loading → response or error**

Use a simple prompt like "Say hello" in the Gemini slot. If no API key, settings should open (we'll add that next).

- [ ] **Step 4: Commit**

```bash
git add assets/js/council.js
git commit -m "feat: add OpenRouter API calls with fire, fire-all, clear, and retry"
```

---

### Task 5: Copy All Results

**Files:**
- Modify: `assets/js/council.js`

- [ ] **Step 1: Add copy formatting and clipboard logic**

Append to `council.js`:

```javascript
// === Copy All Results ===
function formatResults() {
  const slots = getSlots();
  let output = '\uD83D\uDCCB COUNCIL RESULTS\n';

  slots.forEach(slot => {
    const state = slotStates[slot.id];
    if (!state) return;

    if (state.status === 'complete') {
      output += `\n\u2500\u2500\u2500\u2500 ${slot.label} \u2500\u2500\u2500\u2500\n`;
      output += `Response time: ${state.time}s | Tokens: ${state.tokens}\n\n`;
      output += state.response + '\n';
    } else if (state.status === 'error') {
      output += `\n\u2500\u2500\u2500\u2500 ${slot.label} \u2500\u2500\u2500\u2500\n`;
      output += `ERROR: ${state.error}\n`;
    }
  });

  return output;
}

async function copyAllResults() {
  const text = formatResults();
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied!');
  } catch {
    // Fallback for older browsers
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('Copied!');
  }
}

function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1500);
}
```

- [ ] **Step 2: Wire Copy All button in the DOMContentLoaded handler**

Add to the `DOMContentLoaded` listener:

```javascript
document.getElementById('copy-all-btn').addEventListener('click', copyAllResults);
```

- [ ] **Step 3: Commit**

```bash
git add assets/js/council.js
git commit -m "feat: add copy-all-results with clipboard and toast notification"
```

---

### Task 6: Settings Panel

**Files:**
- Modify: `assets/js/council.js`

- [ ] **Step 1: Add settings panel rendering and save/cancel logic**

Append to `council.js`:

```javascript
// === Settings Panel ===
function openSettings() {
  const overlay = document.getElementById('settings-overlay');
  const body = document.getElementById('settings-body');

  const currentKey = getApiKey();
  const slots = getSlots();

  let slotsHTML = '';
  slots.forEach(slot => {
    const presets = PRESET_MODELS[slot.id] || [];
    const isCustom = !presets.includes(slot.model);
    const optionsHTML = presets.map(m => `<option value="${m}" ${m === slot.model ? 'selected' : ''}>${m}</option>`).join('')
      + `<option value="__custom" ${isCustom ? 'selected' : ''}>Custom...</option>`;

    slotsHTML += `
      <div class="settings-slot">
        <div class="settings-slot-title">
          <span class="slot-badge" style="background:${slot.color}">${slot.label}</span>
        </div>
        <label class="settings-label">Model</label>
        <select class="settings-select" id="settings-model-${slot.id}" onchange="toggleCustomModel('${slot.id}')">
          ${optionsHTML}
        </select>
        <input class="settings-input" id="settings-custom-${slot.id}" placeholder="Enter OpenRouter model ID" style="margin-top:6px;display:${isCustom ? 'block' : 'none'}">
      </div>
    `;
  });

  body.innerHTML = `
    <div class="settings-group">
      <label class="settings-label">OpenRouter API Key</label>
      <div class="api-key-wrapper">
        <input class="settings-input" id="settings-api-key" type="password" placeholder="sk-or-...">
        <button class="api-key-toggle" onclick="toggleApiKeyVisibility()">show</button>
      </div>
    </div>
    ${slotsHTML}
  `;

  // Set values programmatically to prevent XSS
  document.getElementById('settings-api-key').value = currentKey;
  slots.forEach(slot => {
    const customInput = document.getElementById('settings-custom-' + slot.id);
    const isCustom = !(PRESET_MODELS[slot.id] || []).includes(slot.model);
    if (isCustom && customInput) customInput.value = slot.model;
  });

  overlay.classList.add('open');
}

function closeSettings() {
  document.getElementById('settings-overlay').classList.remove('open');
}

function saveSettings() {
  const key = document.getElementById('settings-api-key').value.trim();
  setApiKey(key);

  const slots = getSlots();
  slots.forEach(slot => {
    const select = document.getElementById('settings-model-' + slot.id);
    const custom = document.getElementById('settings-custom-' + slot.id);
    if (select.value === '__custom') {
      slot.model = custom.value.trim() || slot.model;
    } else {
      slot.model = select.value;
    }
  });
  saveSlots(slots);

  closeSettings();
  renderAllSlots();
}

function toggleCustomModel(slotId) {
  const select = document.getElementById('settings-model-' + slotId);
  const custom = document.getElementById('settings-custom-' + slotId);
  custom.style.display = select.value === '__custom' ? 'block' : 'none';
}

function toggleApiKeyVisibility() {
  const input = document.getElementById('settings-api-key');
  const btn = input.nextElementSibling;
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = 'hide';
  } else {
    input.type = 'password';
    btn.textContent = 'show';
  }
}
```

- [ ] **Step 2: Wire settings buttons in the DOMContentLoaded handler**

Add to the `DOMContentLoaded` listener:

```javascript
document.getElementById('settings-btn').addEventListener('click', openSettings);
document.getElementById('settings-close-btn').addEventListener('click', closeSettings);
document.getElementById('settings-cancel-btn').addEventListener('click', closeSettings);
document.getElementById('settings-save-btn').addEventListener('click', saveSettings);
document.getElementById('settings-overlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeSettings();
});
```

- [ ] **Step 3: Test manually — click Settings gear, verify panel opens, enter a key, save, verify stored in localStorage**

- [ ] **Step 4: Commit**

```bash
git add assets/js/council.js
git commit -m "feat: add settings panel with API key and model configuration"
```

---

### Task 7: End-to-End Test

**Files:** None (testing only)

- [ ] **Step 1: Open council.html in browser**

- [ ] **Step 2: Add your OpenRouter API key in Settings**

- [ ] **Step 3: Paste a test prompt into one slot (e.g. "Say hello in one sentence" in Gemini)**

- [ ] **Step 4: Click Fire — verify loading spinner, then response card with time and tokens**

- [ ] **Step 5: Paste prompts into 2+ slots, click Fire All — verify parallel responses**

- [ ] **Step 6: Click Copy All Results — paste into a text editor, verify the `────` format is correct**

- [ ] **Step 7: Test error state — use an invalid model ID in settings, fire, verify error card with Retry button**

- [ ] **Step 8: Test mobile — resize browser to <768px, verify single column layout**

- [ ] **Step 9: If all passes, commit and update PROJECT_PLAN.md status**

```bash
git add -A
git commit -m "test: verify end-to-end council chamber flow"
```

---

### Task 8: Deploy to GitHub Pages

**Files:**
- No code changes

- [ ] **Step 1: Create GitHub repository**

```bash
gh repo create sbeihzacks/5mind-launchers --public --source=. --push
```

- [ ] **Step 2: Enable GitHub Pages in repo settings (main branch, root directory)**

```bash
gh api repos/sbeihzacks/5mind-launchers/pages -X POST -f source.branch=main -f source.path=/
```

- [ ] **Step 3: Verify live at sbeihzacks.github.io/5mind-launchers/council.html**

- [ ] **Step 4: Update PROJECT_PLAN.md status to "Step 1 Complete"**

```bash
git add PROJECT_PLAN.md
git commit -m "docs: update project status to Step 1 complete"
```
