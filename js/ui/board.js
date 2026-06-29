// ── BOARD UI ─────────────────────────────────────────────────────────────────
// Rendering and board update logic. All DOM manipulation for the grid.

import { state, DIFF_CONFIG } from '../core/sudoku.js';
import { inputNumber } from '../core/game.js';
import { formatTime } from '../utils/helpers.js';

// ── UPDATE NUMPAD ─────────────────────────────────────────────────────────────
export function updateNumPad() {
    const counts = Array(10).fill(0);
    state.board.forEach(v => { if (v) counts[v]++; });
    for (let n = 1; n <= 9; n++) {
        const btn = document.querySelector(`.num-key[data-n="${n}"]`);
        if (!btn) continue;
        const remaining = 9 - counts[n];
        btn.querySelector('.num-count').textContent = remaining || '';
        btn.classList.toggle('exhausted', remaining === 0);
        btn.classList.toggle('selected-num', state.selectedNum === n);
    }
}

// ── RENDER BOARD ─────────────────────────────────────────────────────────────
export function renderBoard() {
    const board = document.getElementById('sudoku-board');
    board.innerHTML = '';
    for (let i = 0; i < 81; i++) {
        const row = Math.floor(i / 9), col = i % 9;
        const cell = document.createElement('div');
        cell.className = 'cell' + (state.given[i] ? ' given' : '');
        cell.dataset.idx = i;
        cell.dataset.row = row;
        cell.dataset.col = col;

        // Completion ring
        const ring = document.createElement('div');
        ring.className = 'completion-ring';
        cell.appendChild(ring);

        // Notes grid
        const ng = document.createElement('div');
        ng.className = 'notes-grid';
        for (let n = 1; n <= 9; n++) {
            const nd = document.createElement('div');
            nd.className = 'note-num';
            nd.dataset.n = n;
            nd.textContent = n;
            ng.appendChild(nd);
        }
        cell.appendChild(ng);

        // Value
        const vd = document.createElement('div');
        vd.className = 'cell-value';
        cell.appendChild(vd);

        cell.addEventListener('click', () => selectCell(i));
        board.appendChild(cell);
    }
    updateBoardDisplay();
}

// ── UPDATE BOARD DISPLAY ──────────────────────────────────────────────────────
export function updateBoardDisplay() {
    for (let i = 0; i < 81; i++) {
        const cell = document.querySelector(`.cell[data-idx="${i}"]`);
        if (!cell) continue;
        const vd = cell.querySelector('.cell-value');
        const ng = cell.querySelector('.notes-grid');

        const v = state.board[i];
        if (v !== 0) {
            vd.textContent = v;
            ng.style.display = 'none';
            cell.classList.toggle('error', state.opts.mistakes && state.errors[i]);
        } else {
            vd.textContent = '';
            ng.style.display = 'grid';
            ng.querySelectorAll('.note-num').forEach(nd => {
                nd.classList.toggle('visible', state.notes[i].has(+nd.dataset.n));
            });
        }
        // Complete ring
        cell.classList.toggle('complete', state.given[i] && v !== 0);
    }
    updateHighlights();
    updateStats();
    updateProgress();
    updateNumPad();
    updateHeatmap();
}

// ── HIGHLIGHTS ───────────────────────────────────────────────────────────────
export function updateHighlights() {
    const sel = state.selected;
    const selVal = sel >= 0 ? state.board[sel] : 0;

    document.querySelectorAll('.cell').forEach(cell => {
        const i = +cell.dataset.idx;
        cell.classList.remove('selected', 'related', 'same-num');

        if (i === sel) {
            cell.classList.add('selected'); return;
        }
        if (sel < 0) return;

        const selRow = Math.floor(sel / 9), selCol = sel % 9;
        const selBoxR = Math.floor(selRow / 3) * 3, selBoxC = Math.floor(selCol / 3) * 3;
        const iRow = Math.floor(i / 9), iCol = i % 9;
        const isRelated = (iRow === selRow || iCol === selCol ||
            (Math.floor(iRow / 3) * 3 === selBoxR && Math.floor(iCol / 3) * 3 === selBoxC));

        if (state.opts.samenum && selVal !== 0 && state.board[i] === selVal) {
            cell.classList.add('same-num');
        } else if (state.opts.related && isRelated) {
            cell.classList.add('related');
        }
    });
}

// ── SELECT CELL ──────────────────────────────────────────────────────────────
export function selectCell(idx) {
    if (state.selected === idx) { state.selected = -1; state.selectedNum = -1; }
    else {
        state.selected = idx;
        if (state.board[idx] !== 0) state.selectedNum = state.board[idx];
    }
    updateHighlights();
    updateNumPad();
}

// ── STATS ────────────────────────────────────────────────────────────────────
export function updateStats() {
    document.getElementById('mistakes-val').textContent = `${state.mistakes}/${state.maxMistakes}`;
    document.getElementById('score-val').textContent = state.score;
    const filled = state.board.filter(v => v !== 0).length;
    document.getElementById('filled-val').textContent = `${filled}/81`;
}

// ── PROGRESS ─────────────────────────────────────────────────────────────────
export function updateProgress() {
    const total = 81;
    const correctFilled = state.board.filter((v, i) => v !== 0 && v === state.solution[i]).length;
    const totalFilled = state.board.filter(v => v !== 0).length;
    const filledPct = Math.round(correctFilled / total * 100);
    const accPct = totalFilled ? Math.round(correctFilled / totalFilled * 100) : 100;
    const hintPct = Math.round(state.hintsUsed / 3 * 100);

    document.getElementById('prog-filled').style.width = filledPct + '%';
    document.getElementById('prog-filled-txt').textContent = filledPct + '%';
    document.getElementById('prog-acc').style.width = accPct + '%';
    document.getElementById('prog-acc-txt').textContent = accPct + '%';
    document.getElementById('prog-hint').style.width = hintPct + '%';
    document.getElementById('prog-hint-txt').textContent = state.hintsUsed + '/3';
}

// ── BEST TIMES ───────────────────────────────────────────────────────────────
export function updateBestTimes() {
    const el = document.getElementById('best-times');
    el.innerHTML = '';
    const diffs = ['easy', 'medium', 'hard', 'expert'];
    diffs.forEach(d => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border-light);';
        const t = state.bestTimes[d];
        row.innerHTML = `<span style="color:var(--text-muted);font-size:0.78rem">${DIFF_CONFIG[d].label}</span>
      <span style="color:${DIFF_CONFIG[d].color};font-size:0.8rem;font-weight:700">${t ? formatTime(t) : '—'}</span>`;
        el.appendChild(row);
    });
}

// ── HEATMAP ──────────────────────────────────────────────────────────────────
export function updateHeatmap() {
    const hm = document.getElementById('heatmap');
    if (!hm.children.length) {
        hm.innerHTML = '';
        for (let i = 0; i < 81; i++) {
            const c = document.createElement('div');
            c.className = 'heatmap-cell';
            c.title = `R${Math.floor(i / 9) + 1}C${i % 9 + 1}`;
            hm.appendChild(c);
        }
    }
    const max = Math.max(1, ...state.heatmap);
    hm.querySelectorAll('.heatmap-cell').forEach((c, i) => {
        const v = state.heatmap[i];
        const intensity = v / max;
        if (v === 0) { c.style.background = 'var(--border-light)'; c.textContent = ''; }
        else {
            const r = Math.round(233 * intensity), g = Math.round(69 + 100 * (1 - intensity));
            c.style.background = `rgb(${r},${g},${Math.round(96 * intensity)})`;
            c.style.color = 'rgba(255,255,255,0.8)';
            c.textContent = v;
        }
    });
}
