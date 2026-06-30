// ── SYMBOL UTILITIES ─────────────────────────────────────────────────────────
// Converts between internal numeric values (1…boardSize) and display symbols.
//
// 1-9  → '1'-'9'
// 10   → 'A',  11 → 'B', …, 16 → 'G', …, 35 → 'Z'
//
// This module has NO dependencies so it can be imported anywhere safely.

/**
 * Convert an internal numeric value to its display symbol.
 * @param {number} n - integer ≥ 1
 * @returns {string}
 */
export function toSymbol(n) {
    if (n <= 9) return String(n);
    // 10 → 'A' (charCode 65), 11 → 'B', …
    return String.fromCharCode(55 + n); // 55 = 65 - 10
}

/**
 * Convert a display symbol back to its internal numeric value.
 * @param {string} s - '1'-'9' or 'A'-'Z'
 * @returns {number}
 */
export function fromSymbol(s) {
    const n = parseInt(s, 10);
    if (!isNaN(n) && s.length === 1) return n;           // '1'-'9'
    return s.toUpperCase().charCodeAt(0) - 55;           // 'A'→10, 'B'→11, …
}

/**
 * Check whether a keydown key string maps to a valid symbol for the current
 * board size and return its numeric value, or null if it does not.
 * @param {string} key - e.key from a KeyboardEvent
 * @param {number} boardSize
 * @returns {number|null}
 */
export function keyToNum(key, boardSize) {
    const n = parseInt(key, 10);
    if (!isNaN(n) && n >= 1 && n <= boardSize) return n;
    if (key.length === 1) {
        const code = key.toUpperCase().charCodeAt(0);
        // 'A'=65 … 'Z'=90  →  10 … 35
        if (code >= 65 && code <= 90) {
            const num = code - 55;
            if (num >= 10 && num <= boardSize) return num;
        }
    }
    return null;
}
