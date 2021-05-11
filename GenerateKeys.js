const keythereum = require('keythereum');
const fs = require('fs');
require('dotenv').config();

var password = process.env.KEYFILE_PASSWORD;


let keys = {};
for(var i=0; i < 3; i++) {
    var dk = keythereum.create();
    var keyObject = keythereum.dump(password, dk.privateKey, dk.salt, dk.iv);
    keys[`account${i}`] = {
        "privateKey": dk.privateKey.toString('hex'),
        "address": keyObject.address
    }
}

fs.writeFile('OtherKeys.json', JSON.stringify(keys), () => {});

