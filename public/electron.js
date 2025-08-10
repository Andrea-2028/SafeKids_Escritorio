const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    icon: path.join(__dirname, 'public/logo.icon'), 
    webPreferences: {
      contextIsolation: true
    }
  });

  win.loadFile(path.join(__dirname, '../build/index.html'));
  win.webContents.openDevTools();

}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

