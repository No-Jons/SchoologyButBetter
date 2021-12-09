let url = window.location.href.match(/\?url=(https:\/\/((.+\.)?.+\.[a-z]+).+)/);
let uri = url[1]
    domain = url[2];

if (uri){
    Logger.debug(`Redirected from domain ${domain}`);
    $(".focus-embedded-domain").text(domain);
} else {
    Logger.error("No domain was provided.");
}

$(".focus-cancel").on("click", function(){
    chrome.runtime.sendMessage({event: "close_tab"});
});

$(".focus-whitelist").on("click", function(){
    chrome.storage.sync.get(["userConfig"], function(r){
        r.userConfig.focus.whitelist.push(domain);
        chrome.storage.sync.set({"userConfig": r.userConfig});
    });
    chrome.runtime.sendMessage({event: "edit_tab", options: {url: uri}});
});
