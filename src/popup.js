import { setToLocal, getFromLocal, removeFromLocal } from './storage.js';

const goToWindow = () => {
    chrome.tabs.create({active: true, url: '/window.html'});
}

// given popup id, reveals it and hides everything else
const revealPopup = (popup) => {
    document.querySelectorAll('.popup-panel').forEach((panel) => {
        if (panel.id === popup) {
            panel.style.display = 'block';
        } else {
            panel.style.display = 'none';
        }
    });
}

const renderRegister = () => {
    revealPopup('registerPopup');
}

const renderLogin = () => {
    revealPopup('loginPopup');
}

document.querySelectorAll('.go-register').forEach((el) => {
    el.addEventListener('click', (e) => {
        e.preventDefault();
        renderRegister();
    });
});

document.querySelectorAll('.go-login').forEach((el) => {
    el.addEventListener('click', (e) => {
        e.preventDefault();
        renderLogin();
    });
});

const onRego = async (regoForm) => {
    if (regoForm.regoPwd.value !== regoForm.regoPwdConfirm.value) {
        alert('Passwords must match');
        return;
    }

    // check user does not exist already
    let users = await getFromLocal('allUsers');
    console.log(users);
    users = users.allUsers ? users.allUsers : '';
    console.log(users);
    if (users.includes(`${regoForm.regoUser.value};`)) {
        alert('Username already exists');
        return;
    }

    // should do validation for username and password

    // ready to add new user
    users += `${regoForm.regoUser.value};`;
    await setToLocal('allUsers', users);

    // generate salt and login hash
    let salt = regoForm.regoUser.value + Date.now().toString();
    let hash = regoForm.regoPwd.value;

    let logins = await getFromLocal('userAuth');
    logins = logins.userAuth;
    console.log(logins);
    if (logins) {
        logins[regoForm.regoUser.value] = {salt, hash};
    } else {
        logins = {
            [regoForm.regoUser.value]: {
                salt, hash
            }
        };
    }

    await setToLocal('userAuth', logins);
    await setToLocal('currentSession', {
        'user': regoForm.regoUser.value
    });

    regoForm.querySelectorAll('input').forEach((field) => {
        field.value = '';
    });

    goToWindow();
}


const regoForm = document.forms.register;
regoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    onRego(regoForm);
});

const onLogin = async (loginForm) => {
    let users = await getFromLocal('allUsers');
    users = users.allUsers ? users.allUsers : '';

    const userAttempt = loginForm.loginUser.value;

    if (!users.includes(`${userAttempt};`)) {
        alert('User not found');
        return;
    }

    let logins = await getFromLocal('userAuth');
    logins = logins.userAuth;

    let password = loginForm.loginPwd.value;
    const salt = logins[userAttempt].salt;

    // find hash
    const hash = password;

    if (logins[userAttempt].hash !== hash) {
        alert('Invalid password');
        return;
    }
    // otherwise login success
    await setToLocal('currentSession', {
        'user': userAttempt
    });
    loginForm.querySelectorAll('input').forEach((field) => {
        field.value = '';
    });
    goToWindow();
}

const loginForm = document.forms.login;
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    onLogin(loginForm);
});

const onLogout = async () => {
    await removeFromLocal('currentSession');
}

document.querySelector('#logout').addEventListener('click', (e) => {
    e.preventDefault();
    onLogout();
    renderInitial();
});


const renderInitial = async () => {
    let session = await getFromLocal('currentSession');
    if (session.currentSession) {
        const user = session.currentSession.user;
        console.log(user);
        const userSpan = document.querySelector('#loggedInUser');
        if (userSpan.lastChild) {
            userSpan.removeChild(userSpan.lastChild);
        }
        userSpan.appendChild(document.createTextNode(user));
        revealPopup('loggedInPopup');
    } else {
        revealPopup('initialPopup');
    }


    let allUsers = await getFromLocal('allUsers');
    if (!allUsers) {
        setToLocal('allUsers', '');
    }
    let logins = await getFromLocal('userAuth');
    if (!logins) {
        setToLocal('userAuth', {});
    }

}

renderInitial();