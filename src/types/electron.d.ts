declare global {
  interface Window {
    electronAPI: {
      getAppVersion: () => Promise<string>
      showSaveDialog: (options: any) => Promise<any>
      showOpenDialog: (options: any) => Promise<any>
      openExternal: (url: string) => Promise<void>
      windowMinimize: () => Promise<void>
      windowMaximize: () => Promise<void>
      windowClose: () => Promise<void>
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

export {}
