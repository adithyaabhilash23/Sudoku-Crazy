// ── APP BOOTSTRAP ────────────────────────────────────────────────────────────
// Imports, wires UI callbacks into game logic, registers all event listeners,
// then kicks off the first game.
//
// No global window.* assignments — all HTML buttons use data-action attributes
// and are handled via event delegation in initActionButtons().

import {
    registerUI, newGame, setDifficulty, confirmReset,
    undoMove, useHint, solvePuzzle, revealSolution, toggleOpt,
} from './core/game.js';
import { renderBoard, updateBoardDisplay, updateBestTimes, updateNumPad } from './ui/board.js';
import { renderNumPad, initKeyboard, initBg } from './ui/controls.js';
import { showModal, closeModal } from './ui/modal.js';
import { showToast, addHistoryLog, launchConfetti } from './ui/toast.js';

// ── WIRE UI CALLBACKS INTO GAME LOGIC ────────────────────────────────────────
// game.js needs UI functions but cannot import them directly (circular deps).
// We inject them here at bootstrap time.
registerUI({
    showModal,
    closeModal,
    showToast,
    addHistoryLog,
    launchConfetti,
    renderBoard,
    renderNumPad,
    updateBoardDisplay,
    updateBestTimes,
    updateNumPad,
});

// ── ACTION MAP ────────────────────────────────────────────────────────────────
// Maps data-action attribute values → handler functions.
// data-param on the element is forwarded as the first argument when present.
const ACTION_MAP = {
    'new-game':        () => newGame(),
    'undo':            () => undoMove(),
    'hint':            () => useHint(),
    'solve':           () => solvePuzzle(),
    'reset':           () => confirmReset(),
    'reveal-solution': () => revealSolution(),
    'set-difficulty':  (el) => setDifficulty(el.dataset.diff),
    'toggle-opt':      (el) => toggleOpt(el.dataset.opt),
    'close-modal':     (el) => closeModal(el.dataset.modal),
};

// ── EVENT DELEGATION ─────────────────────────────────────────────────────────
/**
 * Single click handler on <body>. Reads data-action from the clicked element
 * (or its closest ancestor with data-action) and dispatches to ACTION_MAP.
 */
function initActionButtons() {
    document.body.addEventListener('click', e => {
        const target = e.target.closest('[data-action]');
        if (!target) return;
        const handler = ACTION_MAP[target.dataset.action];
        if (handler) handler(target);
    });
}

// ── INIT ──────────────────────────────────────────────────────────────────────
initBg();
initKeyboard();
initActionButtons();
updateBestTimes();
newGame();
