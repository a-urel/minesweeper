import { Cell, CellState, GameStatus } from '../game/state';

const MINE_SYMBOL = '💣';
const FLAG_SYMBOL = '🚩';

export function createGrid(
  rows: number,
  cols: number,
  onLeftClick: (row: number, col: number) => void,
  onRightClick: (row: number, col: number) => void,
): HTMLElement {
  const container = document.getElementById('grid-container')!;
  container.innerHTML = '';
  container.style.gridTemplateColumns = `repeat(${cols}, 24px)`;
  container.style.gridTemplateRows = `repeat(${rows}, 24px)`;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const el = document.createElement('div');
      el.className = 'cell';
      el.dataset.row = String(r);
      el.dataset.col = String(c);
      el.addEventListener('click', () => onLeftClick(r, c));
      el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        onRightClick(r, c);
      });
      container.appendChild(el);
    }
  }
  return container;
}

export function updateGrid(
  board: Cell[][],
  status: GameStatus,
  triggeredRow?: number,
  triggeredCol?: number,
): void {
  const container = document.getElementById('grid-container')!;
  const cells = container.children;
  const cols = board[0].length;

  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = board[r][c];
      const el = cells[r * cols + c] as HTMLElement;
      el.className = 'cell';
      el.textContent = '';

      if (cell.state === CellState.Revealed) {
        el.classList.add('revealed');
        if (cell.hasMine) {
          el.textContent = MINE_SYMBOL;
          if (r === triggeredRow && c === triggeredCol) {
            el.classList.add('mine-triggered');
          } else {
            el.classList.add('mine');
          }
        } else if (cell.adjacentMines > 0) {
          el.textContent = String(cell.adjacentMines);
          el.classList.add(`number-${cell.adjacentMines}`);
        }
      } else if (cell.state === CellState.Flagged) {
        el.classList.add('flagged');
        el.textContent = FLAG_SYMBOL;

        // On loss, show incorrect flags
        if (status === GameStatus.Lost && !cell.hasMine) {
          el.classList.add('mine-incorrect');
          el.textContent = '❌';
        }
      } else {
        // Hidden cells
        if (status === GameStatus.Lost && cell.hasMine) {
          el.classList.add('revealed', 'mine');
          el.textContent = MINE_SYMBOL;
        } else if (status === GameStatus.Won && cell.hasMine) {
          el.classList.add('flagged');
          el.textContent = FLAG_SYMBOL;
        }
      }
    }
  }
}
