// ── GENERATOR ────────────────────────────────────────────────────────────────
// Pure logic: no DOM manipulation.
// Reads board geometry from BOARD_CONFIG at call-time.

import { solve, countSolutions } from './solver.js';
import { shuffle } from '../utils/helpers.js';
import { BOARD_CONFIG } from './config.js';

/**
 * Generate a Sudoku puzzle with a unique solution.
 * Works for any board size defined in BOARD_CONFIG.
 * @param {number} clueCount - number of given clues to keep
 * @returns {{ puzzle: number[], solution: number[] }}
 */
export function generatePuzzle(clueCount) {
    const cellCount = BOARD_CONFIG.cellCount; // read at call-time via getter

    // 1. Create a full valid solution
    const sol = Array(cellCount).fill(0);
    solve(sol, true);

    // 2. Remove cells while preserving a unique solution
    const puzzle    = [...sol];
    const positions = shuffle([...Array(cellCount).keys()]);
    let removed = 0;

    for (const pos of positions) {
        if (removed >= cellCount - clueCount) break;
        const backup = puzzle[pos];
        puzzle[pos]  = 0;
        const test   = [...puzzle];
        if (countSolutions(test, 2) !== 1) {
            puzzle[pos] = backup; // restore — ambiguous without this cell
        } else {
            removed++;
        }
    }
    return { puzzle, solution: sol };
}
