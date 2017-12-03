'use strict';

const { ipcRenderer } = require('electron');

angular.module('Simulator').component('cacheInput', {
    templateUrl: 'src/browser/cacheInput.html',
    //add any dependencies below
    controller: ['$scope', 'SimDriver', 'FileParser', CacheInputController],
    bindings: {}
});


/*
 * This controller is responsible for everything that happens in the "cache input" component, or the sidebar, in the main
 * display of the application. This is where the user sets all the parameters for the cache configuration, uploads their 
 * trace file, and runs the simulation. The contents of the trace file are displayed as a table called the "Memory Access Queue",
 * or MAQ. Once the simulation has been triggered, the user controls the flow of the simulation using buttons that trigger actions,
 * namely play, pause, step forward, step backward, and reset.
 */
function CacheInputController($scope, simDriver, fileParser) {

    let ctrl = this;

    // flags for hiding/displaying elements
    ctrl.hideSidebar = false;
    ctrl.hideRunSimButton = true;
    ctrl.hideControlButtons = true;
    ctrl.hideMAQ = true;

    ctrl.simPlaying = 0;  // this is an int set by the window.setInterval method when the sim is playing

    ctrl.cacheInfo = $scope.$parent.initialCacheInfo;
    ctrl.currentMemQueueIndex = 0;
    ctrl.currentMemQueue = null;
    ctrl.speedRating = 1;  // set by the value of the speed slider

    let B_min = 3, B_max = 7;

    ctrl.hideSideBar = function() {
        ctrl.hideSidebar = true;
        let maq = document.getElementById('maq');
        maq.style.height = '420px';
    };

    ctrl.showSideBar = function() {
        ctrl.hideSidebar = false;
        let maq = document.getElementById('maq');
        maq.style.height = '150px';
    };

    ctrl.addCache = function() {
        let caches = ctrl.cacheInfo.caches;
        if (caches.length < 3) {
            caches.push({
                title: 'L' + (caches.length + 1),
                size: 'Not Set',
                associativity: 'Not Set',
                active: true,
                C: 10,
                S: 0    
            });
        }
        ctrl.cacheInfo.caches = caches;
        if (caches.length > 1) {
            ctrl.cacheInfo.disableDeleteCache = false;
        }
        //Emit sends an event to the parent controller/component
        $scope.$emit('inputUpdateCanvas', ctrl.cacheInfo);
        $scope.$emit('updateCacheInfo', ctrl.cacheInfo);
    };

    ctrl.handleUpload = () => {
        ipcRenderer.send('uploadFile');
    };

    let setCacheSize = function(index) {
        ctrl.cacheInfo.caches[index].C = Math.log(ctrl.cacheInfo.caches[index].cacheSize) / Math.log(2);

        // Only changing the first cache since we are guaranteed one
        // Two have default config for multiple caches would mean rewriting the add cache button
        // something I dnt want to do for this PR
        if (index === 0) {
            settingsStore.setCacheValue(index, 'C', ctrl.cacheInfo.caches[index].C);
        }

        setAssocOptions(index);
        $scope.$emit('updateCacheInfo', ctrl.cacheInfo);
    };

    let setAssociativity = function(index, item) {
        let assoc = parseInt(item);
        if (assoc === 1) {
            ctrl.cacheInfo.caches[index].S = 0;
        } else {
            ctrl.cacheInfo.caches[index].S = Math.log(assoc) / Math.log(2);
        }

        // Only changing the first cache since we are guaranteed one
        // Two have default config for multiple caches would mean rewriting the add cache button
        // something I dnt want to do for this PR
        if (index === 0) {
            settingsStore.setCacheValue(index, 'S', ctrl.cacheInfo.caches[index].S);
        }

        $scope.$emit('updateCacheInfo', ctrl.cacheInfo);
    };

    ctrl.setBlockSize = () => {
        let blockSize = ctrl.cacheInfo.blockSize;
        ctrl.cacheInfo.B = Math.log(blockSize) / Math.log(2);
        setCacheSizeOptions();
        ctrl.cacheInfo.blockSizeSet = true;

        settingsStore.set('B', ctrl.cacheInfo.B);

        $scope.$emit('updateCacheInfo', ctrl.cacheInfo);
    };

    ctrl.setPolicy = () => {
        ctrl.cacheInfo.policySet = true;

        settingsStore.set('policy', ctrl.cacheInfo.policy);

        $scope.$emit('updateCacheInfo', ctrl.cacheInfo);
    };


    ipcRenderer.on('fileNameReceived', (err, fileName) => {
        $scope.$parent.fileName = fileName;
        ctrl.fileName = fileName;
        ctrl.cacheInfo.fileName = fileName;
        $scope.$emit('updateCacheInfo', ctrl.cacheInfo);
        //This forces the angular rendering lifecycle to update the value
        $scope.$digest();
    });

    //subscribe to fileParser notifications when file is parsed
    fileParser.subscribe($scope, () => {
        //ask for new mem traces in queue
        $scope.$parent.memQueue = simDriver.getMemAcceses();
    });

    ipcRenderer.on('fileDataReceived', (e, fData) => {
        fileParser.parseFile(fData);
        ctrl.hideRunSimButton = false;
        //This forces the angular rendering lifecycle to update the value
        $scope.$digest();

    });

    $scope.updateCache = function(value, cacheNum, attribute) {
        let cache = ctrl.cacheInfo.caches[cacheNum];
        if (attribute === 'size') {
            cache.cacheSize = value;
            setCacheSize(cacheNum);
        } else if (attribute === 'associativity') {
            cache.associativity = value;
            setAssociativity(cacheNum, value);
        }
        ctrl.cacheInfo.caches[cacheNum] = cache;

        $scope.$emit('inputUpdateCanvas', ctrl.cacheInfo);
        $scope.$emit('updateCacheInfo', ctrl.cacheInfo);
    };
    
    for (let i = B_min; i <= B_max; i++) {
        ctrl.cacheInfo.blockSizes.push(Math.pow(2, i));
    }
    $scope.$emit('inputUpdateCanvas', ctrl.cacheInfo);
    $scope.$emit('updateCacheInfo', ctrl.cacheInfo);

    let setCacheSizeOptions = function() {

        let C_min = ctrl.cacheInfo.B;
        let C_max = 11;

        ctrl.cacheInfo.cacheSizes = [];
        for (let i = C_min; i <= C_max; i++) {
            ctrl.cacheInfo.cacheSizes.push(Math.pow(2, i));
        }
    };

    let setC = function(C, cacheNum) {
        let size = Math.pow(2, C);
        $scope.updateCache(size, cacheNum, 'size');
    };

    let setS = function(S, cacheNum) {
        let assoc = Math.pow(2, S);
        $scope.updateCache(assoc, cacheNum, 'associativity');
    };

    let setAssocOptions = function(index) {
        let caches = ctrl.cacheInfo.caches;

        let C = caches[index].C;
        let B = ctrl.cacheInfo.B;

        let S_min = 0;
        let S_max = C - B;

        caches[index].associativities = [];
        for (let i = S_min; i <= S_max; i++) {
            caches[index].associativities.push(Math.pow(2, i));
        }
        ctrl.cacheInfo.caches = caches;
    };

    function init() {
        /**
         * We call these functions to set up all the default values
         */
        ctrl.setPolicy();
        ctrl.setBlockSize();
        setC(ctrl.cacheInfo.caches[0].C, 0);
        setS(ctrl.cacheInfo.caches[0].S, 0);

    }

    $scope.selectedRow = null;
    $scope.setClickedRow = function(index){  //function that sets the value of selectedRow to current index
        $scope.selectedRow = index;
    };

    $scope.$on('cacheInfoUpdated', function(event, data) {
        ctrl.cacheInfo = data;
    });

    ctrl.runSimulation = function() {
        ipcRenderer.send('runSimulation', ctrl.cacheInfo);
        ctrl.hideControlButtons = false;
        document.getElementById('upload-button').disabled = 'disabled';
    };

    ctrl.stepForward = function() {
        let step = ipcRenderer.sendSync('simAction', 'stepForward');
        console.log('stepForward return value:', step);
        $scope.$emit('step', step);
        // Increment memory address queue index
        if (ctrl.currentMemQueueIndex < $scope.$parent.memQueue.length - 1) {
            ctrl.currentMemQueueIndex++;
        } else {
            window.clearInterval(ctrl.simPlaying);  // stop sim if necessary
        }
        ctrl.updateCurrentMemQueue();
        $scope.$digest();  // this is needed to have the render update when the sim is playing
    };

    ctrl.stepBackward = function() {
        console.log('stepBackward return value:', ipcRenderer.sendSync('simAction', 'stepBackward'));
        // Decrement memory address queue index
        if (ctrl.currentMemQueueIndex > 0) {
            ctrl.currentMemQueueIndex--;
        }
        window.clearInterval(ctrl.simPlaying);  // stop sim if necessary
        ctrl.updateCurrentMemQueue();
    };

    ctrl.pauseSimulation = function() {
        console.log('pauseSimulation return value:', ipcRenderer.sendSync('simAction', 'pause'));
        window.clearInterval(ctrl.simPlaying);  // stop sim if necessary
        // Send this to parent controller for the policy & block size labels
        $scope.$emit('updateParamLabels', ctrl.hideMAQ);
    };

    ctrl.playSimulation = function() {
        console.log('runSimulation return value:', ipcRenderer.sendSync('simAction', 'play'));
        ctrl.hideRunSimButton = true;
        ctrl.hideMAQ = false;

        // Send this to parent controller for the policy & block size labels
        $scope.$emit('updateParamLabels', ctrl.hideMAQ);

        // This sends repeated calls to stepForward to "play" the simulation
        // Use window.clearInterval(ctrl.simPlaying) to stop it
        let timeInterval = (1.0 / parseFloat(ctrl.speedRating)) * 1000;  // time in ms
        ctrl.simPlaying = window.setInterval(ctrl.stepForward, timeInterval);
    };

    ctrl.resetSimulation = function() {
        console.log('resetSimulation return value:', ipcRenderer.sendSync('simAction', 'reset'));
        ctrl.currentMemQueueIndex = 0;
        ctrl.hideMAQ = true;
        window.clearInterval(ctrl.simPlaying);  // stop sim if necessary
        document.getElementById('upload-button').disabled = null; // enable upload button
        ctrl.updateCurrentMemQueue();
    };

    // Sets the current address/action in the memory access queue based on index
    ctrl.updateCurrentMemQueue = function() {
        ctrl.currentMemQueue = $scope.$parent.memQueue[ctrl.currentMemQueueIndex];
        $scope.$emit('currentInstruction', ctrl.currentMemQueue);
    };

    init();
}
