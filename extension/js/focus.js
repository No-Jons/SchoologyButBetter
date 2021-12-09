chrome.storage.sync.get(["userConfig"], function(result){
    if (result.userConfig.focus === undefined){
        result.userConfig.focus = {
            enabled: false,
            strict: false,
            whitelist: []
        }
    } // todo: Remove this next update
    checkValidURI(result.userConfig.focus);
})