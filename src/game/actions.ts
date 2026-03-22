import { GameState, GameStatus, CellState, Cell } from './state';
import { placeMines, calculateAdjacency } from './board';

function cloneBoard(board: Cell[][]): Cell[][] {
  return board.map(row => row.map(cell => ({ ...cell })));
}

export function revealCell(state: GameState, row: number, col: number): GameState {
  // No actions in terminal states
  if (state.status === GameStatus.Won || state.status === GameStatus.Lost) {
    return state;
  }

  // Handle first click: place mines, transition to Playing
  if (state.status === GameStatus.Idle) {
    const minedBoard = placeMines(
      state.board,
      state.difficulty.mineCount,
      row,
      col,
    );
    const boardWithAdjacency = calculateAdjacency(minedBoard);
    const newState: GameState = {
      ...state,
      board: boardWithAdjacency,
      status: GameStatus.Playing,
      minesPlaced: true,
    };
    return revealCell(newState, row, col);
  }

  const cell = state.board[row][col];

  // Can't reveal already revealed or flagged cells
  if (cell.state === CellState.Revealed || cell.state === CellState.Flagged) {
    return state;
  }

  // Hit a mine — game over
  if (cell.hasMine) {
    const newBoard = cloneBoard(state.board);
    newBoard[row][col].state = CellState.Revealed;
    return {
      ...state,
      board: newBoard,
      status: GameStatus.Lost,
    };
  }

  // Reveal the cell
  const newBoard = cloneBoard(state.board);
  let revealedCount = state.revealedCount;

  // Flood fill for zero-adjacent cells
  const stack: [number, number][] = [[row, col]];
  while (stack.length > 0) {
    const [r, c] = stack.pop()!;
    if (r < 0 || r >= state.difficulty.rows || c < 0 || c >= state.difficulty.cols) continue;
    if (newBoard[r][c].state === CellState.Revealed) continue;
    if (newBoard[r][c].state === CellState.Flagged) continue;
    if (newBoard[r][c].hasMine) continue;

    newBoard[r][c].state = CellState.Revealed;
    revealedCount++;

    // If zero adjacent mines, expand to all neighbors
    if (newBoard[r][c].adjacentMines === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          stack.push([r + dr, c + dc]);
        }
      }
    }
  }

  const totalSafeCells = state.difficulty.rows * state.difficulty.cols - state.difficulty.mineCount;
  const newStatus = revealedCount === totalSafeCells ? GameStatus.Won : GameStatus.Playing;

  return {
    ...state,
    board: newBoard,
    status: newStatus,
    revealedCount,
  };
}

export function toggleFlag(state: GameState, row: number, col: number): GameState {
  if (state.status === GameStatus.Won || state.status === GameStatus.Lost) {
    return state;
  }

  const cell = state.board[row][col];

  if (cell.state === CellState.Revealed) {
    return state;
  }

  const newBoard = cloneBoard(state.board);

  if (cell.state === CellState.Flagged) {
    newBoard[row][col].state = CellState.Hidden;
    return { ...state, board: newBoard, flagCount: state.flagCount - 1 };
  }

  newBoard[row][col].state = CellState.Flagged;
  return { ...state, board: newBoard, flagCount: state.flagCount + 1 };
}

export function chord(state: GameState, row: number, col: number): GameState {
  if (state.status === GameStatus.Won || state.status === GameStatus.Lost) {
    return state;
  }

  const cell = state.board[row][col];

  // Can only chord on a revealed numbered cell
  if (cell.state !== CellState.Revealed || cell.adjacentMines === 0) {
    return state;
  }

  // Count adjacent flags
  const { rows, cols } = state.difficulty;
  let flagCount = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        if (state.board[nr][nc].state === CellState.Flagged) {
          flagCount++;
        }
      }
    }
  }

  // Flag count must match the cell's number
  if (flagCount !== cell.adjacentMines) {
    return state;
  }

  // Reveal all unflagged hidden neighbors
  let currentState = state;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        const neighbor = currentState.board[nr][nc];
        if (neighbor.state === CellState.Hidden) {
          currentState = revealCell(currentState, nr, nc);
          if (currentState.status === GameStatus.Lost) {
            return currentState;
          }
        }
      }
    }
  }

  return currentState;
}
