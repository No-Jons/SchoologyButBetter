let courseID = window.location.pathname.match(/\d{10,}/);
let courseEvents = [];
let courseItems;
let coursePages;
let courseDocs;
let courseDisc;
let courseFolders;
let courseCalendar;
let userGrades;
let gradedAssignments = {};
let cachedSites = {};

(async function() {
    $(".materials-filter-wrapper").remove();
    $(".materials-top").append(
        `<div class="materials-filter-wrapper sgy-materials-filter">
             <img src="/sites/all/themes/schoology_theme/images/arrow-down.png" alt="All Materials dropdown" class="materials-filter-arrow" style="left: 45px; top: 13px;">
             <div class="sgy-materials-filter-text" style="padding: 5px 10px; margin: 0 12px 0 0;">Filter</div>
         </div>
         <div class="sgy-materials-filter-list" style="display: none;">
            <div class="loading-icon" style="left: 45%;"></div>
            <div class="filters-wrapper" style="display: none;">
                <div class="type-filters">
                    <label><input type="checkbox" data-filter="assignment">Assignments</label>
                    <label><input type="checkbox" data-filter="assessment">Assessments</label>
                    <label><input type="checkbox" data-filter="event">Events</label>
                    <label><input type="checkbox" data-filter="page">Pages</label>
                    <label><input type="checkbox" data-filter="external_tool">External Tools</label>
                    <label><input type="checkbox" data-filter="discussion">Discussions</label>
                    <label><input type="checkbox" data-filter="file">Files</label>
                    <label><input type="checkbox" data-filter="link">Links</label>
                </div>
                <div class="query-filters">
                    <label>Search Query:</label>
                    <input type="text" class="query">
                    <div class="search-options" style="display: none;">
                        <label><input type="checkbox" class="regex">Regex Search</label>
                        <label><input type="checkbox" class="case-sensitive">Case Sensitive</label>
                    </div>
                </div>
                <div class="date-filters">
                    <label><input type="checkbox" class="after-date">After Date:</label>
                    <input type="date" value="${sgyDate()}" class="after-date-date">
                    <label><input type="checkbox" class="before-date">Before Date:</label>
                    <input type="date" value="${sgyDate()}" class="before-date-date">
                    <label><input type="checkbox" class="late-assignments">Search for Late (or Incomplete) Assignments</label>
                </div>
                <div class="folder-filters"></div>
                <div class="button-filters">
                    <button class="sgy-materials-filter-submit">Submit</button>
                    <button class="sgy-materials-filter-all">Show All</button>
                </div>
            </div>
         </div>`
    );
    $("#course-profile-materials-folders").append("<div id=sgy-filter></div>");

    courseItems = await fetchApiData(`/sections/${courseID}/grade_items?limit=500`);
    let nextLink = courseItems.links.next;
    for (let event of courseItems.assignment){
        courseEvents.push(event);
    }
    while (nextLink){
        let nextItems = await fetchApiData(nextLink.replace(/https:\/\/api\.schoology\.com\/v1/, ""));
        for (let event of nextItems.assignment){
            courseEvents.push(event);
        }
        nextLink = nextItems.links.next;
    }

    courseDocs = await fetchApiData(`/sections/${courseID}/documents?limit=500`);
    nextLink = courseDocs.links.next;
    while (nextLink) {
        let nextDocs = await fetchApiData(nextLink.replace(/https:\/\/api\.schoology\.com\/v1/, ""));
        for (let doc of nextDocs.document) {
            courseDocs.document.push(doc);
        }
        nextLink = nextDocs.links.next;
    }
    for (let doc of courseDocs.document) {
        doc.type = doc.attachments.files ? "file" : (doc.attachments.links ? "link" : "external_tool");
        courseEvents.push({
            "type": doc.type, "id": doc.id, "title": doc.title,
            "folder_id": doc.course_fid ? doc.course_fid.toString() : undefined,
            "filetype": doc.attachments.files ? doc.attachments.files.file[0].extension : undefined,
            "link": doc.attachments.links ? doc.attachments.links.link[0].url : undefined,
            "attachment_id": doc.attachments.files ? doc.attachments.files.file[0].id : undefined
        })
    }

    try {
        courseFolders = await fetchApiData(`/sections/${courseID}/folders?limit=500`);
        nextLink = courseFolders.links.next;
        while (nextLink) {
            let nextFolders = await fetchApiData(nextLink.replace(/https:\/\/api\.schoology\.com\/v1/, ""));
            for (let folder of nextFolders.folders) {
                courseFolders.folders.push(folder);
            }
            nextLink = nextFolders.links.next;
        }

        $(".sgy-materials-filter-list .folder-filters").append(
            `<label><input type="checkbox" class="search-folder">Search Specific Folder</label>
         <div class="folder-selector" style="display: none;">
            <label>Select Folder:</label>
         </div>`
        )
        for (let folder of courseFolders.folders) {
            $(".sgy-materials-filter-list .folder-selector").append(
                `<div class="folder-option course-materials-simple">
                <label><input type="checkbox" data-folder-id="${folder.id}"><span class="inline-icon folder-icon folder-color-${folder.color}"/>${folder.title}</label>
             </div>`
            );
        }
    } catch(err) {
        Logger.warn("Failed to load all folders, skipping...");
        $(".date-filters").css({"padding": "0", "margin": "0", "border-bottom": "none"});
    }

    $(".sgy-materials-filter-list .loading-icon").remove();
    $(".filters-wrapper").show();
})();

async function getFilteredEvents(filterList, query, afterDate, beforeDate, folders, late) {
    Logger.log(`filtering course for ${filterList} [query: ${query.text} regex: ${query.regex} after date: ${afterDate} before date: ${beforeDate} late: ${late}] in folders ${folders.length > 0 ? folders : "(all)"}`);
    $("#course-profile-materials-folders #sgy-filter *").remove();
    $("#course-profile-materials-folders form").hide();
    const type = {
        "page": "page",
        "external_tool": "external_tool",
        "assignment": "assignment",
        "event": "event",
        "assessment": "assignment",
        "assessment_v2": "assignment",
        "discussion": `course/${courseID}/materials/discussion/view`,
        "link": `course/${courseID}/materials/link/view`,
        "file": `course/${courseID}/materials/gp`

    }
    const suffix = {
        "assignment": "info",
        "external_tool": "launch",
        "event": "profile"
    }
    const icons = {
        "page": "page",
        "external_tool": "external-tool",
        "assignment": "assignment",
        "event": "event",
        "assessment": "assessment",
        "assessment_v2": "common-assessment",
        "discussion": "discussion",
        "link": "link"
    }
    const convertFiletype = {
        "mp4": "video",
        "mov": "video",
        "asf": "video",
        "avi": "video",
        "webm": "video",
        "wmv": "video",
        "bsf": "video",
        "mp3": "music",
        "ogg": "music",
        "wav": "music",
        "pcm": "music",
        "wma": "music",
        "flac": "music",
        "docx": "doc",
        "pptx": "ppt",
        "png": "image",
        "jpg": "image",
        "jpeg": "image",
        "jfif": "image",
        "gif": "image",
        "webp": "image",
        "feg": "image",
        "xlsx": "xls",
        "csv": "xls",
        "indd": "ind",
    }

    try {
        if (filterList.includes("page") || query.query || folders.length > 0) {
            if (coursePages === undefined) {
                coursePages = await fetchApiData(`/sections/${courseID}/pages?limit=500`);
                let nextLink = coursePages.links.next;
                while (nextLink) {
                    let nextPages = await fetchApiData(nextLink.replace(/https:\/\/api\.schoology\.com\/v1/, ""));
                    for (let page of nextPages.page) {
                        coursePages.page.push(page);
                    }
                    nextLink = nextPages.links.next;
                }
                for (let page of coursePages.page) {
                    courseEvents.push({
                        "type": "page",
                        "id": page.id,
                        "title": page.title,
                        "folder_id": page.folder_id ? page.folder_id.toString() : undefined
                    });
                }
            }
        }

        if (filterList.includes("discussion") || query.query || folders.length > 0) {
            if (courseDisc === undefined) {
                courseDisc = await fetchApiData(`/sections/${courseID}/discussions?limit=500`);
                let nextLink = courseDisc.links.next;
                while (nextLink) {
                    let nextDisc = await fetchApiData(nextLink.replace(/https:\/\/api\.schoology\.com\/v1/, ""));
                    for (let disc of nextDisc.discussion) {
                        courseDisc.discussion.push(disc);
                    }
                    nextLink = nextDisc.links.next;
                }
                for (let disc of courseDisc.discussion) {
                    courseEvents.push({
                        "type": "discussion",
                        "id": disc.id,
                        "title": disc.title,
                        "folder_id": disc.folder_id ? disc.folder_id.toString() : undefined
                    })
                }
            }
        }

        if (filterList.includes("event") || query.query) {
            if (courseCalendar === undefined){
                courseCalendar = await fetchApiData(`/sections/${courseID}/events?limit=500`);
                let nextLink = courseCalendar.links.next;
                while (nextLink) {
                    let nextCalendar = await fetchApiData(nextLink.replace(/https:\/\/api\.schoology\.com\/v1/, ""));
                    for (let event of nextCalendar.event){
                        courseCalendar.event.push(event);
                    }
                    nextLink = nextCalendar.links.next;
                }
                for (let event of courseCalendar.event){
                    if (event.type === "event"){
                        courseEvents.push(event);
                    }
                }

            }
        }
    } catch(err) {
        Logger.error("Ratelimit encountered, try again in 5s");
        // todo: error message popup here
    }

    let matches = 0;
    for (let event of courseEvents){
        let match;
        if (query.regex){
            let qReg = new RegExp(query.caseSensitive ? query.text : query.text.toLowerCase());
            match = query.caseSensitive ? event.title.match(qReg) : event.title.toLowerCase().match(qReg);
        }
        else if (query.query)
            match = query.caseSensitive ? event.title.includes(query.text) : event.title.toLowerCase().includes(query.text.toLowerCase());
        let dateMatch;
        if (afterDate){
            if (event.start === undefined && [undefined, ""].includes(event.due))
                dateMatch = true;
            else {
                let ts = new Date(event.start || event.due).getTime();
                dateMatch = ts > afterDate.getTime();
            }
        }
        if (beforeDate){
            if (event.start === undefined && [undefined, ""].includes(event.due))
                dateMatch = true;
            else {
                let ts = new Date(event.start || event.due).getTime();
                dateMatch = ts < beforeDate.getTime();
            }
        }
        if (late){
            if (event.start === undefined && [undefined, ""].includes(event.due))
                dateMatch = false;
            else {
                let ts = new Date(event.start || event.due).getTime();
                dateMatch = ts < new Date(Date.now()).getTime();
            }
            if (dateMatch){
                if (!gradedAssignments[event.id])
                    dateMatch = true;
                else if (gradedAssignments[event.id].grade > 0){
                    dateMatch = false;
                }
            }
        }
        if ((filterList.length > 0 ? filterList.includes(event.type) : true) && (!query.query || match) && ((!afterDate && !beforeDate && !late) || dateMatch) && (folders.length > 0 ? folders.includes(event.folder_id) : true)) {
            matches++;
            Logger.debug(`Matching event ${event.id}`);
            let date = "";
            const options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
            if (event.start || event.due){
                date = new Date(event.start ? event.start : event.due).toLocaleDateString(undefined, options);
            }
            $("#course-profile-materials-folders #sgy-filter").prepend(
                `<div class="item-${event.id} sgy-filter-item">
                              <div class="item-info">
                                  <div class="item-body">
                                      <span class="inline-icon ${event.filetype ? convertFiletype[event.filetype] || event.filetype : icons[event.type]}-icon"/>
                                      <a class="item-title" ${!(["link", "file"].includes(event.type)) ? "style=top:0!important;" : ""} href="/${type[event.type]}/${event.id}/${suffix[event.type] || ""}">${event.title}</a>
                                  </div>
                                  <div class="item-subtitle">${date}</div>
                              </div>
                          </div>`
            )
        }
    }
    $("#course-profile-materials-folders .loading-icon").remove();
    if (matches === 0)
        $("#course-profile-materials-folders #sgy-filter").prepend("<div class=\"h3-med sgy-materials-filter-no-matches\">No matches</div>");
}

$(document.body).on("click", ".sgy-materials-filter", function(){
    $(".sgy-materials-filter-list").css("display", "flex");
});

$(document.body).on("click", function(e){
    let container = $(".sgy-materials-filter-list");
    let trigger = $(".sgy-materials-filter");
    if (!container.is(e.target) && container.has(e.target).length === 0 &&
        !trigger.is(e.target) && trigger.has(e.target).length === 0)
        container.hide();
});

$(document.body).on("click", ".sgy-materials-filter-submit", function(){
    $("#course-profile-materials-folders #sgy-filter *").remove();
    $("#course-profile-materials-folders").append("<span class=\"loading-icon\" style=\"left: 45%; top: 50px;\"></span>");
    let filters = [];
    let folders = [];
    $(".sgy-materials-filter-list .type-filters input[type=checkbox]:checked").each(function(){
        let filter = $(this).attr("data-filter");
        filters.push(filter);
        if (filter === "assessment"){
            filters.push("assessment_v2");
        }
    });
    if ($(".sgy-materials-filter-list .search-folder").is(":checked")) {
        $(".sgy-materials-filter-list .folder-selector input[type=checkbox]:checked").each(function () {
            folders.push($(this).attr("data-folder-id"));
        });
    }
    const qs = $(".sgy-materials-filter-list input[type=text]").val();
    let query = qs ? {"text": qs, "regex": $(".sgy-materials-filter-list .regex").is(":checked"),
        "caseSensitive": $(".sgy-materials-filter-list .case-sensitive").is(":checked"),
        "query": true} : "";
    let afterDate = $(".after-date").is(":checked") ? $(".sgy-materials-filter-list .after-date-date").val() : false;
    let beforeDate = $(".before-date").is(":checked") ? $(".sgy-materials-filter-list .before-date-date").val() : false;
    let late = $(".late-assignments").is(":checked");
    if (late && filters.length === 0)
        filters = ["assignment", "assessment", "assessment_v2"];
    if (filters.length === 0 && !query && !afterDate && !beforeDate && folders.length === 0 && !late) {
        $("#course-profile-materials-folders .loading-icon").remove();
        $("#course-profile-materials-folders form").show();
        $(".sgy-materials-filter-list").hide();
        return;
    }
    getFilteredEvents(filters, query, afterDate ? new Date(afterDate.replace(/-/, "/")) : false,
        beforeDate ? new Date(beforeDate.replace(/-/, "/")) : false, folders, late).then();
    $(".sgy-materials-filter-list").hide();
});

$(document.body).on("click", ".sgy-materials-filter-all", function(){
    $("#course-profile-materials-folders #sgy-filter *").remove();
    $("#course-profile-materials-folders form").show();
});

$(document.body).on("change paste keyup", ".sgy-materials-filter-list .query", function(){
    let val = $(this).val();
    if (val === "")
        $(".sgy-materials-filter-list .search-options").hide();
    else
        $(".sgy-materials-filter-list .search-options").css("display", "flex");
});

$(document.body).on("change", ".search-folder", function(){
    let folders = $(".folder-selector");
    if ($(this).is(":checked"))
        folders.show();
    else
        folders.hide();
});

(async function(){
    userGrades = await fetchApiData(`/users/${userID}/grades?section_id=${courseID}`);
    let section = userGrades.section[0];
    if (section === undefined)
        return;
    for (let period of section.period) {
        let grades = period.assignment;
        for (let item of grades) {
            gradedAssignments[item.assignment_id] = {"grade": item.grade, "max": item.max_points}
        }
    }
})();

// Adds grade popup to the main course page
$(document.body).on("mouseover", ".dr .item-info .item-title a", function(){
    if (!config.course.grade_popup)
        return;
    let link = $(this).attr("href");
    let match = link.match(/(assignment|assessments)\/\d+/);
    if (match){
        let itemID = parseInt(match[0].match(/\d+/));
        let grade = gradedAssignments[itemID];
        if (!grade) {
            $(this).parent().append(`<div class="sgy-tooltip grade-popup" style="top: -3px;"><span class="sgy-tooltiptext"><span class="grade-red">N/A</span></span></div>`);
            return;
        }
        $(this).parent().append(`<div class="sgy-tooltip grade-popup" style="top: -3px;"><span class="sgy-tooltiptext"><span class="grade-green">${grade.grade}</span>/${grade.max}</span></div>`);
    }
});

// Adds grade popup to the filtered results page
$(document.body).on("mouseover", "#sgy-filter .sgy-filter-item", function(){
    if (!config.course.grade_popup)
        return;
    let link = $(this).find("a.item-title").attr("href");
    let match = link.match(/(assignment|assessments)\/\d+/);
    if (match){
        let itemID = parseInt(match[0].match(/\d+/));
        let grade = gradedAssignments[itemID];
        if (!grade) {
            $(this).find(".item-body").append(`<div class="grade-popup" style="top: 0;"><span class="grade-red">N/A</span></div>`);
            return;
        }
        $(this).find(".item-body").append(`<span class="grade-popup"><span class="grade-green">${grade.grade}</span>/${grade.max}</span>`);
    }
});

// Removes tooltip from any gradable item
$(document.body).on("mouseout", ".dr .item-info, #sgy-filter .sgy-filter-item", function(){
    $(this).find(".grade-popup").remove();
})

// Adds link tooltip to an item
$(document.body).on("mouseover", ".dr .item-info .item-body a, #sgy-filter .sgy-filter-item .item-title", async function(){
    let link = $(this).attr("href");
    let youtubeLinkMatch = link.match(/\/link\?(a=(\.+)?&)?path=(https?%3A%2F%2F(youtu\.be|youtube\.com)%2F(.{11,}))/);
    if (youtubeLinkMatch){
        if (!config.course.youtube_popup)
            return;
        let youtubeLink = "https://www.youtube.com/embed/" + youtubeLinkMatch[5];
        if ($(this).closest(".item-info").find(".show-ytvideo, .close-ytvideo").length > 0)
            return;
        $(this).closest(".item-info").append(`<span class="show-ytvideo" data-url="${youtubeLink}" frameborder="0" allowfullscreen>Show Video</span>`);
    }
});

$(document.body).on("mouseout", ".dr .item-info .item-body a, #sgy-filter .sgy-filter-item .item-title", async function(){
    $(".site-name-popup").remove();
});

$(document.body).on("click", ".show-ytvideo", function(){
    $(this).parent().append(
        `<div id="sgy-yt-wrap" data-id="${$(this).attr("data-url")}">
            <iframe src="${$(this).attr("data-url")}" frameborder="0" allowfullscreen></iframe>
         </div>`
    );
    $(this).text("Close Video");
    $(this).attr("class", "close-ytvideo");
});

$(document.body).on("click", ".close-ytvideo", function(){
    $(`#sgy-yt-wrap[data-id="${$(this).attr("data-url")}"]`).remove();
    $(this).text("Show Video");
    $(this).attr("class", "show-ytvideo");
});

$(document.body).on("mouseover", ".dr.type-document .item-info .item-body a", function(){
    if (!config.course.docviewer)
        return;
    if (!$(this).attr("href").match(/gp\/\d+/))
        return;
    if ($(this).closest(".item-info").find(".show-docviewer, .close-docviewer").length > 0)
        return;
    let itemID = parseInt($(this).attr("href").match(/gp\/(\d+)/)[1]);
    let doc;
    for (let item of courseEvents){
        if (item.id === itemID)
            doc = item;
    }
    $(this).closest(".item-info").append(`<span class="show-docviewer" data-id="${doc.attachment_id}">Show Document</span>`);
});

$(document.body).on("mouseout", ".show-docviewer, .show-ytvideo", function(){
    $(this).remove();
});

$(document.body).on("click", ".show-docviewer", function(){
    $(this).parent().append(
        `<div id="sgy-dv-wrap" data-id="${$(this).attr("data-id")}">
             <iframe id="scaled-frame" src="/attachment/${$(this).attr("data-id")}/docviewer"></iframe>
         </div>`
    );
    $(this).text("Close Docviewer");
    $(this).attr("class", "close-docviewer");
});

$(document.body).on("click", ".close-docviewer", function(){
    $(`#sgy-dv-wrap[data-id="${$(this).attr("data-id")}"]`).remove();
    $(this).text("Show Document");
    $(this).attr("class", "show-docviewer");
});