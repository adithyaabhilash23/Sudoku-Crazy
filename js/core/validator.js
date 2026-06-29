// ── VALIDATOR ────────────────────────────────────────────────────────────────
// Pure logic: no DOM manipulation.

/**
 * Check if placing `num` at position `idx` is valid on the given board array.
 * @param {number[]} board
 * @param {number} idx
 * @param {number} num
 * @returns {boolean}
 */
export function isValid(board, idx, num) {
    const row = Math.floor(idx / 9), col = idx % 9;
    const boxR = Math.floor(row / 3) * 3, boxC = Math.floor(col / 3) * 3;
    for (let i = 0; i < 9; i++) {
        if (board[row * 9 + i] === num) return false;
        if (board[i * 9 + col] === num) return false;
        if (board[(boxR + Math.floor(i / 3)) * 9 + (boxC + i % 3)] === num) return false;
    }
    return true;
}
