import { describe, it, expect } from 'vitest';
import { createBoard, placeMines, calculateAdjacency } from '../../src/game/board';
import { CellState } from '../../src/game/state';

describe('createBoard', () => {
  it('returns a board with correct dimensions for Beginner', () => {
    const board = createBoard(9, 9);
    expect(board).toHaveLength(9);
    expect(board[0]).toHaveLength(9);
  });

  it('returns a board with correct dimensions for Expert', () => {
    const board = createBoard(16, 30);
    expect(board).toHaveLength(16);
    expect(board[0]).toHaveLength(30);
  });

  it('initializes all cells as Hidden with no mines', () => {
    const board = createBoard(9, 9);
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        expect(board[r][c].state).toBe(CellState.Hidden);
        expect(board[r][c].hasMine).toBe(false);
        expect(board[r][c].adjacentMines).toBe(0);
        expect(board[r][c].row).toBe(r);
        expect(board[r][c].col).toBe(c);
      }
    }
  });
});

describe('placeMines', () => {
  it('places the exact number of mines specified', () => {
    const board = createBoard(9, 9);
    const mined = placeMines(board, 10, 4, 4);
    let mineCount = 0;
    for (const row of mined) {
      for (const cell of row) {
        if (cell.hasMine) mineCount++;
      }
    }
    expect(mineCount).toBe(10);
  });

  it('excludes the first-click cell and its neighbors from mines', () => {
    const board = createBoard(9, 9);
    // Click at center (4,4) — exclusion zone is (3,3) to (5,5) = 9 cells
    const mined = placeMines(board, 10, 4, 4);
    for (let r = 3; r <= 5; r++) {
      for (let c = 3; c <= 5; c++) {
        expect(mined[r][c].hasMine).toBe(false);
      }
    }
  });

  it('excludes corner click and its neighbors from mines', () => {
    const board = createBoard(9, 9);
    // Click at (0,0) — exclusion zone is (0,0), (0,1), (1,0), (1,1) = 4 cells
    const mined = placeMines(board, 10, 0, 0);
    expect(mined[0][0].hasMine).toBe(false);
    expect(mined[0][1].hasMine).toBe(false);
    expect(mined[1][0].hasMine).toBe(false);
    expect(mined[1][1].hasMine).toBe(false);
  });

  it('does not mutate the original board', () => {
    const board = createBoard(9, 9);
    placeMines(board, 10, 4, 4);
    for (const row of board) {
      for (const cell of row) {
        expect(cell.hasMine).toBe(false);
      }
    }
  });
});

describe('calculateAdjacency', () => {
  it('correctly counts adjacent mines', () => {
    // Create a 3x3 board with mines at (0,0) and (0,2)
    const board = createBoard(3, 3);
    board[0][0] = { ...board[0][0], hasMine: true };
    board[0][2] = { ...board[0][2], hasMine: true };
    const result = calculateAdjacency(board);

    // (0,1) is adjacent to both mines
    expect(result[0][1].adjacentMines).toBe(2);
    // (1,0) is adjacent to mine at (0,0)
    expect(result[1][0].adjacentMines).toBe(1);
    // (1,1) is adjacent to both mines
    expect(result[1][1].adjacentMines).toBe(2);
    // (1,2) is adjacent to mine at (0,2)
    expect(result[1][2].adjacentMines).toBe(1);
    // (2,0) has no adjacent mines
    expect(result[2][0].adjacentMines).toBe(0);
    // Mine cells also have adjacency counts
    expect(result[0][0].adjacentMines).toBe(0);
    expect(result[0][2].adjacentMines).toBe(0);
  });

  it('returns 0 for cells with no neighboring mines', () => {
    const board = createBoard(3, 3);
    // Only mine at (0,0)
    board[0][0] = { ...board[0][0], hasMine: true };
    const result = calculateAdjacency(board);
    expect(result[2][2].adjacentMines).toBe(0);
  });
});
