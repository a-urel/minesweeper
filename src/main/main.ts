import { app, BrowserWindow, Menu, ipcMain } from 'electron';
import { WINDOW_DIMENSIONS } from '../game/constants';
// window.ts provides calculateWindowSize for dynamic sizing (used in future enhancements)

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let mainWindow: BrowserWindow | null = null;

const createWindow = (): void => {
  const { width, height } = WINDOW_DIMENSIONS.beginner;

  mainWindow = new BrowserWindow({
    width,
    height,
    resizable: false,
    useContentSize: true,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  buildMenu();
};

function buildMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Game',
      submenu: [
        {
          label: 'New Game',
          accelerator: 'F2',
          click: () => mainWindow?.webContents.send('game:new-game'),
        },
        { type: 'separator' },
        {
          label: 'Beginner',
          type: 'radio',
          checked: true,
          click: () => mainWindow?.webContents.send('game:set-difficulty', 'beginner'),
        },
        {
          label: 'Intermediate',
          type: 'radio',
          click: () => mainWindow?.webContents.send('game:set-difficulty', 'intermediate'),
        },
        {
          label: 'Expert',
          type: 'radio',
          click: () => mainWindow?.webContents.send('game:set-difficulty', 'expert'),
        },
        { type: 'separator' },
        { label: 'Exit', role: 'quit' },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// Handle window resize requests from renderer
ipcMain.on('window:resize', (_event, payload: { width: number; height: number }) => {
  if (mainWindow) {
    mainWindow.setContentSize(payload.width, payload.height);
  }
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
