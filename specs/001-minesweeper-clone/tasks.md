# Tasks: Minesweeper Clone

**Input**: Design documents from `/specs/001-minesweeper-clone/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/ipc-contract.md, quickstart.md

**Tests**: Included — plan.md specifies Vitest and defines test files in the project structure.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize Electron Forge project with TypeScript, configure tooling, create directory structure

- [X] T001 Initialize Electron Forge project with TypeScript template and configure package.json scripts (start, test, test:watch, package, make) in package.json
- [X] T002 Configure TypeScript (tsconfig.json) and add Vitest as dev dependency with vitest.config.ts
- [X] T003 [P] Create source directory structure: src/main/, src/renderer/, src/game/, tests/unit/
- [X] T004 [P] Configure Electron Forge build settings in forge.config.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types, constants, Electron shell, and base HTML/CSS that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Define CellState enum (Hidden, Revealed, Flagged), GameStatus enum (Idle, Playing, Won, Lost), Cell interface, DifficultyPreset interface, and GameState interface in src/game/state.ts
- [X] T006 [P] Define difficulty presets (Beginner 9×9/10, Intermediate 16×16/40, Expert 30×16/99), cell number colors, and window dimension constants in src/game/constants.ts
- [X] T007 [P] Create Electron preload script exposing IPC bridge (game:new-game, game:set-difficulty, window:resize channels) via contextBridge in src/renderer/preload.ts
- [X] T008 Create base Electron main process with BrowserWindow creation (non-resizable, Beginner size default) and preload script loading in src/main/main.ts
- [X] T009 [P] Create base HTML structure with toolbar area (mine counter, smiley button, timer), grid container, and link to styles in src/renderer/index.html
- [X] T010 [P] Create CSS with classic Minesweeper aesthetic: beveled cell borders (outset/inset), seven-segment LED counter styles, gray background, cell state classes (hidden, revealed, flagged, mine), number colors (blue=1, green=2, red=3, dark-blue=4, maroon=5, teal=6, black=7, gray=8) in src/renderer/styles.css

**Checkpoint**: Foundation ready — Electron app launches with empty shell, all types defined, user story implementation can begin

---

## Phase 3: User Story 1 — Reveal Cells and Avoid Mines (Priority: P1) 🎯 MVP

**Goal**: Player can click cells to reveal them. Numbers show adjacent mine counts. Blank cells trigger flood-fill auto-reveal. Clicking a mine ends the game. First click is always safe.

**Independent Test**: Start a game, click cells to reveal, verify numbers match adjacent mine counts, verify flood fill on blank cells, verify mine click ends game.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T011 [P] [US1] Write board generation tests: createBoard returns correct dimensions, placeMines places exact mine count, first-click exclusion zone is mine-free, adjacency counts are correct in tests/unit/board.test.ts
- [X] T012 [P] [US1] Write revealCell tests: reveal numbered cell, reveal zero cell triggers flood fill, reveal mine transitions to Lost, reveal on Idle triggers mine placement and transitions to Playing in tests/unit/actions.test.ts
- [X] T013 [P] [US1] Write game state transition tests: Idle→Playing on first reveal, Playing→Lost on mine reveal, no actions allowed in Won/Lost states in tests/unit/state.test.ts

### Implementation for User Story 1

- [X] T014 [US1] Implement createBoard (empty grid), placeMines (random placement with first-click exclusion zone), and calculateAdjacency (neighbor mine counts) in src/game/board.ts
- [X] T015 [US1] Implement revealCell action: handle first click (deferred mine placement), reveal single cell, flood-fill for zero-adjacent cells, game-over on mine hit — all as pure functions returning new GameState in src/game/actions.ts
- [X] T016 [US1] Implement grid rendering: create cell DOM elements from board dimensions, update cell visual state (hidden/revealed/number), handle re-render after state changes in src/renderer/grid.ts
- [X] T017 [US1] Implement UI initialization: create initial GameState (Beginner, Idle), bind left-click events on grid cells, call revealCell on click, re-render grid after each action in src/renderer/app.ts

**Checkpoint**: Core Minesweeper gameplay works — player can reveal cells, see numbers, trigger flood fill, and lose by clicking mines. First click is always safe.

---

## Phase 4: User Story 2 — Flag Suspected Mines (Priority: P2)

**Goal**: Player can right-click to toggle flags on hidden cells. Flagged cells are protected from accidental reveal. Mine counter shows remaining unflagged mines.

**Independent Test**: Right-click cells to toggle flags, verify mine counter updates, verify flagged cells can't be revealed by left-click.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T018 [P] [US2] Write toggleFlag tests: flag hidden cell increments flagCount, unflag decrements, flag on revealed cell does nothing, flag count can exceed mine count (negative counter) in tests/unit/actions.test.ts

### Implementation for User Story 2

- [X] T019 [US2] Implement toggleFlag action: toggle CellState between Hidden and Flagged, update flagCount, prevent flagging revealed cells — pure function returning new GameState in src/game/actions.ts
- [X] T020 [US2] Implement mine counter display: render (mineCount - flagCount) in seven-segment LED style in src/renderer/controls.ts
- [X] T021 [US2] Add right-click (contextmenu) event handling on grid cells, call toggleFlag, update flag rendering and mine counter display, prevent left-click reveal on flagged cells in src/renderer/app.ts

**Checkpoint**: Flagging works — player can flag/unflag cells, mine counter tracks remaining mines, flagged cells are protected.

---

## Phase 5: User Story 3 — Win the Game (Priority: P2)

**Goal**: Game detects when all non-mine cells are revealed and transitions to Won state. Board locks, remaining mines are auto-flagged, victory indicator shown.

**Independent Test**: Reveal all non-mine cells, verify game transitions to Won, verify board is locked, verify remaining mines are flagged.

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T022 [P] [US3] Write win detection tests: revealing last non-mine cell transitions to Won, Won state locks all actions, verify revealedCount tracking in tests/unit/state.test.ts

### Implementation for User Story 3

- [X] T023 [US3] Add win condition check to revealCell: after each reveal, check if revealedCount equals (rows × cols − mineCount), transition to Won if true in src/game/actions.ts
- [X] T024 [US3] Implement game-end rendering: on Lost show all mines (highlight clicked mine, show incorrectly flagged cells with X), on Won auto-flag remaining mines, lock board (disable click handlers) in src/renderer/grid.ts
- [X] T025 [US3] Update app.ts to check GameStatus before processing clicks (no actions in Won/Lost), trigger end-game rendering on status change in src/renderer/app.ts

**Checkpoint**: Complete game loop — player can win by revealing all safe cells or lose by hitting a mine. Board locks appropriately.

---

## Phase 6: User Story 4 — Select Difficulty Level (Priority: P2)

**Goal**: Player can select Beginner/Intermediate/Expert from the application menu. Window resizes to fit the selected grid. New game starts automatically on difficulty change.

**Independent Test**: Select each difficulty from menu, verify grid dimensions and mine counts, verify window resizes correctly.

### Implementation for User Story 4

- [X] T026 [P] [US4] Implement window sizing calculations (pixel width/height per difficulty based on cell size, toolbar height, border padding) in src/main/window.ts
- [X] T027 [US4] Add Game application menu with New Game (F2), difficulty radio items (Beginner/Intermediate/Expert), separator, and Exit — send game:new-game and game:set-difficulty IPC messages in src/main/main.ts
- [X] T028 [US4] Handle game:set-difficulty IPC in renderer: update difficulty preset, reset GameState to Idle with new dimensions, rebuild grid, send window:resize IPC back to main in src/renderer/app.ts
- [X] T029 [US4] Handle window:resize IPC in main process: resize BrowserWindow to requested dimensions in src/main/main.ts

**Checkpoint**: All three difficulty levels work — menu selection changes grid size, window resizes, new game starts with correct mine count.

---

## Phase 7: User Story 5 — Timer and Game Controls (Priority: P3)

**Goal**: Timer counts elapsed seconds from first click (0–999). Smiley face button shows game state (normal, surprised, dead, sunglasses) and can be clicked to restart.

**Independent Test**: Click a cell and watch timer increment. Click smiley to restart. Verify timer stops on win/loss. Verify timer caps at 999.

### Implementation for User Story 5

- [X] T030 [US5] Implement timer display: render elapsed seconds (0–999) in seven-segment LED style, provide update and reset methods in src/renderer/controls.ts
- [X] T031 [US5] Implement smiley face button: render four states (smile=Idle/Playing, surprised=mousedown, dead=Lost, sunglasses=Won), bind click to restart game in src/renderer/controls.ts
- [X] T032 [US5] Add timer logic in app: start setInterval on first click (Idle→Playing), stop on Won/Lost, cap at 999, reset on new game. Wire smiley click to reset GameState and re-render. Handle game:new-game IPC for menu restart in src/renderer/app.ts

**Checkpoint**: Timer and controls work — timer counts from first click, smiley reflects game state, click smiley to restart.

---

## Phase 8: User Story 6 — Chord / Reveal Neighbors of Satisfied Numbers (Priority: P3)

**Goal**: Click a revealed number cell whose adjacent flag count matches its number to auto-reveal all unflagged neighbors. Incorrect flags may cause a loss.

**Independent Test**: Flag correct number of cells around a number, click the number, verify unflagged neighbors are revealed. Test with incorrect flags to verify loss.

### Tests for User Story 6

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T033 [P] [US6] Write chord tests: chord with correct flag count reveals unflagged neighbors, chord with insufficient flags does nothing, chord with misplaced flag triggers loss in tests/unit/actions.test.ts

### Implementation for User Story 6

- [X] T034 [US6] Implement chord action: verify cell is revealed with number, count adjacent flags, if count matches cell number then reveal all unflagged hidden neighbors (may trigger flood fill or mine hit) — pure function returning new GameState in src/game/actions.ts
- [X] T035 [US6] Add chord click handling: detect click on revealed numbered cell, call chord action, re-render affected cells, check for win/loss in src/renderer/app.ts

**Checkpoint**: Chording works — experienced players can speed up gameplay by chording satisfied number cells.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Visual refinement, performance validation, and final integration testing

- [X] T036 [P] Refine CSS for classic Minesweeper visual fidelity: smiley face sprites (CSS-only), cell pressed state, toolbar beveled frame, counter digit alignment in src/renderer/styles.css
- [X] T037 [P] Validate performance: <100ms input response on all difficulties, <1s flood fill on Expert grid (480 cells)
- [X] T038 Run quickstart.md validation: npm start launches app, npm test passes all unit tests, npm run package creates distributable

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3–8)**: All depend on Foundational phase completion
  - US1 (Phase 3) must complete before US2, US3, US5, US6 (they build on reveal mechanics)
  - US2 (Phase 4) must complete before US6 (chord depends on flags)
  - US3 (Phase 5) can run in parallel with US4
  - US4 (Phase 6) can run in parallel with US3, US5
  - US5 (Phase 7) can run after US1
  - US6 (Phase 8) requires US1 + US2
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational only — no other story dependencies
- **US2 (P2)**: Depends on US1 (needs reveal mechanics and grid rendering)
- **US3 (P2)**: Depends on US1 (needs revealCell to add win check)
- **US4 (P2)**: Depends on Foundational only (menu/window are independent of game logic)
- **US5 (P3)**: Depends on US1 (timer starts on first click, needs game state)
- **US6 (P3)**: Depends on US1 + US2 (chord needs both reveal and flag mechanics)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Game logic (src/game/) before renderer (src/renderer/)
- Core actions before UI integration
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: T003 and T004 can run in parallel (after T001/T002)
- **Phase 2**: T006, T007, T009, T010 can all run in parallel (after T005)
- **Phase 3 tests**: T011, T012, T013 can all run in parallel
- **Phase 4 + Phase 6**: US3 and US4 can run in parallel (both depend on US1 only)
- **Phase 8 tests**: T033 can run in parallel with other test writing

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Write board generation tests in tests/unit/board.test.ts"          # T011
Task: "Write revealCell tests in tests/unit/actions.test.ts"              # T012
Task: "Write game state transition tests in tests/unit/state.test.ts"    # T013

# After tests written, T014 (board.ts) can start first, then T015 (actions.ts) depends on T014
# T016 (grid.ts) and T017 (app.ts) are sequential: grid before app
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T004)
2. Complete Phase 2: Foundational (T005–T010)
3. Complete Phase 3: User Story 1 (T011–T017)
4. **STOP and VALIDATE**: Click cells, verify numbers, flood fill, mine loss, first-click safety
5. Playable Minesweeper demo with reveal-only mechanics

### Incremental Delivery

1. Setup + Foundational → Electron shell launches
2. Add US1 → Core reveal gameplay works (MVP!)
3. Add US2 → Flagging and mine counter
4. Add US3 → Win/loss detection with board lock
5. Add US4 → Difficulty selection from menu
6. Add US5 → Timer and smiley restart button
7. Add US6 → Chording for experienced players
8. Polish → Visual refinement and performance validation

### Parallel Team Strategy

With multiple developers after Foundational is complete:

1. Team completes Setup + Foundational together
2. Developer A: US1 (must complete first — other stories depend on it)
3. Once US1 is done:
   - Developer A: US3 (win detection)
   - Developer B: US2 (flagging) → then US6 (chord, needs US2)
   - Developer C: US4 (difficulty menu) → then US5 (timer/controls)
4. All: Polish phase

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story is independently testable after completion
- Game logic (src/game/) is pure functions — no DOM, no Electron, no side effects
- Renderer (src/renderer/) imports game functions and manages state locally
- Main process (src/main/) is thin — window and menu management only
- Verify tests fail before implementing corresponding logic
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
