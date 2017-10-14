let stateMachine = require('./stateMachine');
'use strict';

const { ipcMain } = require('electron');

let i = 0;


function stepForward() {
    console.log("stepping forward", ++i);
}

exports.stepForward = stepForward;
