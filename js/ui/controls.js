// ── NUMPAD & CONTROLS UI ─────────────────────────────────────────────────────
// Rendering the number pad and wiring up keyboard shortcuts.
// All board geometry is read from BOARD_CONFIG at call-time.

import { state } from '../core/sudoku.js';
import { BOARD_CONFIG } from '../core/config.js';
import { inputNumber, clearCell, undoMove, useHint, toggleOpt } from '../core/game.js';
import { selectCell } from './board.js';

// ── RENDER NUMPAD ────────────────────────────────────────────────────────────
export function renderNumPad() {
    const boardSize = BOARD_CONFIG.boardSize;
    const np = document.getElementById('numpad');
    np.innerHTML = '';
    np.setAttribute('role', 'group');
    np.setAttribute('aria-label', 'Number pad');



    for (let n = 1; n <= boardSize; n++) {
        const btn = document.createElement('button');
        btn.className   = 'num-key';
        btn.dataset.n   = n;
        btn.innerHTML   = `<span>${n}</span><span class="num-count" id="nc-${n}"></span>`;
        btn.setAttribute('aria-label',   `${n}`);
        btn.setAttribute('aria-pressed', 'false');
        btn.addEventListener('click', () => inputNumber(n));
        np.appendChild(btn);
    }
}

// ── KEYBOARD SHORTCUTS ────────────────────────────────────────────────────────
export function initKeyboard() {
    document.addEventListener('keydown', e => {
        if (!state.gameActive) return;
        const key       = e.key;
        const boardSize = BOARD_CONFIG.boardSize;
        const cellCount = BOARD_CONFIG.cellCount;

        // Arrow keys — navigate board cells
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            e.preventDefault();
            const centerIdx = Math.floor(cellCount / 2);
            const maxIdx    = cellCount - 1;
            let idx = state.selected < 0 ? centerIdx : state.selected;
            if (key === 'ArrowUp')    idx = Math.max(0,      idx - boardSize);
            if (key === 'ArrowDown')  idx = Math.min(maxIdx, idx + boardSize);
            if (key === 'ArrowLeft')  idx = Math.max(0,      idx - 1);
            if (key === 'ArrowRight') idx = Math.min(maxIdx, idx + 1);
            selectCell(idx);
            return;
        }

        // Number input — valid for 1..boardSize only
        const num = parseInt(key, 10);
        if (!isNaN(num) && num >= 1 && num <= boardSize) { inputNumber(num); return; }
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
