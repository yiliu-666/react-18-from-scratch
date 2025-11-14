import { setInitialProperties } from "./ReactDOMComponent";

export function finalizeInitialChildren(domElement, type, props) {
    setInitialProperties(domElement, type, props);
}
export const createInstance = (type, props, internalInstanceHandle) => {
    const domElement = document.createElement(type);
    return domElement;
};



export function shouldSetTextContent(type, props) {
    return typeof props.children === "string" || typeof props.children === "number";
}


export function createTextInstance(content) {
    return document.createTextNode(content);
}

export const appendInitialChild = (parent, child) => {
    parent.appendChild(child);
};


export function appendChild(parentInstance, child) {
    parentInstance.appendChild(child);
}
export function insertBefore(parentInstance, child, beforeChild) {
    parentInstance.insertBefore(child, beforeChild);
}