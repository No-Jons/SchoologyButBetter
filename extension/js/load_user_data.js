 let storage = chrome.storage.sync;

 storage.get(["userConfig"], function(result) {
     if (result.userConfig) {
         config = result.userConfig;
         Logger.debug(config)
     } else {
         config = {
             todolist: [],
             priorities: [],
             completed: [],
             friends: [],
             notifications: {
                 enabled: true,
                 one_hour: true,
                 ten_minutes: true,
                 check_interval: 600,
                 notify_for: ["assignments", "events"]
             },
             course : {
                 link_popup: true,
                 docviewer: true,
                 grade_popup: true,
                 youtube_popup: true
             },
             theme: {
                 color: {
                     main: "#3355ff",
                     background: "#ffffff",
                     hover: "#405dff",
                     border: "#dddddd",
                     link: "#4479b3",
                     text: "#ffffff",
                     background_contrast: "#000000"
                 },
                 animate: {
                     animate: false,
                     attrs: []
                 }
             },
             notes: [],
             key: undefined,
             secret: undefined
         };
         storage.set({"userConfig" : config});
     }
 });

 function saveUserConfig() { storage.set({"userConfig": config}); }