// ── GENERATOR ────────────────────────────────────────────────────────────────
// Pure logic: no DOM manipulation.

import { solve, countSolutions } from './solver.js';
import { shuffle } from '../utils/helpers.js';
import { CELL_COUNT } from './config.js';

/**
 * Generate a Sudoku puzzle with a unique solution.
 * @param {number} clueCount - number of given clues to keep
 * @returns {{ puzzle: number[], solution: number[] }}
 */
export function generatePuzzle(clueCount) {
    // 1. Create full solution
    const sol = Array(CELL_COUNT).fill(0);
    solve(sol, true);

    // 2. Remove cells ensuring unique solution
    const puzzle    = [...sol];
    const positions = shuffle([...Array(CELL_COUNT).keys()]);
    let removed = 0;

    for (const pos of positions) {
        if (removed >= CELL_COUNT - clueCount) break;
        const backup  = puzzle[pos];
        puzzle[pos]   = 0;
        const test    = [...puzzle];
        if (countSolutions(test, 2) !== 1) {
            puzzle[pos] = backup; // restore — would create ambiguity
        } else {
            removed++;
        }
    }
    return { puzzle, solution: sol };
}
