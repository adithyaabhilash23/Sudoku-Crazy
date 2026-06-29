// ── LOCAL STORAGE ────────────────────────────────────────────────────────────
// All reads use safeParseJSON() so corrupted data can never crash the app.

const BEST_KEY = 'sudoku_best';

/**
 * Safely parse a JSON string.
 * If parsing fails, logs a warning, removes the corrupted item, and returns
 * the supplied fallback so the application continues normally.
 *
 * @template T
 * @param {string|null} raw      - Raw string from localStorage (may be null).
 * @param {T}           fallback - Value to return on parse failure.
 * @param {string}      [key]    - Storage key, used only for the warning message.
 * @returns {T}
 */
function safeParseJSON(raw, fallback, key = '') {
    if (raw === null) return fallback;
    try {
        return JSON.parse(raw);
    } catch (err) {
        console.warn(
            `[Storage] Failed to parse localStorage key "${key}". ` +
            `Resetting to default. (${err.message})`
        );
        if (key) localStorage.removeItem(key);
        return fallback;
    }
}

/**
 * Load best times from localStorage.
 * Returns an empty object if the key is absent or the stored JSON is corrupt.
 * @returns {Object}
 */
export function loadBestTimes() {
    return safeParseJSON(localStorage.getItem(BEST_KEY), {}, BEST_KEY);
}

/**
 * Save best times object to localStorage.
 * @param {Object} bestTimes
 */
export function saveBestTimes(bestTimes) {
    localStorage.setItem(BEST_KEY, JSON.stringify(bestTimes));
}
