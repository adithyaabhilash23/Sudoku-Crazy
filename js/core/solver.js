// ── SOLVER ───────────────────────────────────────────────────────────────────
// Pure logic: no DOM manipulation.
// Reads board geometry from BOARD_CONFIG at call-time.

import { isValid } from './validator.js';
import { shuffle } from '../utils/helpers.js';
import { BOARD_CONFIG } from './config.js';

/**
 * Backtracking solver. Mutates board in-place.
 * @param {number[]} board
 * @param {boolean}  randomize - shuffle candidates for puzzle generation
 * @returns {boolean}
 */
export function solve(board, randomize = false) {
    const idx = board.indexOf(0);
    if (idx === -1) return true;
    // Build candidate list from current config at call-time
    const symbols = BOARD_CONFIG.symbols; // fresh array each call (getter)
    const nums    = randomize ? shuffle([...symbols]) : [...symbols];
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
 * @param {number}   limit
 * @returns {number}
 */
export function countSolutions(board, limit = 2) {
    const idx = board.indexOf(0);
    if (idx === -1) return 1;
    const boardSize = BOARD_CONFIG.boardSize;
    let count = 0;
    for (let n = 1; n <= boardSize; n++) {
        if (isValid(board, idx, n)) {
            board[idx] = n;
            count += countSolutions(board, limit);
            board[idx] = 0;
            if (count >= limit) return count;
        }
    }
    return count;
}
