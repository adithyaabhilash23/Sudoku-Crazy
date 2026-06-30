// ── SOLVER ───────────────────────────────────────────────────────────────────
// Pure logic: no DOM manipulation.
// Reads board geometry from BOARD_CONFIG at call-time.
//
// For boards ≤ 9×9: simple left-to-right cell selection (fast, proven).
// For boards > 9×9: Minimum Remaining Values (MRV) heuristic reduces the
//   branching factor dramatically, making 16×16 feasible in the browser.

import { isValid } from './validator.js';
import { shuffle } from '../utils/helpers.js';
import { BOARD_CONFIG } from './config.js';

// ── MRV CELL SELECTION ────────────────────────────────────────────────────────
/**
 * Find the empty cell with the fewest valid candidates (MRV heuristic).
 * @param {number[]} board
 * @returns {number} index of best cell, -1 if all filled, -2 if a dead-end found
 */
function _findMRVCell(board) {
    const boardSize = BOARD_CONFIG.boardSize;
    let minCount = boardSize + 1;
    let minIdx   = -1;

    for (let i = 0; i < board.length; i++) {
        if (board[i] !== 0) continue;
        let count = 0;
        for (let n = 1; n <= boardSize; n++) {
            if (isValid(board, i, n)) {
                count++;
                if (count >= minCount) break; // already worse than best, prune
            }
        }
        if (count === 0) return -2; // naked dead-end — back-track immediately
        if (count < minCount) {
            minCount = count;
            minIdx   = i;
            if (minCount === 1) break; // naked single — can't do better
        }
    }
    return minIdx; // -1 when every cell is filled
}

// ── SOLVER ───────────────────────────────────────────────────────────────────
/**
 * Backtracking solver. Mutates board in-place.
 * @param {number[]} board
 * @param {boolean}  randomize - shuffle candidates for puzzle generation
 * @returns {boolean}
 */
export function solve(board, randomize = false) {
    const boardSize = BOARD_CONFIG.boardSize;
    const useMRV    = boardSize > 9;

    let idx;
    if (useMRV) {
        idx = _findMRVCell(board);
        if (idx === -2) return false; // immediate dead-end
    } else {
        idx = board.indexOf(0);
    }
    if (idx === -1) return true; // completely filled

    const symbols = BOARD_CONFIG.symbols; // fresh array via getter
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

// ── COUNT SOLUTIONS ───────────────────────────────────────────────────────────
/**
 * Count solutions up to `limit` (used for uniqueness checking).
 * @param {number[]} board
 * @param {number}   limit
 * @returns {number}
 */
export function countSolutions(board, limit = 2) {
    const boardSize = BOARD_CONFIG.boardSize;
    const useMRV    = boardSize > 9;

    let idx;
    if (useMRV) {
        idx = _findMRVCell(board);
        if (idx === -2) return 0;
    } else {
        idx = board.indexOf(0);
    }
    if (idx === -1) return 1;

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
