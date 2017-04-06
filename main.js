// THIS IS AN EXAMPLE
const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')

const $ = require('jQuery');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

// Cache global variables
let numCacheLevels = 1;
let MAX_CACHE_LEVELS = 3;

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
function loadCacheLevels() {

}

function addCacheLevel(event) {
    // Prevents page from reloading when button is clicked
    event.preventDefault();

    // Declare all variables
    var i, tabcontent, tablinks;

    if (numCacheLevels < 3) {
        numCacheLevels++;
        tablinks = document.getElementsByClassName("tablinks");
        for (i=0; i < numCacheLevels; i++) {
            $(tablinks[i]).show()
        }
    }
}

function openCacheLevelParams(event, cacheLevel) {
    // Prevents page from reloading when button is clicked
    event.preventDefault();

    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // // Get all elements with class="tablinks" and remove the class "active"
    // tablinks = document.getElementsByClassName("tablinks");
    // for (i = 0; i < tablinks.length; i++) {
    //     tablinks[i].className = tablinks[i].className.replace(" active", "");
    // }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(cacheLevel).style.display = "block";
    // event.currentTarget.className += " active";
}
