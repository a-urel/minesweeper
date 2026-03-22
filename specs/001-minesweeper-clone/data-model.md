# Data Model: Minesweeper Clone

**Feature**: 001-minesweeper-clone
**Date**: 2026-03-22

## Entities

### CellState (enum)

Represents the visual/interaction state of a single cell.

| Value    | Description                                    |
|----------|------------------------------------------------|
| Hidden   | Default state, not yet revealed or flagged     |
| Revealed | Player has clicked to reveal this cell         |
| Flagged  | Player has right-clicked to mark as mine       |

### Cell

A single unit in the game grid.

| Field         | Type      | Description                                      |
|---------------|-----------|--------------------------------------------------|
| row           | number    | Row index (0-based)                              |
| col           | number    | Column index (0-based)                           |
| hasMine       | boolean   | Whether this cell contains a mine                |
| adjacentMines | number    | Count of mines in neighboring cells (0-8)        |
| state         | CellState | Current interaction state (Hidden/Revealed/Flagged) |

**Validation rules**:
- `adjacentMines` must be 0-8
- `row` must be 0 to (height - 1)
- `col` must be 0 to (width - 1)
- A cell with `hasMine: true` should never have `state: Revealed` during normal play (only on game loss)

### GameStatus (enum)

Represents the current phase of a game session.

| Value      | Description                                    |
|------------|------------------------------------------------|
| Idle       | Game created but no cells clicked yet          |
| Playing    | First click made, timer running                |
| Won        | All non-mine cells revealed                    |
| Lost       | A mine cell was revealed                       |

### DifficultyPreset

A named configuration for grid dimensions and mine count.

| Field     | Type   | Description                  |
|-----------|--------|------------------------------|
| name      | string | Display name of the preset   |
| rows      | number | Number of rows in the grid   |
| cols      | number | Number of columns in the grid|
| mineCount | number | Total mines to place         |

**Preset values**:

| Name         | Rows | Cols | Mines |
|--------------|------|------|-------|
| Beginner     | 9    | 9    | 10    |
| Intermediate | 16   | 16   | 40    |
| Expert       | 16   | 30   | 99    |

### GameState

The complete state of a game session.

| Field       | Type              | Description                                      |
|-------------|-------------------|--------------------------------------------------|
| board       | Cell[][]          | 2D array of cells (rows x cols)                  |
| difficulty  | DifficultyPreset  | Current difficulty configuration                 |
| status      | GameStatus        | Current game phase                               |
| minesPlaced | boolean           | Whether mines have been placed (deferred until first click) |
| flagCount   | number            | Number of flags currently placed                 |
| elapsedTime | number            | Seconds elapsed since first click (0-999)        |
| revealedCount | number          | Number of cells currently revealed               |

**Derived values** (not stored, computed):
- `mineCounter = difficulty.mineCount - flagCount`
- `isWon = revealedCount === (rows * cols - mineCount)`

## State Transitions

```
         first click
Idle ──────────────► Playing
                        │
                        ├── reveal non-mine cell → Playing (update board)
                        ├── toggle flag → Playing (update board + flagCount)
                        ├── chord → Playing (update board) or Lost
                        ├── reveal mine → Lost
                        └── reveal last safe cell → Won

Won ──► (terminal, board locked)
Lost ──► (terminal, board locked)

Any state + restart → Idle (new board, reset timer)
Any state + change difficulty → Idle (new board, new dimensions)
```

## Relationships

- **GameState** contains one **DifficultyPreset** (defines board dimensions)
- **GameState** contains a 2D array of **Cell** entities (the board)
- **Cell** state transitions are driven by player actions filtered through **GameStatus** (no transitions allowed in Won/Lost)
- **DifficultyPreset** determines initial **GameState** dimensions and mine count
