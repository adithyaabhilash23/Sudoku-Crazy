# Sudoku Master

A fully-featured Sudoku game with a dark futuristic aesthetic.

## Project Structure

```
Super Sudoku/
│
├── index.html              ← Entry point (HTML only, no inline CSS/JS)
│
├── css/
│   ├── variables.css       ← :root CSS custom properties / design tokens
│   ├── style.css           ← Layout, board, buttons, panels, typography, responsive
│   └── animations.css      ← @keyframes, utility animation classes, toast/confetti
│
├── js/
│   ├── app.js              ← Bootstrap: imports, wires UI callbacks, kicks off game
│   │
│   ├── core/
│   │   ├── sudoku.js       ← Shared state object & DIFF_CONFIG constants
│   │   ├── validator.js    ← isValid() — pure Sudoku constraint check
│   │   ├── solver.js       ← solve() + countSolutions() — backtracking solver
│   │   ├── generator.js    ← generatePuzzle() — unique-solution puzzle generator
│   │   └── game.js         ← All game logic (inputNumber, undo, hint, timer, win…)
│   │
│   ├── ui/
│   │   ├── board.js        ← renderBoard, updateBoardDisplay, highlights, stats, heatmap
│   │   ├── controls.js     ← renderNumPad, updateNumPad, keyboard shortcuts, bg particles
│   │   ├── modal.js        ← showModal / closeModal helpers
│   │   └── toast.js        ← showToast, addHistoryLog, launchConfetti
│   │
│   └── utils/
│       ├── helpers.js      ← shuffle(), formatTime()
│       └── storage.js      ← loadBestTimes(), saveBestTimes() — localStorage wrappers
│
└── assets/                 ← (reserved for future images/icons)
```

## How to Run

Open `index.html` directly in a browser **or** serve it with any local static server
(required for ES Modules when opened as `file://` in some browsers):

```bash
# Python
python -m http.server 8080

# Node (npx)
npx serve .
```

Then navigate to `http://localhost:8080`.

## Features

- 4 difficulty levels: Easy · Medium · Hard · Expert
- Notes mode with auto-removal
- Undo history
- 3 hints per game
- Auto-solve
- Move history log
- Cell heatmap
- Best-time records (localStorage)
- Keyboard navigation (arrows, 1-9, Del, N, Z, H)
- Confetti win animation
- Animated particle background
