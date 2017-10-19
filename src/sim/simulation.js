'use strict';
let stateMachine = require('./stateMachine');

const ADDR_SIZE = 32;

let i = 0;

let cacheTableL1;
let cacheTableL2;
let cacheTableL3;

function cahceInit() {
    //call configure cache on each cache level
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


function stepForward() {
    console.log('stepping forward', ++i);
    return i;
}

exports.stepForward = stepForward;