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
const slotStates = {};

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

// === Init ===
document.addEventListener('DOMContentLoaded', () => {
  renderAllSlots();
  if (!getApiKey()) {
    openSettings();
  }
  document.getElementById('fire-all-btn').addEventListener('click', fireAll);
  document.getElementById('copy-all-btn').addEventListener('click', copyAllResults);
});
