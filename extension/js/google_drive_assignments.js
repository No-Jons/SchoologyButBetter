const assignmentID = window.location.pathname.match(/\/assignments\/(\d+)\//)[1];
const googleDocsURI = "/apps/lti/1073361950/run/assignment/" + assignmentID; // Insert assignment ID as param in URI

// todo: Probably find a better way to do this.
setupButtons();
$(document.body).on("click", ".nav-tab-tab-325229968", setupButtons);
$(document.body).on("click", "typography-button-primary-loader-button-3107419752", function(){
    config.completed.push(assignmentID);
    if (config.completed.length > 100){ // Make max # of completed a setting
        console.log(`Removing ${config.completed.length - 100} extraneous entries in completed assignments.`);
        config.completed = config.completed.splice(config.completed.length - 100, config.completed.length);
    }
    saveUserConfig();
});

$(document.body).on("click", ".document-header-aside-submit-unsubmitPrimaryText-3104047831", function(){
    let idx = config.completed.indexOf(assignmentID.toString());
    config.completed.splice(idx, 1);
    saveUserConfig();
});


function setupButtons() {
    let newButton = setInterval(function () {
        let contentBox = $(".content-box-container-3232021855");
        if (contentBox.length > 0 && !($(".document-btns").length > 0)) {
            contentBox.append(`<div class="document-btns">
                                   <a class="edit-document-btn-wrapper" href="${googleDocsURI}">
                                       <button class="edit-document-btn" data-sgy-component="secondary-button">Edit Document</button>
                                   </a>
                               </div>`);
            clearInterval(newButton);
        }
    }, 100);
}
