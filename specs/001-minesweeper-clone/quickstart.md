# Quickstart: Minesweeper Clone

**Feature**: 001-minesweeper-clone
**Date**: 2026-03-22

## Prerequisites

- Node.js 20+ (LTS)
- npm 10+

## Setup

```bash
# Clone and enter project
cd minesweeper

# Install dependencies
npm install

# Start development (with hot reload)
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Package for distribution
npm run package

# Create distributable installer
npm run make
```

## Project Structure

```
minesweeper/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── main.ts           # App entry, window creation, menu
│   │   └── window.ts         # Window sizing per difficulty
│   ├── renderer/             # Electron renderer process
│   │   ├── index.html        # Main HTML
│   │   ├── styles.css        # Classic Minesweeper CSS
│   │   ├── app.ts            # UI initialization, event binding
│   │   ├── grid.ts           # Grid rendering and cell DOM updates
│   │   ├── controls.ts       # Counter display, timer display, smiley button
│   │   └── preload.ts        # Electron preload script (IPC bridge)
│   └── game/                 # Pure game logic (no DOM/Electron deps)
│       ├── board.ts          # Board creation, mine placement, adjacency
│       ├── actions.ts        # revealCell, toggleFlag, chord — pure functions
│       ├── state.ts          # GameState type, status transitions
│       └── constants.ts      # Difficulty presets, cell colors, dimensions
├── tests/
│   └── unit/
│       ├── board.test.ts     # Board generation, mine placement tests
│       ├── actions.test.ts   # Reveal, flag, chord logic tests
│       └── state.test.ts     # Game state transition tests
├── forge.config.ts           # Electron Forge configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies and scripts
└── specs/                    # Feature specifications (this directory)
```

## Key Architecture Decisions

1. **Game logic is pure**: All game functions in `src/game/` take state in, return new state out. No DOM, no Electron, no side effects. This makes testing straightforward.

2. **Renderer owns game state**: The renderer process holds the `GameState` object and calls pure game functions on user actions. After each action, it re-renders the affected cells.

3. **Main process is thin**: Only handles window creation/sizing and application menu. Communicates with renderer via IPC for menu actions (new game, difficulty change).

4. **No framework**: Plain DOM manipulation in the renderer. CSS handles the classic Minesweeper look with beveled borders and colored numbers.

## Development Workflow

1. `npm start` launches Electron with hot reload
2. Game logic changes in `src/game/` — run `npm test` to verify
3. UI changes in `src/renderer/` — visible immediately with hot reload
4. Window/menu changes in `src/main/` — requires restart (`rs` in terminal)
