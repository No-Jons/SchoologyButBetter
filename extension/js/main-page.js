(async function(){
    courseQuicklinks(await fetchApiData(`/users/${userID}/sections`));
    profileQuicklinks();
    setupToDoList();
    setupAssignmentActions()
    markCompletedAssignments();
})();

function courseQuicklinks(userSections) {
    document.getElementById("right-column-inner").insertAdjacentHTML("afterbegin", "<div id=\"sgy-ext-wrapper\"><div id=\"quick-access-courses\" class=\"courses-menu-icon\"></div></div>");
    let quickAccess = document.getElementById("quick-access-courses");
    quickAccess.insertAdjacentHTML("beforeend", "<h3 class=\"h3-med\">Courses<a class=\"sgy-course-reorder\" href=\"/courses?reorder\">Reorder</a></h3>");
    let section;
    for (let i = 0; i < userSections.section.length; i++) {
        section = userSections["section"][i];
        quickAccess.insertAdjacentHTML("beforeend", `<div id="${section['id']}-wrapper" class="section-course-wrapper"><a id=\"${section['id']}\" class="course-link" href="/course/${section['id']}">${section.course_title}</a></div>`)
        document.getElementById(`${section['id']}-wrapper`).insertAdjacentHTML("beforeend", `<a id="course-shortcut" href="/course/${section['id']}/updates"><span id="sgy-updates-icon"></span></a><a id="course-shortcut" href="/course/${section['id']}/student_grades"><span id="sgy-grade-icon"></span></a><a id="course-shortcut" href="/course/${section['id']}/student_mastery"><span id="sgy-mastery-icon"></span></a>`)
    }
    quickAccess.insertAdjacentHTML("beforeend",
        `<h3 class="h3-med" style=\"margin-top: 10px;\">Quick Access</h3>
                  <div id="sgy-quick-access-container">
                    <a class="sgy-quick-access-link" href="/user/${userID}/info">Profile</a>
                    <a class="sgy-quick-access-link" href="/courses">Courses</a>
                    <a class="sgy-quick-access-link" href="/grades/grades">Grades</a>
                    <a class="sgy-quick-access-link" href="/mastery">Mastery</a>
                    <a class="sgy-quick-access-link" href="/resources">Resources</a>
                    <a class="sgy-quick-access-link" href="/groups">Groups</a>
                  </div>`
    )
    quickAccess.insertAdjacentHTML("afterend", "<div id=\"to-do-list\"><span id=\"empty-to-do-list\">No items in list... yet!</span></div>");
    let toDoList = document.getElementById("to-do-list");
    toDoList.insertAdjacentHTML("afterbegin", "<h3 class=\"h3-med\" style=\"margin-top: 10px;\">To-Do List</h3>");
}

function profileQuicklinks() {
    let profile = $("._1tpub ._2Id_D img.USYsM");
    let profileImage = profile.attr("src");
    let studentName = profile.attr("alt");
    let userInfoDrop = $(`div[data-sgy-sitenav="header-my-account-menu"] button`);
    userInfoDrop.click();
    let schoolLink = $(`li a[href^="/school"]`).attr("href");
    let logoutLink = $(`li a[href^="/logout?ltoken"]`).attr("href");
    userInfoDrop.click();
    $("#right-column-inner").prepend(
        `<div id="sgy-profile-wrapper">
                <div id="sgy-profile">
                    <h3 class="h3-med">${studentName}</h3>
                    <img src="${profileImage}" alt="${studentName}" id="sgy-profile-image">
                    <div id="sgy-profile-links">
                        <a href="/user/${userID}/info" class="profile-link" style="margin-right:30px;"><span><span id="sgy-person-icon"></span>Profile</span></a>
                        <a href="/settings/account" class="profile-link" style="margin-right:30px;"><span><span id="sgy-settings-icon"></span>Settings</span></a>
                        <a href="${schoolLink}" class="profile-link"><span><span id="sgy-school-icon"></span>School</span></a>
                        <a href="${logoutLink}" class="profile-link"><span><span id="sgy-remove-icon"></span>Logout</span></a>
                    </div>
                </div>
             </div>`
    );
}

function setupToDoList() {
    let assignmentID;
    Logger.log("Setting up to-do list");
    for (let i = 0; i < config.todolist.length; i++){
        assignmentID = config.todolist[i];
        Logger.debug(`Adding assignment ${assignmentID} to to-do list`);
        reAddItemToToDoList(assignmentID);
    }
    Logger.log("Marking assignment priorities");
    for (let i = 0; i < config.priorities.length; i++){
        assignmentID = config.priorities[i];
        Logger.debug(`Marking assignment ${assignmentID} as a priority`);
        $(`#to-do-list-item.${assignmentID}-to-do`).addClass("priority");
        let button = $(`.sgy-mark-priority-toggle[data-id="${assignmentID}"]`);
        button.attr("data-action", "unprioritize");
    }
}

function setupAssignmentActions() {
    let assignments = getAssignments(true);
    let assignment;
    Logger.log("Adding action buttons to valid assignments");
    for (let i = 0; i < assignments.length; i++){
        assignment = assignments[i];
        let assignmentElement = $(`div[data-start] a[href$="${assignment}"]`);
        assignmentElement.parent().append(
            `<div id="sgy-action" class="sgy-assignment-complete-toggle green-check" data-id="${assignment}" data-action="markcomplete"></div><div id="sgy-action" class="sgy-add-to-todo" data-id="${assignment}" data-action="addtolist"></div>`
        );
    }
}

function markCompletedAssignments(){
    let assignments = getAssignments(true);
    let assignment;
    let submissions = [];
    let submitted;
    Logger.log("Marking completed assignments as complete");
    for (let i = 0; i < assignments.length; i++) {
        assignment = assignments[i];
        submitted = config.completed.includes(assignment.toString());
        submissions.push({submission: submitted, assignment: assignment});
    }
    let submission;
    for (let i = 0; i < submissions.length; i++) {
        submission = submissions[i];
        if (submission.submission) {
            toggleAssignmentComplete(submission.assignment, submission.submission, false);
        }
    }
}

function getAssignments(overdue){
    Logger.log("Fetching assignments");
    let assignments = [];
    $(".upcoming-events .upcoming-event:not(.hidden)").each(function() {
        let inner = $($(this).html());
        let linkRegex = /(\/assignment\/|\/course\/\d+\/materials\/discussion\/view\/|\/event\/)/;
        let assignmentID = $("a", inner).attr("href");
        if (assignmentID !== undefined) {
            if (assignmentID.match(linkRegex)) {
                assignmentID = assignmentID.replace(linkRegex, "").match(/\d+/);
                assignments.push(assignmentID);
            }
        }
    });
    if (overdue === true){
        $("#overdue-submissions .upcoming-event:not(.hidden)").each(function() {
            let inner = $($(this).html());
            let linkRegex = /(\/assignment\/|\/course\/\d+\/materials\/discussion\/view\/|\/event\/)/;
            let assignmentID = $("a", inner).attr("href");
            if (assignmentID !== undefined) {
                if (assignmentID.match(linkRegex)) {
                    assignmentID = assignmentID.replace(linkRegex, "").match(/\d+/);
                    assignments.push(assignmentID);
                }
            }
        });
    }
    return assignments;
}

function reAddItemToToDoList(assignmentID){
    let assignmentElement = $(`a[href$="${assignmentID}"]`);
    if (!(assignmentElement.length)) {
        return;
    }
    assignmentElement = assignmentElement.closest(".course-event").clone();
    $(".infotip", assignmentElement).append(`<div id="sgy-action" class="sgy-remove-from-todo" data-id="${assignmentID}" data-action="removefromlist"></div><div id="sgy-action" class="sgy-mark-priority-toggle" data-id="${assignmentID}" data-action="prioritize"></div>`);
    document.getElementById("to-do-list").insertAdjacentHTML("beforeend", `<div id=\"to-do-list-item\" class="upcoming-event course-event ${assignmentID}-to-do to-do">${assignmentElement.html()}</div>`);
    $("#empty-to-do-list").hide();
}

function addItemToToDoList(assignmentID){
    if (config.todolist.includes(assignmentID.toString())) { return; }
    // if (config.todolist.length > 100) { config.todolist.shift(); }
    let assignmentElement = $(`.course-event:not(.to-do) a[href$="${assignmentID}"]`).closest(".course-event").clone();
    if (assignmentElement.hasClass("complete")) { return; }
    Logger.debug(`Adding assignment ${assignmentID} to to-do list`);
    $(".infotip .sgy-add-to-todo", assignmentElement).remove();
    $(".infotip .sgy-assignment-complete-toggle", assignmentElement).remove();
    $(".infotip", assignmentElement).append(`<div id="sgy-action" class="sgy-remove-from-todo" data-id="${assignmentID}" data-action="removefromlist"></div><div id="sgy-action" class="sgy-mark-priority-toggle" data-id="${assignmentID}" data-action="prioritize"></div>`);
    document.getElementById("to-do-list").insertAdjacentHTML("beforeend", `<div id=\"to-do-list-item\" class="upcoming-event course-event ${assignmentID}-to-do to-do">${assignmentElement.html()}</div>`);
    config.todolist.push(assignmentID);
    $("#empty-to-do-list").hide();
    if (config.todolist.length > 100){ // Make max # of todolist assignments a setting
        Logger.log(`Removing ${config.todolist.length - 100} extraneous entries in completed assignments.`);
        config.todolist = config.todolist.splice(config.todolist.length - 100, config.todolist.length);
    }
    saveUserConfig();
}

function removeItemFromToDoList(assignmentID){
    let element = $(`#to-do-list-item.${assignmentID}-to-do`);
    if (!(element.length))
        return;
    Logger.debug(`Removing assignment ${assignmentID} from to-do list`);
    element.remove();
    let idx = config.todolist.indexOf(assignmentID.toString());
    config.todolist.splice(idx, 1);
    if (config.priorities.includes(assignmentID.toString())){
        idx = config.todolist.indexOf(assignmentID.toString());
        config.priorities.splice(idx, 1);
    }
    // mark complete on remove from to-do list.
    toggleAssignmentComplete(assignmentID, true, true, false);
    saveUserConfig();
    if (config.todolist.length === 0) { $("#empty-to-do-list").show(); }
}

function toggleAssignmentComplete(assignmentID, on, save, remove){
    let assignmentElement;
    let button;
    if (on === true) {
        Logger.debug(`Marking assignment ${assignmentID} as complete`);
        assignmentElement = $(`.course-event:not(.to-do) a[href$="${assignmentID}"]`).parent();
        assignmentElement.closest(".course-event").addClass("complete");
        button = $(".sgy-assignment-complete-toggle", assignmentElement);
        button.attr("data-action", "markincomplete");
        button.css("background-color", "#4aff29");
        button.css("color", "#000000");
        switch (remove) {
            case undefined:
            case true:
                removeItemFromToDoList(`${assignmentID}`);
        }
        switch (save) {
            case undefined:
            case true:
                config.completed.push(assignmentID);
                saveUserConfig();
        }
    } else {
        Logger.debug(`Unmarking assignment ${assignmentID} as complete`);
        assignmentElement = $(`.course-event:not(.to-do) a[href$="${assignmentID}"]`).closest(".course-event");
        assignmentElement.removeClass("complete");
        button = $(".sgy-assignment-complete-toggle", assignmentElement);
        button.attr("data-action", "markcomplete");
        button.css("background-color", "#ffffff");
        button.css("color", "#ffffff");
        let idx = config.completed.indexOf(assignmentID.toString());
        switch (save) {
            case undefined:
            case true:
                config.completed.splice(idx, 1);
                saveUserConfig();
        }
    }
    if (config.completed.length > 100){ // Make max # of completed a setting
        Logger.log(`Removing ${config.completed.length - 100} extraneous entries in completed assignments.`);
        config.completed = config.completed.splice(config.completed.length - 100, config.completed.length);
        saveUserConfig();
    }
}

function toggleAssignmentPriority(assignmentID, on){
    let button;
    if (on === true){
        Logger.debug(`Unmarking assignment ${assignmentID} as priority`);
        $(`#to-do-list-item.${assignmentID}-to-do`).removeClass("priority");
        button = $(`.sgy-mark-priority-toggle[data-id="${assignmentID}"]`);
        button.attr("data-action", "prioritize");
        let idx = config.priorities.indexOf(assignmentID);
        config.priorities.splice(idx, 1);
    } else {
        Logger.debug(`Marking assignment ${assignmentID} as priority`);
        $(`#to-do-list-item.${assignmentID}-to-do`).addClass("priority");
        button = $(`.sgy-mark-priority-toggle[data-id="${assignmentID}"]`);
        button.attr("data-action", "unprioritize");
        config.priorities.push(assignmentID);
    }
    if (config.priorities.length > 100){ // Make max # of priorities a setting
        Logger.log(`Removing ${config.priorities.length - 100} extraneous entries in prioritized assignments`);
        config.priorities = config.priorities.splice(config.priorities.length - 100, config.priorities.length);
    }
    saveUserConfig();
}

$(document.body).on("click", "#sgy-action", function(){
    let action = $(this).attr("data-action");
    let assignmentID;
    let on;
    switch (action) {
        case "addtolist":
            assignmentID = $(this).attr("data-id");
            addItemToToDoList(assignmentID);
            break;
        case "removefromlist":
            assignmentID = $(this).attr("data-id");
            removeItemFromToDoList(assignmentID);
            break;
        case "markcomplete":
        case "markincomplete":
            let assignmentElement = $("a[href]", $(this).closest(".course-event"));
            assignmentID = (assignmentElement.attr("href")).replace(/\/assignment\/|\/course\/\d+\/materials\/discussion\/view\//, "").match(/\d+/)[0];
            on = (action === "markcomplete");
            toggleAssignmentComplete(assignmentID, on, true);
            break;
        case "prioritize":
        case "unprioritize":
            assignmentID = $(this).attr("data-id");
            on = (action === "unprioritize");
            toggleAssignmentPriority(assignmentID, on);
            break;
    }
});