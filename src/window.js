import { authenticate, createMasterKey, decrypt, encrypt, inputValid, setAttributes } from './helpers.js';
import { addNewEntry, addVaultData, getAllEntries, getFromLocal, getVaultData, needsAuth, setAuthTime, deleteVaultEntry } from './storage.js';
import { makePrimaryBtn, createFormField } from './components.js';
import { chachaString } from './chacha.js';
const CryptoJS = require('crypto-js');

let key = "";

// resets the main element to contain an empty main div container
const resetMain = () => {
    const main = document.querySelector('main');
    let mainDiv = document.querySelector('#main-container');
    main.removeChild(mainDiv);

    mainDiv = document.createElement('div');
    setAttributes(mainDiv, {
        'class': 'container',
        'id': 'main-container'
    });

    main.appendChild(mainDiv);
}

// if not logged in, brings up not logged in page
// otherwise returns the username
const checkLoggedIn = async () => {
    let session = await getFromLocal('currentSession');
    if (!session.currentSession) {
        const card = document.createElement('div');
        setAttributes(card, {
            'class': 'card text-center',
            'id': 'loggedOutCard'
        });

        const cardBody = document.createElement('div');
        cardBody.setAttribute('class', 'card-body');

        const heading = document.createElement('h1');
        heading.setAttribute('class', 'card-title');
        const text = document.createTextNode('You are not logged in');
        heading.appendChild(text);
        cardBody.appendChild(heading);
        card.appendChild(cardBody);
        resetMain();
        const mainDiv = document.querySelector('#main-container');
        mainDiv.appendChild(card);
        return false;
    }
    return session.currentSession.user;
}

const onSubmitPwd = async (modal, user, successFunc, args) => {
    console.log(successFunc);
    const form = document.forms.reenterPwd;

    const key = await authenticate(form.reenteredPwd.value, user);
    console.log('authentication');
    if (key) {
        console.log('authenticated');
        await setAuthTime();
        console.log('key found');
        form.reenteredPwd.value = '';
        modal.hide();
        switch (successFunc) {
            case 'saveNewData': saveNewData();
            break;
            case 'deleteEntry': deleteEntry(args[0]);
            break;
            case 'renderEntryDetails': renderEntryDetails(args[0]);
            break;
            default: alert("Didn't hard-code this oops");
        }
       
    } else {
        alert('Invalid password');
    } 
}

const makeModalForm = () => {
    const form = document.createElement('form');
    form.setAttribute('name', 'reenterPwd');

    const inputDiv = document.createElement('div');
    inputDiv.setAttribute('class', 'mb-3');
    const label = document.createElement('label');
    setAttributes(label, {
        'for': 'reenteredPwd',
        'class': 'col-form-label'
    });
    label.appendChild(document.createTextNode('Master password:'));
    inputDiv.appendChild(label);
    const input = document.createElement('input');
    setAttributes(input, {
        'type': 'password',
        'class': 'form-control',
        'id': 'reenteredPwd',
        'required': 'true'
    });
    inputDiv.appendChild(input);
    form.appendChild(inputDiv);

    const submit = document.createElement('button');
    setAttributes(submit, {
        'type': 'submit',
        'class': 'btn btn-primary'
    });
    submit.appendChild(document.createTextNode('Confirm'));
    form.appendChild(submit);

    return form;
}

const passwordGateway = async (user, successFunc, args) => {
    let authed = await needsAuth(Date.now());
    if (!authed) {
        switch (successFunc) {
            case 'saveNewData': saveNewData();
            break;
            case 'deleteEntry': deleteEntry(args[0]);
            break;
            case 'renderEntryDetails': renderEntryDetails(args[0]);
            break;
            default: alert("Didn't hard-code this oops");
        } 
        return;
    }
    key = "";

    const modalBody = document.querySelector('.modal-body');
    while (modalBody.lastChild) {
        modalBody.removeChild(modalBody.lastChild);
    }
    modalBody.appendChild(makeModalForm());

    const modal = new bootstrap.Modal(document.querySelector('#reenterPwdModal'));
    modal.show();
   
    const form = document.forms.reenterPwd;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        onSubmitPwd(modal, user, successFunc, args);
    });
}

const renderWelcome = async () => {
    resetMain();
    // check logged in
    const user = await checkLoggedIn();
    if (!user) {
        return;
    }

    const welcomeCard = document.createElement('div');
    setAttributes(welcomeCard, {
        'class': 'card text-center',
        'id': 'welcome-card'
    });

    const cardBody = document.createElement('div');
    cardBody.setAttribute('class', 'card-body');

    const welcomeHeading = document.createElement('h1');
    welcomeHeading.setAttribute('class', 'card-title');

    const welcomeText = document.createTextNode('Welcome to your vault');
    welcomeHeading.appendChild(welcomeText);

    const btnDiv = document.createElement('div');
    btnDiv.setAttribute('class', 'row btn-div');

    const btn1 = makePrimaryBtn('button', 'welcome-add', 'Add a new password');
    btn1.classList.add('btn-block', 'col-sm');
    btn1.addEventListener('click', () => {
        renderNewPass();
    });

    const btn2 = makePrimaryBtn('button', 'welcome-vault', 'Go to your passwords');
    btn2.classList.add('btn-block', 'col-sm');
    btn2.addEventListener('click', () => {
        renderVault();
    });

    cardBody.appendChild(welcomeHeading);
    btnDiv.appendChild(btn1);
    btnDiv.appendChild(btn2);
    cardBody.append(btnDiv);
    welcomeCard.appendChild(cardBody);

    const mainDiv = document.querySelector('#main-container');
    mainDiv.appendChild(welcomeCard);
}


// saves new data to local storage and displays vault
const saveNewData = async () => {
    const user = await checkLoggedIn();
    if (!user) {
        return;
    }
    
    console.log('saving data');
    const form = document.querySelector('#newPwdForm');
    
    console.log('about to encrypt');

    const title = form.newTitle.value;
    const username = encrypt(form.newUsername.value, key).toString();
    const password = encrypt(form.newPwd.value, key).toString();

    try {
        await addNewEntry(user, title, key);
        await addVaultData(user, title, username, password);
    } catch (err) {
        alert(err);
        return;
    }
    renderVault();
}

const deleteEntry = async (toDel) => {
    const user = await checkLoggedIn();
    if (!user) {
        return;
    }

    await deleteVaultEntry(user, toDel, key);
    
    renderVault();
}



const renderNewPass = async () => {
    const user = await checkLoggedIn();
    if (!user) {
        return;
    }
    const newCard = document.createElement('div');
    setAttributes(newCard, {
        'class': 'card',
        'id': 'newPassCard'
    });

    const heading = document.createElement('h1');
    heading.setAttribute('class', 'header??');
    const headingText = document.createTextNode('Enter new credentials');
    heading.appendChild(headingText);
    newCard.append(heading);

    const cardBody = document.createElement('div');
    cardBody.setAttribute('class', 'card-body');
    const newForm = document.createElement('form');
    newForm.setAttribute('id', 'newPwdForm');

    let newInputs = [];
    newInputs.push(createFormField('Title', 'text', 'titleDiv', 'newTitle', 'Required: title to identify your credentials'));
    newInputs.push(createFormField('Username', 'text', 'usernameDiv', 'newUsername','Username for this account'));

    // password input includes buttons for visibility and generate password
    const passwordField = createFormField('Password', 'password', 'pwdDiv', 'newPwd', 'Required: password for this account');
    const inputGroup = document.createElement('div');
    inputGroup.setAttribute('class', 'input-group');
    inputGroup.appendChild(passwordField.childNodes[1]);

    const visibility = document.createElement('button');
    setAttributes(visibility, {
        'class': 'far fa-eye btn btn-outline-secondary',
        'id': 'toggleVisibility',
        'type': 'button'
    });
    visibility.addEventListener('click', (e) => {
        checkLoggedIn();
        
        const password = document.querySelector('#newPwd');
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);
        visibility.classList.toggle('fa-eye-slash');
    });
    inputGroup.appendChild(visibility);
    // add a generate password thing here
    const generate = document.createElement('button');
    setAttributes(generate, {
        'class': 'btn btn-outline-secondary',
        'id': 'generatePassword',
        'type': 'button'
    });
    const syncIcon = document.createElement('img');
    setAttributes(syncIcon, {
        'src': '../assets/sync-alt-solid.svg'
    });
    generate.appendChild(syncIcon);
    generate.addEventListener('click', (e) => {
        checkLoggedIn();
        inputGroup.querySelector('#newPwd').value = chachaString(16);
    });
    inputGroup.appendChild(generate);

    passwordField.replaceChild(inputGroup, passwordField.childNodes[1]);

    newInputs.forEach((input) => {
        newForm.appendChild(input);
    });
    newForm.appendChild(passwordField);

    // add submit button
    const submit = document.createElement('button');
    setAttributes(submit, {
        'class': 'btn btn-primary',
        'type': 'submit',
        'id': 'newSubmit',
    });
    const text = document.createTextNode('Add password');

    submit.appendChild(text);

    newForm.appendChild(submit);

    // form behaviour
    newForm.addEventListener('submit', (event) => {
        event.preventDefault();
        // validate input
        try {
            inputValid(newForm.newTitle.value, 'Title');
            inputValid(newForm.newUsername.value, 'Username');
            inputValid(newForm.newPwd.value, 'Password');
        } catch (err) {
            alert(err);
            return;
        }

        // open modal
        passwordGateway(user, "saveNewData", []);
    });

    cardBody.appendChild(newForm);
    newCard.appendChild(cardBody);

    resetMain();
    const mainDiv = document.querySelector('#main-container');
    mainDiv.appendChild(newCard);
}

const createPageButton = (text) => {
    const pageItem = document.createElement('li');
    pageItem.setAttribute('class', 'page-item');

    const link = document.createElement('a');
    setAttributes(link, {
        'class': 'page-link',
        'href': '#'
    });
    const linkText = document.createTextNode(text);
    link.appendChild(linkText);
    pageItem.appendChild(link);
    return pageItem;
}

// renders the page which contains details for a particular entry
const renderEntryDetails = async (title) => {
    const user = await checkLoggedIn();
    if (!user) {
        return;
    }

    const newCard = document.createElement('div');
    setAttributes(newCard, {
        'class': 'card',
        'id': 'entryPageCard'
    });

    // link to go back
    const backLink = document.createElement('a');
    setAttributes(backLink, {
        'href': '#',
        'class': 'back-link'
    });
    const linkText = document.createTextNode('??? Back to vault');
    backLink.appendChild(linkText);
    backLink.addEventListener('click', (event) =>{
        event.preventDefault();
        renderVault();
    });
    newCard.appendChild(backLink);

    const heading = document.createElement('h1');
    heading.setAttribute('class', 'header');
    const headingText = document.createTextNode(`Credentials for: ${title}`);
    heading.appendChild(headingText);
    newCard.appendChild(heading);

    // retrieve relevant data from storage
    const entryObj = await getVaultData(user, title);

    // unencrypt the username and password
    let username = decrypt(entryObj.username, key).toString(CryptoJS.enc.Utf8);
    let password = decrypt(entryObj.password, key).toString(CryptoJS.enc.Utf8);
    console.log(password);

    // render username and password
    const cardBody = document.createElement('div');
    cardBody.setAttribute('class', 'card-body');
    const newForm = document.createElement('form');
    newForm.setAttribute('id', 'displayPwdForm');

    const userDetails = createFormField('Username', 'text', 'usernameDiv', 'displayUsername', '');
    userDetails.querySelector('input').setAttribute('value', username);
    
    const pwdDetails = document.createElement('div');
    setAttributes(pwdDetails, {
        'class': 'mb-3',
        'id': 'pwdDiv'
    });
    const pwdLabel = document.createElement('label');
    setAttributes(pwdLabel, {
        'class': 'form-label',
        'for': 'displayPwd'
    });
    pwdLabel.appendChild(document.createTextNode('Password'));
    pwdDetails.appendChild(pwdLabel);

    const inputGroup = document.createElement('div');
    setAttributes(inputGroup, {
        'class': 'input-group mb-3'
    });
    const pwdInput = document.createElement('input');
    setAttributes(pwdInput, {
        'type': 'password',
        'id': 'displayPwd',
        'name': 'displayPwd',
        'class': 'form-control'
    });
    // filling in password
    pwdInput.setAttribute('value', password);
    inputGroup.appendChild(pwdInput);

    const visibility = document.createElement('button');
    setAttributes(visibility, {
        'class': 'far fa-eye btn btn-outline-secondary',
        'id': 'toggleVisibility',
        'type': 'button'
    });
    visibility.addEventListener('click', (e) => {
        checkLoggedIn();
        
        const password = document.querySelector('#displayPwd');
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);
        visibility.classList.toggle('fa-eye-slash');
    });
    inputGroup.appendChild(visibility);
    pwdDetails.appendChild(inputGroup);

    newForm.appendChild(userDetails);
    newForm.appendChild(pwdDetails);
    cardBody.appendChild(newForm);

    // delete option
    const deleteButton = makePrimaryBtn('button', 'deleteEntry', 'Delete entry');
    deleteButton.setAttribute('class', 'btn btn-danger');
    deleteButton.addEventListener('click', () => {
        // delete entry from storage
        // require password to delete item
        passwordGateway(user, "deleteEntry", [title]);

    });
    cardBody.appendChild(deleteButton);
    // edit option?

    newCard.appendChild(cardBody);
    resetMain();
    const mainDiv = document.querySelector('#main-container');
    mainDiv.appendChild(newCard); 
}

// creates a list object for the vault entries list
const createVaultEntry = (title, user) => {
    const entryItem = document.createElement('li');
    entryItem.setAttribute('class', 'list-group-item btn vault-entry');
    setAttributes(entryItem, {
        'class': 'list-group-item btn vault-entry',
    });

    const titleText = document.createTextNode(title);
    entryItem.appendChild(titleText);

    // when this vault entry gets clicked, it will serve the details for that entry
    entryItem.addEventListener('click', (event) => {
        event.preventDefault();
        passwordGateway(user, "renderEntryDetails", [title]);
    });

    return entryItem;

}

const renderVault = async () => {
    const user = await checkLoggedIn();
    if (!user) {
        return;
    }
    // search bar

    const vaultCard = document.createElement('div');
    setAttributes(vaultCard, {
        'class': 'card',
        'id': 'vaultCard'
    });

    const vaultHeading = document.createElement('h1');
    setAttributes(vaultHeading, {
        'class': 'header',
        'id': 'vaultHeading'
    });
    const headingText = document.createTextNode('Your passwords');
    vaultHeading.appendChild(headingText);
    vaultCard.appendChild(vaultHeading);

    // button for new password
    const newBtn = makePrimaryBtn('button', 'newPwdFromVault', 'Add new password');
    newBtn.setAttribute('class', 'btn btn-outline-primary');
    newBtn.addEventListener('click', () => {
        renderNewPass();
    });
    vaultCard.appendChild(newBtn);


    // the entries
    const entryGroup = document.createElement('ul');
    setAttributes(entryGroup, {
        'class': 'list-group list-group-flush',
        'id': 'vaultEntriesList'
    });
    

    let allEntries;
    try {
        allEntries = await getAllEntries(user, key);
        console.log('after receiving entries');
        console.log(allEntries);
        let newEntry;
        allEntries.sort().forEach((title) => {
            newEntry = createVaultEntry(title, user);
            entryGroup.appendChild(newEntry);
        });
    } catch (err) {
        alert(err);
    }

    vaultCard.appendChild(entryGroup);

    // create nav button group
    const pageNav = document.createElement('nav');
    pageNav.setAttribute('aria-label', 'Vault page navigation');

    const pagesList = document.createElement('ul');
    pagesList.setAttribute('class', 'pagination');

    const prev = document.createElement('li');
    prev.setAttribute('class', 'page-item');
    let link = document.createElement('a');
    setAttributes(link, {
        'class': 'page-link',
        'href': '#',
        'aria-label': 'Previous'
    });
    let span = document.createElement('span');
    span.setAttribute('aria-hidden', 'true');
    let text = document.createTextNode('<<');
    span.appendChild(text);
    link.appendChild(span);
    prev.appendChild(link);
    pagesList.appendChild(prev);

    // do this in a loop for however many pages needed
    let nextButton = createPageButton('1');
    pagesList.append(nextButton);

    // next button
    const next = document.createElement('li');
    next.setAttribute('class', 'page-item');
    link = document.createElement('a');
    setAttributes(link, {
        'class': 'page-link',
        'href': '#',
        'aria-label': 'Next'
    });
    span = document.createElement('span');
    span.setAttribute('aria-hidden', 'true');
    text = document.createTextNode('>>');
    span.appendChild(text);
    link.appendChild(span);
    next.appendChild(link);
    pagesList.appendChild(next);

    pageNav.appendChild(pagesList);

    vaultCard.appendChild(pageNav);
    resetMain();
    const mainDiv = document.querySelector('#main-container');
    mainDiv.appendChild(vaultCard);
}

// set listener for logo to bring back to welcome page
document.querySelector('.navbar-brand').addEventListener('click', (event) => {
    event.preventDefault();
    renderWelcome();
});

renderWelcome();