import { Cell, CellState } from './state';

export function createBoard(rows: number, cols: number): Cell[][] {
  const board: Cell[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        row: r,
        col: c,
        hasMine: false,
        adjacentMines: 0,
        state: CellState.Hidden,
      });
    }
    board.push(row);
  }
  return board;
}

export function placeMines(
  board: Cell[][],
  mineCount: number,
  clickRow: number,
  clickCol: number,
): Cell[][] {
  const rows = board.length;
  const cols = board[0].length;

  // Deep copy the board
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));

  // Build exclusion set: clicked cell + 8 neighbors
  const excluded = new Set<string>();
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = clickRow + dr;
      const nc = clickCol + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        excluded.add(`${nr},${nc}`);
      }
    }
  }

  // Collect eligible positions
  const eligible: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!excluded.has(`${r},${c}`)) {
        eligible.push([r, c]);
      }
    }
  }

  // Fisher-Yates shuffle and pick first mineCount
  for (let i = eligible.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [eligible[i], eligible[j]] = [eligible[j], eligible[i]];
  }

  for (let i = 0; i < mineCount; i++) {
    const [r, c] = eligible[i];
    newBoard[r][c].hasMine = true;
  }

  return newBoard;
}

export function calculateAdjacency(board: Cell[][]): Cell[][] {
  const rows = board.length;
  const cols = board[0].length;
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (newBoard[r][c].hasMine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newBoard[nr][nc].hasMine) {
            count++;
          }
        }
      }
      newBoard[r][c].adjacentMines = count;
    }
  }

  return newBoard;
}
