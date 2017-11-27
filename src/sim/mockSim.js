const { parseAddress }= require('../common/addressParser');

let B, mockActions, cache;

function initSim(data) {
    B = data.B;
    cache = data.caches[0];
    mockActions = [];
}

function mockRunSim(data) {
    initSim(data);
    mockActions = [[action(cache, '0x99baddad', 0, 0, 0)], [action(cache, '0x99090000', 0, 0, 0)], [action(cache, '0x43443493', 0, 0, 0)],
        [action(cache, '0x44983433', 0, 0, 0)], [action(cache, '0x43bdaaaa', 0, 0, 0)], [action(cache, '0x5520ffff', 0, 0, 0)],
        [action(cache, '0xffffffff', 0, 0, 0)], [action(cache, '0xdeaddead', 0, 0, 0)], [action(cache, '0x77777777', 0, 0, 0)], 
        [action(cache, '0x10000000', 0, 0, 0)], [action(cache, '0x00000099', 0, 0, 0)]];
    console.log(mockActions);
}

function action(cache, address, way, valid, dirty) {
    let addressBreakdown = parseAddress(address, cache.C, cache.S, B);
    let index = addressBreakdown.index.toString(10);
    let tag = addressBreakdown.tag.toString(16);
    return {
        level: cache.title,
        way: way,
        // need to know B
        block: block(address, B),
        index: index,
        tag: tag,
        valid: valid,
        dirty: dirty,
    };
}

function block(initAddress, B) {
    let blockSize = Math.pow(2, B);
    let address = parseInt(initAddress, 16);
    address -= address % blockSize;
    let block = [];

    for (let i = 0; i < blockSize; i++, address++) {
        block.push(address.toString(16));
    }
    return block;
}


// This is a generator. Yield is similar to return but it hangs after returning, the next time it is called the execution
// continues and it increments i (modding to the length) and then yields again.
// the star next to the function name declares this function as a generator
function *nextActionGen() {
    let i = 0;
    while (true) {
        yield mockActions[i];
        i = (i + 1) % mockActions.length;
    }
}

let gen = nextActionGen();

exports.mockStepForward = () => {
    return gen.next().value;
};

exports.mockStepBackward = () => {
    return 'stepping back';
};

exports.mockPlay = () => {
    return 'playing';
};

exports.mockPause = () => {
    return 'pausing';
};

exports.mockReset = () => {
    return 'reset';
};

exports.mockRunSim = mockRunSim;
