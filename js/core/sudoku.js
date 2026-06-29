// ── SUDOKU CORE — shared constants & state ───────────────────────────────────
// No DOM manipulation.

import { BOARD_CONFIG, CELL_COUNT } from './config.js';
import { loadBestTimes } from '../utils/storage.js';

// ── RE-EXPORT DIFFICULTY CONFIG ───────────────────────────────────────────────
// Kept as DIFF_CONFIG so all existing imports remain unchanged.
export const DIFF_CONFIG = BOARD_CONFIG.difficulty;

// ── GAME STATE ───────────────────────────────────────────────────────────────
export const state = {
    board:      Array(CELL_COUNT).fill(0),          // current board values
    solution:   Array(CELL_COUNT).fill(0),           // correct solution
    given:      Array(CELL_COUNT).fill(false),       // clue cells
    notes:      Array.from({ length: CELL_COUNT }, () => new Set()),
    errors:     Array(CELL_COUNT).fill(false),
    selected:   -1,
    difficulty: 'medium',
    mistakes:   0, maxMistakes: BOARD_CONFIG.maxMistakes,
    score:      0,
    hintsLeft:  BOARD_CONFIG.maxHints, hintsUsed: 0,
    timerSec:   0, timerActive: false, timerRef: null,
    history:    [],      // [{idx, oldVal, newVal, oldNotes, isNote}]
    historyLog: [],      // display log
    heatmap:    Array(CELL_COUNT).fill(0),
    opts: { related: true, samenum: true, mistakes: true, notes: false, autonotes: true },
    bestTimes:  loadBestTimes(),
    gameActive: false,
    selectedNum: -1,
};
