import './styles.css';
import { GameState, GameStatus, CellState } from '../game/state';
import { DIFFICULTY, WINDOW_DIMENSIONS, MAX_TIMER } from '../game/constants';
import { createBoard } from '../game/board';
import { revealCell, toggleFlag, chord } from '../game/actions';
import { createGrid, updateGrid } from './grid';
import { updateMineCounter, updateTimerDisplay, updateSmiley, bindSmiley } from './controls';

declare global {
  interface Window {
    minesweeper: {
      onNewGame: (callback: () => void) => void;
      onSetDifficulty: (callback: (difficulty: string) => void) => void;
      resizeWindow: (width: number, height: number) => void;
    };
  }
}

let gameState: GameState;
let currentDifficultyKey = 'beginner';
let timerInterval: ReturnType<typeof setInterval> | null = null;

function stopTimer(): void {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function startTimer(): void {
  stopTimer();
  timerInterval = setInterval(() => {
    if (gameState.elapsedTime < MAX_TIMER) {
      gameState = { ...gameState, elapsedTime: gameState.elapsedTime + 1 };
      updateTimerDisplay(gameState.elapsedTime);
    }
  }, 1000);
}

function newGame(difficultyKey?: string): void {
  stopTimer();
  if (difficultyKey) currentDifficultyKey = difficultyKey;
  const difficulty = DIFFICULTY[currentDifficultyKey];
  gameState = {
    board: createBoard(difficulty.rows, difficulty.cols),
    difficulty,
    status: GameStatus.Idle,
    minesPlaced: false,
    flagCount: 0,
    elapsedTime: 0,
    revealedCount: 0,
  };

  createGrid(
    difficulty.rows,
    difficulty.cols,
    handleLeftClick,
    handleRightClick,
  );
  updateGrid(gameState.board, gameState.status);
  updateMineCounter(gameState.difficulty.mineCount, gameState.flagCount);
  updateTimerDisplay(0);
  updateSmiley(gameState.status);
}

function handleLeftClick(row: number, col: number): void {
  if (gameState.status === GameStatus.Won || gameState.status === GameStatus.Lost) return;

  const wasIdle = gameState.status === GameStatus.Idle;
  const prev = gameState;
  const cell = gameState.board[row][col];

  // Chord: click on a revealed numbered cell
  if (cell.state === CellState.Revealed && cell.adjacentMines > 0) {
    gameState = chord(gameState, row, col);
  } else {
    gameState = revealCell(gameState, row, col);
  }

  if (gameState !== prev) {
    if (wasIdle && gameState.status === GameStatus.Playing) {
      startTimer();
    }

    const triggeredRow = gameState.status === GameStatus.Lost ? row : undefined;
    const triggeredCol = gameState.status === GameStatus.Lost ? col : undefined;
    updateGrid(gameState.board, gameState.status, triggeredRow, triggeredCol);
    updateMineCounter(gameState.difficulty.mineCount, gameState.flagCount);
    updateSmiley(gameState.status);

    if (gameState.status === GameStatus.Won || gameState.status === GameStatus.Lost) {
      stopTimer();
    }
  }
}

function handleRightClick(row: number, col: number): void {
  if (gameState.status === GameStatus.Won || gameState.status === GameStatus.Lost) return;

  const cell = gameState.board[row][col];
  const prev = gameState;

  // Chord: right-click on a revealed numbered cell
  if (cell.state === CellState.Revealed && cell.adjacentMines > 0) {
    gameState = chord(gameState, row, col);

    if (gameState !== prev) {
      updateGrid(gameState.board, gameState.status);
      updateMineCounter(gameState.difficulty.mineCount, gameState.flagCount);
      updateSmiley(gameState.status);

      if (gameState.status === GameStatus.Won || gameState.status === GameStatus.Lost) {
        stopTimer();
      }
    }
    return;
  }

  gameState = toggleFlag(gameState, row, col);

  if (gameState !== prev) {
    updateGrid(gameState.board, gameState.status);
    updateMineCounter(gameState.difficulty.mineCount, gameState.flagCount);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  newGame();
  bindSmiley(() => newGame());

  // IPC handlers for menu actions
  if (window.minesweeper) {
    window.minesweeper.onNewGame(() => {
      newGame();
    });

    window.minesweeper.onSetDifficulty((difficulty: string) => {
      const dims = WINDOW_DIMENSIONS[difficulty];
      if (dims) {
        window.minesweeper.resizeWindow(dims.width, dims.height);
      }
      newGame(difficulty);
    });
  }
});
