import { DifficultyPreset } from './state';

export const DIFFICULTY: Record<string, DifficultyPreset> = {
  beginner: { name: 'Beginner', rows: 9, cols: 9, mineCount: 10 },
  intermediate: { name: 'Intermediate', rows: 16, cols: 16, mineCount: 40 },
  expert: { name: 'Expert', rows: 16, cols: 30, mineCount: 99 },
};

export const CELL_SIZE = 24;
export const TOOLBAR_HEIGHT = 52;
export const BORDER_PADDING = 20;

export const WINDOW_DIMENSIONS: Record<string, { width: number; height: number }> = {
  beginner: {
    width: DIFFICULTY.beginner.cols * CELL_SIZE + BORDER_PADDING,
    height: DIFFICULTY.beginner.rows * CELL_SIZE + TOOLBAR_HEIGHT + BORDER_PADDING,
  },
  intermediate: {
    width: DIFFICULTY.intermediate.cols * CELL_SIZE + BORDER_PADDING,
    height: DIFFICULTY.intermediate.rows * CELL_SIZE + TOOLBAR_HEIGHT + BORDER_PADDING,
  },
  expert: {
    width: DIFFICULTY.expert.cols * CELL_SIZE + BORDER_PADDING,
    height: DIFFICULTY.expert.rows * CELL_SIZE + TOOLBAR_HEIGHT + BORDER_PADDING,
  },
};

export const NUMBER_COLORS: Record<number, string> = {
  1: '#0000FF', // blue
  2: '#008000', // green
  3: '#FF0000', // red
  4: '#000080', // dark blue
  5: '#800000', // maroon
  6: '#008080', // teal
  7: '#000000', // black
  8: '#808080', // gray
};

export const MAX_TIMER = 999;
