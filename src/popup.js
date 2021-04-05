import { authenticate, createLoginSalt, passToLoginHash } from './helpers.js';
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

    const username = regoForm.regoUser.value;

    // check user does not exist already
    let users = await getFromLocal('allUsers');
    console.log(users);
    users = users.allUsers ? users.allUsers : '';
    console.log(users);
    if (users.includes(`${username};`)) {
        alert('Username already exists');
        return;
    }

    // should do validation for username and password

    // ready to add new user
    users += `${username};`;

    // generate salt and login hash
    const salt = createLoginSalt(username);
    const hash = passToLoginHash(regoForm.regoPwd.value, salt, username);

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

    await setToLocal('allUsers', users);
    await setToLocal('userAuth', logins);
    await setToLocal('currentSession', {
        'user': username
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

    const authenticated = await authenticate(loginForm.loginPwd.value, loginForm.loginUser.value);
    if (!authenticated) {
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