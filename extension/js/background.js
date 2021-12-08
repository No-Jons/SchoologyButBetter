//import {
//    Logger
//} from "./logger.js";

// let logger = {log: console.log.bind(window.console, `%c+`, `color:orange;border:1px solid #2A2A2A;border-radius:100%;font-size:14px;font-weight:bold;padding: 0 4px 0 4px;background-color:#2A2A2A`)}

function error() { console.log("Last error:", chrome.runtime.lastError); }

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.event === "notif") {
            chrome.notifications.create(
                request.id || request.url,
                request.notification,
                error
            )
        }
        else if (request.event === "tab"){
            chrome.tabs.create(
                {
                    url: request.page
                },
                error
            )
        }
        else if (request.event === "request") {
            (async function(){
                let response = await fetch("https://api.schoology.com/v1/" + request.url, {"headers": {"Authorization": request.authHeaders}});
                return await response.json();
            })().then(response => { sendResponse(response); });
            return true;
        }
    }
);

chrome.notifications.onClicked.addListener(
    function(id) {
        chrome.tabs.create(
            {
                url: `https://${id}`
            },
            error
        );
    }
);