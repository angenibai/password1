import { getUserAuthDetails } from './storage.js';

const CryptoJS = require('crypto-js');
const DIVISOR = 32;

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

    return loginAuth.hash === curHash;
}