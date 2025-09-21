const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  saveFile: (data) => ipcRenderer.invoke('save-file', data),
  openFile: () => ipcRenderer.invoke('open-file'),
  
  // Menu events
  onMenuNewProject: (callback) => ipcRenderer.on('menu-new-project', callback),
  onMenuOpenProject: (callback) => ipcRenderer.on('menu-open-project', callback),
  onMenuSaveProject: (callback) => ipcRenderer.on('menu-save-project', callback),
  onMenuExportPDF: (callback) => ipcRenderer.on('menu-export-pdf', callback),
  onMenuExportMarkdown: (callback) => ipcRenderer.on('menu-export-markdown', callback),
  onMenuExportJSON: (callback) => ipcRenderer.on('menu-export-json', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
