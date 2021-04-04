import { setAttributes } from './helpers.js';

// makes a primary button given button type, id, and text for the button
export const makePrimaryBtn = (btnType, btnID, btnText) => {
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

// creates form field with label, input field and optionally help text
export const createFormField = (inputTitle, inputType, divID, inputID, helpText) => {
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
        'aria-described-by': helpID,
        'required': 'true'
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
