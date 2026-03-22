import { describe, it, expect } from 'vitest';
import { revealCell, toggleFlag, chord } from '../../src/game/actions';
import { createBoard } from '../../src/game/board';
import { CellState, GameStatus, GameState } from '../../src/game/state';
function makeIdleState(rows = 9, cols = 9, mineCount = 10): GameState {
  return {
    board: createBoard(rows, cols),
    difficulty: { name: 'Beginner', rows, cols, mineCount },
    status: GameStatus.Idle,
    minesPlaced: false,
    flagCount: 0,
    elapsedTime: 0,
    revealedCount: 0,
  };
}

function makePlayingState(): GameState {
  // Create a known board: 3x3, mine at (0,0) only
  const board = createBoard(3, 3);
  board[0][0] = { ...board[0][0], hasMine: true };
  // Set adjacency: (0,1)=1, (1,0)=1, (1,1)=1, rest=0
  board[0][1] = { ...board[0][1], adjacentMines: 1 };
  board[1][0] = { ...board[1][0], adjacentMines: 1 };
  board[1][1] = { ...board[1][1], adjacentMines: 1 };
  return {
    board,
    difficulty: { name: 'Test', rows: 3, cols: 3, mineCount: 1 },
    status: GameStatus.Playing,
    minesPlaced: true,
    flagCount: 0,
    elapsedTime: 0,
    revealedCount: 0,
  };
}

describe('revealCell', () => {
  it('transitions from Idle to Playing on first click', () => {
    const state = makeIdleState();
    const next = revealCell(state, 4, 4);
    expect(next.status).toBe(GameStatus.Playing);
    expect(next.minesPlaced).toBe(true);
  });

  it('first click cell is always revealed (safe)', () => {
    const state = makeIdleState();
    const next = revealCell(state, 4, 4);
    expect(next.board[4][4].state).toBe(CellState.Revealed);
    expect(next.board[4][4].hasMine).toBe(false);
  });

  it('reveals a numbered cell without flood fill', () => {
    const state = makePlayingState();
    // (0,1) has adjacentMines=1, should reveal just that cell
    const next = revealCell(state, 0, 1);
    expect(next.board[0][1].state).toBe(CellState.Revealed);
    expect(next.revealedCount).toBe(1);
    // Adjacent cells should still be hidden
    expect(next.board[0][2].state).toBe(CellState.Hidden);
  });

  it('reveals zero cell and triggers flood fill', () => {
    const state = makePlayingState();
    // (2,2) has adjacentMines=0, should flood fill to adjacent zeros and their borders
    const next = revealCell(state, 2, 2);
    // (2,2), (2,1), (2,0), (1,2) are all 0-adjacent → revealed
    // (1,1), (1,0), (0,1) are numbered borders → also revealed by flood fill
    expect(next.board[2][2].state).toBe(CellState.Revealed);
    expect(next.board[2][1].state).toBe(CellState.Revealed);
    expect(next.board[2][0].state).toBe(CellState.Revealed);
    expect(next.board[1][2].state).toBe(CellState.Revealed);
    // Flood fill reveals numbered borders too
    expect(next.board[1][1].state).toBe(CellState.Revealed);
    expect(next.board[1][0].state).toBe(CellState.Revealed);
    expect(next.board[0][1].state).toBe(CellState.Revealed);
    // Mine cell should NOT be revealed
    expect(next.board[0][0].state).toBe(CellState.Hidden);
  });

  it('transitions to Lost when revealing a mine', () => {
    const state = makePlayingState();
    const next = revealCell(state, 0, 0);
    expect(next.status).toBe(GameStatus.Lost);
  });

  it('does nothing when game is Won', () => {
    const state = makePlayingState();
    state.status = GameStatus.Won;
    const next = revealCell(state, 1, 1);
    expect(next).toBe(state);
  });

  it('does nothing when game is Lost', () => {
    const state = makePlayingState();
    state.status = GameStatus.Lost;
    const next = revealCell(state, 1, 1);
    expect(next).toBe(state);
  });

  it('does nothing when revealing an already revealed cell', () => {
    const state = makePlayingState();
    const next = revealCell(state, 0, 1);
    const again = revealCell(next, 0, 1);
    expect(again).toBe(next);
  });

  it('does not reveal a flagged cell', () => {
    const state = makePlayingState();
    const flagged = toggleFlag(state, 1, 1);
    const next = revealCell(flagged, 1, 1);
    expect(next).toBe(flagged);
  });
});

describe('toggleFlag', () => {
  it('flags a hidden cell and increments flagCount', () => {
    const state = makePlayingState();
    const next = toggleFlag(state, 1, 1);
    expect(next.board[1][1].state).toBe(CellState.Flagged);
    expect(next.flagCount).toBe(1);
  });

  it('unflags a flagged cell and decrements flagCount', () => {
    const state = makePlayingState();
    const flagged = toggleFlag(state, 1, 1);
    const unflagged = toggleFlag(flagged, 1, 1);
    expect(unflagged.board[1][1].state).toBe(CellState.Hidden);
    expect(unflagged.flagCount).toBe(0);
  });

  it('does nothing on a revealed cell', () => {
    const state = makePlayingState();
    const revealed = revealCell(state, 0, 1);
    const next = toggleFlag(revealed, 0, 1);
    expect(next).toBe(revealed);
  });

  it('allows flag count to exceed mine count (negative counter)', () => {
    const state = makePlayingState();
    // mineCount = 1, flag 2 cells
    const flag1 = toggleFlag(state, 1, 0);
    const flag2 = toggleFlag(flag1, 1, 1);
    expect(flag2.flagCount).toBe(2);
    // Mine counter would be 1 - 2 = -1
  });

  it('does nothing in Won state', () => {
    const state = makePlayingState();
    state.status = GameStatus.Won;
    const next = toggleFlag(state, 1, 1);
    expect(next).toBe(state);
  });

  it('does nothing in Lost state', () => {
    const state = makePlayingState();
    state.status = GameStatus.Lost;
    const next = toggleFlag(state, 1, 1);
    expect(next).toBe(state);
  });
});

describe('chord', () => {
  it('reveals unflagged neighbors when flag count matches number', () => {
    const state = makePlayingState();
    // Reveal (1,1) which has adjacentMines=1
    const revealed = revealCell(state, 1, 1);
    // Flag (0,0) which is the mine
    const flagged = toggleFlag(revealed, 0, 0);
    // Chord on (1,1) — 1 flag matches adjacentMines=1
    const chorded = chord(flagged, 1, 1);
    // All unflagged hidden neighbors of (1,1) should be revealed: (0,1), (0,2), (1,0), (1,2), (2,0), (2,1), (2,2)
    expect(chorded.board[0][1].state).toBe(CellState.Revealed);
    expect(chorded.board[1][0].state).toBe(CellState.Revealed);
    expect(chorded.board[0][2].state).toBe(CellState.Revealed);
    expect(chorded.board[1][2].state).toBe(CellState.Revealed);
    // Mine (0,0) should still be flagged
    expect(chorded.board[0][0].state).toBe(CellState.Flagged);
  });

  it('does nothing when flag count does not match number', () => {
    const state = makePlayingState();
    // Reveal (1,1) which has adjacentMines=1
    const revealed = revealCell(state, 1, 1);
    // No flags placed — 0 flags != 1 adjacentMines
    const chorded = chord(revealed, 1, 1);
    expect(chorded).toBe(revealed);
  });

  it('triggers loss when chord reveals a mine due to misplaced flag', () => {
    const state = makePlayingState();
    // Reveal (1,1) which has adjacentMines=1
    const revealed = revealCell(state, 1, 1);
    // Flag (0,1) INCORRECTLY (not the mine)
    const flagged = toggleFlag(revealed, 0, 1);
    // Chord on (1,1) — 1 flag matches adjacentMines=1, but flag is wrong
    const chorded = chord(flagged, 1, 1);
    expect(chorded.status).toBe(GameStatus.Lost);
  });

  it('does nothing on a hidden cell', () => {
    const state = makePlayingState();
    const next = chord(state, 1, 1);
    expect(next).toBe(state);
  });

  it('does nothing on a revealed cell with no number', () => {
    const state = makePlayingState();
    // Reveal (2,2) which has adjacentMines=0
    const revealed = revealCell(state, 2, 2);
    const next = chord(revealed, 2, 2);
    expect(next).toBe(revealed);
  });
});
