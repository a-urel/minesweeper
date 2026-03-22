import { GameStatus } from '../game/state';

export function updateMineCounter(mineCount: number, flagCount: number): void {
  const display = document.getElementById('mine-counter')!;
  const value = mineCount - flagCount;
  setLedDisplay(display, value);
}

export function updateTimerDisplay(seconds: number): void {
  const display = document.getElementById('timer')!;
  setLedDisplay(display, Math.min(seconds, 999));
}

export function updateSmiley(status: GameStatus): void {
  const button = document.getElementById('smiley-button')!;
  switch (status) {
    case GameStatus.Lost:
      button.textContent = '😵';
      break;
    case GameStatus.Won:
      button.textContent = '😎';
      break;
    default:
      button.textContent = '🙂';
      break;
  }
}

export function bindSmiley(onRestart: () => void): void {
  const button = document.getElementById('smiley-button')!;
  button.addEventListener('click', onRestart);
}

function setLedDisplay(container: HTMLElement, value: number): void {
  const digits = container.querySelectorAll('.digit');
  const clamped = Math.max(-99, Math.min(999, value));
  const isNegative = clamped < 0;
  const absStr = String(Math.abs(clamped)).padStart(isNegative ? 2 : 3, '0');
  const display = isNegative ? '-' + absStr : absStr;

  for (let i = 0; i < 3; i++) {
    digits[i].textContent = display[i] || '0';
  }
}
