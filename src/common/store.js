const electron = require('electron');
const path = require('path');
const fs = require('fs');

const defaultConfig = require('./default-config.json');

class Store {
    /**
     * constructs data and file path for some user data that is saved to an OS specific place save from any updates
     * and changes to the source code of the app
     * @param options JSON settings particular to the user
     */
    constructor(options) {
        // Renderer process has to get `app` module via `remote`, whereas the main process can get it directly
        // app.getPath('userData') will return a string of the user's app data directory path.
        // I believe that using `remote` means that even though we are a remote process we are still referencing the
        // same instance of the useDataPath. So changing it here and changing it in main or another process means that
        // one object is ultimately changing
        const userDataPath = (electron.app || electron.remote.app).getPath('userData');

        // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
        this.path = path.join(userDataPath, options.configName + '.json');

        this.data = parseDataFile(this.path, options.defaults);
    }

    /**
     * Returns some data
     * @param key
     * @returns {*}
     */
    get(key) {
        return this.data[key];
    }

    /**
     * returns True if the key is in the data
     * @param key
     * @returns {boolean} if data has key
     */
    has(key) {
        return this.data.hasOwnProperty(key);
    }

    /**
     * Sets some data then saves to the file
     * @param key
     * @param value
     */
    set(key, value) {
        this.data[key] = value;
        fs.writeFileSync(this.path, JSON.stringify(this.data));
    }

    /**
     * Sets all the data at once, this saves time for file I/O since without this one would
     * write to the file per key
     * @param data
     */
    setAll(data) {
        this.data = data;
        fs.writeFileSync(this.path, JSON.stringify(this.data));
    }

    /**
     * updates the local data structure based on the data in this Store object
     * @param localData compatible data structure that is a superset of the Store object's data
     */
    updateLocalFromStore(localData) {
        console.log('updating');
        this._dataWalk(localData, this.data);
    }

    /**
     * recursively tracerses store data and checks if the key is in both the local and stored data set
     * @param localData
     * @param storeData
     * @private
     */
    _dataWalk(localData, storeData){
        for (let key in storeData) {
            if (storeData.hasOwnProperty(key)) {
                let value = storeData[key];
                console.log('key', key, 'value', value);
                this._dataWalk(value);
            }
        }
    }
}

function parseDataFile(filePath, defaults) {
    // We'll try/catch it in case the file doesn't exist yet, which will be the case on the first application run.
    // `fs.readFileSync` will return a JSON string which we then parse into a Javascript object
    try {
        return JSON.parse(fs.readFileSync(filePath));
    } catch(error) {
        // if there was some kind of error (such as the file not existing), return the passed in defaults instead.
        return defaults;
    }
}

const settingsStore = new Store({
    configName: 'user-config',
    defaults: defaultConfig
});

module.exports.Store = Store;
module.exports.settingsStore = settingsStore;
