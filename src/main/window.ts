import { CELL_SIZE, TOOLBAR_HEIGHT, BORDER_PADDING } from '../game/constants';

export function calculateWindowSize(rows: number, cols: number): { width: number; height: number } {
  return {
    width: cols * CELL_SIZE + BORDER_PADDING,
    height: rows * CELL_SIZE + TOOLBAR_HEIGHT + BORDER_PADDING,
  };
}
