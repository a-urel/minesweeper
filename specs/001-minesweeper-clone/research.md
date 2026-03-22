# Research: Minesweeper Clone

**Feature**: 001-minesweeper-clone
**Date**: 2026-03-22

## Technology Decisions

### Language: TypeScript

**Decision**: TypeScript for both main and renderer processes
**Rationale**: Type safety is valuable for game state management (cell states, board transitions, difficulty configs). TypeScript is the standard for modern Electron development and catches logic errors at compile time — important for a game with complex state transitions (hidden/revealed/flagged, win/loss detection).
**Alternatives considered**:
- Plain JavaScript: Faster setup, but loses type safety for cell state and board operations where correctness matters most
- Rust + Tauri: Better performance and smaller binary, but Electron was specified as a requirement

### Renderer Approach: Plain HTML/CSS/DOM

**Decision**: Plain HTML, CSS, and DOM manipulation in the renderer process — no framework
**Rationale**: Minesweeper's UI is a static grid of cells with a toolbar. There is no routing, no complex state synchronization between components, and no dynamic list rendering. The entire UI is a single screen with direct event-to-state mappings. A framework would add build complexity and bundle size without providing meaningful benefit. Plain DOM manipulation also makes it straightforward to recreate the classic Windows Minesweeper aesthetic with CSS (beveled borders, sunken cells, pixel-style counters).
**Alternatives considered**:
- React: Component model is a natural fit for cells, but adds ~40KB bundle, JSX build step, and virtual DOM overhead for a UI that updates <500 elements
- Svelte: Lighter than React but still an unnecessary build dependency for this scope
- Canvas: Good for performance-critical rendering, but DOM gives us native right-click handling, CSS styling for the classic look, and simpler accessibility

### Build Tooling: Electron Forge

**Decision**: Electron Forge for project scaffolding, dev server, and packaging
**Rationale**: Official Electron tooling with built-in TypeScript support, hot reload for development, and cross-platform packaging. Reduces boilerplate compared to manual Electron configuration.
**Alternatives considered**:
- electron-builder: More packaging options but less integrated dev experience
- Manual webpack/vite config: Full control but significant setup overhead for a single-window app

### Testing: Vitest

**Decision**: Vitest for unit testing game logic
**Rationale**: Fast, modern test runner with native TypeScript support and zero-config setup. Game logic (board generation, flood fill, mine counting, win/loss detection) is pure functions that are ideal for unit testing. No need for DOM testing libraries — the game engine is separated from the renderer.
**Alternatives considered**:
- Jest: Heavier setup, slower execution, requires ts-jest transformer
- Playwright: Overkill for initial scope; E2E testing can be added later if needed

### CSS Approach: Classic Minesweeper Aesthetic

**Decision**: CSS with beveled borders (inset/outset box-shadows or border styles) to recreate the Windows 3.1/95/XP Minesweeper look
**Rationale**: The classic Minesweeper visual identity comes from:
- Raised/sunken 3D border effects on cells (CSS `border-style: outset/inset`)
- Seven-segment LED-style counters for mine count and timer
- Gray background with specific cell colors (blue=1, green=2, red=3, etc.)
- Smiley face button with distinct states (normal, surprised, dead, sunglasses)

These are all achievable with pure CSS, no images or sprites required.

## Architecture Decisions

### Game Logic Separation

**Decision**: Pure game engine module with no DOM or Electron dependencies
**Rationale**: Separating game logic from rendering enables:
- Comprehensive unit testing without DOM mocking
- Clear data flow: user action → game engine → state change → re-render
- Potential future portability (web version, different renderer)

The game engine exposes pure functions: `createBoard()`, `revealCell()`, `toggleFlag()`, `chord()`, each returning a new game state.

### State Management

**Decision**: Immutable game state object passed through pure functions
**Rationale**: Each user action produces a new state snapshot. This makes undo trivial to add later, simplifies debugging (log state at any point), and prevents accidental mutation bugs. For a board with max 480 cells (30x16 Expert), copying state is negligible in cost.

### Mine Placement Strategy

**Decision**: Deferred placement — mines are distributed after the first click
**Rationale**: FR-002/FR-015 require the first click to be safe (including adjacent cells). Rather than generating a board and then reshuffling if the click hits a mine, we defer mine placement until the first click occurs. This guarantees safety and avoids retry loops. The algorithm:
1. Player clicks cell (row, col)
2. Build exclusion set: clicked cell + 8 neighbors
3. Randomly place N mines in non-excluded cells
4. Calculate adjacency counts for all cells

### Electron IPC

**Decision**: Minimal IPC — game logic runs in the renderer process
**Rationale**: All game logic and rendering happens in the renderer. The main process only handles:
- Window creation and sizing (fixed per difficulty)
- Application menu (Game menu with difficulty options and New Game)
- IPC for difficulty change (main → renderer) and window resize requests (renderer → main)

This keeps the architecture simple and avoids the complexity of serializing game state across processes.
