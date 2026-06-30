// ── VALIDATOR ────────────────────────────────────────────────────────────────
// Pure logic: no DOM manipulation.
// Reads board geometry from BOARD_CONFIG at call-time so it works for any size.

import { BOARD_CONFIG } from './config.js';

/**
 * Check if placing `num` at position `idx` is valid on the given board array.
 * @param {number[]} board
 * @param {number}   idx
 * @param {number}   num
 * @returns {boolean}
 */
export function isValid(board, idx, num) {
    const boardSize = BOARD_CONFIG.boardSize;
    const boxRows   = BOARD_CONFIG.boxRows;
    const boxCols   = BOARD_CONFIG.boxCols;

    const row  = Math.floor(idx / boardSize);
    const col  = idx % boardSize;
    const boxR = Math.floor(row / boxRows) * boxRows;
    const boxC = Math.floor(col / boxCols) * boxCols;

    for (let i = 0; i < boardSize; i++) {
        if (board[row * boardSize + i] === num) return false;
        if (board[i * boardSize + col] === num) return false;
        if (board[(boxR + Math.floor(i / boxCols)) * boardSize + (boxC + i % boxCols)] === num) return false;
    }
    return true;
}
