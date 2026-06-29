// ── LOCAL STORAGE ────────────────────────────────────────────────────────────

const BEST_KEY = 'sudoku_best';

/**
 * Load best times from localStorage.
 * @returns {Object}
 */
export function loadBestTimes() {
    return JSON.parse(localStorage.getItem(BEST_KEY) || '{}');
}

/**
 * Save best times object to localStorage.
 * @param {Object} bestTimes
 */
export function saveBestTimes(bestTimes) {
    localStorage.setItem(BEST_KEY, JSON.stringify(bestTimes));
}
