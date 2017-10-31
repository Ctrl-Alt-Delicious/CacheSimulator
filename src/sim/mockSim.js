function instruction(address, action) {
    return {
        address: address,
        action: action,
    };
}

/*
    a list of steps where each step contains a list of instructions
 */
let mockInstructions = [
    instruction('0xffffff', 'add'),
    instruction('0xfffffff0', 'add'),
    instruction('0xffffff00', 'add'),
    instruction('0xffffffff', 'remove'),
    instruction('0xffffff00', 'remove'),
];

// This is a generator. Yield is similar to return but it hangs after returning, the next time it is called the execution
// continues and it increments i (modding to the length) and then yields again.
// the star next to the function name declares this function as a generator
function *nextInstructionGen() {
    let i = 0;

    while (true) {
        yield mockInstructions[i];
        i = (i + 1) % mockInstructions.length;
    }
}

let gen = nextInstructionGen();

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
