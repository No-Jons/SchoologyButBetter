let config;
let themeConfig;
let customConfig;
let animation = [];
let selected;
let slider;

chrome.storage.sync.get(["userConfig"], function(result) {
    config = result.userConfig;
    themeConfig = Object.assign({}, config.theme);
    customConfig = Object.assign({}, config.theme);
});

const themes = {
    "default": {
        "color" : {
            "main": "#3355ff",
            "background": "#ffffff",
            "hover": "#405dff",
            "border": "#dddddd",
            "link": "#4479b3",
            "text": "#ffffff",
            "background_contrast": "#000000",
            "box_shadow": "#000000"
        },
        "animate" : {
            "animate": false
        }
    },
    "dark" : {
        "color" : {
            "background": "#292929",
            "background_contrast": "#ffffff",
            "border": "#787878",
            "hover": "#424242",
            "link": "#378ce6",
            "main": "#333333",
            "text": "#ffffff",
            "box_shadow": "#000000"
        },
        "animate" : {
            "animate" : false
        }
    },
    "rainbow" : {
        "color" : {
            "background": "#ffffff",
            "background_contrast": "#000000",
            "border": "#dddddd",
            "hover": "#ffffff",
            "link": "#ffffff",
            "main": "#ffffff",
            "text": "#ffffff",
            "box_shadow": "#000000"
        },
        "animate" : {
            "animate": true,
            "attrs": ["main", "hover", "link"],
            "alternate": true
        }
    },
    "cherry" : {
        "color" : {
            "background": "#ffebeb",
            "background_contrast": "#000000",
            "border": "#dddddd",
            "hover": "#ff5757",
            "link": "#ff0f0f",
            "main": "#ff3838",
            "text": "#ffffff",
            "box_shadow": "#000000"
        },
        "animate" : {
            "animate": false
        }
    }
}

function saveUserConfig() {
    if (selected === "custom")
        themeConfig = customConfig;
    config.theme = themeConfig;
    chrome.storage.sync.set({"userConfig": config});
}

function waitForConfig(){
    if (typeof config == "undefined"){
        setTimeout(waitForConfig, 250);
    } else {
        setup();
    }
}

waitForConfig();

function hexToGreyscale(h) {
    let r = 0, g = 0, b = 0;

    if (h.length === 4) {
        r = "0x" + h[1] + h[1];
        g = "0x" + h[2] + h[2];
        b = "0x" + h[3] + h[3];

    } else if (h.length === 7) {
        r = "0x" + h[1] + h[2];
        g = "0x" + h[3] + h[4];
        b = "0x" + h[5] + h[6];
    }

    return Math.round((parseInt(r, 16) + parseInt(b, 16) + parseInt(g, 16)) / 3);
}

function editRootVar(varName, value) {
    let root = document.documentElement;
    root.style.setProperty(`--${varName}`, value);
}

function setup() {
    for (let color of ["main", "background", "hover", "border", "link"]) {
        $("#colors-wrapper").append(`
            <div class="color-selection">
                <label class="color-label">${color.charAt(0).toUpperCase() + color.slice(1)}</label>
                <input type="color" value="${themeConfig.color[color]}" data-color="${color}">
            </div>
        `);
    }
    $("#animate-wrapper").append(
        `<label class="animate-label"><input type="checkbox" class="animate-toggle">Animate</label>
         <div class="animate-options" style="display: none;">
             <label class="animate-label">Colors to Animate:</label>
                 <div class="animate-select">
                     <label class="animate-label"><input type="checkbox" data-color="main" checked>Main</label>
                     <label class="animate-label"><input type="checkbox" data-color="background">Background</label>
                     <label class="animate-label"><input type="checkbox" data-color="link">Link</label>
                 </div>
             <label class="animate-label">Hue Range:</label>
             <div id="hue-range-select"></div>
             <label class="animate-select animate-label animate-alternate"><input type="checkbox" ${themeConfig.animate.alternate ? "checked" : ""}>Alternate</label>
             <label class="animate-label">Speed: <span class="animate-speed-value">${themeConfig.animate.speed ? themeConfig.animate.speed : "50"}</span></label>
             <input type="range" class="animate-speed" value="${themeConfig.animate.speed ? themeConfig.animate.speed : "50"}" min="1" max="99" step="1">
             <label class="animate-label">Saturation: <span class="animate-sat-value">50</span></label>
             <input type="range" class="animate-sat" value="${themeConfig.animate.saturation ? themeConfig.animate.saturation : "50"}" min="0" max="100" step="1">
             <label class="animate-label">Light: <span class="animate-light-value">50</span></label>
             <input type="range" class="animate-light" value="${themeConfig.animate.light ? themeConfig.animate.light : "50"}" min="0" max="100" step="1">
         </div>`
    );
    slider = document.getElementById("hue-range-select");
    noUiSlider.create(slider, {
        start: [themeConfig.animate.min || 0, themeConfig.animate.max || 0],
        tooltips: true,
        range: {
            min: 0,
            max: 360
        },
        step: 1,
        margin: 10
    });
    slider.noUiSlider.on("update", function () {
        getAnimOpts();
        doAnimate();
        let hueVals = slider.noUiSlider.get();
        $(".noUi-handle-lower").css("background", `hsl(${hueVals[0]},50%,50%)`);
        $(".noUi-handle-upper").css("background", `hsl(${hueVals[1]},50%,50%)`);
    });
    if (themeConfig.animate.animate) {
        getAnimOpts();
        doAnimate();
    }
}

$(".theme-selection").on("click", function() {
    let theme = $(this).attr("data-theme");
    selected = theme;
    for (let anim of animation)
        clearInterval(anim);
    if (theme === "custom") {
        $("#editor-wrapper").show();
        for (let val in customConfig.color)
            editRootVar(val, customConfig.color[val]);
        if (customConfig.animate.animate) {
            $(".animate-toggle").attr("checked", "true");
            $(".animate-options").show();
            $(".animate-select input").each(function(){
                if (customConfig.animate.attrs.includes($(this).attr("data-color")))
                    $(this).attr("checked", "true");
            });
            getAnimOpts();
            doAnimate();
        }
    }
    else {
        $("#editor-wrapper").hide();
        for (let val in themes[theme].color)
            editRootVar(val, themes[theme].color[val]);
        themeConfig.color = themes[theme].color;
        themeConfig.animate = themes[theme].animate;
        if (themeConfig.animate.animate) {
            getAnimOpts();
            doAnimate();
        }
    }
});

$(document.body).on( "input", "#colors-wrapper input[type=color]", function() {
    let colorName = $(this).attr("data-color");
    let color = $(this).val();
    editRootVar(colorName, color);
    if (colorName === "main") {
        let greyscale = hexToGreyscale(color);
        if (greyscale > 186) {
            editRootVar("text", "#000000");
            customConfig.color["text"] = "#000000";
        }
        else {
            editRootVar("text", "#ffffff");
            customConfig.color["text"] = "#ffffff";
        }
    } else if (colorName === "background") {
        let greyscale = hexToGreyscale(color);
        if (greyscale > 186) {
            editRootVar("background_contrast", "#000000");
            customConfig.color["background_contrast"] = "#000000";
        }
        else {
            editRootVar("background_contrast", "#ffffff");
            customConfig.color["background_contrast"] = "#ffffff";
        }
        if (greyscale > 40) {
            editRootVar("box_shadow", "rgba(0,0,0,0.5)");
            customConfig.color["box_shadow"] = "rgba(0,0,0,0.5)";
        }
        else {
            editRootVar("box_shadow", "rgba(255,255,255,0.25)");
            customConfig.color["box_shadow"] = "rgba(255,255,255,0.25)";
        }
    }
    customConfig.color[colorName] = color;
});

function getAnimOpts(){
    for (let anim of animation)
        clearInterval(anim);
    let toAnimate = [];
    editRootVar("hue", 0);
    editRootVar("sat", themeConfig.animate.saturation ? `${themeConfig.animate.saturation}%` : "50%");
    editRootVar("sat", themeConfig.animate.light ? `${themeConfig.animate.light}%` : "50%");
    if (selected === "custom") {
        $(".animate-select input[type=checkbox]:checked").each(function () {
            let color = $(this).attr("data-color");
            toAnimate.push(color);
            if (color === "main")
                toAnimate.push("hover");
        });
        customConfig.animate.attrs = toAnimate;
        let minMax = slider.noUiSlider.get();
        customConfig.animate.min = parseInt(minMax[0].replace(/\.\d+/, ""));
        customConfig.animate.max = parseInt(minMax[1].replace(/\.\d+/, ""));
        customConfig.animate.alternate = $(".animate-alternate input").is(":checked");
        customConfig.animate.speed = parseInt($(".animate-speed").val());
        customConfig.animate.saturation = parseInt($(".animate-sat").val());
        customConfig.animate.light = parseInt($(".animate-light").val());
        editRootVar("hue", customConfig.animate.min);
        editRootVar("sat", `${customConfig.animate.saturation}%`);
        editRootVar("light", `${customConfig.animate.light}%`);
    }
    for (let color of ["main", "hover", "background", "link"]){
        if (selected === "custom") {
            if (!toAnimate.includes((color)))
                editRootVar(color, customConfig.color[color]);
            else {
                if (color === "hover")
                    editRootVar(color, `hsl(var(--hue),35%,var(--light))`);
                else
                    editRootVar(color, `hsl(var(--hue),var(--sat),var(--light))`);
            }
        }
        else {
            if (!themeConfig.animate.attrs.includes(color))
                editRootVar(color, themeConfig.color[color]);
            else {
                if (color === "hover")
                    editRootVar(color, `hsl(var(--hue),35%,var(--light))`);
                else
                    editRootVar(color, `hsl(var(--hue),var(--sat),var(--light))`);
            }
        }
    }
    editRootVar("change", "1");
}

function doAnimate() {
    animation.push(
        setInterval(function() {
            let hue = parseInt($(":root").css("--hue"));
            if (!themeConfig.animate.max) {
                if (hue > 360)
                    hue = 0;
                else
                    hue++;
            } else {
                if (hue >= themeConfig.animate.max) {
                    if (!themeConfig.animate.alternate)
                        hue = themeConfig.animate.min;
                    else
                        editRootVar("change", "-1");
                } else if (hue <= themeConfig.animate.min)
                    editRootVar("change", "1");
                hue += parseInt($(":root").css("--change"));
            }
            editRootVar("hue", hue);
        }, 50 * ((100 - themeConfig.animate.speed || 50) / 50))
    );
    console.log("a");
}


$(document.body).on("change", ".animate-toggle", function(){
    let options = $(".animate-options");
    if ($(this).is(":checked")) {
        customConfig.animate.animate = true;
        getAnimOpts();
        doAnimate();
        options.show();
        themeConfig.animate = customConfig.animate;
    }
    else {
        for (let anim of animation)
            clearInterval(anim);
        for (let color of ["main", "hover", "background", "link"]){
            editRootVar(color, customConfig.color[color]);
        }
        options.hide();
        customConfig.animate.animate = false;
        themeConfig.animate = customConfig.animate;
    }
});

$(document.body).on("input", ".animate-select input[type=checkbox], input[type=range]", function(){ getAnimOpts(); doAnimate(); });

$(document.body).on("input", "input[type=range]", function(){ $(`.${$(this).attr("class")}-value`).text($(this).val()); })

$(".save-theme").on("click", function(){
    saveUserConfig();
    console.log("Theme saved");
});


