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
        return null;
        // throw "current session not found"
    }
}

/**
 * Returns object with the {hash, salt} corresponding to the input user
 */
export const getUserAuthDetails = async (user) => {
   
    const r = await getFromLocal('userAuth');
    if (!r.userAuth) {
        //return null;
        throw "userAuth doesn't exist in database";
    }
    return r.userAuth[user];

}