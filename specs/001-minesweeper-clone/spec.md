# Feature Specification: Minesweeper Clone

**Feature Branch**: `001-minesweeper-clone`
**Created**: 2026-03-22
**Status**: Draft
**Input**: User description: "minesweeper: create a minesweeper clone. just like the one in windows games."

## Clarifications

### Session 2026-03-22

- Q: What is the target platform for this greenfield project? → A: Desktop application using Electron (native window)
- Q: Should the window be fixed-size or resizable? → A: Fixed window size per difficulty level (window resizes to fit grid, not user-resizable)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reveal Cells and Avoid Mines (Priority: P1)

A player starts a new game and sees a grid of hidden cells. They click on cells to reveal them. Revealed cells show either a number (indicating how many adjacent cells contain mines) or are blank (no adjacent mines). When a blank cell is revealed, all connected blank cells and their numbered neighbors are automatically revealed. If the player clicks on a mine, the game ends and all mines are shown.

**Why this priority**: This is the core gameplay mechanic - without cell revealing and mine interaction, there is no game.

**Independent Test**: Can be fully tested by starting a game, clicking cells to reveal them, and verifying numbers match adjacent mine counts. Delivers the fundamental puzzle-solving experience.

**Acceptance Scenarios**:

1. **Given** a new game has started, **When** the player clicks a hidden cell that is not a mine, **Then** the cell is revealed showing the count of adjacent mines (0-8)
2. **Given** a new game has started, **When** the player clicks a hidden cell with zero adjacent mines, **Then** all connected zero-adjacent-mine cells and their numbered neighbors are automatically revealed (flood fill)
3. **Given** a game is in progress, **When** the player clicks a cell containing a mine, **Then** the game ends, the clicked mine is highlighted, and all other mines are revealed
4. **Given** the game has started, **When** the player makes their very first click, **Then** the clicked cell is guaranteed to be safe (not a mine)

---

### User Story 2 - Flag Suspected Mines (Priority: P2)

A player right-clicks on a hidden cell to place a flag, marking it as a suspected mine. Flagged cells cannot be accidentally revealed by clicking. Right-clicking a flagged cell removes the flag. A counter displays how many mines remain unflagged.

**Why this priority**: Flagging is essential for strategic play and preventing accidental mine clicks. The mine counter provides critical information for deduction.

**Independent Test**: Can be tested by right-clicking cells to toggle flags and verifying the mine counter updates correctly.

**Acceptance Scenarios**:

1. **Given** a hidden cell is not flagged, **When** the player right-clicks it, **Then** a flag icon appears on the cell and the mine counter decreases by one
2. **Given** a cell is flagged, **When** the player right-clicks it, **Then** the flag is removed and the mine counter increases by one
3. **Given** a cell is flagged, **When** the player left-clicks it, **Then** nothing happens (the cell remains hidden and flagged)
4. **Given** the mine counter shows 0, **When** the player flags another cell, **Then** the counter shows -1 (counter can go negative)

---

### User Story 3 - Win the Game (Priority: P2)

A player wins the game by revealing all cells that do not contain mines. When the game is won, the timer stops, all remaining hidden cells (mines) are automatically flagged, and a victory indicator is shown.

**Why this priority**: The win condition completes the core game loop and gives players a goal to work toward.

**Independent Test**: Can be tested by revealing all non-mine cells and verifying the game transitions to a win state with appropriate feedback.

**Acceptance Scenarios**:

1. **Given** all non-mine cells have been revealed, **When** the last non-mine cell is revealed, **Then** the game displays a victory state and the timer stops
2. **Given** the game is won, **When** the victory state is displayed, **Then** all unflagged mine cells are automatically flagged
3. **Given** the game is won, **When** the player clicks on any cell, **Then** nothing happens (the board is locked)

---

### User Story 4 - Select Difficulty Level (Priority: P2)

A player can choose between three difficulty levels before starting a game: Beginner (small grid, few mines), Intermediate (medium grid, moderate mines), and Expert (large grid, many mines). Each difficulty defines a specific grid size and mine count matching the classic Windows Minesweeper.

**Why this priority**: Difficulty selection provides accessibility for new players and challenge for experienced ones, directly matching the classic Windows experience.

**Independent Test**: Can be tested by selecting each difficulty and verifying the grid dimensions and mine counts are correct.

**Acceptance Scenarios**:

1. **Given** the player selects Beginner, **When** a new game starts, **Then** the grid is 9 columns by 9 rows with 10 mines
2. **Given** the player selects Intermediate, **When** a new game starts, **Then** the grid is 16 columns by 16 rows with 40 mines
3. **Given** the player selects Expert, **When** a new game starts, **Then** the grid is 30 columns by 16 rows with 99 mines
4. **Given** no difficulty is selected, **When** the game first loads, **Then** the default difficulty is Beginner

---

### User Story 5 - Timer and Game Controls (Priority: P3)

A timer displays elapsed seconds starting from the player's first click. A status indicator (smiley face) shows the current game state and can be clicked to restart the game. The timer stops when the game ends (win or loss).

**Why this priority**: Timer and reset controls enhance the classic feel and allow competitive play, but are not required for core gameplay.

**Independent Test**: Can be tested by clicking a cell and watching the timer increment, then restarting via the status indicator.

**Acceptance Scenarios**:

1. **Given** a new game is displayed, **When** no cells have been clicked yet, **Then** the timer shows 0
2. **Given** the player clicks the first cell, **When** time passes, **Then** the timer increments every second
3. **Given** the game is in progress, **When** the player clicks the status indicator, **Then** a new game starts with the same difficulty and the timer resets to 0
4. **Given** the game ends (win or loss), **When** the timer was running, **Then** the timer stops at its current value
5. **Given** the timer reaches 999, **When** more time passes, **Then** the timer stays at 999

---

### User Story 6 - Chord (Reveal Neighbors of Satisfied Numbers) (Priority: P3)

When a revealed number cell has exactly the correct number of adjacent flags matching its number, the player can click on it to automatically reveal all unflagged adjacent cells. If the flags are placed incorrectly, this may trigger a mine and end the game.

**Why this priority**: Chording is a quality-of-life feature for experienced players that speeds up gameplay, but the game is fully playable without it.

**Independent Test**: Can be tested by flagging the correct number of cells around a number, then clicking the number to reveal remaining neighbors.

**Acceptance Scenarios**:

1. **Given** a revealed cell shows "2" and exactly 2 adjacent cells are flagged, **When** the player clicks the numbered cell, **Then** all unflagged adjacent hidden cells are revealed
2. **Given** a revealed cell shows "3" but only 1 adjacent cell is flagged, **When** the player clicks the numbered cell, **Then** nothing happens
3. **Given** a revealed cell has correct flag count but a flag is misplaced, **When** the player chords, **Then** a mine is revealed and the game ends in a loss

---

### Edge Cases

- The application window has a fixed size per difficulty level, automatically resizing when difficulty changes. The window is not user-resizable.
- What happens when the player right-clicks on an already revealed cell? Nothing should happen.
- What happens if all mines are accidentally placed such that the board is unsolvable? The first-click-safe guarantee and random placement should minimize this, though solvability is not guaranteed (matching classic Windows Minesweeper behavior).
- What happens when the player tries to flag more cells than there are mines? The counter goes negative, and the game continues normally.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a grid of cells that can be in one of these visual states: hidden, revealed (with number 0-8), revealed mine, or flagged
- **FR-002**: System MUST randomly distribute mines across the grid at game start, ensuring the first-clicked cell and its adjacent cells are mine-free
- **FR-003**: System MUST calculate and display the correct adjacent mine count (0-8) for each revealed non-mine cell
- **FR-004**: System MUST perform flood-fill auto-reveal when a cell with zero adjacent mines is revealed, recursively revealing all connected zero cells and their numbered neighbors
- **FR-005**: System MUST support right-click to toggle flags on hidden cells
- **FR-006**: System MUST display a mine counter showing total mines minus number of placed flags
- **FR-007**: System MUST display a timer that starts on first click and counts elapsed seconds (0-999)
- **FR-008**: System MUST provide three preset difficulty levels: Beginner (9x9, 10 mines), Intermediate (16x16, 40 mines), Expert (30x16, 99 mines)
- **FR-009**: System MUST detect win condition when all non-mine cells are revealed
- **FR-010**: System MUST detect loss condition when a mine cell is clicked
- **FR-011**: System MUST provide a restart mechanism (status indicator click) that starts a new game at the current difficulty
- **FR-012**: System MUST support chording on revealed number cells when the adjacent flag count matches the cell's number
- **FR-013**: System MUST prevent interaction with the grid after the game ends (win or loss)
- **FR-014**: System MUST visually distinguish between: unrevealed cells, revealed cells, flagged cells, mines (on game over), and incorrectly-flagged cells (on game over)
- **FR-015**: System MUST guarantee the first click is always safe (not a mine)
- **FR-016**: System MUST display a fixed-size window that automatically resizes to fit the grid when difficulty changes; the window is not user-resizable

### Key Entities

- **Cell**: A single unit in the game grid. Has a position (row, column), a hidden/revealed/flagged state, whether it contains a mine, and an adjacent mine count (0-8)
- **Game Board**: The complete grid of cells. Defined by width (columns), height (rows), and total mine count. Contains the state of all cells
- **Game State**: The current status of a game session: not started, in progress, won, or lost. Tracks elapsed time and remaining mine count
- **Difficulty Preset**: A named configuration defining grid dimensions and mine count (Beginner, Intermediate, Expert)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Players can complete a Beginner game in under 5 minutes on their first attempt
- **SC-002**: All three difficulty levels are selectable and produce correctly-sized grids with the correct number of mines
- **SC-003**: The first click on any new game always reveals a safe cell (never a mine)
- **SC-004**: Flood-fill correctly reveals all connected empty cells and their numbered borders in under 1 second
- **SC-005**: The mine counter accurately reflects total mines minus placed flags at all times
- **SC-006**: The timer accurately tracks elapsed seconds from first click to game end
- **SC-007**: Game controls (reveal, flag, chord, restart) respond to player input within 100 milliseconds
- **SC-008**: The game visually matches the classic Windows Minesweeper aesthetic (grid layout, cell appearance, status indicator, counters)

## Assumptions

- The game will be a single-player experience (no multiplayer or leaderboards in initial scope)
- Custom difficulty (user-defined grid size and mine count) is out of scope for this feature
- Sound effects are out of scope for this feature
- The game does not guarantee logical solvability of every generated board, matching classic Windows Minesweeper behavior
- The "question mark" flag mode (cycling through flag -> question mark -> unflagged) is out of scope; only flag/unflag toggle is included
- The game is delivered as a desktop application using Electron, running in a native window
- The game uses a visual style inspired by the classic Windows Minesweeper but does not need to be pixel-perfect
