'use strict';

const os = require('os');

angular.module('Simulator').factory('FileParser', ['SimDriver', '$rootScope', function FileParserService(simDriver, $rootScope) {

    let ctrl = this;

    //Used as a helper for when uploading a trace file
    //TODO

    let lines = "";

    ctrl.subscribe = function(scope, callback) {
        let handler = $rootScope.$on('fileParsed', callback);
        scope.$on('$destroy', handler);
    };

    ctrl.notify = function() {
        $rootScope.$emit('fileParsed');
    };

    ctrl.parseFile = function(input, C, S, B) {
        //use node's value for native OS end of line
        lines = input.split(os.EOL);
        //many text editors end in a new line char
        if (lines[lines.length - 1] === "") {
            lines.splice(lines.length - 1)
        }

        for (let line of lines) {
            simDriver.addToQueue(parseLineToAddress(line, C, S, B));
        }
        simDriver.setQueue(lines); // Is this asynchronous?
        ctrl.notify();
    };

    ctrl.getRawData = function() {
        return lines;
    };

    /**
     * Parses a line from the trace file and returns an object with the full address, tag, index, and offset
     * @param line
     * @param C
     * @param S
     * @param B
     * @returns {{address: Number, tag: number, index: number, offset: number}}
     */
    function parseLineToAddress(line, C, S, B) {
        let address = parseInt(line, 16);
        return {
            address: address,
            tag: getTag(address, C, S),
            index: getIndex(address, C, S, B),
            offset: getOffset(address, B),
        };

    }

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
        return (address >> C - S) & mask(31 - C - S);
    }

    return ctrl;
}]);
