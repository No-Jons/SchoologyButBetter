const Logger = {
    log: (() => console.log.bind(window.console, "%cLOG:", logCSS(230, 100, 60)))(),
    error: (() => console.error.bind(window.console, "%cERROR:", logCSS(8, 87, 47)))(),
    debug: (() => console.debug.bind(window.console, "%cDEBUG:", logCSS(127, 96, 28)))(),
    warn: (() => console.warn.bind(window.console, "%cWARNING:", logCSS(53, 100, 40)))(),
    trace: (() => console.trace.bind(window.console, "%cTRACE:", logCSS(38, 83, 50)))()
}

function logCSS(h, s, l){
    let color = `hsl(${h},${s}%,${l}%)`;
    return `color:${color};border:1px solid ${color};background-color:hsl(${h},${s}%,${Math.round((l/2)*3)}%);`
}

Logger.debug("Initialized SchoologyButBetter Logger.")