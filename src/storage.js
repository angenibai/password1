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
    let session = await getFromLocal('currentSession');
    return session.currentSession ? session.currentSession.user : null;
}