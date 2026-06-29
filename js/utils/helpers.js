// ── HELPERS ──────────────────────────────────────────────────────────────────

/**
 * Fisher-Yates in-place shuffle.
 * @param {any[]} arr
 * @returns {any[]}
 */
export function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * Format seconds into m:ss string.
 * @param {number} s
 * @returns {string}
 */
export function formatTime(s) {
    const m = Math.floor(s / 60), sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
}
