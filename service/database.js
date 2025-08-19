const path = require('path');
const fs = require('fs-extra');

const getRootPath = (p) => {
    return path.join(__dirname);
}

module.exports = {
    getRootPath
}