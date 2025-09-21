const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    titleBarStyle: 'default',
    show: false
  });

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../build/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App event handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Menu setup
const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New Project',
        accelerator: 'CmdOrCtrl+N',
        click: () => {
          mainWindow.webContents.send('menu-new-project');
        }
      },
      {
        label: 'Open Project',
        accelerator: 'CmdOrCtrl+O',
        click: async () => {
          const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile'],
            filters: [
              { name: 'SkripsiMate Projects', extensions: ['skm'] },
              { name: 'All Files', extensions: ['*'] }
            ]
          });
          
          if (!result.canceled) {
            mainWindow.webContents.send('menu-open-project', result.filePaths[0]);
          }
        }
      },
      {
        label: 'Save Project',
        accelerator: 'CmdOrCtrl+S',
        click: () => {
          mainWindow.webContents.send('menu-save-project');
        }
      },
      { type: 'separator' },
      {
        label: 'Export',
        submenu: [
          {
            label: 'Export to PDF',
            click: () => {
              mainWindow.webContents.send('menu-export-pdf');
            }
          },
          {
            label: 'Export to Markdown',
            click: () => {
              mainWindow.webContents.send('menu-export-markdown');
            }
          },
          {
            label: 'Export to JSON',
            click: () => {
              mainWindow.webContents.send('menu-export-json');
            }
          }
        ]
      },
      { type: 'separator' },
      {
        role: 'quit'
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'close' }
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'About SkripsiMate',
        click: () => {
          dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'About SkripsiMate',
            message: 'SkripsiMate v1.0.0',
            detail: 'AI-powered thesis planning desktop application\n\nBuilt with Electron + React'
          });
        }
      },
      {
        label: 'GitHub Repository',
        click: () => {
          require('electron').shell.openExternal('https://github.com/XenchinRyu7/SkripsiMate');
        }
      }
    ]
  }
];

// Set application menu
const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

// IPC handlers for file operations
ipcMain.handle('save-file', async (event, data) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: 'SkripsiMate Projects', extensions: ['skm'] },
      { name: 'JSON Files', extensions: ['json'] }
    ]
  });
  
  if (!result.canceled) {
    const fs = require('fs');
    fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2));
    return result.filePath;
  }
  return null;
});

ipcMain.handle('open-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'SkripsiMate Projects', extensions: ['skm'] },
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  if (!result.canceled) {
    const fs = require('fs');
    const data = fs.readFileSync(result.filePaths[0], 'utf8');
    return { filePath: result.filePaths[0], data: JSON.parse(data) };
  }
  return null;
});
