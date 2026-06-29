// ── NUMPAD & CONTROLS UI ─────────────────────────────────────────────────────
// Rendering the number pad and wiring up keyboard shortcuts.

import { state } from '../core/sudoku.js';
import { inputNumber, clearCell, undoMove, useHint, toggleOpt } from '../core/game.js';
import { selectCell } from './board.js';

// ── RENDER NUMPAD ────────────────────────────────────────────────────────────
export function renderNumPad() {
    const np = document.getElementById('numpad');
    np.innerHTML = '';
    for (let n = 1; n <= 9; n++) {
        const btn = document.createElement('button');
        btn.className = 'num-key';
        btn.dataset.n = n;
        btn.innerHTML = `<span>${n}</span><span class="num-count" id="nc-${n}"></span>`;
        btn.addEventListener('click', () => inputNumber(n));
        np.appendChild(btn);
    }
}

// ── KEYBOARD SHORTCUTS ────────────────────────────────────────────────────────
export function initKeyboard() {
    document.addEventListener('keydown', e => {
        if (!state.gameActive) return;
        const key = e.key;

        // Arrow keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            e.preventDefault();
            let idx = state.selected < 0 ? 40 : state.selected;
            if (key === 'ArrowUp')    idx = Math.max(0, idx - 9);
            if (key === 'ArrowDown')  idx = Math.min(80, idx + 9);
            if (key === 'ArrowLeft')  idx = Math.max(0, idx - 1);
            if (key === 'ArrowRight') idx = Math.min(80, idx + 1);
            selectCell(idx);
            return;
        }

        if (key >= '1' && key <= '9') { inputNumber(+key); return; }
        if (key === '0' || key === 'Delete' || key === 'Backspace') { clearCell(); return; }
        if (key.toLowerCase() === 'z' || (e.ctrlKey && key.toLowerCase() === 'z')) { undoMove(); return; }
        if (key.toLowerCase() === 'n') { toggleOpt('notes'); return; }
        if (key.toLowerCase() === 'h') { useHint(); return; }
    });
}

// ── ANIMATED BACKGROUND ───────────────────────────────────────────────────────
export function initBg() {
    const bg = document.getElementById('bg-anim');
    for (let i = 0; i < 40; i++) {
        const s = document.createElement('span');
        s.style.cssText = `left:${Math.random() * 100}%;
      width:${2 + Math.random() * 3}px; height:${2 + Math.random() * 3}px;
      animation-duration:${6 + Math.random() * 12}s;
      animation-delay:${Math.random() * 10}s;
      opacity:${0.3 + Math.random() * 0.7};
      background:hsl(${Math.random() * 60 + 200},80%,70%)`;
        bg.appendChild(s);
    }
}
