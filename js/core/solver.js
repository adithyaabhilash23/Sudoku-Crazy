// ── SOLVER ───────────────────────────────────────────────────────────────────
// Pure logic: no DOM manipulation.

import { isValid } from './validator.js';
import { shuffle } from '../utils/helpers.js';

/**
 * Backtracking solver. Mutates board in-place.
 * @param {number[]} board
 * @param {boolean} randomize - shuffle candidates for puzzle generation
 * @returns {boolean}
 */
export function solve(board, randomize = false) {
    const idx = board.indexOf(0);
    if (idx === -1) return true;
    const nums = randomize ? shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]) : [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (const n of nums) {
        if (isValid(board, idx, n)) {
            board[idx] = n;
            if (solve(board, randomize)) return true;
            board[idx] = 0;
        }
    }
    return false;
}

/**
 * Count the number of solutions (up to `limit`) for uniqueness checking.
 * @param {number[]} board
 * @param {number} limit
 * @returns {number}
 */
export function countSolutions(board, limit = 2) {
    const idx = board.indexOf(0);
    if (idx === -1) return 1;
    let count = 0;
    for (let n = 1; n <= 9; n++) {
        if (isValid(board, idx, n)) {
            board[idx] = n;
            count += countSolutions(board, limit);
            board[idx] = 0;
            if (count >= limit) return count;
        }
    }
    return count;
}
