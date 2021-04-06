import { authenticate, createMasterKey, decrypt, encrypt, inputValid, setAttributes } from './helpers.js';
import { getFromLocal, getVaultData, setToLocal } from './storage.js';
import { makePrimaryBtn, createFormField } from './components.js';
const CryptoJS = require('crypto-js');


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

    const authenticated = await authenticate(form.reenteredPwd.value, user);
    console.log('authentication');
    if (authenticated) {
        console.log('authenticated');
        const key = createMasterKey(form.reenteredPwd.value, user);
        console.log('key found');
        form.reenteredPwd.value = '';
        modal.hide();
        switch (successFunc) {
            case 'saveNewData': saveNewData(key);
            break;
            case 'deleteEntry': deleteEntry(args[0]);
            break;
            case 'renderEntryDetails': renderEntryDetails(key, args[0]);
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

const passwordGateway = (user, successFunc, args) => {

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
        renderVault(user);
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
const saveNewData = async (key) => {
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

   
    // allEntries is a semi-colon separated string 
    // this should be hashed or something
    const userEntries = `${user}AllEntries`;
    let r = await getFromLocal(userEntries);
    let allEntries = r[userEntries] ? r[userEntries] : "";

    if (allEntries.includes(`${title};`)) {
        // the title we're looking for does exist
        alert("Title already exists");
        
    } else {
        // add to the vault
        const userVault = `${user}Vault`;
        let r = await getFromLocal(userVault);
        let vault = r[userVault];
        if (vault) {
            vault[title] = {username, password};
        } else {
            vault = {
                [title]: {username, password}
            };
        }
        await setToLocal(userVault, vault);

        allEntries += `${title};`;
        await setToLocal(userEntries, allEntries);
    }
    renderVault();
}

const deleteEntry = async (toDel) => {
    const user = await checkLoggedIn();
    if (!user) {
        return;
    }

    const userEntries = `${user}AllEntries`;
    let r = await getFromLocal(userEntries);
    let allEntries = r[userEntries] ? r[userEntries] : "";

    if (allEntries.includes(`${toDel};`)) {
        // can delete this entry
        // delete from vault
        const userVault = `${user}Vault`;
        let r = await getFromLocal(userVault);
        let vault = r[userVault];
        delete vault[toDel];
        await setToLocal(userVault, vault);

        // remove from all entries
        allEntries = allEntries.replace(`${toDel};`, '');
        await setToLocal(userEntries, allEntries);
    } else {
        alert("Title does not exist");
    }
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
    heading.setAttribute('class', 'header ');
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
    newInputs.push(createFormField('Password', 'password', 'pwdDiv', 'newPwd', 'Required: password for this account'));

    newInputs.forEach((input) => {
        newForm.appendChild(input);
    });

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
        //saveNewData()
    });

    cardBody.appendChild(newForm);
    newCard.appendChild(cardBody);

    resetMain();
    const mainDiv = document.querySelector('#main-container');
    mainDiv.appendChild(newCard);
}

const createPageButton = (text) => {
    // <li class="page-item"><a class="page-link" href="#">1</a></li>
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
const renderEntryDetails = async (key, title) => {
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
    const linkText = document.createTextNode('← Back to vault');
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
        //deleteEntry(title);

        // add a thing to vault page about item being deleted
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

        // TODO put this behind password
        passwordGateway(user, "renderEntryDetails", [title]);
    })

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
    
    const userVault = `${user}Vault`;
    let r = await getFromLocal(userVault);
    let vault = r[userVault];
    console.log('rendering vault');
    console.log(vault);
    if (vault) {
        let newEntry;
        Object.keys(vault).sort().forEach((title) => {
            newEntry = createVaultEntry(title, user);
            entryGroup.appendChild(newEntry);
        });
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