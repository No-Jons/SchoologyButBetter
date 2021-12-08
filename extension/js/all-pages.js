let defaultDomain = window.location.host;

let userID = getUserID();
let schoolID;

function getUserID() { return Number.parseInt(new URLSearchParams(document.querySelector("iframe[src*=session-tracker]").src.split("?")[1]).get("id")); }

function generateID() {
    let alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let rtn = '';
    for (let i = 0; i < 8; i++) {
        rtn += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return rtn;
}

function sgyDate() {
    const today = new Date();
    let current = today.getFullYear().toString();
    if (today.getMonth().toString().length === 1) {
        current += `-0${today.getMonth() + 1}`;
    } else {
        current += `-${today.getMonth() + 1}`
    }
    if (today.getDate().toString().length === 1) {
        current += `-0${today.getDate()}`;
    } else {
        current += `-${today.getDate()}`;
    }
    return current;
}

// todo: implement way more logging throughout the entire project
