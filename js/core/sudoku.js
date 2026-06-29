// ── SUDOKU CORE — shared constants & state ───────────────────────────────────
// No DOM manipulation.

import { loadBestTimes } from '../utils/storage.js';

// ── DIFFICULTY CONFIG ────────────────────────────────────────────────────────
export const DIFF_CONFIG = {
    easy:   { clues: 45, label: 'Easy',   color: '#00d68f' },
    medium: { clues: 35, label: 'Medium', color: '#4fc3f7' },
    hard:   { clues: 28, label: 'Hard',   color: '#ffb74d' },
    expert: { clues: 22, label: 'Expert', color: '#e94560' },
};

// ── GAME STATE ───────────────────────────────────────────────────────────────
export const state = {
    board: Array(81).fill(0),          // current board values
    solution: Array(81).fill(0),       // correct solution
    given: Array(81).fill(false),      // clue cells
    notes: Array.from({ length: 81 }, () => new Set()),
    errors: Array(81).fill(false),
    selected: -1,
    difficulty: 'medium',
    mistakes: 0, maxMistakes: 3,
    score: 0,
    hintsLeft: 3, hintsUsed: 0,
    timerSec: 0, timerActive: false, timerRef: null,
    history: [],      // [{idx, oldVal, newVal, oldNotes, isNote}]
    historyLog: [],   // display log
    heatmap: Array(81).fill(0),
    opts: { related: true, samenum: true, mistakes: true, notes: false, autonotes: true },
    bestTimes: loadBestTimes(),
    gameActive: false,
    selectedNum: -1,
};
