const addressSize = 32;

/**
 * Parses a line from the trace file and returns an object with the full address, tag, index, and offset
 * @param line
 * @param C
 * @param S
 * @param B
 * @returns {{address: Number, tag: number, index: number, offset: number}}
 */
exports.parseAddress = (line, C, S, B) => {
    let address = parseInt(line, 16);
    return {
        address: address,
        tag: pad(getTag(address, C, S), 32-C+S),
        index: pad(getIndex(address, C, S, B), C-S-B),
        offset: pad(getOffset(address, B), B),
    };
};

/**
 * Returns the lower B bits of address
 * @param address
 * @param B
 * @returns number offset
 */
function getOffset(address, B) {
    return address & mask(B);
}

/**
 * returns the bits between C - S and B (inclusively)
 * @param address
 * @param C
 * @param S
 * @param B
 * @returns {number}
 */
function getIndex(address, C, S, B) {
    return (address >> B - 1) & mask(C - S - B);
}

/**
 * Creates a mask of n bits
 * 2^n - 1
 * Ex: n = 3; the desired output is 000111 or 0x3
 * 2^3 = 1000 or 8. 8 - 1 = 7 or 111
 * @param n
 * @returns number with the lower n bits on and the rest off
 */
function mask(n) {
    return Math.pow(2, n) - 1;
}

/**
 * returns the remaining 31 - C - S bits
 * @param address
 * @param C
 * @param S
 * @returns {number}
 */
function getTag(address, C, S) {
    return (address >> C - S) & mask(addressSize - 1 - C - S);
}

/**
 * parses the input (integer) into a string repr of hex and prepends '0x'
 * @param hex
 * @returns {string}
 */
function parseHexToString(hex) {
    return '0x' + hex.toString(16);
}

/**
 * pads a given binary number with given pad value
 * @param n
 * @param width
 * @param z
 * @returns {string}
 */

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
