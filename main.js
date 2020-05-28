'use strict';

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const url = require('url');
//const $ = require('jQuery')
const fs = require('fs');
const log = require('electron-log');

const sim = require('./src/sim/simulation');


log.transports.console.level = 'debug';
log.transports.file.level = 'debug';


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', init);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


/* Function declarations */

function init() {
    ipcListeners();
    createWindow();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 800,
        height: 600
    });

    // and load the index.html of the app.
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Open the DevTools.
    // win.webContents.openDevTools();

    // Maximize Browser Window
    win.maximize();

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });
}

function ipcListeners() {
    //Add event handler for upload functionality - listens to ipcRenderer from angular components
    ipcMain.on('uploadFile', () => {
        dialog.showOpenDialog({
            filters: [{
                name: 'All Files',
                extensions: ['trace']
            }]
        }, (fileNames) => {
            if (fileNames === undefined) return;

            let filePath  = fileNames[0];
            log.debug('filename:', filePath);
            let fileName = path.basename(fileNames[0]);
            win.webContents.send('fileNameReceived', fileName);
            fs.readFile(filePath, 'utf-8', (err, data) => {
                if (err) {
                    log.error('an error has occurred while reading the trace file:', err, '\nas a result we are not sending the trace file');
                    return;
                }
                win.webContents.send('fileDataReceived', data);
                log.debug('sending ipc to channel "fileDataReceived"');
            });
        });
    });

    ipcMain.on('simAction', (event, action) => {
        event.returnValue = sim[action]();
    });

    ipcMain.on('runSimulation', (event, data) => {
        log.verbose('running simulation....');
        sim.runSim(data);
    });
}
