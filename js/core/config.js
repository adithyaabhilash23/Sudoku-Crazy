// ── BOARD CONFIGURATION ───────────────────────────────────────────────────────
// Single source of truth for all board-size constants.
// To support a future board size (16×16, 25×25), update BOARD_CONFIG and
// re-derive the constants. All other modules read from here — never hardcode.

/**
 * Active board configuration.
 * All numeric constants that represent board geometry MUST derive from this.
 *
 * @typedef {Object} BoardConfig
 * @property {number}   boardSize  - Number of rows/cols (e.g. 9)
 * @property {number}   boxRows    - Rows per sub-box   (e.g. 3)
 * @property {number}   boxCols    - Cols per sub-box   (e.g. 3)
 * @property {number}   cellCount  - Total cells        (boardSize²)
 * @property {number[]} symbols    - Valid cell values   (1…boardSize)
 * @property {number}   maxHints   - Hints per game
 * @property {number}   maxMistakes - Max allowed mistakes
 * @property {Object}   difficulty  - Per-difficulty clue counts
 */
export const BOARD_CONFIG = Object.freeze({
    boardSize:    9,
    boxRows:      3,
    boxCols:      3,
    get cellCount()  { return this.boardSize * this.boardSize; },
    get symbols()    { return Array.from({ length: this.boardSize }, (_, i) => i + 1); },
    maxHints:     3,
    maxMistakes:  3,
    difficulty: Object.freeze({
        easy:   { clues: 45, label: 'Easy',   color: '#00d68f' },
        medium: { clues: 35, label: 'Medium', color: '#4fc3f7' },
        hard:   { clues: 28, label: 'Hard',   color: '#ffb74d' },
        expert: { clues: 22, label: 'Expert', color: '#e94560' },
    }),
});

// ── DERIVED CONSTANTS ─────────────────────────────────────────────────────────
// Consumed throughout the codebase. Derived once so they are fast references.

/** Number of rows/columns on the board (9 for standard Sudoku). */
export const BOARD_SIZE = BOARD_CONFIG.boardSize;

/** Number of rows inside one sub-box (3 for standard Sudoku). */
export const BOX_ROWS   = BOARD_CONFIG.boxRows;

/** Number of columns inside one sub-box (3 for standard Sudoku). */
export const BOX_COLS   = BOARD_CONFIG.boxCols;

/** Total number of cells on the board (81 for standard Sudoku). */
export const CELL_COUNT = BOARD_CONFIG.cellCount;

/** Array of valid numeric symbols [1…9] for standard Sudoku. */
export const SYMBOLS    = BOARD_CONFIG.symbols;
