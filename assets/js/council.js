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

// === Init ===
document.addEventListener('DOMContentLoaded', () => {
  renderAllSlots();
  if (!getApiKey()) {
    openSettings();
  }
});
