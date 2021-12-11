$("#body").append(
    `<div id="focus-mode-wrapper">
        <div class="focus-toggle">
            <input class="focus-toggle-check" type="checkbox" ${config.focus.enabled ? "checked" : ""}>
            <label class="focus-toggle-label">Enable Focus Mode</label>
        </div>
        <div class="focus-open-wrapper">
            <div class="focus-open" data-open="0px">></div>
        </div>
    </div>`
);

$(document.body).on("click", ".focus-open-wrapper", function(){
    let button = $(".focus-open");
    let open = button.attr("data-open");
    button.text(open === "0px" ? "<" : ">");
    $("#focus-mode-wrapper").animate({left: open});
    button.attr("data-open", open === "0px" ? "-144px" : "0px");
});

$(document.body).on("click", ".focus-toggle-check", function(){
    config.focus.enabled = $(this).is(":checked");
    Logger.log(`${config.focus.enabled === true ? "Enabled" : "Disabled"} focus mode`);
    saveUserConfig();
});
