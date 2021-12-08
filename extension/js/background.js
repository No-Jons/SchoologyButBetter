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