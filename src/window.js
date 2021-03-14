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
    
    chrome.storage.local.set({'dummy': 'username'}, () => {
        console.log('success');
    })

    /*
    chrome.storage.local.set({title: {'username': username, 'password': password}}, () => {
        console.log('success:', title, username, password);
    });
    */

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

renderWelcome();