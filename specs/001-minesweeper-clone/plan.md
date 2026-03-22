# Implementation Plan: Minesweeper Clone

**Branch**: `001-minesweeper-clone` | **Date**: 2026-03-22 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-minesweeper-clone/spec.md`

## Summary

Build a classic Windows Minesweeper clone as an Electron desktop application. The game features a grid of cells with hidden mines, left-click to reveal, right-click to flag, flood-fill auto-reveal, chording, three difficulty levels (Beginner/Intermediate/Expert), a mine counter, timer, and smiley-face restart button. Game logic is implemented as pure TypeScript functions separate from the Electron renderer, enabling comprehensive unit testing. The renderer uses plain HTML/CSS/DOM manipulation to recreate the classic Minesweeper aesthetic with beveled borders and seven-segment displays.

## Technical Context

**Language/Version**: TypeScript 5.x (Node.js 20+ LTS)
**Primary Dependencies**: Electron 33+, Electron Forge (build tooling)
**Storage**: N/A (no persistence — game state is in-memory only)
**Testing**: Vitest (unit tests for game logic)
**Target Platform**: Desktop (macOS, Windows, Linux via Electron)
**Project Type**: Desktop application
**Performance Goals**: <100ms input response, <1s flood fill on Expert grid (480 cells)
**Constraints**: Fixed window size per difficulty, non-resizable, single window
**Scale/Scope**: Single-player, single-window app, ~15 source files

## Constitution Check

*No constitution file found. Gate passes by default.*

## Project Structure

### Documentation (this feature)

```text
specs/001-minesweeper-clone/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: Technology decisions
├── data-model.md        # Phase 1: Entity models
├── quickstart.md        # Phase 1: Dev setup guide
├── contracts/           # Phase 1: IPC contract
│   └── ipc-contract.md  # Main ↔ Renderer IPC channels
├── checklists/          # Quality validation
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── main/                 # Electron main process
│   ├── main.ts           # App entry, window creation, menu setup
│   └── window.ts         # Window sizing calculations per difficulty
├── renderer/             # Electron renderer process
│   ├── index.html        # Main HTML structure
│   ├── styles.css        # Classic Minesweeper CSS (beveled cells, counters)
│   ├── app.ts            # UI initialization, event binding, state management
│   ├── grid.ts           # Grid rendering and cell DOM updates
│   ├── controls.ts       # Mine counter, timer display, smiley button
│   └── preload.ts        # Electron preload script (IPC bridge)
└── game/                 # Pure game logic (no DOM/Electron dependencies)
    ├── board.ts          # Board creation, mine placement, adjacency calculation
    ├── actions.ts        # revealCell, toggleFlag, chord — pure functions
    ├── state.ts          # GameState type definitions, status transitions
    └── constants.ts      # Difficulty presets, cell colors, window dimensions

tests/
└── unit/
    ├── board.test.ts     # Board generation, mine placement, adjacency tests
    ├── actions.test.ts   # Reveal, flag, chord, flood-fill logic tests
    └── state.test.ts     # Game state transition tests
```

**Structure Decision**: Single Electron project with three logical layers: main process (window/menu), renderer (UI/DOM), and game engine (pure logic). The game engine has zero dependencies on DOM or Electron, enabling fast unit tests. The renderer imports game functions and manages state locally — no framework needed for a single-screen game UI.
