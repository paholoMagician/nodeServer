// PATRON ADAPTADOR DE MODULOS NPM

const { v4: uuidv4 } = require('uuid');

const getCodecID = () => {
    return uuidv4();
}


module.exports = {
    getCodecID
}

