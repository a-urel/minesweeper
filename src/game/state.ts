export enum CellState {
  Hidden = 'hidden',
  Revealed = 'revealed',
  Flagged = 'flagged',
}

export enum GameStatus {
  Idle = 'idle',
  Playing = 'playing',
  Won = 'won',
  Lost = 'lost',
}

export interface Cell {
  row: number;
  col: number;
  hasMine: boolean;
  adjacentMines: number;
  state: CellState;
}

export interface DifficultyPreset {
  name: string;
  rows: number;
  cols: number;
  mineCount: number;
}

export interface GameState {
  board: Cell[][];
  difficulty: DifficultyPreset;
  status: GameStatus;
  minesPlaced: boolean;
  flagCount: number;
  elapsedTime: number;
  revealedCount: number;
}
