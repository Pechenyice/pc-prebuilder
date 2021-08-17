// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, Menu} = require('electron')
const electron = require("electron")
const path = require('path')
const fs = require('fs');

const execFile = require('child_process').execFile;

/**
 * Function to execute exe
 * @param {string} filename The name of the executable file to run.
 * @param {string[]} params List of string arguments.
 * @param {string} path Current working directory of the child process.
 */
function execute(filename, params, path) {
  execFile(filename, params, (error, stdout, stderr) => {
    if (error) {
      throw error;
    }
  });
}

electron.app.setLoginItemSettings({
  openAtLogin: true,
  // path: electron.app.getPath("exe")
});

console.log(path.basename(process.execPath));

let menuTemplate = [];

let prefabs = [];
if (fs.existsSync('prefabs.json')) {
  let rawdata = fs.readFileSync('prefabs.json');
  prefabs = JSON.parse(rawdata);
}

// console.log(prefabs);

// execute('C:\\Program Files (x86)\\Steam\\steam.exe');

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    show: false,
    // titleBarStyle: "hidden",
    // frame: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.maximize();

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  ipcMain.on('prefabReady', (event, data) => {
    console.log(data)
    let response = data;
    let info = JSON.parse(data);
    for (let elem of prefabs) {
      if (elem.data.name == info.name) response = {error: true, comment: 'Prefab with this name already exists'};
    }
    if (response == data) {
      prefabs.push({number: prefabs.length + 1, data: info});
      fs.writeFileSync('prefabs.json', JSON.stringify(prefabs));
      response = {number: prefabs.length, data: JSON.parse(response)};
    }
    
    mainWindow.webContents.send('createPrefabSignal', JSON.stringify(response));
  });

  ipcMain.on('onInit', (event, data) => {
    for (let elem of prefabs) {
      mainWindow.webContents.send('createPrefabSignal', JSON.stringify(elem));
    }
  });

  ipcMain.on('loadPrefab', (event, data) => {
    let info = JSON.parse(data);
    for (let elem of prefabs) {
      if (elem.number == info.number) {
        for (let item of elem.data.items) {
          try{
            execute(item.path);
          } catch(e) {
            console.log(e);
          }
        }
        mainWindow.webContents.send('prefabLoaded', JSON.stringify({}));
        return;
      }
    }
  });
 
  let menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
