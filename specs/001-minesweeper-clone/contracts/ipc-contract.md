# IPC Contract: Main ↔ Renderer

**Feature**: 001-minesweeper-clone
**Date**: 2026-03-22

## Overview

Electron IPC channels between the main process (window management, menus) and the renderer process (game logic, UI). Game logic runs entirely in the renderer; the main process only handles window sizing and menu actions.

## Channels: Main → Renderer

### `game:new-game`

Triggered when the user selects "New Game" from the application menu or presses the keyboard shortcut.

**Payload**: none
**Renderer action**: Reset the game state to Idle with current difficulty, clear the board, reset timer to 0.

### `game:set-difficulty`

Triggered when the user selects a difficulty level from the application menu.

**Payload**:
```typescript
{
  difficulty: 'beginner' | 'intermediate' | 'expert'
}
```

**Renderer action**: Update the difficulty preset, reset the game to Idle with new board dimensions, notify main process to resize window.

## Channels: Renderer → Main

### `window:resize`

Triggered when the renderer needs the window to resize (e.g., after difficulty change).

**Payload**:
```typescript
{
  width: number   // desired window width in pixels
  height: number  // desired window height in pixels
}
```

**Main action**: Resize the BrowserWindow to the specified dimensions. Window remains non-resizable.

## Menu Structure

```
Game
├── New Game          (F2)
├── ─────────────────
├── Beginner          (radio, default checked)
├── Intermediate      (radio)
├── Expert            (radio)
├── ─────────────────
└── Exit              (Alt+F4 / Cmd+Q)
```
