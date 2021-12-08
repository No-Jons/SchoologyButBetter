let root = document.documentElement;
let themeConfig
let animate;
let pause = false;

// todo: append pause button to nav bar

chrome.storage.sync.get(["userConfig"], function(result) { themeConfig = result.userConfig; cssSetup(); });

function cssSetup() {
    root.style.setProperty("--main", themeConfig.theme.color.main);
    root.style.setProperty("--background", themeConfig.theme.color.background);
    root.style.setProperty("--hover", themeConfig.theme.color.hover);
    root.style.setProperty("--border", themeConfig.theme.color.border);
    root.style.setProperty("--link", themeConfig.theme.color.link);
    root.style.setProperty("--text", themeConfig.theme.color.text);
    root.style.setProperty("--background_contrast", themeConfig.theme.color.background_contrast);
    root.style.setProperty("--box_shadow", themeConfig.theme.color.box_shadow);
    if (themeConfig.theme.animate.animate) {
        root.style.setProperty("--hue", themeConfig.theme.animate.min || "0");
        doAnimate();
    }
}

function doAnimate() {
    root.style.setProperty("--sat", themeConfig.theme.animate.saturation ? `${themeConfig.theme.animate.saturation}%` : "50%");
    root.style.setProperty("--light", themeConfig.theme.animate.light ? `${themeConfig.theme.animate.light}%` : "50%");
    for (let val of themeConfig.theme.animate.attrs){
        if (val === "hover")
            root.style.setProperty(`--${val}`, `hsl(var(--hue),35%,var(--light))`);
        else
            root.style.setProperty(`--${val}`, `hsl(var(--hue),var(--sat),var(--light))`);
    }
    animate = setInterval(function(){
        if (pause)
            return;
        let hue = parseInt($(":root").css("--hue"));
        if (!themeConfig.theme.animate.max) {
            if (hue > 360)
                hue = 0;
            else
                hue++;
        }
        else {
            if (hue >= themeConfig.theme.animate.max) {
                if (!themeConfig.theme.animate.alternate)
                    hue = themeConfig.theme.animate.min;
                else
                    root.style.setProperty("--change", "-1");
            }
            else if (hue <= themeConfig.theme.animate.min)
                root.style.setProperty("--change", "1");
            hue += parseInt($(":root").css("--change"));
        }
        root.style.setProperty("--hue", hue.toString());
    }, 100 - themeConfig.theme.animate.speed);
}