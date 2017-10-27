'use strict';
let stateMachine = require('./stateMachine');
let mockSim = require('./mockSim');

const ADDR_SIZE = 32;

let step = 0;

let numCacheLevels;
let B;

let cacheSettingsL1;
let cacheSettingsL2;
let cacheSettingsL3;

let cacheTableL1;
let cacheTableL2;
let cacheTableL3;

let cacheHistoryL1 = [];
let cacheHistoryL2 = [];
let cacheHistoryL3 = [];

function simSetup() {
    numCacheLevels = 3;
    B = 5;
    cacheSettingsL1 = {
        C : 5,
        S : 0,
    };
    cacheSettingsL2 = {
        C : 6,
        S : 1,
    };
    cacheSettingsL3 = {
        C : 7,
        S : 2,
    };
}

function cacheInit() {
    //call configure cache on each cache level
    configureCache(cacheTableL1);
}

function configureCache(cacheTable, C, B, S) {

    let indexSize = ADDR_SIZE - (C - B - S) - B;

    cacheTable = [];

    for (let i = 0; i < (1 << indexSize); i++) {
        let cacheEntry = {
            parsedAddr : {}, //contains tag, index, offset, and isWrite
            dirtyBit   : 0,
            validBit   : 0,
            age        : 0
        };
        cacheTable.push(cacheEntry);
    }
}

function calcNextStep() {

}


function stepForward() {
    console.log('stepping forward', ++step);
    return step;
}

exports.stepForward = mockSim.mockStepForward;