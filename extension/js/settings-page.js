// todo: manual domain whitelisting
// todo: don't save domain removal until click "Submit"

$("body").removeClass("sExtlink-processed");
$("#wrapper").remove();
$("footer._2T2dA._3_bfp").remove();
$("#body").append(`
    <div id="sgy-settings-wrapper">
        <div id="sgy-settings-header">Schoology But Better Settings</div>
        <div id="sgy-settings-inner">
            <div id="sgy-settings-forms">
                <div id="sgy-settings-section">
                    <header class="sgy-settings-section-header">Notifications</header>
                    <form id="sgy-settings-notifications">
                        <div id="sgy-settings-setting" class="enabled">
                            <input type="checkbox" ${config.notifications.enabled ? "checked" : ""}>
                            <label id="sgy-settings-label">Receive notifications</label>
                            <span id="sgy-settings-description">If enabled, you will recieve notifications for upcoming assignments as their due date nears.</span>
                        </div>
                        <div id="sgy-settings-setting" class="one_hour">
                            <input type="checkbox" ${config.notifications.one_hour ? "checked" : ""}>
                            <label id="sgy-settings-label">1 hour notification</label>
                            <span id="sgy-settings-description">Send a notification if an assignment is due in ~1 hour</span>
                        </div>
                        <div id="sgy-settings-setting" class="ten_minutes">
                            <input type="checkbox" ${config.notifications.ten_minutes ? "checked" : ""}>
                            <label id="sgy-settings-label">10 minutes notification</label>
                            <span id="sgy-settings-description">Send a notification if an assignment is due in ~10 minutes</span>
                        </div>
                        <div id="sgy-settings-setting" class="check_interval">
                            <input type="number" value="${config.notifications.check_interval}" min="120" max="3600">
                            <label id="sgy-settings-label">Notification check interval</label>
                            <span id="sgy-settings-description">How often to check assignment due dates and send notifications, in seconds</span>
                        </div>
                    </form>
                </div>
                <div id="sgy-settings-section">
                    <header class="sgy-settings-section-header">Course Page</header>
                    <form id="sgy-settings-course">
                        <div class="sgy-settings-setting docviewer">
                            <input type="checkbox" ${config.course.docviewer ? "checked" : ""}>
                            <label id="sgy-settings-label">Docviewer Popup</label>
                            <span id="sgy-settings-description">Show docviewer popup when you hover over a document's link</span>
                        </div>
                        <div class="sgy-settings-setting grade_popup">
                            <input type="checkbox" ${config.course.grade_popup ? "checked" : ""}>
                            <label id="sgy-settings-label">Show Grade Tooltip</label>
                            <span id="sgy-settings-description">Show a tooltip containing an assignment's grade information while hovering over an assignment</span>
                        </div>
                        <div class="sgy-settings-setting youtube_popup">
                            <input type="checkbox" ${config.course.youtube_popup ? "checked" : ""}>
                            <label id="sgy-settings-label">Show Youtube Video Embed</label>
                            <span id="sgy-settings-description">Show a video embed after hovering over a youtube link</span>
                        </div>
                    </form>
                </div>
                <div id="sgy-settings-section">
                    <header class="sgy-settings-section-header">Focus Mode</header>
                    <span class="sgy-whitelisted-domains-header">Whitelisted Domains</span>
                    <div class="sgy-whitelisted-domains"></div>
                </div>
                <div id="sgy-settings-section">
                    <header class="sgy-settings-section-header">Theme</header>
                    <span class="theme-external-page" style="color: var(--link)!important;">Go To Theme Editor</span>
                </div>
            <div class="submit-span-wrapper">
                <a href="/home">
                    <input id="sgy-settings-submit" type="submit" class="form-submit">
                </a>
            </div>
        </div>
    </div>
`);
for (let x of config.focus.whitelist.slice(1)){
    $(".sgy-whitelisted-domains").append(`
       <div class="sgy-domain-wrapper" data-domain="${x}">
           <span class="sExtlink-processed sgy-domain">${x}</span>
           <button class="sgy-blacklist-domain" data-domain="${x}">Remove</button>
       </div>
    `);
}

$(document.body).on("click", ".theme-external-page", function(){
    chrome.runtime.sendMessage({"event": "tab", "page": "/html/theme.html"});
})

$(document.body).on("click", "#sgy-settings-submit", function() {
    config.notifications = {
        enabled: $(".enabled input").is(":checked"),
        one_hour: $(".one_hour input").is(":checked"),
        ten_minutes: $(".ten_minutes input").is(":checked"),
        check_interval: parseInt($(".check_interval input").val())
    }
    config.course = {
        docviewer: $(".docviewer input").is(":checked"),
        grade_popup: $(".grade_popup input").is(":checked"),
        youtube_popup: $(".youtube_popup input").is(":checked")
    }
    saveUserConfig();
    Logger.log("Updated extension settings");
});

$(document.body).on("click", ".sgy-blacklist-domain", function(){
    let idx = config.focus.whitelist.indexOf($(this).attr("data-domain"));
    config.focus.whitelist.splice(idx, 1);
    saveUserConfig();
    Logger.debug(config.focus.whitelist);
    $(`.sgy-domain-wrapper[data-domain=${$(this).attr("data-domain")}]`).remove();
});
