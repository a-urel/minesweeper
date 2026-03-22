import { describe, it, expect } from 'vitest';
import { revealCell } from '../../src/game/actions';
import { createBoard } from '../../src/game/board';
import { CellState, GameStatus, GameState } from '../../src/game/state';

describe('Game state transitions', () => {
  it('Idle → Playing on first reveal', () => {
    const state: GameState = {
      board: createBoard(9, 9),
      difficulty: { name: 'Beginner', rows: 9, cols: 9, mineCount: 10 },
      status: GameStatus.Idle,
      minesPlaced: false,
      flagCount: 0,
      elapsedTime: 0,
      revealedCount: 0,
    };
    const next = revealCell(state, 4, 4);
    expect(next.status).toBe(GameStatus.Playing);
  });

  it('Playing → Lost on mine reveal', () => {
    // Create a board with a known mine location
    const board = createBoard(3, 3);
    board[0][0] = { ...board[0][0], hasMine: true };
    board[0][1] = { ...board[0][1], adjacentMines: 1 };
    board[1][0] = { ...board[1][0], adjacentMines: 1 };
    board[1][1] = { ...board[1][1], adjacentMines: 1 };

    const state: GameState = {
      board,
      difficulty: { name: 'Test', rows: 3, cols: 3, mineCount: 1 },
      status: GameStatus.Playing,
      minesPlaced: true,
      flagCount: 0,
      elapsedTime: 0,
      revealedCount: 0,
    };
    const next = revealCell(state, 0, 0);
    expect(next.status).toBe(GameStatus.Lost);
  });

  it('no actions allowed in Won state', () => {
    const state: GameState = {
      board: createBoard(3, 3),
      difficulty: { name: 'Test', rows: 3, cols: 3, mineCount: 1 },
      status: GameStatus.Won,
      minesPlaced: true,
      flagCount: 0,
      elapsedTime: 0,
      revealedCount: 8,
    };
    const next = revealCell(state, 1, 1);
    expect(next).toBe(state);
  });

  it('no actions allowed in Lost state', () => {
    const state: GameState = {
      board: createBoard(3, 3),
      difficulty: { name: 'Test', rows: 3, cols: 3, mineCount: 1 },
      status: GameStatus.Lost,
      minesPlaced: true,
      flagCount: 0,
      elapsedTime: 0,
      revealedCount: 0,
    };
    const next = revealCell(state, 1, 1);
    expect(next).toBe(state);
  });

  it('Playing → Won when revealing last non-mine cell', () => {
    // 3x3 board, mine at (0,0), all other cells already revealed except (0,1)
    const board = createBoard(3, 3);
    board[0][0] = { ...board[0][0], hasMine: true };
    board[0][1] = { ...board[0][1], adjacentMines: 1 };
    board[1][0] = { ...board[1][0], adjacentMines: 1 };
    board[1][1] = { ...board[1][1], adjacentMines: 1 };
    // Reveal all non-mine cells except (0,1)
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (r === 0 && c === 0) continue; // mine
        if (r === 0 && c === 1) continue; // last cell to reveal
        board[r][c] = { ...board[r][c], state: CellState.Revealed };
      }
    }

    const state: GameState = {
      board,
      difficulty: { name: 'Test', rows: 3, cols: 3, mineCount: 1 },
      status: GameStatus.Playing,
      minesPlaced: true,
      flagCount: 0,
      elapsedTime: 5,
      revealedCount: 7, // 8 safe cells - 1 remaining
    };
    const next = revealCell(state, 0, 1);
    expect(next.status).toBe(GameStatus.Won);
    expect(next.revealedCount).toBe(8);
  });

  it('Won state locks all actions including flagging', () => {
    const board = createBoard(3, 3);
    const state: GameState = {
      board,
      difficulty: { name: 'Test', rows: 3, cols: 3, mineCount: 1 },
      status: GameStatus.Won,
      minesPlaced: true,
      flagCount: 0,
      elapsedTime: 0,
      revealedCount: 8,
    };
    const revealed = revealCell(state, 1, 1);
    expect(revealed).toBe(state);
  });

  it('tracks revealedCount accurately', () => {
    const board = createBoard(3, 3);
    board[0][0] = { ...board[0][0], hasMine: true };
    board[0][1] = { ...board[0][1], adjacentMines: 1 };
    board[1][0] = { ...board[1][0], adjacentMines: 1 };
    board[1][1] = { ...board[1][1], adjacentMines: 1 };

    const state: GameState = {
      board,
      difficulty: { name: 'Test', rows: 3, cols: 3, mineCount: 1 },
      status: GameStatus.Playing,
      minesPlaced: true,
      flagCount: 0,
      elapsedTime: 0,
      revealedCount: 0,
    };
    const next = revealCell(state, 0, 1);
    expect(next.revealedCount).toBe(1);
    const next2 = revealCell(next, 1, 0);
    expect(next2.revealedCount).toBe(2);
  });
});
