// notes data structure
// {
//      content: "...",
//      id: "...",
//      color: "#FFFFFF",
//      display: false,
//      pos: {
//          x: 0,
//          y: 0
//      }
// }

let notes;
let notesPopupActive = false;
let mouseDrag = false;
$("nav[role=navigation] ul:first-of-type").append(`<li id="sgy-notes-button-wrapper" class="_24avl _3Rh90 _349XD"><button id="sgy-notes-button" class="_1SIMq _2kpZl _3OAXJ _13cCs _3_bfp _2M5aC _24avl _3v0y7 _2s0LQ _3ghFm _3LeCL _31GLY _9GDcm _1D8fw util-height-six-3PHnk StandardHeader-header-button-active-state-V0d6c Header-header-button-1EE8Y fjQuT uQOmx">Notes</button></li>`);
$("#body").append(`<div id="sgy-notes-display"></div>`);
notes = config.notes;
for (let note of notes){
    if (note.display)
        displayNote(note);
}


function formatNotes(){
    let formattedNotes = [];
    for (let note of notes)
        formattedNotes.push(`<div class="sgy-note-menu-item" data-id="${note.id}"><div class="sgy-note-menu-content" style="background-color: ${note.color};">${note.content}</div><div class="sgy-note-menu-controls"><button class="sgy-display-note _9e7c_ _13cCs _3U8Br _2M5aC _3v0y7 _3ghFm _2s0LQ _3LeCL dVlNp _10N3s _3Wb6n" data-id="${note.id}">Display</button><button class="sgy-edit-note _9e7c_ _13cCs _3U8Br _2M5aC _3v0y7 _3ghFm _2s0LQ _3LeCL dVlNp _10N3s _3Wb6n" data-id="${note.id}">Edit</button><button class="sgy-delete-note _9e7c_ _13cCs _3U8Br _2M5aC _3v0y7 _3ghFm _2s0LQ _3LeCL dVlNp _10N3s _3Wb6n" data-id="${note.id}">Delete</button></div></div>`);
    return formattedNotes;
}

function displayNote(note) { $("#sgy-notes-display").append(`<div class="sgy-note-display" data-id="${note.id}" style="background-color: ${note.color}; left: ${note.pos.x}px; top: ${note.pos.y}px;"><div class="sgy-note-display-top" data-id="${note.id}"></div><div class="sgy-note-display-content">${note.content}</div><button class="sgy-remove-note" data-id="${note.id}">X</button></div>`); }

function openNotePopup(){
    if (notesPopupActive) return;
    notesPopupActive = true;
    $("#sgy-notes-button-wrapper").append(`<div id="sgy-notes-menu-wrapper" class="_2mWUT _3RmDr _2xvND _2trRU j17AQ S42JQ _1Z0RM util-width-thirty-nine-1B-gb VSOiH _2ue1O les2- util-box-shadow-dropdown-2Bl9b util-margin-top-negative-point-four-3GRLY fjQuT uQOmx"></div>`);
    $("#sgy-notes-menu-wrapper").append(`<div class="_2JX1Q _2awxe _3skcp _1tpub _26UWf _2nSV0 util-justify-content-space-between-3euFK"><h3 class="_3eD4l _2L1lG _3v0y7 _2K08O">Notes</h3><button id="sgy-new-note" class="_9e7c_ _13cCs _3U8Br _2M5aC _3v0y7 _3ghFm _2s0LQ _3LeCL dVlNp _10N3s _3Wb6n">New Note</button></button></div><div id="sgy-notes-menu"></div>`);
    let noteNodes = formatNotes();
    for (let note of noteNodes)
        $("#sgy-notes-menu").append(note);
}

function closeNotePopup(){
    $("#sgy-notes-menu-wrapper").remove();
    notesPopupActive = false;
}

function closeNoteEditor(){ $("#sgy-note-editor-wrapper").remove(); }

$(document.body).on("click", "#sgy-notes-button", function(){ openNotePopup(); });

$(document.body).on("click", "#sgy-notes-menu-wrapper, #sgy-notes-button", function(e){ e.stopPropagation(); });

$(document.body).on("click", function(){
    if (notesPopupActive)
        closeNotePopup();
});

$(document.body).on("click", "#sgy-new-note", function(){
    closeNotePopup();
    $("#sgy-notes-button-wrapper").append(`<div id="sgy-note-editor-wrapper" class="_2mWUT _3RmDr _2xvND _2trRU j17AQ S42JQ _1Z0RM util-width-thirty-nine-1B-gb VSOiH _2ue1O les2- util-box-shadow-dropdown-2Bl9b util-margin-top-negative-point-four-3GRLY fjQuT uQOmx"></div>`);
    $("#sgy-note-editor-wrapper").append(`<div id="sgy-note-editor-options"><div><h3 class="sgy-popup-header">Note Text:</h3><textarea id="sgy-note-content"></textarea></div><div><h3 class="sgy-popup-header">Note Color:</h3><select id="sgy-note-color"><option value="#ebc934" selected="selected">Yellow</option><option value="#67db5e">Green</option><option value="#ed928c">Red</option><option value="#e8ad38">Orange</option><option value="#8aa9e3">Blue</option><option value="#a88ae3">Purple</option><option value="#e38acb">Pink</option><option value="#8ae0e3">Teal</option></select></div></div><div id="sgy-note-editor-buttons" class="submit-buttons"><span class="submit-span-wrapper"><input type="submit" name="op" id="sgy-note-save" value="Save" class="form-submit"></span><a id="sgy-cancel-note" class="cancel-btn schoology-processed">Cancel</a></div>`);
});

$(document.body).on("click", "#sgy-cancel-note",  function(){ closeNoteEditor(); });

$(document.body).on("click", "#sgy-note-save", function(){
    let noteData = {
        content: $("#sgy-note-content").val(),
        id: generateID(),
        color: $("#sgy-note-color option:selected").attr("value"),
        display: false,
        pos: {
            x: 0,
            y: 0
        }
    }
    config.notes.push(noteData);
    saveUserConfig();
    closeNoteEditor();
});

$(document.body).on("click", ".sgy-delete-note", function(){
    let noteID = $(this).attr("data-id");
    for (let idx = 0; idx < notes.length; idx++){
        let note = notes[idx];
        if (note.id === noteID)
            config.notes.splice(idx, 1);
    }
    $(`.sgy-note-menu-item[data-id=${noteID}]`).remove();
    let displayNote = $(`.sgy-note-display[data-id=${noteID}]`);
    if (displayNote.length > 0) displayNote.remove();
    notes = config.notes;
    saveUserConfig();
});

$(document.body).on("click", ".sgy-display-note", function(){
    let noteID = $(this).attr("data-id");
    let displayNote = $(`.sgy-note-display[data-id=${noteID}]`);
    if (displayNote.length > 0) return;
    let note;
    for (let idx = 0; idx < notes.length; idx++) {
        let noteTemp = notes[idx];
        if (noteTemp.id === noteID) {
            config.notes[idx].display = true;
            note = noteTemp;
        }
    }
    notes = config.notes;
    $("#sgy-notes-display").append(`<div class="sgy-note-display" data-id="${note.id}" style="background-color: ${note.color}; left: ${note.pos.x}px; top: ${note.pos.y}px;"><div class="sgy-note-display-top" data-id="${note.id}"></div><div class="sgy-note-display-content">${note.content}</div><button class="sgy-remove-note" data-id="${note.id}">X</button></div>`);
});

let selectedID;
let selectedItem;
$(document.body).on("mousedown", ".sgy-note-display-top", function(){
    mouseDrag = true;
    selectedID = $(this).attr("data-id");
    selectedItem = $(`.sgy-note-display[data-id=${selectedID}]`);
    $("#sgy-notes-display").css("pointer-events", "all");
    $("#sgy-notes-display:hover").css("cursor", "grabbing");
    $(".sgy-remove-note, .sgy-note-display-content").css("user-select", "none");
    $(".sgy-note-display-top:hover").css("cursor", "grabbing");
    $(document.body).on("mousemove", function(e){
        if (mouseDrag) {
            selectedItem.css("left", e.pageX - (selectedItem.width() / 2) + "px");
            selectedItem.css("top", e.pageY - 7.5 + "px");
        }
    });
}).on("mouseup", document.body, function(e){
    if (!mouseDrag) return;
    mouseDrag = false;
    $(".sgy-note-display-top:hover").css("cursor", "grab");
    $("#sgy-notes-display").css("pointer-events", "none");
    $("#sgy-notes-display:hover").css("cursor", "initial");
    $(".sgy-remove-note, .sgy-note-display-content").css("user-select", "auto");
    for (let idx = 0; idx < notes.length; idx++) {
        let note = notes[idx];
        if (note.id === selectedID) {
            config.notes[idx].pos.x = e.pageX - (selectedItem.width() / 2);
            config.notes[idx].pos.y = e.pageY - 7.5;
        }
    }
    notes = config.notes;
    saveUserConfig();
});

$(document.body).on("click", ".sgy-remove-note", function(){
    let noteID = $(this).attr("data-id");
    for (let idx = 0; idx < notes.length; idx++) {
        let noteTemp = notes[idx];
        if (noteTemp.id === noteID)
            config.notes[idx].display = false;
    }
    $(`.sgy-note-display[data-id=${noteID}]`).remove();
    notes = config.notes;
    saveUserConfig();
})

$(document.body).on("click", ".sgy-edit-note", function(){
    let noteID = $(this).attr("data-id");
    let note;
    for (let idx = 0; idx < notes.length; idx++) {
        let noteTemp = notes[idx];
        if (noteTemp.id === noteID)
            note = noteTemp;
    }
    closeNotePopup();
    $("#sgy-notes-button-wrapper").append(`<div id="sgy-note-editor-wrapper" class="_2mWUT _3RmDr _2xvND _2trRU j17AQ S42JQ _1Z0RM util-width-thirty-nine-1B-gb VSOiH _2ue1O les2- util-box-shadow-dropdown-2Bl9b util-margin-top-negative-point-four-3GRLY fjQuT uQOmx"></div>`);
    $("#sgy-note-editor-wrapper").append(`<div id="sgy-note-editor-options"><div><h3 class="sgy-popup-header">Note Text:</h3><textarea id="sgy-note-content">${note.content}</textarea></div></div><div id="sgy-note-editor-buttons" class="submit-buttons"><span class="submit-span-wrapper"><input type="submit" name="op" id="sgy-note-edit" value="Save" class="form-submit" data-id="${note.id}"></span><a id="sgy-cancel-note" class="cancel-btn schoology-processed">Cancel</a></div>`);
    // <select id="sgy-note-color"><option value="#ebc934" selected="selected">Yellow</option><option value="#67db5e">Green</option><option value="#ed928c">Red</option><option value="#e8ad38">Orange</option><option value="#8aa9e3">Blue</option><option value="#a88ae3">Purple</option><option value="#e38acb">Pink</option><option value="#8ae0e3">Teal</option></select>
});

$(document.body).on("click", "#sgy-note-edit", function(){
    let noteID = $(this).attr("data-id");
    let content = $("#sgy-note-content").val();
    for (let idx = 0; idx < notes.length; idx++) {
        let noteTemp = notes[idx];
        if (noteTemp.id === noteID)
            config.notes[idx].content = content;
    }
    notes = config.notes;
    saveUserConfig();
    closeNoteEditor();
    let displayNote = $(`.sgy-note-display[data-id=${noteID}] .sgy-note-display-content`);
    if (displayNote.length > 0) displayNote.text(content);
});