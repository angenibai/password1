// helper function to set multiple attributes at once
const setAttributes = (element, attributeObj) => {
    for (const [attr, val] of Object.entries(attributeObj)) {
        element.setAttribute(attr, val);
    }
}

// makes a primary button given button type, id, and text for the button
const makePrimaryBtn = (btnType, btnID, btnText) => {
    const newBtn = document.createElement('button');
    setAttributes(newBtn, {
        'type': btnType,
        'class': 'btn btn-primary',
        'id': btnID
    });
    const text = document.createTextNode(btnText);
    newBtn.appendChild(text);

    return newBtn;
}

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

// creates form field with label, input field and optionally help text
const createFormField = (inputTitle, inputType, divID, inputID, helpText) => {
    const newDiv = document.createElement('div');
    setAttributes(newDiv, {
        'class': 'mb-3',
        'id': divID
    });

    // label
    const label = document.createElement('label');
    setAttributes(label, {
        'class': 'form-label',
        'for': inputID
    });
    let text = document.createTextNode(inputTitle);
    label.appendChild(text);

    const helpID = inputID + 'Help';

    // input field
    const input = document.createElement('input');
    setAttributes(input, {
        'type': inputType,
        'id': inputID,
        'name': inputID,
        'class': 'form-control',
        'aria-described-by': helpID
    });

    // help text
    const help = document.createElement('div');
    setAttributes(help, {
        'id': helpID,
        'class': 'form-text'
    });
    text = document.createTextNode(helpText);
    help.appendChild(text);

    // append everything
    newDiv.appendChild(label);
    newDiv.appendChild(input);
    newDiv.appendChild(help);

    return newDiv;
}

const renderWelcome = () => {
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

    resetMain();
    const mainDiv = document.querySelector('#main-container');
    mainDiv.appendChild(welcomeCard);
}

// checking that data to add for new credential is valid
const checkNewValid = () => {
    // Unique title 1-50 characters

    // username more than 1 character

    // password matches guidelines

    return true;
}

// saves new data to local storage
const saveNewData = () => {
    const form = document.querySelector('#newPwdForm');

    const title = form.newTitle.value;
    const username = form.newUsername.value;
    const password = form.newPwd.value;

    // do some encryption

    // current issue: assumes that all of local storage is dedicated to passwords
    /*
    const vaultObj = {
        'title': title,
        'username': username,
        'password': password
    };
    let vault = await chrome.storage.local.get(['vault'], (object) => {
        return object;
    })
    */
    
    chrome.storage.local.set({[title]: {username, password}}, () => {
        console.log('success');
    })
}

const renderNewPass = () => {
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
        'id': 'newSubmit'
    });
    const text = document.createTextNode('Add password');

    submit.appendChild(text);

    newForm.appendChild(submit);

    // form behaviour
    newForm.addEventListener('submit', (event) => {
        event.preventDefault();
        // validate input

        // save input
        saveNewData();
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
const renderEntryDetails = (title) => {

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
    const entryObj = {
        'username': 'abc',
        'password': 'cba'
    };

    // unencrypt the password

    // render username and password
    const cardBody = document.createElement('div');
    cardBody.setAttribute('class', 'card-body');
    const newForm = document.createElement('form');
    newForm.setAttribute('id', 'displayPwdForm');

    const userDetails = createFormField('Username', 'text', 'usernameDiv', 'displayUsername', '');
    userDetails.querySelector('input').setAttribute('value', entryObj['username']);
    
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
    pwdInput.setAttribute('value', entryObj['username']);
    inputGroup.appendChild(pwdInput);

    const visibility = document.createElement('button');
    setAttributes(visibility, {
        'class': 'far fa-eye btn btn-outline-secondary',
        'id': 'toggleVisibility',
        'type': 'button'
    });
    visibility.addEventListener('click', (e) => {
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

        renderVault();
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
const createVaultEntry = (title) => {
    const entryItem = document.createElement('li');
    entryItem.setAttribute('class', 'list-group-item btn vault-entry');

    const titleText = document.createTextNode(title);
    entryItem.appendChild(titleText);

    // when this vault entry gets clicked, it will serve the details for that entry
    entryItem.addEventListener('click', (event) => {
        event.preventDefault();
        renderEntryDetails(title);
    })

    return entryItem;

}

const renderVault = () => {
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
    /*
    let allEntries = chrome.storage.local.get(null, (result) => {
        console.log(result);
        return result;
    });
    */
    // currently dummy data for all entries
    let allEntries = {
        "abc": {
            "username": "cba",
            "password": "bac"
        },
        "def": {
            "username": "fed",
            "password": "edf"
        },
        "ghi": {
            "username": "ihg",
            "password": "hgi"
        }
    };

    let newEntry;
    Object.keys(allEntries).sort().forEach((title) => {
        newEntry = createVaultEntry(title);
        entryGroup.appendChild(newEntry);
    })

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