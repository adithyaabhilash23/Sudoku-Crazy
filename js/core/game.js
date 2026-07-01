// ── GAME LOGIC ───────────────────────────────────────────────────────────────
// Pure game state mutations — no direct DOM manipulation except through
// callbacks/imports to UI modules.
//
// All board geometry is read from BOARD_CONFIG at call-time so the game
// works correctly after a board-size switch.

import { state, DIFF_CONFIG } from './sudoku.js';
import { BOARD_CONFIG, setBoardSize } from './config.js';
import { generatePuzzle } from './generator.js';
import { saveBestTimes } from '../utils/storage.js';
import { formatTime } from '../utils/helpers.js';
import { toSymbol } from '../utils/symbols.js';

// Forward-declared UI callbacks (set by app.js to avoid circular deps)
let _ui = {};
export function registerUI(ui) { _ui = ui; }

// ── SCORE ────────────────────────────────────────────────────────────────────
export function scoreForCell() {
    const base = { easy: 10, medium: 20, hard: 35, expert: 50 }[state.difficulty];
    const timeBonus = Math.max(0, 300 - state.timerSec);
    return base + Math.floor(timeBonus / 10);
}

// ── AUTO-REMOVE NOTES ────────────────────────────────────────────────────────
export function clearRelatedNotes(idx, num) {
    const boardSize = BOARD_CONFIG.boardSize;
    const boxRows   = BOARD_CONFIG.boxRows;
    const boxCols   = BOARD_CONFIG.boxCols;
    const cellCount = BOARD_CONFIG.cellCount;

    const row  = Math.floor(idx / boardSize);
    const col  = idx % boardSize;
    const boxR = Math.floor(row / boxRows) * boxRows;
    const boxC = Math.floor(col / boxCols) * boxCols;

    for (let i = 0; i < cellCount; i++) {
        const ir = Math.floor(i / boardSize), ic = i % boardSize;
        if (
            ir === row || ic === col ||
            (Math.floor(ir / boxRows) * boxRows === boxR &&
             Math.floor(ic / boxCols) * boxCols === boxC)
        ) {
            state.notes[i].delete(num);
        }
    }
}

// ── TIMER ────────────────────────────────────────────────────────────────────
export function startTimer() {
    state.timerActive = true;
    state.timerRef = setInterval(() => {
        state.timerSec++;
        document.getElementById('timer-val').textContent = formatTime(state.timerSec);
    }, 1000);
}

export function stopTimer() {
    state.timerActive = false;
    clearInterval(state.timerRef);
}

// ── WIN CHECK ────────────────────────────────────────────────────────────────
export function checkWin() {
    const cellCount = BOARD_CONFIG.cellCount;
    const filled = state.board.filter((v, i) => v !== 0 && v === state.solution[i]).length;
    if (filled === cellCount) {
        state.gameActive = false;
        stopTimer();
        const t = formatTime(state.timerSec);
        if (!state.bestTimes[state.difficulty] || state.timerSec < state.bestTimes[state.difficulty]) {
            state.bestTimes[state.difficulty] = state.timerSec;
            saveBestTimes(state.bestTimes);
        }
        document.getElementById('win-time').textContent     = t;
        document.getElementById('win-score').textContent    = state.score;
        document.getElementById('win-mistakes').textContent = state.mistakes;
        document.getElementById('win-sub').textContent =
            `${DIFF_CONFIG()[state.difficulty].label} puzzle completed in ${t}!`;
        document.getElementById('board-wrapper').classList.add('pulse-win');
        setTimeout(() => {
            _ui.showModal('win-modal');
            _ui.launchConfetti();
        }, 700);
    }
}

// ── INPUT NUMBER ─────────────────────────────────────────────────────────────
export function inputNumber(num) {
    const idx = state.selected;
    if (idx < 0 || state.given[idx] || !state.gameActive) return;

    const boardSize = BOARD_CONFIG.boardSize;

    if (state.opts.notes) {
        const snap = new Set(state.notes[idx]);
        if (state.notes[idx].has(num)) state.notes[idx].delete(num);
        else { state.notes[idx].add(num); state.board[idx] = 0; }
        state.history.push({ idx, oldVal: state.board[idx], newVal: state.board[idx], oldNotes: snap, isNote: true });
        _ui.updateBoardDisplay();
        return;
    }

    const oldVal = state.board[idx];
    if (oldVal === num) return;

    state.history.push({ idx, oldVal, newVal: num, oldNotes: new Set(state.notes[idx]), isNote: false });

    state.board[idx] = num;
    state.notes[idx].clear();
    state.heatmap[idx]++;

    const correct = (state.solution[idx] === num);
    state.errors[idx] = !correct;

    if (!correct && state.opts.mistakes) {
        state.mistakes++;
        document.getElementById('mistakes-val').textContent = `${state.mistakes}/${state.maxMistakes}`;
        const cell = document.querySelector(`.cell[data-idx="${idx}"]`);
        cell.classList.add('shake');
        setTimeout(() => cell.classList.remove('shake'), 400);
        _ui.addHistoryLog(`R${Math.floor(idx / boardSize) + 1}C${idx % boardSize + 1}: ${toSymbol(num)} ✗`, 'err');
        _ui.showToast(`❌ Incorrect! ${state.maxMistakes - state.mistakes} chances left`, 'error');
        if (state.mistakes >= state.maxMistakes) {
            setTimeout(() => _ui.showModal('lose-modal'), 600);
        }
    } else if (correct) {
        state.errors[idx] = false;
        if (state.opts.autonotes) clearRelatedNotes(idx, num);
        state.score += scoreForCell();
        const cell = document.querySelector(`.cell[data-idx="${idx}"]`);
        cell.classList.add('pop-in');
        setTimeout(() => cell.classList.remove('pop-in'), 300);
        _ui.addHistoryLog(`R${Math.floor(idx / boardSize) + 1}C${idx % boardSize + 1}: ${toSymbol(num)} ✓`, '');
    }

    state.selectedNum = num;
    _ui.updateBoardDisplay();
    checkWin();
}

// ── CLEAR CELL ───────────────────────────────────────────────────────────────
export function clearCell() {
    const idx = state.selected;
    if (idx < 0 || state.given[idx] || !state.gameActive) return;
    if (state.board[idx] === 0 && state.notes[idx].size === 0) return;
    state.history.push({ idx, oldVal: state.board[idx], newVal: 0, oldNotes: new Set(state.notes[idx]), isNote: false });
    state.board[idx] = 0;
    state.errors[idx] = false;
    state.notes[idx].clear();
    _ui.updateBoardDisplay();
}

// ── UNDO ─────────────────────────────────────────────────────────────────────
export function undoMove() {
    if (!state.history.length) { _ui.showToast('Nothing to undo!', 'info'); return; }
    const h = state.history.pop();
    const boardSize = BOARD_CONFIG.boardSize;
    state.board[h.idx]  = h.oldVal;
    state.notes[h.idx]  = h.oldNotes;
    state.errors[h.idx] = false;
    state.selected      = h.idx;
    _ui.addHistoryLog(`Undo R${Math.floor(h.idx / boardSize) + 1}C${h.idx % boardSize + 1}`, 'undo');
    _ui.updateBoardDisplay();
    _ui.showToast('↩️ Move undone', 'info');
}

// ── HINT ─────────────────────────────────────────────────────────────────────
export function useHint() {
    if (state.hintsLeft <= 0) { _ui.showToast('No hints left! 💡', 'error'); return; }
    if (!state.gameActive) return;

    const cellCount = BOARD_CONFIG.cellCount;
    const boardSize = BOARD_CONFIG.boardSize;

    let idx = state.selected;
    if (idx < 0 || state.board[idx] !== 0 || state.given[idx]) {
        const empties = [];
        for (let i = 0; i < cellCount; i++) if (state.board[i] === 0) empties.push(i);
        if (!empties.length) return;
        idx = empties[Math.floor(Math.random() * empties.length)];
    }
    if (state.board[idx] !== 0) { _ui.showToast('Cell already filled!', 'info'); return; }

    state.hintsLeft--;
    state.hintsUsed++;
    document.getElementById('hint-count').textContent = `(${state.hintsLeft})`;

    state.board[idx]    = state.solution[idx];
    state.notes[idx].clear();
    state.errors[idx]   = false;
    state.given[idx]    = true;
    state.selected      = idx;

    const cell = document.querySelector(`.cell[data-idx="${idx}"]`);
    cell.classList.add('highlight-flash', 'given');
    setTimeout(() => cell.classList.remove('highlight-flash'), 350);

    _ui.updateBoardDisplay();
    _ui.addHistoryLog(
        `Hint R${Math.floor(idx / boardSize) + 1}C${idx % boardSize + 1}: ${toSymbol(state.solution[idx])} 💡`, ''
    );
    _ui.showToast(`💡 Hint used! ${state.hintsLeft} remaining`, 'info');
    checkWin();
}

// ── AUTO SOLVE ───────────────────────────────────────────────────────────────
export function solvePuzzle() {
    if (!state.gameActive) return;
    if (!confirm('Auto-solve will end your current game. Continue?')) return;
    const cellCount = BOARD_CONFIG.cellCount;
    for (let i = 0; i < cellCount; i++) {
        if (!state.given[i]) {
            state.board[i]  = state.solution[i];
            state.errors[i] = false;
            state.notes[i].clear();
        }
    }
    state.gameActive = false;
    stopTimer();
    _ui.updateBoardDisplay();
    _ui.showToast('🤖 Puzzle auto-solved!', 'info');
}

export function revealSolution() {
    _ui.closeModal('lose-modal');
    solvePuzzle();
}

// ── NEW GAME ─────────────────────────────────────────────────────────────────
export function newGame() {
    _ui.closeModal('win-modal');
    _ui.closeModal('lose-modal');
    document.getElementById('board-wrapper').classList.remove('pulse-win');

    const diffCfg = DIFF_CONFIG()[state.difficulty];

    setTimeout(() => {
        const cellCount = BOARD_CONFIG.cellCount;
        const { puzzle, solution } = generatePuzzle(diffCfg.clues);

        state.board       = [...puzzle];
        state.solution    = [...solution];
        state.given       = puzzle.map(v => v !== 0);
        state.notes       = Array.from({ length: cellCount }, () => new Set());
        state.errors      = Array(cellCount).fill(false);
        state.heatmap     = Array(cellCount).fill(0);
        state.selected    = -1;
        state.selectedNum = -1;
        state.mistakes    = 0;
        state.maxMistakes = BOARD_CONFIG.maxMistakes;
        state.score       = 0;
        state.hintsLeft   = BOARD_CONFIG.maxHints;
        state.hintsUsed   = 0;
        state.history     = [];
        state.historyLog  = [];
        state.gameActive  = true;

        document.getElementById('hint-count').textContent = `(${BOARD_CONFIG.maxHints})`;
        document.getElementById('history-list').innerHTML = '';

        stopTimer(); state.timerSec = 0;
        startTimer();

        _ui.renderBoard();
        _ui.renderNumPad();
        _ui.updateBestTimes();
    }, 50);
}

// ── DIFFICULTY ───────────────────────────────────────────────────────────────
export function setDifficulty(d) {
    state.difficulty = d;
    document.querySelectorAll('.diff-btn').forEach(b => {
        const active = b.dataset.diff === d;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    newGame();
}

// ── BOARD SIZE SWITCH ─────────────────────────────────────────────────────────
/**
 * Switch the active board size and start a fresh game.
 * This is the single entry point for all board-size changes.
 * Adding future sizes (16, 25) requires no changes here.
 * @param {number} size - one of 4, 9 (16, 25 when enabled)
 */
export function setBoardSizeAndNewGame(size) {
    setBoardSize(size);           // mutates BOARD_CONFIG in place
    state.boardSizeKey = size;

    // Sync the size-selector buttons
    document.querySelectorAll('.size-btn').forEach(b => {
        const active = +b.dataset.size === size;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    // Update board ARIA dimensions
    const bs = BOARD_CONFIG.boardSize;
    const boardEl = document.getElementById('sudoku-board');
    if (boardEl) {
        boardEl.setAttribute('aria-label', `Sudoku grid, ${bs} rows and ${bs} columns`);
        boardEl.setAttribute('aria-rowcount', bs);
        boardEl.setAttribute('aria-colcount', bs);
    }

    // Update the keyboard hint to reflect valid input range
    const kbNumHint = document.getElementById('kb-num-hint');
    if (kbNumHint) {
        kbNumHint.textContent = bs <= 9 ? `1-${bs}` : `1-9 · A-${toSymbol(bs)}`;
    }

    newGame();
}

// ── RESET ────────────────────────────────────────────────────────────────────
export function confirmReset() {
    if (!state.gameActive) return;
    if (!confirm('Reset all your progress?')) return;
    const cellCount = BOARD_CONFIG.cellCount;
    for (let i = 0; i < cellCount; i++) {
        if (!state.given[i]) {
            state.board[i] = 0; state.errors[i] = false; state.notes[i].clear();
        }
    }
    state.mistakes   = 0; state.score = 0;
    state.history    = [];
    state.historyLog = [];
    document.getElementById('history-list').innerHTML = '';
    _ui.updateBoardDisplay();
    _ui.showToast('🔄 Board reset', 'info');
}

// ── TOGGLE OPTION ────────────────────────────────────────────────────────────
export function toggleOpt(key) {
    state.opts[key] = !state.opts[key];
    const tog = document.getElementById('tog-' + key);
    tog.classList.toggle('on', state.opts[key]);
    tog.setAttribute('aria-checked', state.opts[key] ? 'true' : 'false');
    _ui.updateBoardDisplay();
    if (key === 'notes') _ui.showToast(state.opts.notes ? '📝 Notes mode ON' : '📝 Notes mode OFF', 'info');
}
