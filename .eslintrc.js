module.exports = {
    "env": {
        "browser": true,
        "node": true,
        "es6": true,
    },
    "globals": {
      "angular": true,
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-var": [
            "error",
        ],
        "no-unused-vars": [
            "warn",
        ],
        "no-console": [
            "off",
        ],
    },
};