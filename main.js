const { app, BrowserWindow, Tray, Menu, ipcMain, screen, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

let win;
let tray;
let isAlwaysOnTop = true;

function loadConfig() {
  try {
    const configPath = path.join(__dirname, 'config.json');
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch (e) {
    return { apiUrl: 'http://localhost:18789/v1/chat/completions', token: '', model: 'anthropic/claude-opus-4-6' };
  }
}

function createWindow() {
  const { width: screenW, height: screenH } = screen.getPrimaryDisplay().workAreaSize;

  win = new BrowserWindow({
    width: 500,
    height: 600,
    x: screenW - 520,
    y: screenH - 620,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: false,
    resizable: false,
    hasShadow: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.setIgnoreMouseEvents(true, { forward: true });
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Tray
  const trayIconPath = path.join(__dirname, 'assets', 'tray-icon.png');
  let trayIcon;
  if (fs.existsSync(trayIconPath)) {
    trayIcon = nativeImage.createFromPath(trayIconPath).resize({ width: 16, height: 16 });
  } else {
    // Create a simple 16x16 icon programmatically
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show/Hide', click: () => { win.isVisible() ? win.hide() : win.show(); } },
    { label: 'Clear Chat', click: () => { win.webContents.send('clear-chat'); } },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.quit(); } }
  ]);
  tray.setToolTip('OpenClippy');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => { win.isVisible() ? win.hide() : win.show(); });
}

// IPC handlers
ipcMain.on('set-ignore-mouse', (event, ignore) => {
  if (win) win.setIgnoreMouseEvents(ignore, { forward: true });
});

ipcMain.on('move-window', (event, { deltaX, deltaY }) => {
  if (win) {
    const [x, y] = win.getPosition();
    win.setPosition(x + deltaX, y + deltaY);
  }
});

ipcMain.on('toggle-always-on-top', () => {
  if (win) {
    isAlwaysOnTop = !isAlwaysOnTop;
    win.setAlwaysOnTop(isAlwaysOnTop);
  }
});

ipcMain.on('quit-app', () => { app.quit(); });

ipcMain.handle('get-config', () => loadConfig());

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { app.quit(); });
