import { getUserAuthDetails } from './storage.js';

const CryptoJS = require('crypto-js');
const DIVISOR = 32;

const JsonFormatter = {
    stringify: function(cipherParams) {
        // create json object with ciphertext
        let jsonObj = { ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64) };

        // optionally add iv or salt
        if (cipherParams.iv) {
            jsonObj.iv = cipherParams.iv.toString();
        }
        
        if (cipherParams.salt) {
            jsonObj.s = cipherParams.salt.toString();
        }

        // stringify json object
        return JSON.stringify(jsonObj);
    },
    parse: function(jsonStr) {
        // parse json string
        let jsonObj = JSON.parse(jsonStr);
        
        // extract ciphertext from json object, and create cipher params object
        let cipherParams = CryptoJS.lib.CipherParams.create({
            ciphertext: CryptoJS.enc.Base64.parse(jsonObj.ct)
        });
        
        // optionally extract iv or salt
        
        if (jsonObj.iv) {
            cipherParams.iv = CryptoJS.enc.Hex.parse(jsonObj.iv);
        }
        
        if (jsonObj.s) {
            cipherParams.salt = CryptoJS.enc.Hex.parse(jsonObj.s);
        }
        
        return cipherParams;
    }
};

// helper function to set multiple attributes at once
export const setAttributes = (element, attributeObj) => {
    for (const [attr, val] of Object.entries(attributeObj)) {
        element.setAttribute(attr, val);
    }
}

export const createLoginSalt = (username) => {
    console.log('creating login salt');
    return CryptoJS.PBKDF2(username, Date.now().toString(), {
        keySize: 256/DIVISOR,
        iterations: 1
    }).toString(CryptoJS.enc.Hex);
}

export const createMasterKey = (secret, salt) => {
    console.log('creating master key');
    return CryptoJS.PBKDF2(secret, salt, {
        keySize: 256/DIVISOR,
        iterations: 100100
    }).toString(CryptoJS.enc.Hex);
}

export const passToLoginHash = (secret, salt, user) => {
    console.log('creating login hash');
    return CryptoJS.PBKDF2(createMasterKey(secret, user), salt, {
        keySize: 256/DIVISOR,
        iterations: 100000
    }).toString(CryptoJS.enc.Hex);
}

export const authenticate = async (tryPass, user) => {
    let loginAuth;
    try {
        loginAuth = await getUserAuthDetails(user);
    } catch (err) {
        alert(err);
        return;
    }

    const curHash = passToLoginHash(tryPass, loginAuth.salt, user);

    return loginAuth.hash === curHash ? loginAuth : false;
}

export const encrypt = (message, key) => {
    let encrypted = CryptoJS.AES.encrypt(message, key, {
        format: JsonFormatter
    });
    return encrypted;
}

export const decrypt = (ciphertext, key) => {
    let decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
        format: JsonFormatter
    });
    return decrypted;
}