// helper function to set multiple attributes at once
export function setAttributes(element, attributeObj) {
    for (const [attr, val] of Object.entries(attributeObj)) {
        element.setAttribute(attr, val);
    }
}