const CONFIG = 0;
const SIMULATING = 1;

let state = CONFIG;

exports.configuring = () => state === CONFIG;
exports.simulating = () => state === SIMULATING;
exports.changeState = () => state = state++ % 1;
