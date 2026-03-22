import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('minesweeper', {
  onNewGame: (callback: () => void) => {
    ipcRenderer.on('game:new-game', () => callback());
  },
  onSetDifficulty: (callback: (difficulty: string) => void) => {
    ipcRenderer.on('game:set-difficulty', (_event, difficulty: string) => callback(difficulty));
  },
  resizeWindow: (width: number, height: number) => {
    ipcRenderer.send('window:resize', { width, height });
  },
});
