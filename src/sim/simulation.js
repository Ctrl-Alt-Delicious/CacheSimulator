'use strict';
let stateMachine = require('./stateMachine');
let mockSim = require('./mockSim');

const ADDR_SIZE = 32;
const EXPONENTBASE = 1;
const OSBIT = 32;

let globalTimer = 1;

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

let configL1;
let configL2;
let configL3;


function simSetup () {
    numCacheLevels = 3;
    B = 5;
    cacheSettingsL1 = {
        C: 5,
        S: 0,
    };
    cacheSettingsL2 = {
        C: 6,
        S: 1,
    };
    cacheSettingsL3 = {
        C: 7,
        S: 2,
    };
}


function configureCache (cacheTable, C, B, S) {

    let indexSize = ADDR_SIZE - (C - B - S) - B;

    cacheTable = [];

    for (let i = 0; i < (1 << indexSize); i++) {
        let cacheEntry = {
            parsedAddr: {}, //contains tag, index, offset, and isWrite
            dirtyBit: 0,
            validBit: 0,
            age: 0
        };
        cacheTable.push(cacheEntry);
    }
}

function calcNextStep () {

}

function stepForward () {
    console.log('stepping forward', ++step);
    return step;
}


/**
 * Subroutine for initializing your cache with the passed in arguments.
 * You may initialize any globals you might need in this subroutine
 *
 * @param C1 The total size of the L1 cache is 2^C1 bytes
 * @param C2 The total size of the L2 cache is 2^C2 bytes
 * @param C3 The total size of the L3 cache is 2^C2 bytes
 * @param S The total number of blocks in a line/set of L2 cache is 2^S
 * @param B The size of the blocks is 2^B bytes
 */

function cacheInit(C1, C2, C3, S, B) {

    cacheInitLevel(configL1, C1, B, S);
    cacheInitLevel(configL2, C2, B, S);
    cacheInitLevel(configL3, C3, B, S);

}

function cacheInitLevel (config, C, B, S) {

    config.numBlocks = EXPONENTBASE<<(C-B);
    config.C2 = C;
    config.S = S;
    config.B = B;
    config.offsetSize = B;
    config.indexSize = C - S - B;
    config.tagSize = OSBIT - C + S;
    config.blockCapacity = EXPONENTBASE<<B;
}

/**
 * Subroutine that simulates one cache event at a time.
 * @param rw The type of access, READ or WRITE
 * @param address The address that is being accessed
 * @param stats The struct that you are supposed to store the stats in
 */
function cache_access (rw, address, stats) {

    stats.accesses++;

    let tagL1 = getTag(address, configL1.C1, configL1.B, 0);
    let indexL1 = getIndex(address, configL1.C1, configL1.B, 0);

    //stats
    if(rw === 'READ'){
        stats.reads++;
    } else{
        stats.writes++;
    }

    cacheTableL1[indexL1].lastAccess = globalTimer;
    if(cacheTableL1[indexL1].tag === tagL1 && cacheTableL1[indexL1].valid){
        if(rw === 'WRITE'){
            cacheTableL1[indexL1].dirty = 1;
        }

        //update L2 LRU
        let tagL2 = getTag(address, configL2.C2, configL2.B, configL2.S);
        let indexL2 = getIndex(address, configL2.C2, configL2.B, configL2.S);
        let setCapacity = (EXPONENTBASE<<(configL2.C2 - configL2.B - configL2.indexSize));
        let setOffset = indexL2 * setCapacity;
        for(let i = 0; i < setCapacity; i++){
            if(cacheTableL2[setOffset + i].tag === tagL2 && cacheTableL2[setOffset + i].valid){
                cacheTableL2[setOffset + i].lastAccess = globalTimer;
                break;
            }
        }

    } else{
        //stats
        if(rw === 'READ') {
            stats.read_misses++;
            stats.l1_read_misses++;
            stats.misses++;
        } else{
            stats.write_misses++;
            stats.l1_write_misses++;
            stats.misses++;
        }

        let tagL2 = getTag(address, configL2.C2, configL2.B, configL2.S);
        let indexL2 = getIndex(address, configL2.C2, configL2.B, configL2.S);
        let successL2 = false;
        let targetBlockL2 = -1;
        let targetBlockEvictL2 = -1;
        let setCapacity = (EXPONENTBASE<<(configL2.C2 - configL2.B - configL2.indexSize));
        let setOffset = indexL2 * setCapacity;
        let LRU = globalTimer;

        for(let i = 0; i < setCapacity; i++){
            if(cacheTableL2[setOffset + i].tag === tagL2 && cacheTableL2[setOffset + i].valid){
                successL2 = true;
                cacheTableL2[setOffset + i].lastAccess = globalTimer;
                if(cacheTableL1[indexL1].dirty && cacheTableL1[indexL1].valid){
                    //L1 writeback
                    let evictL2tag = convertTag(tagL1, indexL1, configL1.C1, configL2.C2, configL1.B, configL1.S);
                    let evictL2index;
                    for(let j = 0; j < setCapacity; j++){
                        if(cacheTableL2[setOffset + j].tag === evictL2tag){
                            evictL2index = j;
                            break;
                        }
                    }
                    cacheTableL2[evictL2index].dirty = 1;
                }
                cacheTableL1[indexL1].valid = 1;
                cacheTableL1[indexL1].dirty = 0;
                cacheTableL1[indexL1].tag = tagL1;

                //todo: successful l2 read
                if(rw === 'WRITE') {
                    cacheTableL1[indexL1].dirty = 1;
                }
                break;
            } else if(cacheTableL2[setOffset + i].valid === 0 && targetBlockL2 === -1){
                targetBlockL2 = setOffset + i;
            } else if(cacheTableL2[setOffset + i].lastAccess < LRU){
                targetBlockEvictL2 = setOffset + i;
                LRU = cacheTableL2[setOffset + i].lastAccess;
            }
        }
        if(!successL2){
            //stats
            if(rw === 'READ'){
                stats.read_misses++;
                stats.l2_read_misses++;
                stats.misses++;
            }else{
                stats.write_misses++;
                stats.l2_write_misses++;
                stats.misses++;
            }

            if(targetBlockL2 === -1){
                targetBlockL2 = targetBlockEvictL2;
                let targetTagL1 = convertIndexL1(tagL2, indexL2, configL1.C1, configL2.C2, configL2.B, configL2.S);
                let targetIndexL1 = convertTagL1(tagL2, indexL2, configL1.C1, configL2.C2, configL2.B, configL2.S);
                if(cacheTableL1[targetIndexL1].dirty && cacheTableL1[targetIndexL1].valid){
                    //L1 writeback
                    cacheTableL2[targetBlockL2].dirty = 1;
                    cacheTableL1[targetIndexL1].valid = 0;
                }
                if(cacheTableL2[targetBlockL2].dirty && cacheTableL2[targetBlockL2].valid){
                    //L2 writeback
                    stats.write_backs++;
                    cacheTableL2[targetBlockL2].valid = 0;
                }

            }
            cacheTableL2[targetBlockL2].lastAccess = globalTimer;
            cacheTableL2[targetBlockL2].valid = 1;
            cacheTableL2[targetBlockL2].tag = tagL2;
            cacheTableL2[targetBlockL2].index = indexL2;
            cacheTableL1[indexL1].valid = 1;
            cacheTableL1[indexL1].lastAccess = globalTimer;
            cacheTableL1[indexL1].tag = tagL1;
            cacheTableL1[indexL1].index = indexL1;
            if(rw === 'WRITE'){
                cacheTableL1[indexL1].dirty = 1;
            }

        }
    }

    globalTimer++;
}

function cacheFinalize (stats) {
    
    stats.missRateL1 = stats.readMissesL1 + stats.writeMissesL1/stats.accesses;
    stats.missRateL2 = stats.readMissesL2 + stats.writeMissesL2/stats.readMissesL1 + stats.writeMissesL1;
    stats.missRate = stats.misses/stats.accesses;
    stats.avgAccessTimeL2 = stats.accessTimeL2 + stats.missRateL2 * stats.memoryAccessTime;
    stats.avgAccessTime = stats.accessTimeL1 + stats.missRateL1 * stats.avgAccessTimeL2;

}

/**
 * Subroutine to compute the Tag of a given address based on the parameters passed in
 *
 * @param address The address whose tag is to be computed
 * @param C The size of the cache in bits (i.e. Size of cache is 2^C)
 * @param B The size of the cache block in bits (i.e. Size of block is 2^B)
 * @param S The set associativity of the cache in bits (i.e. Set-Associativity is 2^S)
 *
 * @return The computed tag
 */
function getTag (address, C, B, S) {
    let mask = (EXPONENTBASE << (OSBIT - C + S)) - 1;
    return (address >> (C - S)) & mask;
}

/**
 * Subroutine to compute the Index of a given address based on the parameters passed in
 *
 * @param address The address whose tag is to be computed
 * @param C The size of the cache in bits (i.e. Size of cache is 2^C)
 * @param B The size of the cache block in bits (i.e. Size of block is 2^B)
 * @param S The set associativity of the cache in bits (i.e. Set-Associativity is 2^S)
 *
 * @return The computed index
 */
function getIndex (address, C, B, S) {
    let mask = (EXPONENTBASE << (C - S - B)) - 1;
    return (address >> B) & mask;
}

/**
 * This function converts the tag stored in an L1 block and the index of that L1 block into corresponding
 * tag of the L2 block
 *
 * @param tag The tag that needs to be converted (i.e. L1 tag)
 * @param index The index of the L1 cache (i.e. The index from which the tag was found)
 * @param C1 The size of the L1 cache in bits
 * @param C2 The size of the l2 cache in bits
 * @param B The size of the block in bits
 * @param S The set associativity of the L2 cache
 */
function convertTag (tag, index, C1, C2, B, S) {
    let reconstructedAddress = (tag << (C1 - B)) | index;
    return reconstructedAddress >> (C2 - B - S);
}

/**
 * This function converts the tag stored in an L1 block and the index of that L1 block into corresponding
 * index of the L2 block
 *
 * @param tag The tag stored in the L1 index
 * @param index The index of the L1 cache (i.e. The index from which the tag was found)
 * @param C1 The size of the L1 cache in bits
 * @param C2 The size of the l2 cache in bits
 * @param B The size of the block in bits
 * @param S The set associativity of the L2 cache
 */
function convertIndex (tag, index, C1, C2, B, S) {
    let reconstructedAddress = (tag << (C1 - B)) | index;
    return reconstructedAddress & ((1 << (C2 - S - B)) - 1);
}

/**
 * This function converts the tag stored in an L2 block and the index of that L2 block into corresponding
 * tag of the L1 cache
 *
 * @param tagL2 The L2 tag
 * @param indexL2 The index of the L2 block
 * @param C1 The size of the L1 cache in bits
 * @param C2 The size of the l2 cache in bits
 * @param B The size of the block in bits
 * @param S The set associativity of the L2 cache
 * @return The L1 tag linked to the L2 index and tag
 */
function convertTagL1(tagL2, indexL2, C1, C2, B, S) {
    let reconstructed_address = (tagL2 << (C2 - B - S)) | indexL2;
    return reconstructed_address >> (C1 - B);
}

/**
 * This function converts the tag stored in an L2 block and the index of that L2 block into corresponding
 * index of the L1 block
 *
 * @param tagL2 The L2 tag
 * @param indexL2 The index of the L2 block
 * @param C1 The size of the L1 cache in bits
 * @param C2 The size of the l2 cache in bits
 * @param B The size of the block in bits
 * @param S The set associativity of the L2 cache
 * @return The L1 index of the L2 block
 */
function convertIndexL1(tagL2, indexL2, C1, C2, B, S) {
    let reconstructedAddress = (tagL2 << (C2 - B - S)) | indexL2;
    return reconstructedAddress & ((1 << (C1 - B)) - 1);
}


exports.stepForward = mockSim.mockStepForward;