"use strict";
const { getCodecID } = require('../plugin/uuidv4.plugin');
const { getAge } = require('../plugin/get-age.plugin');
const buildLogger = require('./logger.plugin');
module.exports = {
    getCodecID,
    getAge,
    buildLogger
};
