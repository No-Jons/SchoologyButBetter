let sgySite = "https://sgy.no-jons.xyz/";

function getAuthHeaders(){
    return `OAuth realm="Schoology%20API",oauth_consumer_key="${config.key}",oauth_signature_method="PLAINTEXT",oauth_timestamp="${Math.floor(Date.now() / 1000)}",oauth_nonce="${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}",oauth_version="1.0",oauth_signature="${config.secret}%26"`
}

async function getKeys() {
    if (config.key && config.secret)
        return;
    Logger.log("Getting Schoology API key and secret");
    let key;
    let secret;
    let html = await ( await fetch("https://" + defaultDomain + "/api")).text();
    let docParser = new DOMParser();
    let doc = docParser.parseFromString(html, "text/html");
    if ((key = doc.getElementById("edit-current-key")) && (secret = doc.getElementById("edit-current-secret"))){
        config.key = key.getAttribute("value");
        config.secret = secret.getAttribute("value");
        saveUserConfig();
    } else {
        try {
            Logger.log("Creating new API key or secret");
            let submitData = new FormData(doc.getElementById("s-api-register-form"));
            await fetch("https://" + defaultDomain + "/api", {
                credentials: "same-origin",
                body: submitData,
                method: "post"
            });
            await getKeys();
        } catch(err) {
            Logger.error(`Could not create new API key and secret: ${err}`);
        }
    }
}

(async function(){ await getKeys(); })();

async function fetchApiData(path){
    // todo: error handling
    Logger.log(`Fetching data from ${path}`);
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            {
                "event": "request",
                "url": encodeURI(path),
                "authHeaders": getAuthHeaders()
            }, function (response) {
                resolve(response)
            });
    });
}


// todo: maybe remove this?
async function fetchSiteInfo(link){
    let responseJson;
    Logger.log(`Getting summary for site ${link}`);
    let response = fetch(sgySite + `site_info?site=${link}`);
    await response.then(function(value) {
        responseJson = value.json();
    });
    return responseJson;
}
