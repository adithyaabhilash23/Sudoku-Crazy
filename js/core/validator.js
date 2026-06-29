// ── VALIDATOR ────────────────────────────────────────────────────────────────
// Pure logic: no DOM manipulation.

import { BOARD_SIZE, BOX_ROWS, BOX_COLS } from './config.js';

/**
 * Check if placing `num` at position `idx` is valid on the given board array.
 * @param {number[]} board
 * @param {number}   idx
 * @param {number}   num
 * @returns {boolean}
 */
export function isValid(board, idx, num) {
    const row  = Math.floor(idx / BOARD_SIZE);
    const col  = idx % BOARD_SIZE;
    const boxR = Math.floor(row / BOX_ROWS) * BOX_ROWS;
    const boxC = Math.floor(col / BOX_COLS) * BOX_COLS;

    for (let i = 0; i < BOARD_SIZE; i++) {
        // Row check
        if (board[row * BOARD_SIZE + i] === num) return false;
        // Col check
        if (board[i * BOARD_SIZE + col] === num) return false;
        // Box check
        if (board[(boxR + Math.floor(i / BOX_COLS)) * BOARD_SIZE + (boxC + i % BOX_COLS)] === num) return false;
    }
    return true;
}
