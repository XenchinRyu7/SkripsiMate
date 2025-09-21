import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // File dialogs
  showSaveDialog: (options: any) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options: any) => ipcRenderer.invoke('show-open-dialog', options),
  
  // External links
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  
  
  // Menu events
  onMenuNewProject: (callback: () => void) => {
    ipcRenderer.on('menu-new-project', callback)
  },
  onMenuOpenProject: (callback: (filePath: string) => void) => {
    ipcRenderer.on('menu-open-project', (event, filePath) => callback(filePath))
  },
  onMenuSaveProject: (callback: () => void) => {
    ipcRenderer.on('menu-save-project', callback)
  },
  onMenuSaveProjectAs: (callback: (filePath: string) => void) => {
    ipcRenderer.on('menu-save-project-as', (event, filePath) => callback(filePath))
  },
  onMenuExportPdf: (callback: () => void) => {
    ipcRenderer.on('menu-export-pdf', callback)
  },
  onMenuExportMarkdown: (callback: () => void) => {
    ipcRenderer.on('menu-export-markdown', callback)
  },
  onMenuExportJson: (callback: () => void) => {
    ipcRenderer.on('menu-export-json', callback)
  },
  onMenuOpenSettings: (callback: () => void) => {
    ipcRenderer.on('menu-open-settings', callback)
  },
  
  // Remove listeners
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel)
  }
})

// Type definitions for the exposed API
declare global {
  interface Window {
    electronAPI: {
      getAppVersion: () => Promise<string>
      showSaveDialog: (options: any) => Promise<any>
      showOpenDialog: (options: any) => Promise<any>
      openExternal: (url: string) => Promise<void>
      onMenuNewProject: (callback: () => void) => void
      onMenuOpenProject: (callback: (filePath: string) => void) => void
      onMenuSaveProject: (callback: () => void) => void
      onMenuSaveProjectAs: (callback: (filePath: string) => void) => void
      onMenuExportPdf: (callback: () => void) => void
      onMenuExportMarkdown: (callback: () => void) => void
      onMenuExportJson: (callback: () => void) => void
      onMenuOpenSettings: (callback: () => void) => void
      removeAllListeners: (channel: string) => void
    }
  }
}
