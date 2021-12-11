const Logger = {
    log: (() => console.log.bind(window.console, "%cLOG:", logCSS(230, 100, 60)))(),
    error: (() => console.error.bind(window.console, "%cERROR:", logCSS(8, 87, 47)))(),
    debug: (() => console.debug.bind(window.console, "%cDEBUG:", logCSS(127, 96, 28)))(),
    warn: (() => console.warn.bind(window.console, "%cWARNING:", logCSS(53, 100, 40)))(),
    trace: (() => console.trace.bind(window.console, "%cTRACE:", logCSS(38, 83, 50)))()
}

function logCSS(h, s, l){
    let color = `hsl(${h},${s}%,${l}%)`;
    return `color:${color};border:1px solid ${color};background-color:hsl(${h},${s}%,${Math.round((l/2)*3)}%);`
}

function error() { Logger.error("Last error:", chrome.runtime.lastError); }

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        switch(request.event) {
            case "notif":
                chrome.notifications.create(
                    request.id || request.url,
                    request.notification,
                    error
                );
                break;
            case "tab":
                chrome.tabs.create(
                    {
                        url: request.page
                    },
                    error
                );
                break;
            case "close_tab":
                chrome.tabs.query({active: true}, function(tabs){
                    chrome.tabs.remove(tabs[0].id);
                });
                break;
            case "edit_tab":
                chrome.tabs.query({active: true}, function(tabs){
                    chrome.tabs.update(tabs[0].id, request.options);
                });
                break;
            case "request":
                (async function () {
                    let response = await fetch("https://api.schoology.com/v1/" + request.url, {"headers": {"Authorization": request.authHeaders}});
                    return await response.json();
                })().then(response => {
                    sendResponse(response);
                });
                break;
        }
        return true;
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

chrome.webNavigation.onCompleted.addListener(function(details){
    if (details.frameId === 0) {
        chrome.tabs.get(details.tabId, function (tab) {
            if (tab.url === details.url) {
                checkValidUrl(tab);
            }
        });
    }
});

chrome.tabs.onActivated.addListener(function(details){
    chrome.tabs.get(details.tabId, function (tab) {
        checkValidUrl(tab);
    });
});

function checkValidUrl(tab){
    chrome.storage.sync.get(["userConfig"], function(r){
        if (!r.userConfig.focus.enabled) { return; }
        if (!tab.url.match(/chrome:\/\/.+/)){
            let domain = tab.url.match(/[a-z]+:\/\/((.+\.)?.+\.[a-z]+)/)[1];
            // todo: check domains w/out subdomains as well
            if (!r.userConfig.focus.whitelist.includes(domain)){
                Logger.log(`Redirecting from domain ${domain}`);
                chrome.tabs.update(tab.id, {url: `/html/focus-mode.html?url=${encodeURI(tab.url)}`});
            }
        }
    });
}