const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setIgnoreMouse: (ignore) => ipcRenderer.send('set-ignore-mouse', ignore),
  moveWindow: (deltaX, deltaY) => ipcRenderer.send('move-window', { deltaX, deltaY }),
  toggleAlwaysOnTop: () => ipcRenderer.send('toggle-always-on-top'),
  clearChat: (cb) => ipcRenderer.on('clear-chat', cb),
  quitApp: () => ipcRenderer.send('quit-app'),
  getConfig: () => ipcRenderer.invoke('get-config')
});
