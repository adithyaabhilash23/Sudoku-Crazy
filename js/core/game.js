// ── GAME LOGIC ───────────────────────────────────────────────────────────────
// Pure game state mutations — no direct DOM manipulation except through
// callbacks/imports to UI modules.

import { state, DIFF_CONFIG } from './sudoku.js';
import { generatePuzzle } from './generator.js';
import { solve } from './solver.js';
import { saveBestTimes } from '../utils/storage.js';
import { formatTime } from '../utils/helpers.js';

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
    const row = Math.floor(idx / 9), col = idx % 9;
    const boxR = Math.floor(row / 3) * 3, boxC = Math.floor(col / 3) * 3;
    for (let i = 0; i < 81; i++) {
        const ir = Math.floor(i / 9), ic = i % 9;
        if (ir === row || ic === col || (Math.floor(ir / 3) * 3 === boxR && Math.floor(ic / 3) * 3 === boxC)) {
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
    const filled = state.board.filter((v, i) => v !== 0 && v === state.solution[i]).length;
    if (filled === 81) {
        state.gameActive = false;
        stopTimer();
        const t = formatTime(state.timerSec);
        if (!state.bestTimes[state.difficulty] || state.timerSec < state.bestTimes[state.difficulty]) {
            state.bestTimes[state.difficulty] = state.timerSec;
            saveBestTimes(state.bestTimes);
        }
        document.getElementById('win-time').textContent = t;
        document.getElementById('win-score').textContent = state.score;
        document.getElementById('win-mistakes').textContent = state.mistakes;
        document.getElementById('win-sub').textContent =
            `${DIFF_CONFIG[state.difficulty].label} puzzle completed in ${t}!`;
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
        _ui.addHistoryLog(`R${Math.floor(idx / 9) + 1}C${idx % 9 + 1}: ${num} ✗`, 'err');
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
        _ui.addHistoryLog(`R${Math.floor(idx / 9) + 1}C${idx % 9 + 1}: ${num} ✓`, '');
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
    state.board[h.idx] = h.oldVal;
    state.notes[h.idx] = h.oldNotes;
    state.errors[h.idx] = false;
    state.selected = h.idx;
    _ui.addHistoryLog(`Undo R${Math.floor(h.idx / 9) + 1}C${h.idx % 9 + 1}`, 'undo');
    _ui.updateBoardDisplay();
    _ui.showToast('↩️ Move undone', 'info');
}

// ── HINT ─────────────────────────────────────────────────────────────────────
export function useHint() {
    if (state.hintsLeft <= 0) { _ui.showToast('No hints left! 💡', 'error'); return; }
    if (!state.gameActive) return;

    let idx = state.selected;
    if (idx < 0 || state.board[idx] !== 0 || state.given[idx]) {
        const empties = [];
        for (let i = 0; i < 81; i++) if (state.board[i] === 0) empties.push(i);
        if (!empties.length) return;
        idx = empties[Math.floor(Math.random() * empties.length)];
    }
    if (state.board[idx] !== 0) { _ui.showToast('Cell already filled!', 'info'); return; }

    state.hintsLeft--;
    state.hintsUsed++;
    document.getElementById('hint-count').textContent = `(${state.hintsLeft})`;

    state.board[idx] = state.solution[idx];
    state.notes[idx].clear();
    state.errors[idx] = false;
    state.given[idx] = true;
    state.selected = idx;

    const cell = document.querySelector(`.cell[data-idx="${idx}"]`);
    cell.classList.add('highlight-flash', 'given');
    setTimeout(() => cell.classList.remove('highlight-flash'), 350);

    _ui.updateBoardDisplay();
    _ui.addHistoryLog(`Hint R${Math.floor(idx / 9) + 1}C${idx % 9 + 1}: ${state.solution[idx]} 💡`, '');
    _ui.showToast(`💡 Hint used! ${state.hintsLeft} remaining`, 'info');
    checkWin();
}

// ── AUTO SOLVE ───────────────────────────────────────────────────────────────
export function solvePuzzle() {
    if (!state.gameActive) return;
    if (!confirm('Auto-solve will end your current game. Continue?')) return;
    for (let i = 0; i < 81; i++) {
        if (!state.given[i]) {
            state.board[i] = state.solution[i];
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

    const cfg = DIFF_CONFIG[state.difficulty];
    _ui.showToast(`Generating ${cfg.label} puzzle...`, 'info');

    setTimeout(() => {
        const { puzzle, solution } = generatePuzzle(cfg.clues);
        state.board = [...puzzle];
        state.solution = [...solution];
        state.given = puzzle.map(v => v !== 0);
        state.notes = Array.from({ length: 81 }, () => new Set());
        state.errors = Array(81).fill(false);
        state.heatmap = Array(81).fill(0);
        state.selected = -1;
        state.selectedNum = -1;
        state.mistakes = 0;
        state.score = 0;
        state.hintsLeft = 3;
        state.hintsUsed = 0;
        state.history = [];
        state.historyLog = [];
        state.gameActive = true;

        document.getElementById('hint-count').textContent = '(3)';
        document.getElementById('history-list').innerHTML = '';

        stopTimer(); state.timerSec = 0;
        startTimer();

        _ui.renderBoard();
        _ui.renderNumPad();
        _ui.updateBestTimes();
        _ui.showToast(`🎮 New ${cfg.label} game started!`, 'success');
    }, 50);
}

// ── DIFFICULTY ───────────────────────────────────────────────────────────────
export function setDifficulty(d) {
    state.difficulty = d;
    document.querySelectorAll('.diff-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.diff === d);
    });
    newGame();
}

// ── RESET ────────────────────────────────────────────────────────────────────
export function confirmReset() {
    if (!state.gameActive) return;
    if (!confirm('Reset all your progress?')) return;
    for (let i = 0; i < 81; i++) {
        if (!state.given[i]) {
            state.board[i] = 0; state.errors[i] = false; state.notes[i].clear();
        }
    }
    state.mistakes = 0; state.score = 0; state.history = [];
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
    _ui.updateBoardDisplay();
    if (key === 'notes') _ui.showToast(state.opts.notes ? '📝 Notes mode ON' : '📝 Notes mode OFF', 'info');
}
