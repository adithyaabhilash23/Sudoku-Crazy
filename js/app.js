// ── APP BOOTSTRAP ────────────────────────────────────────────────────────────
// Imports, wires UI callbacks into game logic, then kicks off the first game.

import { registerUI, newGame, setDifficulty, confirmReset, undoMove, useHint, solvePuzzle, revealSolution, toggleOpt } from './core/game.js';
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

// ── EXPOSE TO INLINE HTML ONCLICK HANDLERS ────────────────────────────────────
// index.html uses onclick="newGame()" etc. Since we're using ES Modules
// (which are scoped), we must attach these to window explicitly.
window.newGame = newGame;
window.setDifficulty = setDifficulty;
window.confirmReset = confirmReset;
window.undoMove = undoMove;
window.useHint = useHint;
window.solvePuzzle = solvePuzzle;
window.revealSolution = revealSolution;
window.closeModal = closeModal;
window.toggleOpt = toggleOpt;

// ── INIT ──────────────────────────────────────────────────────────────────────
initBg();
initKeyboard();
updateBestTimes();
newGame();
