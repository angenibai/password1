import { decrypt, encrypt } from "./helpers";
const CryptoJS = require('crypto-js');

export const setToLocal = async (key, val) => {
    await new Promise(resolve => {
        chrome.storage.local.set({[key]: val}, (r) => {
            resolve(r);
        });
    })
}

export const getFromLocal = async (key) => {
    let val = await new Promise(resolve => {
        chrome.storage.local.get([key], (obj) => {
            resolve(obj);
        }); 
    })
    return val;
}

export const removeFromLocal = async (key) => {
    await new Promise(resolve => {
        chrome.storage.local.remove([key], (r) => {
            resolve(r);
        });
    });
}

export const getCurrentUser = async () => {
    const r = await getFromLocal('currentSession');
    if (r.currentSession) {
        return r.currentSession.user;
    } else {
        throw "current session not found"
    }
}

export const setAuthTime = async () => {
    const t = Date.now();
    const r = await getFromLocal('currentSession');
    if (!r.currentSession) {
        throw "current session not found";
    }
    r.currentSession.lastAuth = t;
    await setToLocal('currentSession', r.currentSession);
}

export const needsAuth = async (cur_time) => {
    console.log(cur_time);
    const r = await getFromLocal('currentSession');
    if (!r.currentSession) {
        throw "current session not found";
    } 
    let session = r.currentSession;
    if (!session.lastAuth) {
        console.log('no last auth')
        return true;
    }
    if ((parseInt(cur_time) - parseInt(r.currentSession.lastAuth)) > 30000) {
        console.log('far away');
        console.log(`${parseInt(cur_time) - parseInt(r.currentSession.lastAuth)}`)
        return true;
    }
    return false;
}

/**
 * Returns object with the {hash, salt} corresponding to the input user
 */
export const getUserAuthDetails = async (user) => {
   
    const r = await getFromLocal('userAuth');
    if (!r.userAuth) {
        throw "userAuth doesn't exist in database";
    }
    return r.userAuth[user];

}

export const getVaultData = async (user, title) => {
    console.log('getting vault data');
    const userVault = `${user}Vault`;
    let r = await getFromLocal(userVault);
    if (!r[userVault]) {
        throw "Your vault doesn't exist in database";
    }
    console.log(userVault);
    console.log(title);
    title = CryptoJS.SHA256(title).toString(CryptoJS.enc.hex);
    console.log(title);
    let entryObj = r[userVault][title];
    console.log(entryObj);
    if (!entryObj) {
        throw "This entry doesn't exist in database";
    }
    console.log(typeof entryObj);
    console.log(typeof entryObj.username);
    console.log(typeof entryObj.password);
    return entryObj;
}

export const addVaultData = async (user, title, username, password) => {
    const userVault = `${user}Vault`;
    let r = await getFromLocal(userVault);
    let vault = r[userVault];

    title = CryptoJS.SHA256(title).toString(CryptoJS.enc.hex);

    if (vault) {
        vault[title] = {username, password};
    } else {
        vault = {
            [title]: {username, password}
        };
    }
    await setToLocal(userVault, vault);
}

// all entries is encrypted
export const addNewEntry = async (user, title, key) => {
    const userEntries = `${user}AllEntries`;
    let r = await getFromLocal(userEntries);
    let allEntries = r[userEntries] ? r[userEntries] : ""
    if (allEntries) {
        allEntries = decrypt(allEntries, key).toString(CryptoJS.enc.Utf8);
    }
    if (allEntries.includes(`${title};`)) {
        throw "Title already exists";
    }
    allEntries += `${title};`;
    allEntries = encrypt(allEntries, key).toString();
    await setToLocal(userEntries, allEntries);
}

// all entries is encrypted
export const getAllEntries = async (user, key) => {
    console.log('getting all entries');
    const userEntries = `${user}AllEntries`;
    console.log(userEntries);
    let r = await getFromLocal(userEntries);
    console.log(r);
    if (!r[userEntries]) {
        return [];
    }
    console.log(r[userEntries]);
    let allEntries = decrypt(r[userEntries], key).toString(CryptoJS.enc.Utf8);
    console.log('after decryption');
    console.log(allEntries);
    return allEntries.split(";").slice(0,-1);
}

export const deleteVaultEntry = async (user, title, key) => {
    let allEntries = await getAllEntries(user, key);
    if (!allEntries.includes(title)) {
        throw "Title does not exist";
    }

    const userVault = `${user}Vault`;
    let r = await getFromLocal(userVault);
    if (!r[userVault]) {
        throw "User vault not found";
        return;
    }
    let vault = r[userVault];
    const title_hash = CryptoJS.SHA256(title).toString(CryptoJS.enc.hex);
    try {
        delete vault[title_hash];
    } catch (err) {
        alert(err);
        return;
    }

    await setToLocal(userVault, vault);

    // remove from allEntries string
    allEntries = allEntries.join(";");
    allEntries = allEntries.replace(`${title};`, '');
    allEntries = encrypt(allEntries, key).toString();
    await setToLocal(`${user}AllEntries`, allEntries);
}