// PulsusPlus configurations

const pulsusPlus = {
    version: "PREgamma-v0.1",
    extensionURL: document.getElementById("extension-url").name,
    staticScales: {
        horizontal: [16/9/4, 9/16/3*1.25],
        vertical: [9/16/3*1.5, 16/9/4/1.5]
    },
    currentKeybind: {
        altKey: false,
        ctrlKey: false,
        shiftKey: false,
        code: "",
        isSpecial: false
    },
    currentKeybindStr: "",
    levelLoaded: false,
    themeName: "",
    fullscreened: Math.abs(innerHeight - screen.height) < 150 && Math.abs(innerWidth - screen.width) < 300,
    bgLoading: document.getElementById("bg-loading"),
    printer: false,
    printerOpacity: 0,
    printerDescend: false,
    retry: null,
    retryCount: 0,
    retryCountPos: 0,
    retryProgress: 0,
    skip: false,
    skipAuto: false,
    game: {
        noteTimes: [],
        noteEndTimes: [],
        barProgress: 0,
        breakProgress: 0,
        mods: {
            endPos: 0
        },
        UR: 0,
        hitStatsSumReal: 0,
        hitStatsSum: 0,
        ratio: "0:0",
        lastCalc: 0,
        hw: 0,
        hwMs: 0,
        kps: [],
        calculatedUR: true,
        loaded: false,
        sectionScroll: 0,
        sectionScrollDis: 0,
        sectionHitbox: false,
        sectionOverflow: 0
    },
    queuedPress: [...Array(9).keys()].map(x => false),
    pressedLetters: [...Array(9).keys()].map(x => false),
    pressedNum: [...Array(9).keys()].map(x => false),
    pressedAuto: [...Array(9).keys()].map(x => false),
    themeSearch: "",
    themeSearchFor: "name",
    themeSort: "name_asc",
    stopRetry: false,
    addedThemes: {},
    masterVolumeBuffer: 0,
    playbackRate: 1,
    snap: 1/4,
    targetSection: {
        time: 0,
        offset: 0,
        name: "New Bookmark",
        visible: false,
        bpm: 120,
        color: 141,
        saturation: 255,
        brightness: 255
    },
    effectClipboard: [],
    beatClipboard: [],
    resultsScreenAppeared: false
};
pulsusPlus.functionReplace = function(func=new Function(), match=new RegExp("", "s"), extraCode="", extraArgs=[]) {
    // Set default match regexps
    let pos = match;
    if (match === "start") match = /\{/s;
    else if (match === "end") match = /\}(?!.*\})/s;
    return func.toString()
    // Remove first bit of code to allow expressions such as func = game.pulsusPlus.functionRepl...
        .replace(/.*?\(/s, "function(")
    // Add args
        .replace(")", `${((func.toString().replace(/.*?\(/s, "function(").search(/^function\(\)/) === -1 && extraArgs.length > 0 ? "," : "") + extraArgs.join(","))})`)
    // Add code
        .replace(match, `${(pos==="start" ? "{" : "") + extraCode + (pos==="end" ? "};" : "")}`);
};

// AT BPM FS HW NF NR HD FL IF PF RD MR NP NE
pulsusPlus.getMods = function(mods) {
    const modNames = {
        auto: "AT",
        bpm: "BPM",
        foresight: "FS",
        hitWindow: "HW", 
        noFail: "NF", 
        noRelease: "NR",
        hidden: "HD",
        flashslight: "FL",
        instantFail: "IF",
        perfect: "PF",
        random: "RD",
        mirror: "MR",
        noPitch: "NP",
        noEffects: "NE"
    };
    
    let result = [];
    Object.entries(modNames).forEach(entry => {
        const key = entry[0];
        const value = entry[1];
        if(typeof mods[key] === "boolean" && mods[key] !== false) {
            result.push(value);
        } else if(typeof mods[key] === "number" && mods[key] !== 1) {
            result.push(`${value} ${round(mods[key], 2)}x`);
        };
    });
    if(result.length === 0) result = ["No Mods"];
    result = result.join(", ").replace(/(?![^\n]{1,32}$)([^\n]{1,32})\s/g, '$1\n');
    return result + (pulsusPlus.settings.fixDC && !game.replay.on && !game.mods.auto ? "\nUsing Delta Dual Controls" : "");
};

pulsusPlus.getStandardDeviation = function(arr) {
    if(arr.length < 2) return 0;
    const mean = arr.reduce((acc, val) => acc + val, 0) / arr.length;
    const sumOfSquaredDifferences = arr.reduce((acc, val) => acc.concat((val - mean) ** 2), [])
        .reduce((acc, val) => acc + val, 0);
    return Math.sqrt(sumOfSquaredDifferences / (arr.length - 1));
};

pulsusPlus.keybindToString = function(keyEvent) {
    let key = keyEvent.key.charAt(0).toUpperCase() + keyEvent.key.substring(1);
    key = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "Shift + 0", "Space"][["!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "Insert", " "].indexOf(key)] ?? key
    return [keyEvent.altKey ? "Alt" : "", keyEvent.ctrlKey ? "Ctrl" : "", keyEvent.shiftKey ? "Shift" : "", ((keyEvent.key === "Meta" || keyEvent.key === "Alt" || keyEvent.key === "Control" || keyEvent.key === "Shift") ? "" : key)].filter((x) => x !== "").join(" + ") 
}

// Extension element fetcher
pulsusPlus.fromExtension = function(filename) {
    return pulsusPlus.extensionURL + filename
}

// Auto parameter fetcher
pulsusPlus.getParameter = function(type, search, varSearch, position, useParentheses) {
    let paramMatches = [];
    if(type === "object") {
        Object.keys(window).forEach((key) => {
            try {
                if(typeof window[key][search] !== "undefined") paramMatches.push(key);
            } catch(error){}
        })
    } else if(type === "function") {
        for(i in window) {
            try {
                if((typeof window[i]).toString() === "function" && window[i].toString().search(search) !== -1) {
                    paramMatches.push(i);
                }
            }
            catch(error){}
        }
    } else if(type === "variable") {
        let matches = search.toString().match(varSearch);
        return matches[0].split(useParentheses ? /(\(|\)|,)/ : /[^A-Za-z]/)[position]
    }
    return paramMatches[0];
};

pulsusPlus.setParameters = function(params) {
    let final = "";
    for(param of Object.entries(params)) {
        let name = param[0];
        let target = pulsusPlus.getParameter(...param[1]);
        final += `Object.defineProperty(globalThis,'${name}',{get:()=>{return ${target}},set:(val)=>{${target}=val}});`
    }
    eval(final);
};
pulsusPlus.setParameters({
    loadGame: ["function", /,.*?=\[\{main/]
})

pulsusPlus.getLocal = function(target, defaults, fuckingBitch) {
    if(localStorage.getItem(target) === null) {
        localStorage.setItem(target, JSON.stringify(defaults));
    };
    let result = JSON.parse(localStorage.getItem(target));
    Object.keys(defaults).forEach((key) => {
        if(!Object.keys(result).includes(key)) result[key] = defaults[key];
    });
    localStorage.setItem(target, JSON.stringify(result));
    if(fuckingBitch) { // JSON tells classes to go fuck themselves (in this case the color class' prototype gets exterminated and then nothing works)
        let bufferResult = "pulsusPlus.themes = [{";
        Object.values(result).forEach((theme, i) => {
            bufferResult += `name:"${theme.name}",values:{`
            Object.entries(theme.values).forEach((entry, j) => {
                const key = entry[0];
                const value = entry[1];
                if(typeof value !== "object") {
                    bufferResult += `${key}:${value}`;
                } else {
                    bufferResult += `${key}:color(${value.levels})`;
                };
                if(Object.entries(theme.values).length-1 !== j) bufferResult += ",";
            });
            bufferResult += "}";
            if(Object.values(result).length-1 !== i) bufferResult += "},{";
        });
        bufferResult += "}]";
        return bufferResult;
    }
    return result;
};

pulsusPlus.wipeLocal = function() {
    saveGameData = function(){};
    Object.keys(localStorage).filter(key => key.search(/pulsusplus/gi) !== -1).forEach(key => localStorage.removeItem(key));
    window.onbeforeunload = null;
    Timeout.set(() => location.reload(), 300)
};

pulsusPlus.fetchOnlineThemes = async function() {
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/16BsUFcytJpupYA302vn1wYGHLoVWZ3H9GkzmoaV0Eg8/values/Sheet1?key=AIzaSyAqUfX_ioDf6cVwVnqY7Ve9kls5YgqocEI`)
    const data = await response.json();
    return await data.values;
};

pulsusPlus.compareThemes = function(theme1, theme2) {
    return theme1.name === theme2.name && !Object.keys(theme1.values).some(key => !lodash.isEqual(theme1.values[key].levels, theme2.values[key].levels));
};

pulsusPlus.updateThemeState = function() {
    pulsusPlus.customTheme.menu.pages[1].items.slice(5).map(theme => [theme.themeName, theme.theme]).forEach(theme => {
        pulsusPlus.addedThemes[theme[0]] = pulsusPlus.themes.some(t => pulsusPlus.compareThemes(t, theme[1]));
    });
};

pulsusPlus.updateThemesPage = function() {
    pulsusPlus.customTheme.menu.pages[1].items.splice(5, pulsusPlus.customTheme.menu.pages[1].items.length - 5);
    pulsusPlus.fetchOnlineThemes().then(values => {
        if(values.some(v => newGrabUser(v[1], "uuid").user === "Loading...")) {
            pulsusPlus.updateThemesPage();
            return;
        }
        values.sort((a, b) => {
            switch(pulsusPlus.themeSort) {
                case "name_asc":
                    return a[0].localeCompare(b[0]);
                case "name_desc":
                    return b[0].localeCompare(a[0]);
                case "author_asc":
                    return (newGrabUser(a[1], "uuid").user).localeCompare(newGrabUser(b[1], "uuid").user);
                case "author_desc":
                    return (newGrabUser(b[1], "uuid").user).localeCompare(newGrabUser(a[1], "uuid").user);
            }
        });
        values.forEach(theme => {
            try {
                const name = theme[0];
                const author = newGrabUser(theme[1], "uuid").user;
                switch(pulsusPlus.themeSearchFor) {
                    case "name":
                        if(!name.toLowerCase().includes(pulsusPlus.themeSearch.toLowerCase())) {
                            return;
                        };
                        break;
                    case "author":
                        if(!author.toLowerCase().includes(pulsusPlus.themeSearch.toLowerCase())) {
                            return;
                        };
                        break;
                };
                const desc = theme[2];
                const data = JSON.parse(theme[3]);
                Object.entries(data).forEach(entry => {
                    if(!pulsusPlus.defaultThemes[0].hasOwnProperty(entry[0])) {
                        throw new Error("Invalid JSON");
                    };
                });
                Object.entries(data.values).forEach(entry => {
                    if(!pulsusPlus.defaultThemes[0].values.hasOwnProperty(entry[0])) {
                        throw new Error("Invalid JSON");
                    };
                });
                if(typeof data.name !== "string" || Object.keys(pulsusPlus.defaultThemes[0].values).length !== Object.keys(data.values).length) {
                    throw new Error("Invalid JSON");
                };

                pulsusPlus.customTheme.menu.pages[1].items.push({
                    type: "theme",
                    name: "PP_LABEL",
                    hint: "PP_LABEL",
                    keys: [],
                    theme: data,
                    themeName: name,
                    author: author,
                    desc: desc
                })
            } catch(e) {
                console.error(e)
            };
        })
        pulsusPlus.updateThemeState();
    });
}

pulsusPlus.testImage = function(url) {
    return new Promise(function (resolve, reject) {
        let timer;
        let img = new Image();
        img.onerror = img.onabort = function () {
            clearTimeout(timer);
            resolve("error");
        };
        img.onload = function () {
            clearTimeout(timer);
            resolve("success");
        };
        timer = setTimeout(function () {
            // reset .src to invalid URL so it stops previous
            // loading, but doesn't trigger new load
            img.src = "//!!!!/test.jpg";
            resolve("timeout");
        }, 5000);
        img.src = url;
    });
};

pulsusPlus.testAudio = function(url) {
    return new Promise(function (resolve, reject) {
        let timer;
        let audio = new Audio();
        audio.onerror = audio.onabort = function () {
            clearTimeout(timer);
            resolve("error");
        };
        audio.oncanplaythrough = function () {
            clearTimeout(timer);
            resolve("success");
        };
        timer = setTimeout(function () {
            // reset .src to invalid URL so it stops previous
            // loading, but doesn't trigger new load
            audio.src = "//!!!!/test.wav";
            resolve("timeout");
        }, 5000);
        audio.src = url;
        audio.load();
    });
};

pulsusPlus.downloadJSON = function(filename, dataObjToWrite) {
    const blob = new Blob([JSON.stringify(dataObjToWrite)], { type: "text/json" });
    const link = document.createElement("a");
    link.download = filename;
    link.href = window.URL.createObjectURL(blob);
    link.dataset.downloadurl = ["text/json", link.download, link.href].join(":");
    const evt = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
    });
    link.dispatchEvent(evt);
    link.remove();
};

pulsusPlus.reader = function(file) {
    return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve([fr, file.name]);
        fr.onerror = (err) => reject(err);
        if(file.type.search(/json/) !== -1 || file.type.search(/text/) !== -1 || (file.type === "" && file.name.split(".")[file.name.split(".").length - 1] === "osu")) {
            fr.readAsText(file);
        } else if(file.type.search(/audio/) !== -1) {
            fr.readAsDataURL(file);
        } else {
            reject(`Unsupported file type "${file.type === "" ? file.name.split(".")[file.name.split(".").length - 1] : file.type}"`);
        }
    });
};
pulsusPlus.fetchFileData = async function(fileList) {
    const frPromises = fileList.map(pulsusPlus.reader);

    try {
        return (await Promise.all(frPromises)).map(r => [r[0].result, r[1]]);
    } catch (err) {
        console.error(err);
        popupMessage({
            type: "error",
            message: "PP_ERROR_MSG",
            keys: [err, "INVALID FILE"]
        })
        return;
    }
};

pulsusPlus.thread = function(targetFunction, ...args) {
    const worker = new Worker(
        URL.createObjectURL(new Blob([`postMessage((${targetFunction}).bind.apply((${targetFunction}), [this, ${args.join(",")}])());`]), {
            type: 'application/javascript; charset=utf-8'
        })
    );
    
    return new Promise((res, rej) => {
        worker.onmessage = ({ data }) => {
            res(data), worker.terminate();
        };
        worker.onerror = err => {
            rej(err), worker.terminate();
        };
    });
};

const themeImport = document.createElement("input")
themeImport.className = "pulsus-plus";
themeImport.id = "theme-import";
themeImport.addEventListener("change", (e) => {
    if(!e.target.files) return;
    pulsusPlus.fetchFileData([...e.target.files])
        .then(data => {
            data.forEach(result => pulsusPlus.importTheme(result));
        });
});
document.body.appendChild(themeImport);
const settingsImport = document.createElement("input")
settingsImport.className = "pulsus-plus";
settingsImport.id = "settings-import";
settingsImport.addEventListener("change", (e) => {
    if(!e.target.files) return;
    pulsusPlus.fetchFileData([...e.target.files])
        .then(data => {
            data.forEach(result => pulsusPlus.importSettings(result));
        });
});
document.body.appendChild(settingsImport);
const levelImport = document.createElement("input")
levelImport.className = "pulsus-plus";
levelImport.id = "level-import";
levelImport.addEventListener("change", (e) => {
    if(!e.target.files) return;
    pulsusPlus.fetchFileData([...e.target.files])
        .then(data => {
            data.forEach(result => pulsusPlus.importLevel(result));
        });
});
document.body.appendChild(levelImport);
const osuImport = document.createElement("input")
osuImport.className = "pulsus-plus";
osuImport.id = "osu-import";
osuImport.addEventListener("change", (e) => {
    if(!e.target.files || [...e.target.files].length !== 1) return;
    pulsusPlus.fetchFileData([...e.target.files])
        .then(data => {
            data.forEach(result => pulsusPlus.importOsu(result));
        });
});
document.body.appendChild(osuImport);
const songImport = document.createElement("input")
songImport.className = "pulsus-plus";
songImport.id = "song-import";
songImport.addEventListener("change", (e) => {
    if(!e.target.files || [...e.target.files].length !== 1) return;
    pulsusPlus.fetchFileData([...e.target.files])
        .then(data => {
            data.forEach(result => pulsusPlus.importSong(result));
        });
});
document.body.appendChild(songImport);
document.querySelectorAll(".pulsus-plus").forEach(element => {
    element = document.getElementById(element.id)
    element.type = "file";
    element.accept = ".json";
    element.multiple = true;
    element.style.display = "none";
    element.addEventListener("click", (e) => {
        e.target.value = null;
    });
});
osuImport.accept = ".osu, .txt";
osuImport.multiple = false;
songImport.accept = "audio/*";
songImport.multiple = false;

// Set in-game variables

function completeSetup() {

    // Functions and objects
    pulsusPlus.setParameters({
        adjustCanvas: ["function", /resizeCanvas/],
        checkHolds: ["function", /disMode&&!0===(.{1,2})\.keysHeld\[.*?\]/],
        clickMenu: ["object", "screens"], // This is actually a function lol
        copyLevel: ["function", /message:"menu_lvl_copied"/],
        copyObject: ["function", /\{if\(void 0!==.{1,2}\)return J/],
        copyToClipboard: ["function", "navigator.clipboard.writeText"],
        createLevel: ["function", `New Map",`],
        cycleSnap: ["function", /\.snap=\.25/],
        drawDifficultyCircle: ["function", /new (.{1,2})\(.*?\)\.draw\(.*?\)\}/],
        drawProfile: ["function", "menu_account_joinedSince"],
        drawScreens: ["function", /\,"hidden"\!==/],
        ease: ["function", /return Number\.isNaN\(.{1,2}\)/],
        fitText: ["function", /textSize\(min/],
        formatTime: ["function", /"min:sec"===/],
        game: ["object", "beat"],
        getLevelDownloadState: ["function", /\?1:0:2/],
        getLevelDuration: ["function", /\.ar<(.{1,2})\.hw/],
        getObject: ["function", /return .{1,2}\[.{1,2}\[.{1,2}\.length-1\]\]/],
        getScroll: ["function", /:navigator\.userAgent/],
        getSize: ["function", /return 1e9/],
        getSongInfo: ["function", /explicit:\!1/],
        hitbox: ["function", /"rcorner"===.{1,2}/],
        img: ["object", "discordLogoInvert"],
        lang: ["function", /.{1,2}=.{1,2}\[..\?"en":.{1,2}\]/],
        langs: ["object", "fr"],
        levels: ["object", "onlineScores"],
        loadLevel: ["function", /.{1,2}\.lvl\.loading=!0\)/],
        loadMenuMusic: ["function", /pulsusMenu\.mp3/],
        loadSong: ["function", /mods.noPitch\|\|void 0/],
        loadStartScreens: ["function", /\{background\(255\)/],
        menu: ["object", "settings"],
        musicManager: ["function", /oldAr,9999/],
        newGrabLevel: ["function", /.{1,2}\.newGrabbedLevels\[.{1,2}\]:void 0/],
        newGrabLevelMeta: ["function", /.{1,2}\.newGrabbedLevels\[.{1,2}\]:.:void 0/],
        newGrabUser: ["function", /mode:"uuid"/],
        newSettingsMenu: ["function", /dropdownHitbox/],
        pauseAction: ["function", /case"retry"/],
        popupMessage: ["function", /message:.{1,2}\.message,/],
        pressKey: ["function", /newScore\.press\.push/],
        prmptingColor: ["object", "currentColor"],
        prmptingString: ["object", "vSet"],
        promptRes: ["function", /"number"===.{1,2}\.check/],
        queueServer: ["function", /(.{1,2})\.queueType\.unshift/],
        refreshLevels: ["function", /case"dateDesc":return/],
        releaseKey: ["function", /newScore\.release\.push/],
        resetclevels: ["function", /\{return .{1,2}=\[\]/],
        saveGameData: ["function", /setItem\("pulsusGammaLvlScores/],
        server: ["object", "newGrabbedLevels"],
        setObject: ["function", /(.{1,2})\[(.{1,2})\[(.{1,2})\.length-1\]\]=(.{1,2})/],
        sideView: ["function", /(.{1,2})\.startMS/],
        theme: ["object", "main"],
        transitionScreen: ["function", /dropTime=millis\(\),/],
        user: ["object", "recievedAll"],
        welcome: ["object", "startTime"]
    });
    // Variables
    pulsusPlus.setParameters({
        clevels: ["variable", resetclevels, /return (.{1,2})=\[\]/, 1],
        langSel: ["variable", saveGameData, /"sessionWarning",(.{1,2})\)/, 3],
        lvlHowl: ["variable", musicManager.musicTime, /\((.{1,2})\[.{1,2}\.song\]\.rate/, 1],
        songHowl: ["variable", loadSong, /:(.{1,2}),/, 1],
        matrix: ["variable", newSettingsMenu.prototype.draw, /"rcenter",(.{1,2})\.get\(\)/, 3],
        gameScreen: ["variable", drawScreens, /"click"===(.{1,2})&/, 5],
        welcomeBorders: ["variable", loadStartScreens, /abs\((.{1,2})\[/, 1],
        themes: ["variable", loadGame, /\},(.{1,2})=\[\{main/, 2],
        tooltipText: ["variable", drawScreens, /(.{1,2})\((.{1,2}),mouseX/, 2, true],
        DifficultyCircle: ["variable", drawDifficultyCircle, /new (.{1,2})\(/, 1] // This is a class,
    })

    // I'm sorry i have to do this
    eval(`
        pulsusPlus.forceEase = ${pulsusPlus.functionReplace(ease, /(.{1,2})\.settings\.disableEase/, "false")};
        newSettingsMenu.prototype.draw = ${pulsusPlus.functionReplace(newSettingsMenu.prototype.draw, /fill\(255\)/, `fill(${pulsusPlus.getParameter("object", "main")}.text)`)
            .replace(`"slider"===`, `!pulsusPlus.settings.replaceSliders && "slider"===`)
            .replace(`"number"===`, `(pulsusPlus.settings.replaceSliders && "slider" === H.type) || "number"===`)
            .replace("var W", `
                if(H.type === "slider" && pulsusPlus.settings.replaceSliders && typeof H.replaceable === "undefined") {
                    this.pages[c].items[f].type = "number";
                    this.pages[c].items[f].minOld = H.min;
                    this.pages[c].items[f].maxOld = H.max;
                    this.pages[c].items[f].min = false;
                    this.pages[c].items[f].max = false;
                    this.pages[c].items[f].smallChange = H.step;
                    this.pages[c].items[f].bigChange = H.step * 10;
                    this.pages[c].items[f].replaceable = true;
                } else if(H.type === "number" && !pulsusPlus.settings.replaceSliders && typeof H.replaceable !== "undefined") {
                    this.pages[c].items[f].type = "slider";
                    this.pages[c].items[f].min = H.minOld;
                    this.pages[c].items[f].max = H.maxOld;
                    setObject(H.var, constrain(getObject(H.var), H.min, H.max));
                    this.pages[c].items[f].replaceable = undefined;
                };
                var W
            `)
            .replace("255:200", "theme.buttonUp : theme.buttonDown")
            .replace("scale(1+.2*H.highlights[T])", "scale(1 + .2 * H.highlights[T] + (q.indexOf(T) !== -1 ? .2 : 0))")
        };
    `);
    eval(`
        pulsusPlus.newPulsusPlusMenu = ${pulsusPlus.functionReplace(newSettingsMenu, "this.data={", "this.data={scroll:0,scrollDis:0,")};
        pulsusPlus.newPulsusPlusMenu.prototype.click = ${newSettingsMenu.prototype.click};
        pulsusPlus.newPulsusPlusMenu.prototype.draw = ${pulsusPlus.functionReplace(newSettingsMenu.prototype.draw, "start", `let desc; this.data.scrollDis += ease(this.data.scroll, this.data.scrollDis, 0.15);`, ["zIndex", "menuHeight", "verticalOffset"])
            .replace(/\("rc/g, `(zIndex + "rc`)
            .replace(new RegExp(`\\${pulsusPlus.getParameter("object", "main")}\\.`, "g"), "pulsusPlus.windowTheme.")
            .replace(/if\("str/, `
                if ("divider" === H.type) {
                    push();
                    rectMode(CENTER);
                    let P = ((e.stacked ? 0 : i) + o - 4 * l) / (e.stacked ? 1 : 2);
                    let Q = (e.stacked ? 2 * a - u : 0) + u / 1.5;
                    translate(e.stacked ? 0 : (o + i - 4 * l) / 4, 0);
                    translate(P / 2, Q / 2);
                    translate(-(e.stacked ? 0 : i) + 2 * l, (u - Q) / 2);
                    translate(0, e.stacked ? .875 * -(2 * a - Q) : 0);
                    fill(pulsusPlus.windowTheme.text);
                    rect(0, 0, 1.5*P, Q/32, (P < Q ? P : Q)/4);
                    pop();
                } else if ("keybind" === H.type) {
                    if(typeof H.highlights === "undefined") H.highlights = [0];
                    push();
                    rectMode(CENTER);
                    let P = ((e.stacked ? 0 : i) + o - 4 * l) / (e.stacked ? 1 : 2);
                    let Q = (e.stacked ? 2 * a - u : 0) + u / 1.5;
                    translate(e.stacked ? 0 : (o + i - 4 * l) / 4, 0);
                    translate(P / 2, Q / 2);
                    translate(-(e.stacked ? 0 : i) + 2 * l, (u - Q) / 2);
                    translate(0, e.stacked ? .875 * -(2 * a - Q) : 0);
                    if(hitbox(zIndex + "rcenter", matrix.get().x + P/3, matrix.get().y, P, Q)) {
                        H.highlights[0] += ease(1, H.highlights[0], .2);
                    } else {
                        H.highlights[0] += ease(0, H.highlights[0], .2);
                    }
                    scale(1 + .025 * H.highlights[0]);
                    if(0 < H.highlights[0].toFixed(3)) {
                        push();
                        translate(d * lerp(0, 1, H.highlights[0]), g * lerp(0, 1, H.highlights[0]));
                        fill(0, 100);
                        rect(P/3, 0, P, Q, (P < Q ? P : Q)/4);
                        pop();
                    };
                    fill(lerpColor(pulsusPlus.windowTheme.keybindDown, pulsusPlus.windowTheme.keybindUp, H.highlights[0]));
                    rect(P/3, 0, P, Q, (P < Q ? P : Q)/4);
                    textAlign(CENTER, CENTER);
                    fill(pulsusPlus.windowTheme.buttonText);
                    if(prmptingString.active) {
                        Object.keys(pulsusPlus.savedKeybinds).forEach((bind) => pulsusPlus.savedKeybinds[bind].active = false);
                    };
                    fitText((!prmptingString.active && getObject(H.var).active) ? pulsusPlus.currentKeybindStr : (getObject(H.var).str || "Set keybind"), P/3, 0, P / 1.5, Q / 1.5);
                    this.clickEvents.push({
                        hitbox: hitbox(zIndex + "rcenter", matrix.get().x + P/3, matrix.get().y, P, Q),
                        item: H,
                        event: function(e) {
                            if(!prmptingString.active) {
                                Object.keys(pulsusPlus.savedKeybinds).forEach((bind) => pulsusPlus.savedKeybinds[bind].active = false);
                                pulsusPlus.currentKeybindStr = "Listening...";
                                getObject(e.var).active = true;
                            } else {
                                popupMessage({
                                    type: "error",
                                    message: "PP_ERROR_TXT-PRMPT-KEYBIND"
                                }) 
                            }
                            e.highlights[0] /= 5;
                        }
                    });
                    pop();
                } else if ("theme" === H.type) {
                    if(typeof H.highlights === "undefined") H.highlights = [0];
                    push();
                    let P = ((e.stacked ? 0 : i) + o - 4 * l) / (e.stacked ? 1 : 2);
                    let Q = (e.stacked ? 2 * a - u : 0) + u / 1.5;
                    translate(e.stacked ? 0 : (o + i - 4 * l) / 4, 0);
                    rectMode(CORNER);
                    rectMode(CENTER);
                    translate(P / 2, Q / 2);
                    translate(-(e.stacked ? 0 : i) + 2 * l, (u - Q) / 2);
                    translate(0, e.stacked ? .875 * -(2 * a - Q) : 0);
                    if(hitbox(zIndex + "rcenter", matrix.get().x + P/3, matrix.get().y, P, Q)) {
                        H.highlights[0] += ease(1, H.highlights[0], .2);
                    } else {
                        H.highlights[0] += ease(0, H.highlights[0], .2);
                    }
                    scale(1 + .025 * H.highlights[0]);
                    if(0 < H.highlights[0].toFixed(3)) {
                        push();
                        translate(d * lerp(0, 1, H.highlights[0]), g * lerp(0, 1, H.highlights[0]));
                        fill(0, 100);
                        rect(P/3, 0, P, Q, (P < Q ? P : Q)/4);
                        pop();
                    };
                    fill(lerpColor(pulsusPlus.windowTheme.buttonDown, pulsusPlus.windowTheme.buttonUp, H.highlights[0]));
                    rect(P/3, 0, P, Q, (P < Q ? P : Q)/16);
                    textAlign(CENTER, CENTER);
                    fill(pulsusPlus.windowTheme.buttonText);
                    fitText(pulsusPlus.addedThemes[H.themeName] ? "Apply Theme" : "Add Theme", P/3, 0, P / 1.5, Q / 1.5);
                    this.clickEvents.push({
                        hitbox: hitbox(zIndex + "rcenter", matrix.get().x + P/3, matrix.get().y, P, Q),
                        item: H,
                        event: function(e) {
                            if(pulsusPlus.addedThemes[e.themeName]) {
                                pulsusPlus.settings.themeSel = pulsusPlus.themes.findIndex(theme => pulsusPlus.compareThemes(theme, e.theme))
                            } else {
                                pulsusPlus.importTheme([e.theme, e.theme.name]);
                            };
                            e.highlights[0] /= 5;
                        }
                    });
                    pop();
                }
                else if("str`)
            .replace(/fill\(255\)/g, "fill(pulsusPlus.windowTheme.text)")
            .replace(/0,0,P-2/, "(textAlign(CENTER, CENTER) && 0),0,P-2")
            .replace("translate(0,h+A)", "translate(0, (h+A) + this.data.scrollDis * ( -((a * this.pages[this.data.page].items.length) - (menuHeight/1.25 - verticalOffset - (h + A)) + a) ))")
            .replace("A/2),pop()),", `
                    A/2),pop()),
                    fill(pulsusPlus.windowTheme.scrollbar);
                    let items = this.pages[this.data.page].items;
                    let overflow = Math.max(0, items.length*a -( menuHeight/1.25 - verticalOffset - (h+A)));
                    this.data.overflow = overflow;
                    let scrollHeight = Math.max(e.height/48, menuHeight/1.25-verticalOffset-e.height/48 - overflow);
                    if(menuHeight/1.25 - verticalOffset - (h+A) < items.length*a) {
                        rect(e.widthAbs-e.widthAbs/64, e.height/96 + this.data.scrollDis*(menuHeight/1.25 - verticalOffset - e.height/48 - scrollHeight), e.widthAbs/128, scrollHeight, e.height/2);
                    };
            `)
            .replace("f++){", `f++){
                let opacityTop = constrain((matrix.get().y - (h + A) - e.y)/a + f + 1, 0, 1);
                let opacityBottom = constrain((menuHeight/1.25 - h - matrix.get().y + e.y)/a - f, 0, 1);
                if(Math.min(opacityTop, opacityBottom) > .05) {
                    drawingContext.globalAlpha = Math.min(opacityTop, opacityBottom);
            `)
            .replace("pop(),pop()}pop()", "pop(),pop()}}pop()")
            .replace(",35", ", 35*(Math.min(constrain((((matrix.get().y + (s.highlighted*a*(e.stacked ? 2 : 1))) - (e.y + (h+A)))/a + 1), 0, 1), constrain((((e.y + menuHeight/1.25 - verticalOffset) - (matrix.get().y + ((s.highlighted+1)*a*(e.stacked ? 2 : 1))))/a * 4/3), 0, 1)))")
            .replace("[1]}}", "[1]; e[0].data.scroll = 0; e[0].data.scrollDis = 0}}")
            .replace(/fill\(pulsusPlus\.windowTheme\.buttonText\),(.{1,2})\((.{1,2})\(H\.var\)/, "fill(pulsusPlus.windowTheme.buttonText),fitText(H.display === undefined ? getObject(H.var) : H.display(getObject(H.var))")
            .replace(/\(H\.name,(.{1,2})\)/, "(H.name, langSel, ...(H.keys ?? []))")
            .replace("update(H);", `update(H);
                if(H.type === "theme") {
                    push();
                    rectMode(CORNER);
                    colorMode(RGB);
                    fill(...(pulsusPlus.windowTheme.lightTheme ? [50, 75] : [150, 75]));
                    rect(0, 0, e.width/3, a * (e.stacked ? 2 : 1));
                    pop();
                    if(hitbox(zIndex + "rcorner", matrix.get().x, matrix.get().y, e.width/3, a * (e.stacked ? 2 : 1))) {
                        H.keys = ["By: " + H.author];
                    } else {
                        H.keys = [H.themeName]; 
                    }
                }
            `)
            .replace("H.hint,", `H.hint, desc = H.type === "theme" ? H.desc : undefined,`)
            .replace(/\(F,(.{1,2})\)/, `(F, langSel, ...(typeof desc !== "undefined" ? [desc] : []))`)
        };
    `);

    DifficultyCircle = class {
        static maxDifficulty = 6;
        static colors = DifficultyCircle.colors;
        static getColor(e) {
            e = "stars" + Math.floor(constrain(e, 0, DifficultyCircle.maxDifficulty));
            return DifficultyCircle.colors.get(e)
        }
        difficulty;
        awarded;
        special;
        constructor(e, t, i=!1, user) {
            this.difficulty = constrain(Math.floor(e) ?? 0, 0, DifficultyCircle.maxDifficulty);
            this.awarded = t ?? !1;
            this.special = i;
            this.gaySex = pulsusPlus.settings.gaySex && (user === "regvulcan" || String(e).split(".").join("").search(/69/) !== -1);
        }
        draw(e, t, i, o) {
            push();
            smooth();
            rectMode(CENTER);
            ellipseMode(CENTER);
            angleMode(DEGREES);
            noStroke();
            
            fill(255);
            ellipse(e, t, i, o);
            
            if(!this.gaySex) {
                fill(this.#getBackgroundColor());
            } else {
                let gradient = drawingContext.createConicGradient(
                    3*Math.PI/2 + Math.PI/4, e, t
                );
                colorMode(HSB);
                for(let i=0; i<12; i++) {
                    gradient.addColorStop(i/12, color(i/12*300, 150, this.awarded ? 255 : 120));
                }
                drawingContext.fillStyle = gradient;
            }
            ellipse(e, t, .9 * i, .9 * o);
            
            var n = Math.ceil(i / 25);
            fill(0, 100);
            this.#drawSymbol(e + n, t + n, i, o);
            fill(this.#getSymbolColor());
            this.#drawSymbol(e, t, i, o);
            
            pop();
            ellipseMode(CENTER);
        }
        #getBackgroundColor() {
            return DifficultyCircle.colors.get(this.awarded ? this.#getMainColorKey() : "na") ?? DifficultyCircle.colors.get("na")
        }
        #getSymbolColor() {
            return DifficultyCircle.colors.get(this.awarded || this.gaySex ? "white" : this.#getMainColorKey()) ?? DifficultyCircle.colors.get("na")
        }
        #getMainColorKey() {
            return this.#isAwardedUnranked() ? this.#getAwardKey() : "stars" + this.difficulty
        }
        #isAwardedUnranked() {
            return this.special
        }
        #getAwardKey() {
            if (this.special)
                return "special"
        }
        #drawSymbol(e, t, i, o) {
            if (push(),
            translate(e, t),
            this.special)
                for (var n = 0; n < 3; n++)
                    push(),
                    rotate(60 * n),
                    rect(0, 0, i / 9, o * (4 / 9), i),
                    pop();
            else
                [0].includes(this.difficulty) && rect(0, 0, 1.5 * i / 9, 1.5 * i / 9, 1.5 * i / 9),
                [1, 3, 5].includes(this.difficulty) && rect(0, 0, i / 9, o * (4 / 9), i),
                [2, 3, 4, 5, 6].includes(this.difficulty) && (rect(-i / 9 * 1.5, 0, i / 9, o * (4 / 14), i),
                rect(i / 9 * 1.5, 0, i / 9, o * (4 / 14), i)),
                [4, 5, 6].includes(this.difficulty) && (rect(-i / 9 * 3, 0, i / 9, i / 9, i),
                rect(i / 9 * 3, 0, i / 9, i / 9, i)),
                [6].includes(this.difficulty) && (e = i * (4 / 9),
                t = o * (4 / 14) / 1.5,
                rect(0, -(e / 2 - t / 2), i / 9, t, i),
                rect(0, e / 2 - t / 2, i / 9, t, i));
            pop()
        }
    }

    pulsusPlus.pg = createGraphics(width, height, WEBGL);
    pulsusPlus.pg.font = loadFont("/client/resources/font/Pulsus.otf");

    pulsusPlus.setPrinterOnFire = function() {
        if(pulsusPlus.printerOpacity >= 254 && !pulsusPlus.printerDescend) pulsusPlus.printerDescend = true;
        if(pulsusPlus.printerOpacity <= 1 && pulsusPlus.printerDescend) pulsusPlus.printer = false;
        pulsusPlus.printerOpacity += pulsusPlus.forceEase(pulsusPlus.printerDescend ? 0 : 255, pulsusPlus.printerOpacity, pulsusPlus.printerDescend ? .025 : .005);
        push();
        pulsusPlus.pg.clear();
        pulsusPlus.pg.angleMode(DEGREES);
        pulsusPlus.pg.push();
        pulsusPlus.pg.rotateY(((millis()/10000*1.25)%1)*360);
        if(pulsusPlus.pg.width !== width || pulsusPlus.pg.height !== height) pulsusPlus.pg.resizeCanvas(width, height);
        pulsusPlus.pg.textFont(pulsusPlus.pg.font);
        pulsusPlus.pg.background(0, pulsusPlus.printerOpacity);
        pulsusPlus.pg.textSize((width > height ? height : width)/12);
        pulsusPlus.pg.textAlign(CENTER);
        pulsusPlus.pg.noStroke();
        pulsusPlus.pg.colorMode(HSB);
        let color = 80 * ((millis()/1000/10)%1);
        pulsusPlus.pg.fill(color > 40 ? 80 - color : color, 102, 255, pulsusPlus.printerOpacity/255);
        pulsusPlus.pg.text('YOUR PRINTER IS ON FIRE!!!', 0, 0);
        imageMode(CORNER);
        image(pulsusPlus.pg, 0, 0);
        pulsusPlus.pg.pop();
        pop();
    };

    pulsusPlus.defaultSettings = {
        allowMultiple: true,
        backgroundURL: "",
        canvasX: 0,
        canvasY: 0,
        comboBreak: "",
        cycleArrowKeys: true,
        detailedCanvas: true,
        fadeOnEnd: true,
        fixDC: true,
        gameplayFileMode: "file",
        gaySex: false,
        hideErrors: false,
        hitsound: "",
        holdRelease: "",
        holdReleaseVolume: menu.settings.hitsoundVolume,
        keybindFocus: false,
        masterVolume: 100,
        overlayLetters: {
            hue: 141,
            saturation: 100,
            brightness: 179
        }, overlayNum: {
            hue: 0,
            saturation: 100,
            brightness: 179
        },
        preferredFS: 1,
        preferredFSEnabled: false,
        preferredHW: 1,
        preferredHWEnabled: false,
        replaceSliders: false,
        resolution: "noResize",
        retryTime: 300,
        sfxVolume: 50,
        showDetailedJudgements: true,
        showMods: true,
        showOverlay: true,
        skipWelcome: false,
        syncWelcome: true,
        tabIcon: "data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAAMMOAADDDgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkMVoAAAAUAYuWrh3HxcBp286wv6mkmnwAAAAEBwcHAAAAAAAAAAAAo6SmAKWnqQiXnKQvlpqfN5GRkjd2eX83iY2WRdHKuYDt0pjN+shb+P+/Mf/fyZfTcniCTHp+giwgHx8IJycnAPHq3wD07uRH3byI5dGvee3Tw6vs3NG57O3LgfT9wkH+/7QO//+uAP//rgD/98lk/cOujfLRupfTeXyBLY2NjQAAAAAA2tfUa9e1f//ivHb/98dh//+8J///sQT//64A//+vAP//rwD//64A//+7Jf/Sr3H/y6hy7JeboTeurq4A4te+lfHRjeH8xk7//7cV//+vAP//rgD//68A//+vAP//rwD//68A//+vAP//sAP/7sVw/8OwlOySk5U3ra2tAP/fmu7/sw3//64A//+vAP//rwD//68A//+vAP//rwD//68A//+vAP//rwD//64A//7BPP/LwrDta21wN4iIiAD/7sih/7wp//+uAP//rwD//68A//+vAP//rwD//68A//+vAP//rwD//68A//+vAP//tAz/4smU82NocUWFhoYA////Qv/Qa+z/rgD//68A//+vAP//rwD//68A//+vAP//rwD//68A//+vAP//rwD//64A//jFVv6opqF2////AP///wr/5q+w/7YW//+vAP//rwD//68A//+vAP//rwD//68A//+vAP//rwD//68A//+uAP//uB3/28igvzQ+Uxr/9N0A//rtaf/IUv//rgD//68A//+vAP//rwD//68A//+vAP//rwD//68A//+vAP//rwD//68A//TLcfCWmJ1d/vz5AP7//1z+4aL+/7EG//+vAP//rwD//68A//+vAP//rwD//68A//+vAP//rwD//68A//+tAP//vjP/yr+ntPnu3QD57+Bc8tam/v++Mf//rgD//68A//+vAP//rwD//68A//+vAP//rwD//64A//+xB///vi7//tR37OTZw5P47NkA+OzaXOGya/75yWf//68A//+vAP//rwD//68A//+uAP//rgD//7QQ//7DRP/2ynL/7NWs8szOzlj///8F+fDhAPry5lXjtW/789KV//+4Hf//rgD//64A//+wBP//uyX//9Fu/vvir/7sypT+3qpZ/9+/jeWZnaUvra2tAP78+QD+/PoV+vLmU/337YD/y1r1/7IK///CPf3/2ILe/uzFlP79+V78+fVb+OzaXPnu3Vzz7eRHpKapCK6urgAAAAAAAAAAAP///wD///8S/+m5xv/hn+D+89yA/P//Kfb//wP5//8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/gcAAIABAACAAQAAgAEAAAABAAAAAQAAAAEAAAABAAAAAAAAgAAAAIAAAACAAAAAgAAAAIABAACAAQAA4H8AAA==",
        tabName: "Pulsus",
        timingPoints: false,
        themeFileMode: "file",
        themeSel: themes[menu.settings.themeSel].lightTheme ? 1 : 0,
        wave: true,
        welcomeText: "welcome",
        windowOpacity: 75
    };
    
    pulsusPlus.settings = pulsusPlus.getLocal("PulsusPlusSettings", pulsusPlus.defaultSettings);

    pulsusPlus.importSettings = function(data) {
        let name;
        if(typeof data !== "string") {
            name = data[1];
            data = typeof data[0] === "string" ? data[0] : JSON.stringify(data[0]);
        } else {
            name = "Clipboard";
        }
        try {
            data = JSON.parse(data);
            Object.keys(menu.settings).forEach(key => {
                if(!data.hasOwnProperty(key) && key !== "menu") {
                    throw new Error("Invalid JSON");
                };
            });
            Object.entries(data).forEach(entry => {
                menu.settings[entry[0]] = entry[1];
            })
            popupMessage({
                type: "success",
                message: "PP_SUCCESS_IMPORTED-SETTINGS"
            });
        } catch(e) {
            popupMessage({
                type: "error",
                message: "PP_ERROR_SETTINGS-IMPORT-JSON",
                keys: [name]
            });
            return;
        };
    };

    pulsusPlus.importLevel = function(data) {
        const name = data[1];
        const level = typeof data[0] === "string" ? JSON.parse(data[0]) : data[0];
        try {
            JSON.parse(JSON.stringify(level));
            if(!level.hasOwnProperty("beat")) throw Error();
            levels.saved.push(level);
            menu.lvl.tab = 0;
            menu.lvl.sortMode = "dateDesc";
            menu.lvl.showUnranked = true;
            menu.lvl.search = "";
            levels.search = [];
            menu.lvl.scroll = 0;
            menu.lvl.sel = false;
            menu.lvl.searchSent = false;
            menu.lvl.viewSkip = 0;
            clevels = refreshLevels(levels.saved, "dateDesc");
            popupMessage({
                type: "success",
                message: "PP_SUCCESS_IMPORTED-LEVEL"
            });
        } catch(e) {
            popupMessage({
                type: "error",
                message: "PP_ERROR_LEVEL-IMPORT-JSON",
                keys: [name]
            });
            return;
        };
    };

    pulsusPlus.importOsu = function(data) {
        let timings = data[0].replace(/(\n|\r\n)/g, "LINEBREAK").match(/\[TimingPoints\](.*?)\[/)[1].split("LINEBREAK").map(point => point.split(",").map(p => parseFloat(p)));
        timings.shift();
        timings.pop();
        const uninherited = timings.filter(timingPoint => timingPoint[6] === 1).map(inheritedPoint => { return {time: inheritedPoint[0], bpm: inheritedPoint[1]} });
        let changes = [];
        uninherited.forEach((point, index) => {
            const previousPoint = index === 0 ? ["", ""] : uninherited[index - 1];
            if(point.bpm !== previousPoint.bpm) {
                changes.push([point.time, round(60000 / point.bpm, 3)])
            }
        });
        // [0]-> start time (ms)
        // [1] -> bpm
        const firstChange = lodash.cloneDeep(changes[0]);
        changes = changes.map(point => {
            return {
                name: `${point[1]}BPM`,
                time: pulsusPlus.convertTime((point[0] - firstChange[0])/1000, "pulsus"),
                offset: point[0] - firstChange[0],
                bpm: point[1],
                color: 0,
                saturation: 205,
                brightness: 255,
                visible: false
            }
        });
        if(game.sections.length === 1 && lodash.isEqual(game.sections[0], {
            time: 0,
            offset: 0,
            name: "New Bookmark",
            visible: false,
            bpm: game.beat[0]?.[9] ?? 120,
            color: 141,
            saturation: 255,
            brightness: 255
        })) {
            game.sections.pop();
        }
        game.sections.push(...changes);
        popupMessage({
            type: "success",
            message: "PP_SUCCESS_OSU-IMPORT",
            keys: [changes.length]
        });
    };
    
    pulsusPlus.importSong = function(data) {
        const audio = data[0];
        const name = data[1];
        lvlHowl[game.song]._src = audio;
        lvlHowl[game.song].load();
        popupMessage({
            type: "success",
            message: "PP_SUCCESS_SONG-IMPORT",
            keys: [name]
        })
    }

    pulsusPlus.convertTime = function(value, to="seconds") {
        switch(to) {
            case "seconds":
                return value / (game.bpm/60);
            case "pulsus":
                return value * (game.bpm/60);
            default:
                throw Error("invalid mode " + to);
        };
    };

    document.title = pulsusPlus.settings.tabName
    document.querySelector("link[rel='icon']").href = pulsusPlus.settings.tabIcon
    if(pulsusPlus.settings.wave) {
        welcome.wave = 1;
    };
    pulsusPlus.resolutionBuffer = pulsusPlus.settings.resolution;
    if(pulsusPlus.settings.backgroundURL !== "") {
        document.body.style.backgroundImage = `url("${pulsusPlus.settings.backgroundURL}")`;
    };
    pulsusPlus.dcBuffer = pulsusPlus.settings.detailedCanvas;
    if(round(Math.random()*250) === 1) {
        pulsusPlus.settings.backgoundURL = "https://media1.tenor.com/m/4mQt6i-OR74AAAAd/prowler.gif";
    };
    langs["en"].welcome = pulsusPlus.settings.welcomeText

    pulsusPlus.defaultThemes = [{
        name: "PulsusPlus Dark",
        values: {
            buttonDown: color(54, 54, 125),
            buttonText: color(255, 255, 255),
            buttonUp: color(101, 99, 191),
            checkmark: color(0, 225, 255),
            dropdown: color(33, 33, 104),
            keybindDown: color(24, 24, 95),
            keybindUp: color(71, 69, 161),
            lightTheme: false,
            main: color(33, 33, 43),
            modText: color(62, 229, 173),
            overlayShade: color(35, 35, 45),
            scrollbar: color(93, 149, 208),
            select: color(59, 50, 67),
            shade: color(23, 23, 33),
            text: color(255, 255, 255),
            textDown: color(150, 150, 150),
            topBar: color(58, 58, 68)
        }
    }, {
        name: "PulsusPlus Light",
        values: {
            buttonDown: color(85, 85, 190),
            buttonText: color(225, 225, 255),
            buttonUp: color(62, 62, 142),
            checkmark: color(0, 180, 204),
            dropdown: color(73, 71, 133),
            keybindDown: color(55, 55, 170),
            keybindUp: color(42, 42, 122),
            lightTheme: true,
            main: color(181, 181, 227),
            modText: color(34, 195, 142),
            overlayShade: color(130, 130, 191),
            scrollbar: color(32, 129, 233),
            select: color(153, 120, 181),
            shade: color(139, 139, 193),
            text: color(30, 30, 41),
            textDown: color(82, 81, 103),
            topBar: color(178, 178, 188)
        }
    }];

    eval(pulsusPlus.getLocal("PulsusPlusCustomThemes", [{
        name: "PulsusPlus Dark",
        values: {
            buttonDown: color(54, 54, 125),
            buttonText: color(255, 255, 255),
            buttonUp: color(101, 99, 191),
            checkmark: color(0, 225, 255),
            dropdown: color(33, 33, 104),
            keybindDown: color(24, 24, 95),
            keybindUp: color(71, 69, 161),
            lightTheme: false,
            main: color(33, 33, 43),
            modText: color(62, 229, 173),
            overlayShade: color(35, 35, 45),
            scrollbar: color(93, 149, 208),
            select: color(59, 50, 67),
            shade: color(23, 23, 33),
            text: color(255, 255, 255),
            textDown: color(150, 150, 150),
            topBar: color(58, 58, 68)
        }
    }, {
        name: "PulsusPlus Light",
        values: {
            buttonDown: color(85, 85, 190),
            buttonText: color(225, 225, 255),
            buttonUp: color(62, 62, 142),
            checkmark: color(0, 180, 204),
            dropdown: color(73, 71, 133),
            keybindDown: color(55, 55, 170),
            keybindUp: color(42, 42, 122),
            lightTheme: true,
            main: color(181, 181, 227),
            modText: color(34, 195, 142),
            overlayShade: color(130, 130, 191),
            scrollbar: color(32, 129, 233),
            select: color(153, 120, 181),
            shade: color(139, 139, 193),
            text: color(30, 30, 41),
            textDown: color(82, 81, 103),
            topBar: color(178, 178, 188)
        }
    }], true));
    let themeNames = {};
    pulsusPlus.themes.forEach((theme) => themeNames[`PP_MENU_THEME_SELECT_LABEL_${theme.name}`] = theme.name);
    Object.assign(langs["en"], langs["en"], themeNames);

    pulsusPlus.bufferTheme = {};
    colorMode(RGB);
    Object.entries(pulsusPlus.themes[Math.max(0, pulsusPlus.settings.themeSel)].values).forEach(entry => {
        if(typeof entry[1] !== "object") {
            pulsusPlus.bufferTheme[entry[0]] = entry[1];    
            return;
        }
        pulsusPlus.bufferTheme[entry[0]] = [];
        pulsusPlus.bufferTheme[entry[0]][0] = hue(color(...entry[1].levels));
        pulsusPlus.bufferTheme[entry[0]][1] = saturation(color(...entry[1].levels));
        pulsusPlus.bufferTheme[entry[0]][2] = brightness(color(...entry[1].levels));
    });

    pulsusPlus.themeSelBuffer = pulsusPlus.settings.themeSel;


    pulsusPlus.windowTheme = pulsusPlus.themes[theme.lightTheme ? 1 : 0].values;

    pulsusPlus.adjustCanvas = function() {
        PulsusPlusWindow.allInstances.forEach((instance) => {
            if(instance.states.maximized) {
                instance.heightFixed = height/3.25*1.6;
                instance.properties[0] = 0;
                instance.properties[1] = 0;
                instance.properties[2] = width;
                instance.properties[3] = height - instance.heightFixed/32;
            } else {
                instance.heightFixed = height/3.25*1.6;
                instance.properties[2] = instance.targetScale[0] * width;
                instance.properties[3] = instance.targetScale[1] * width;
                instance.properties[0] = constrain(instance.properties[0], 0, width - instance.properties[2]);
                instance.properties[1] = constrain(instance.properties[1], 0, height - ((instance.states.minimized ? instance.heightFixed/32 : instance.properties[3]) + instance.heightFixed/32));
            };
        });
    };

    pulsusPlus.importTheme = function(data) {
        let name;
        if(typeof data !== "string") {
            name = data[1];
            data = typeof data[0] === "string" ? data[0] : JSON.stringify(data[0]);
        } else {
            name = "Clipboard";
        }
        try {
            data = JSON.parse(data);
            Object.entries(data).forEach(entry => {
                if(!pulsusPlus.defaultThemes[0].hasOwnProperty(entry[0])) {
                    throw new Error("Invalid JSON");
                };
            });
            Object.entries(data.values).forEach(entry => {
                if(!pulsusPlus.defaultThemes[0].values.hasOwnProperty(entry[0])) {
                    throw new Error("Invalid JSON");
                };
            });
            if(typeof data.name !== "string" || Object.keys(pulsusPlus.defaultThemes[0].values).length !== Object.keys(data.values).length) {
                throw new Error("Invalid JSON");
            };
            let bufferResult = `pulsusPlus.themes.push({name:"${data.name}",values:{`;
            Object.entries(data.values).forEach((entry, i) => {
                const key = entry[0];
                const value = entry[1];
                if(typeof value !== "object") {
                    bufferResult += `${key}:${value}`;
                } else {
                    bufferResult += `${key}:color(${value.levels})`;
                };
                if(Object.keys(data.values).length-1 !== i) bufferResult += ",";
            });
            bufferResult += "}";
            bufferResult += "})";
            eval(bufferResult);
            langs["en"][`PP_MENU_THEME_SELECT_LABEL_${data.name}`] = data.name;
            pulsusPlus.menu.menu.pages[1].items[0].labels.push(`PP_MENU_THEME_SELECT_LABEL_${data.name}`);
            pulsusPlus.menu.menu.pages[1].items[0].options.push(pulsusPlus.menu.menu.pages[1].items[0].options.length-1);
            pulsusPlus.settings.themeSel = pulsusPlus.menu.menu.pages[1].items[0].options.length-2;
            popupMessage({
                type: "success",
                message: "PP_SUCCESS_IMPORTED-THEME",
                keys: [name]
            });
            pulsusPlus.updateThemeState();
        } catch(e) {
            popupMessage({
                type: "error",
                message: "PP_ERROR_THEME-IMPORT-JSON",
                keys: [name]
            });
            return;
        };
    };

    pulsusPlus.createNewDifficulty = function(reference) {
        levels.saved[levels.saved.length] = {};
        var index = levels.saved.length - 1;
        levels.saved[index].local = true;
        levels.saved[index].beat = [];
        levels.saved[index].effects = reference.effects;
        levels.saved[index].sections = reference.sections;
        levels.saved[index].bpm = reference.bpm;
        levels.saved[index].ar = 2;
        levels.saved[index].hw = 2;
        levels.saved[index].hpD = 15;
        levels.saved[index].song = reference.song;
        levels.saved[index].bg = reference.bg;
        levels.saved[index].songOffset = reference.songOffset;
        levels.saved[index].title = "New Difficulty of " + reference.title;
        levels.saved[index].desc = "";
        levels.saved[index].author = 0 < user.uuid.length ? user.uuid : null;
        popupMessage({
            type: "success",
            message: "PP_SUCCESS_NEW-DIFFICULTY"
        });
        if(game.edit) {
            loadLevel(index, "new");
        }
    }

    // icon
    img.pulsusPlus = loadImage(pulsusPlus.fromExtension("static/icons/game-512.png"));

    // Language items
    fetch(pulsusPlus.fromExtension("src/lang.json"))
        .then(response => response.json())
        .then(data => {
            Object.assign(langs["en"], langs["en"], data);
            window.dispatchEvent(new CustomEvent('SetupComplete'));
        }
    );

    // sounds
    lowLag.load(pulsusPlus.fromExtension("static/sound/scroll.wav"), "scroll");
    lowLag.load(pulsusPlus.fromExtension("static/sound/load.wav"), "load");
    lowLag.load(pulsusPlus.fromExtension("static/sound/retry.wav"), "retry");
    lowLag.load(pulsusPlus.fromExtension("static/sound/skip.wav"), "skip");
};
if(typeof mousePressed === "undefined") function mousePressed(){};
if(typeof mouseDragged === "undefined") function mouseDragged(){};
eval(`
    loadGame = ${pulsusPlus.functionReplace(loadGame, "end", `
        completeSetup();
    `)}
`);

window.addEventListener("SetupComplete", function() {
    if(pulsusPlus.settings.comboBreak !== "") lowLag.load(pulsusPlus.settings.comboBreak, "comboBreak");
    if(pulsusPlus.settings.hitsound !== "") lowLag.load(pulsusPlus.settings.hitsound, "hitsound");
    if(pulsusPlus.settings.holdRelease !== "") lowLag.load(pulsusPlus.settings.holdRelease, "holdRelease");
    canvas.style.filter = (!pulsusPlus.settings.detailedCanvas || pulsusPlus.settings.resolution === "native" || pulsusPlus.settings.resolution === "noResize") ? "" : "drop-shadow(#000 .75vw .75vh .5vmax)";
    Timeout.set(() => {
        pulsusPlus.adjustCanvas();
        pulsusPlus.fullscreened = Math.abs(innerHeight - screen.height) < 150 && Math.abs(innerWidth - screen.width) < 300;
        if(pulsusPlus.fullscreened && pulsusPlus.settings.resolution !== "noResize") {
            canvas.style.borderRadius = !pulsusPlus.settings.detailedCanvas || pulsusPlus.settings.resolution === "native" ? "" : ".75vmax";
            resizeCanvas(...(pulsusPlus.settings.resolution === "native" ? [screen.width, screen.height] : pulsusPlus.settings.resolution.split("x").map(x => Number(x))));
        }
    }, 2000);
    const mmBuffer = musicManager;
    const cmsBuffer = clickMenu.screens;
    const pp = "data:image/jpeg;base64,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";
    eval(`
        adjustCanvas = ${pulsusPlus.functionReplace(adjustCanvas, "end", `
            if(pulsusPlus.resolutionBuffer !== pulsusPlus.settings.resolution) {
                pulsusPlus.resolutionBuffer = pulsusPlus.settings.resolution;
                canvas.style.filter = (!pulsusPlus.settings.detailedCanvas || pulsusPlus.settings.resolution === "native" || pulsusPlus.settings.resolution === "noResize") ? "" : "drop-shadow(#000 .75vw .75vh .5vmax)";
                canvas.style.borderRadius = (!pulsusPlus.settings.detailedCanvas || pulsusPlus.settings.resolution === "native" || pulsusPlus.settings.resolution === "noResize") ? "" : ".75vmax";
                if(pulsusPlus.settings.resolution === "noResize") return;
                resizeCanvas(...(pulsusPlus.settings.resolution === "native" ? [screen.width, screen.height] : pulsusPlus.settings.resolution.split("x").map(x => Number(x))));
                pulsusPlus.adjustCanvas();
            };
            if(pulsusPlus.dcBuffer !== pulsusPlus.settings.detailedCanvas) {
                pulsusPlus.dcBuffer = pulsusPlus.settings.detailedCanvas;
                canvas.style.borderRadius = (!pulsusPlus.settings.detailedCanvas || pulsusPlus.settings.resolution === "native" || pulsusPlus.settings.resolution === "noResize") ? "" : ".75vmax";
                canvas.style.filter = (!pulsusPlus.settings.detailedCanvas || pulsusPlus.settings.resolution === "native" || pulsusPlus.settings.resolution === "noResize") ? "" : "drop-shadow(#000 .75vw .75vh .5vmax)";
            };
            let xOff = constrain(pulsusPlus.settings.canvasX/2 + 50, 0, 100);
            let yOff = constrain(pulsusPlus.settings.canvasY/2 + 50, 0, 100);
            canvas.parentElement.style.cssText = (pulsusPlus.fullscreened && pulsusPlus.settings.resolution !== "noResize") ? \`margin: 0; position: absolute; top: \$\{yOff}%; left: \$\{xOff\}%; transform: translate(-\$\{xOff}%, -\$\{yOff\}%);\` : "";
            `)
            .replace("resizeCanvas(e", "menu.lvl.scroll *= t/height, resizeCanvas(e")
            .replace(/millis\(\),/, `
                millis(),
                pulsusPlus.adjustCanvas(),
            `)
            .replace("||width", `||(pulsusPlus.fullscreened && pulsusPlus.settings.resolution !== "noResize")||width`)
        };
        checkHolds = ${pulsusPlus.functionReplace(checkHolds, /(.{1,2})\.settings\.hitsoundVolume/, "pulsusPlus.settings.holdReleaseVolume")}
        copyLevel = ${pulsusPlus.functionReplace(copyLevel, /,/, `
            , levels.saved[t].stars = newGrabLevel(e, "id").stars
        `)};
        clickMenu.screens = ${pulsusPlus.functionReplace(clickMenu.screens, /\.5===(.{1,2})\.playbackRate/, "true")
            .replace(/playingOffset=(.{1,2})\.time/, "playingOffset = game.time, pulsusPlus.playbackRate = game.playbackRate")
            .replace(/\((.{1,2})\(String/, "(pulsusPlus.shiftKey ? createLevel(clevels[menu.song.sel]) : copyToClipboard(String")
        };
        Object.keys(cmsBuffer).forEach(key => {
            clickMenu.screens[key] = cmsBuffer[key];
        });
        clickMenu.screens.click = ${pulsusPlus.functionReplace(clickMenu.screens.click, "start", `
            if(pulsusPlus.settings.skipWelcome) {
                gameScreen = "menu";
                menu.screen = "lvl";
                loadMenuMusic();
                welcome.startTime = millis();
                return;
            };
        `)};
        createLevel = ${pulsusPlus.functionReplace(createLevel, `New Map",`, `New Map",
            levels.saved[levels.saved.length - 1].bg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
            `, ["songID"])
            .replace(".sections=[]", `.sections=(pulsusPlus.settings.timingPoints ? [{
                    time: 0,
                    offset: 0,
                    name: "New Bookmark",
                    visible: false,
                    bpm: 120,
                    color: 141,
                    saturation: 255,
                    brightness: 255
                }] : [])
            `)
            .replace(".song=1203", `.song = (typeof songID !== "undefined" ? (menu.screen = "lvl", songID) : 1203)`)
            .replace("ar=2", "ar=1")
            .replace("hw=2", "hw=1")
        };
        cycleSnap = ${pulsusPlus.functionReplace(cycleSnap, "=.25))", "= .25 : game.snap = .25); pulsusPlus.snap = game.snap;")
            .replace(/&&\((.{1,2})\.snap/, "? game.snap")
        };
        drawDifficultyCircle = ${pulsusPlus.functionReplace(drawDifficultyCircle, /\)\.draw\(/, `,gaySex).draw(`, ["gaySex"])};
        drawProfile = ${pulsusPlus.functionReplace(drawProfile, /"id"\)\.special\)/g, `"id").special, newGrabUser(newGrabLevelMeta(clevels[t], "id").author, "uuid").user)`)}
        drawScreens = ${pulsusPlus.functionReplace(drawScreens, /"vsync"/s, `
            pulsusPlus.windowTheme = pulsusPlus.settings.themeSel === -1 ? pulsusPlus.themes[theme.lightTheme ? 1 : 0].values : pulsusPlus.themes[pulsusPlus.settings.themeSel].values;
            PulsusPlusWindow.allInstances.filter(instance => instance.states.visible).sort((a, b) => a.z - b.z).forEach(instance => instance.render())
            if(pulsusPlus.printer) {
                pulsusPlus.setPrinterOnFire();
            };
            "vsync"
            `)
            .replace(/"game"!==.*?-a\),pop\(\)\),/, `
            gameScreen !== "game" && (
                colorMode(HSB),
                fill(255 * ((millis()/1000/10)%1), 102, 255),
                text(\`PulsusPlus \$\{pulsusPlus.version\}\`, a, height-a-(2*textLeading())),
                fill(theme.text),
                text(d + "\\nTetroGem 2024", a, height-a)
            ),pop()),
            `)
            .replace(`case"success"`, `case "warning": r = color(255, 175, 0);break;case "success"`)
            .replace(/\?\((.{1,2})\.loaded=!0/, "&& pulsusPlus.game.loaded ? (game.loaded = true")
        };
        getScroll = ${pulsusPlus.functionReplace(getScroll, "start", `
            if(PulsusPlusWindow.allInstances.some(instance => instance.states.visible && hitbox(instance.z + "rcorner", instance.properties[0], instance.properties[1], instance.properties[2], instance.heightFixed/16 + Math.max(0, instance.menuHeight/1.25 - instance.heightFixed/32)) || instance.states.dragging || instance.menu.data.dropdownHitbox)) {
                return false;
            };
        `)};
        hitbox = ${pulsusPlus.functionReplace(hitbox, "start", `
            if(drawingContext.globalAlpha <= .05 || pulsusPlus.printer || PulsusPlusWindow.allInstances.some(instance => instance.states.dragging)) return false;
            if(typeof testHitbox === "undefined") {
                if(isNaN(parseInt(e[0]))) {
                    e = "0" + e;
                }
                if(PulsusPlusWindow.allInstances.some(instance => instance.states.visible && instance.z > parseInt(e[0]) && (hitbox("rcorner", instance.properties[0], instance.properties[1], instance.properties[2], instance.heightFixed/16 + Math.max(0, instance.menuHeight/1.25 - instance.heightFixed/32), undefined, undefined, true) || instance.menu.data.dropdownHitbox))) {
                    return false;
                };
                e = e.substring(1);
            }
        `, ["testHitbox"])};
        Howl.prototype.volume = ${pulsusPlus.functionReplace(Howl.prototype.volume, /(vol =|vol=)/, "vol = (pulsusPlus.settings.masterVolume/100) *")}
        loadLevel = ${pulsusPlus.functionReplace(loadLevel, "start", `
        `)
            .replace("lvl.loading=!0)", `lvl.loading=!0)
            pulsusPlus.game.loaded = false
            pulsusPlus.resultsScreenAppeared = false;
            pulsusPlus.game.UR = 0;
            pulsusPlus.game.noteTimes = game.beat.map(beat => beat[1]).sort((a, b) => a - b);
            pulsusPlus.game.hw = round((clevels[menu.lvl.sel]?.local ? clevels[menu.lvl.sel].hw : newGrabLevelMeta(clevels[menu.lvl.sel], "id").hw) * game.mods.hitWindow, 2);
            pulsusPlus.game.hwMs = round((pulsusPlus.convertTime(game.hw) * 1e3) * game.hitValues[game.hitValues.length - 2].timing);
            pulsusPlus.game.barProgress = 0;
            pulsusPlus.game.breakProgress = 1;
            pulsusPlus.thread((noteTimes, gameBeat) => {
                return noteTimes.map(time => gameBeat.filter(beat => beat[1] === time).map(beat => beat[1] + (beat[5] ? beat[6] : 0)).sort((a, b) => b - a)[0])
            },
                JSON.stringify(pulsusPlus.game.noteTimes), JSON.stringify(game.beat)
            ).then(response => {
                pulsusPlus.game.noteEndTimes = response;    
                pulsusPlus.game.loaded = true;
            });
            if(!game.retry) {
                lowLag.play("load", pulsusPlus.settings.sfxVolume/100);
            };
            pulsusPlus.pressedNum = [...Array(9).keys()].map(x => false);
            pulsusPlus.pressedLetters = [...Array(9).keys()].map(x => false);
        `)    
            .replace(/if\(soundManager/, `
            if(pulsusPlus.settings.preferredFSEnabled && !game.edit) {
                game.mods.foresight = round(constrain(pulsusPlus.settings.preferredFS / (clevels[menu.lvl.sel]?.local ? clevels[menu.lvl.sel].ar : newGrabLevelMeta(clevels[menu.lvl.sel], "id").ar), .25, 2), 2);
            };
            if(pulsusPlus.settings.preferredHWEnabled && !game.edit) {
                game.mods.hitWindow = round(constrain(pulsusPlus.settings.preferredHW / (clevels[menu.lvl.sel]?.local ? clevels[menu.lvl.sel].hw : newGrabLevelMeta(clevels[menu.lvl.sel], "id").hw), .25, 2), 2);
            };
            if (soundManager`)
        };
        if(pulsusPlus.settings.syncWelcome) {
            loadStartScreens = ${pulsusPlus.functionReplace(loadStartScreens, /fill\(190\).*?fill\(255\)/, `
                targetBrightness = brightness(theme.main) > 255/2 ? 10 : 10,
                colorMode(HSB),
                fill(hue(theme.main), saturation(theme.main), lerp(brightness(theme.main), targetBrightness, .25)),
                rect(0, 0 - height / 2 * (1 - abs(welcomeBorders[3])) * 1, width, height / 2),
                rect(0, height / 2 + height / 2 * (1 - abs(welcomeBorders[3])) * 1, width, height / 2),
                fill(hue(theme.main), saturation(theme.main), lerp(brightness(theme.main), targetBrightness, .5)),
                rect(0, 0 - height / 2 * (1 - abs(welcomeBorders[2])) * 1, width, height / 2),
                rect(0, height / 2 + height / 2 * (1 - abs(welcomeBorders[2])) * 1, width, height / 2),
                fill(hue(theme.main), saturation(theme.main), lerp(brightness(theme.main), targetBrightness, .75)),
                rect(0, 0 - height / 2 * (1 - abs(welcomeBorders[1])) * 1, width, height / 2),
                rect(0, height / 2 + height / 2 * (1 - abs(welcomeBorders[1])) * 1, width, height / 2),
                fill(hue(theme.main), saturation(theme.main), lerp(brightness(theme.main), targetBrightness, 1)),
                rect(0, 0 - height / 2 * (1 - abs(welcomeBorders[0])) * 1, width, height / 2),
                rect(0, height / 2 + height / 2 * (1 - abs(welcomeBorders[0])) * 1, width, height / 2),
                colorMode(RGB),
                fill(255)
                `)
                .replace("background(255)", "background(theme.main)")
                .replace("fill\(0,255-255", "fill(theme.text, 255 - 255")
            };
        };
        lowLag.msg = function(){};
        lowLag.play = ${pulsusPlus.functionReplace(lowLag.play, "start", "if(vol === undefined) vol = 1; vol *= pulsusPlus.settings.masterVolume/100;")}
        mousePressed = ${pulsusPlus.functionReplace(mousePressed, "end", `
            PulsusPlusWindow.allInstances.filter(instance => instance.states.visible).forEach((instance) => {
                if(hitbox(instance.z + "rcorner", instance.properties[0], instance.properties[1], instance.properties[2], instance.heightFixed/16 + Math.max(0, instance.menuHeight/1.25 - instance.heightFixed/32))) {
                    instance.z = 99;
                    PulsusPlusWindow.allInstances.sort((a,b) => a.z-b.z);
                    let newIndexes = [...Array(PulsusPlusWindow.allInstances.length).keys()].map(x => x+1);
                    PulsusPlusWindow.allInstances.map((e, i) => e.z = newIndexes[i]);
                };
                if(!instance.states.maximized && hitbox(instance.z + "rcorner", instance.propertiesDis[0], instance.propertiesDis[1], instance.propertiesDis[2] - 3*instance.heightFixedDis/12, instance.heightFixedDis/16)) {
                    instance.distanceX = mouseX - instance.properties[0];
                    instance.distanceY = mouseY - instance.properties[1];
                    instance.states.dragging = true;
                };
            });
        `)};
        mouseReleased = ${pulsusPlus.functionReplace(mouseReleased, "end", `
            PulsusPlusWindow.allInstances.forEach((instance) => {
                if(instance.states.dragging) {
                    instance.states.dragging = false;
                    localStorage.setItem("PULSUSPLUS_WINDOW-POS_" + instance.windowName, JSON.stringify([instance.properties[0], instance.properties[1]]));
                };
            });
        `)};
        mouseDragged = ${pulsusPlus.functionReplace(mouseDragged, "end", `
            PulsusPlusWindow.allInstances.filter(instance => instance.states.visible).forEach((instance) => {
                if(instance.states.dragging) {
                    instance.properties[0] = constrain(mouseX - instance.distanceX, 0, width - instance.properties[2]);
                    instance.properties[1] = constrain(mouseY - instance.distanceY, 0, height - ((instance.states.minimized ? instance.heightFixed/32 : instance.properties[3]) + instance.heightFixed/32));
                }
            });
        `)};
        mouseClicked = ${pulsusPlus.functionReplace(mouseClicked, "start", `
            PulsusPlusWindow.allInstances.filter(instance => instance.states.visible).forEach((instance) => {
                if((hitbox(instance.z + "rcorner", instance.propertiesDis[0], instance.propertiesDis[1]+instance.heightFixed/16, instance.propertiesDis[2], instance.propertiesDis[3]-instance.heightFixed/32) || instance.menu.data.dropdownHitbox) && !instance.states.minimized) instance.menu.click();
                if(!(Object.values(pulsusPlus.savedKeybinds).some(x => x.active)) && hitbox(instance.z + "rcorner", instance.propertiesDis[0]+instance.propertiesDis[2]-instance.heightFixedDis/12, instance.propertiesDis[1], instance.heightFixedDis/12, instance.heightFixedDis/16)) instance.topbarAction("toggle");
                if(hitbox(instance.z + "rcorner", instance.propertiesDis[0]+instance.propertiesDis[2]-2*instance.heightFixedDis/12, instance.propertiesDis[1], instance.heightFixedDis/12, instance.heightFixedDis/16)) instance.topbarAction("maximize");
                if(!(Object.values(pulsusPlus.savedKeybinds).some(x => x.active)) && hitbox(instance.z + "rcorner", instance.propertiesDis[0]+instance.propertiesDis[2]-3*instance.heightFixedDis/12, instance.propertiesDis[1], instance.heightFixedDis/12, instance.heightFixedDis/16)) instance.topbarAction("minimize");
            });
        `)};
        musicManager = ${pulsusPlus.functionReplace(musicManager, "start", `
            if(pulsusPlus.stopRetry) {
                pulsusPlus.stopRetry = false;
                game.retry = false;
                game.quickRetry = false;
            }    
        `)
            .replace("retry()", `retry()
            if(!(gameScreen === "game" && (game.disMode === 1 || game.disMode === 2) && !game.edit)) return;
            push();
            if(pulsusPlus.retryDown && !Timeout.pending("retry")) {
                pulsusPlus.retry = millis();
                pulsusPlus.retryDown = false;
            }
            if(pulsusPlus.retry !== null && !Timeout.pending("retry")) {
                if(pulsusPlus.settings.retryTime === 0) {
                    pulsusPlus.retryProgress = 1;
                } else {
                    pulsusPlus.retryProgress = (millis()-pulsusPlus.retry)/pulsusPlus.settings.retryTime;
                };
                if(pulsusPlus.retryProgress >= 1) {
                    game.retry = true;
                    game.quickRetry = true;
                    game.retryMillis = millis();
                    pulsusPlus.retryCount++;
                    pulsusPlus.retryCountPos = 0;
                    if(pulsusPlus.convertTime(game.beat[0]?.[1] ?? 0) > 4) {
                        pulsusPlus.skipAuto = true;
                    };
                    Timeout.set("retry", () => {if(pulsusPlus.retry !== null) pulsusPlus.retry = millis()}, 500);
                    lowLag.play("retry", pulsusPlus.settings.sfxVolume/100);
                }
            } else if (Timeout.pending("retry") || pulsusPlus.retry === null) {
                pulsusPlus.retryProgress += pulsusPlus.forceEase(0, pulsusPlus.retryProgress, .025)
            }
            fill(0, pulsusPlus.retryProgress*255);
            rect(0, 0, width, height);
            pop();
        `)};
        Object.keys(mmBuffer).forEach(key => {
            musicManager[key] = mmBuffer[key];
        });
        musicManager.field.draw = ${pulsusPlus.functionReplace(musicManager.field.draw, "end", `
            const vmax = width > height ? width / 64 : height / 64;
            if(game.beat.length !== 0 ? game.beat[game.beat.length - 1][1] - game.time <= 0 : true) return;
            if(!lvlHowl[game.song].playing() && !game.paused && !game.edit && pulsusPlus.convertTime(game.time) < -2) {
                push();
                fill(0, 200);
                noStroke();
                rectMode(CORNER);
                rect(0, 0, width, height);
                textAlign(RIGHT, BOTTOM);
                textSize(height/24);
                fill(255);
                text("Loading song...", width - vmax, height - vmax - height/24 - height/64);
                pop();
                return;
            }
            if(!(gameScreen === "game" && game.disMode === 1 && !game.edit) || game.beat.length === 0 || game.beat[game.beat.length - 1][1] <= game.time) {
                pulsusPlus.skip = false;
                pulsusPlus.skipAuto = false;
                return;
            };
            const isStart = game.time < game.beat[0][1];
            const prevNoteTime = pulsusPlus.game.noteTimes.filter(t => t <= game.time).sort((a, b) => b - a)?.[0] ?? 0
            const prevIndex = lodash.indexOf(pulsusPlus.game.noteTimes, prevNoteTime);
            const prevNoteEndTime = isStart ? 0 : pulsusPlus.game.noteEndTimes[prevIndex] ?? 0;
            const nextNoteTime = pulsusPlus.game.noteTimes.filter(t => t > game.time)[0];
            const untilNext = pulsusPlus.convertTime(nextNoteTime - Math.max(0, game.time));
            const spacing = pulsusPlus.convertTime(nextNoteTime - prevNoteEndTime);
            if((prevNoteEndTime >= game.time && !isStart)) {
                pulsusPlus.skip = false;
                pulsusPlus.skipAuto = false;
                return;
            };
            const breakProgress = (untilNext - 4)/(spacing - 4);
            pulsusPlus.game.breakProgress += pulsusPlus.forceEase(breakProgress, pulsusPlus.game.breakProgress, .1);
            let skippable, drawable, progStart, progEnd;
            if(isStart) {
                skippable = untilNext > 4;
                drawable = untilNext > 3.5;
                progStart = 1;
            } else {
                skippable = untilNext > 4 && spacing > 8;
                drawable = untilNext > 3.5 && spacing > 8;
                progStart = constrain(spacing - untilNext, 0, 1);
            };
            progEnd = constrain(untilNext-3.5, 0, .5) / .5;
            const progress = progStart * progEnd;
            if(skippable && (pulsusPlus.skip || pulsusPlus.skipAuto)) {
                Timeout.set("skipStart", () => {
                    lvlHowl[game.song].seek((game.songOffset + game.mods.offset + menu.settings.offset)/1000 + (60 * (nextNoteTime - (8 * game.mods.bpm)) / 120));
                    Timeout.set("skipEnd", () => {}, 200);
                }, 200);
                if(pulsusPlus.skip) {
                    lowLag.play("skip", pulsusPlus.settings.sfxVolume/50);
                };
                pulsusPlus.skipAuto = false;
            };
            push();
            drawingContext.globalAlpha = progress;
            pulsusPlus.game.barProgress += pulsusPlus.forceEase(Math.pow(1 - progress, 3), pulsusPlus.game.barProgress, .1);
            if(drawable) {
                rectMode(CORNER);
                noStroke();
                fill(0, 150);
                rect(0, 0, width, height);
                rectMode(CENTER);
                fill(50, 255, 100);
                rect(width/2, height/32/2 - (height/32 * pulsusPlus.game.barProgress), Math.max(0, width * pulsusPlus.game.breakProgress), height/32);
                textAlign(RIGHT, BOTTOM);
                textSize(height/24);
                fill(255);
                text("Press <" + pulsusPlus.savedKeybinds.skip.str + "> to skip", width - vmax + (vmax * 2 * pulsusPlus.game.barProgress), height - vmax - height/24 - height/64);
            };
            pop();
            pulsusPlus.skip = false;
        `)
            .replace(/fill\(0,0,0,200\)/g, "fill(...(theme.lightTheme ? [255, 200] : [0, 200]))")
            .replace(/fill\(lerp\(0,25,..\.menuSize\),lerp\(200,255,..\.menuSize\)\)/g, "fill(theme.main.levels[0], theme.main.levels[1], theme.main.levels[2], 255*game.menuSize)")
            .replace(`"%";`, `"%";
                if(pulsusPlus.levelLoaded === false) {
                    pulsusPlus.levelLoaded = millis();
                };
                const vmax = width > height ? width / 64 : height / 64;
                if(pulsusPlus.retryCount > 1 && pulsusPlus.levelLoaded !== false && millis() - pulsusPlus.levelLoaded >= 1000 && !game.retry) {
                    push();
                    const back = millis() - pulsusPlus.levelLoaded >= 2500;
                    pulsusPlus.retryCountPos += pulsusPlus.forceEase(back ? 0 : 1, pulsusPlus.retryCountPos, back ? 0.075 : .1);
                    textSize(height/32);
                    textAlign(LEFT, TOP);
                    fill(255, pulsusPlus.retryCountPos * 255);
                    text(pulsusPlus.retryCount + " retries and counting...", ((1 - pulsusPlus.retryCountPos) * -vmax * 2) + vmax, vmax + height/24 + height/64);
                    pop();
                };
            `)
            .replace(/\!(.{1,2})\.menu&&/, `!game.menu && !PulsusPlusWindow.allInstances.some(instance => instance.states.visible && (hitbox(instance.z + "rcorner", instance.properties[0], instance.properties[1], instance.properties[2], instance.heightFixed/16 + Math.max(0, instance.menuHeight/1.25 - instance.heightFixed/32)) || instance.menu.data.dropdownHitbox)) &&`)
            .replace(/,(.{1,2})\.settings\.showScore&&/, `,
                pulsusPlus.settings.showMods && (
                    textAlign(RIGHT, TOP),
                    fill(255, 200 * game.guiAlpha),
                    textSize(height / 16 / 1.5 / 1.5),
                    text(pulsusPlus.getMods(game.mods), width - height/32, 2.5 * height/32)
                ),
                pulsusPlus.settings.showDetailedJudgements && (
                    textAlign(LEFT, TOP),
                    textSize(height / 16 / 1.5 / 1.6),
                    push(),
                    drawingContext.globalAlpha = game.guiAlpha,
                    game.hitValues.forEach((val, i) => {
                        pulsusPlus.game.hitStatsSumReal += game.hitStats[i];
                        const name = val.name;
                        const col = val.color;
                        const hit = game.hitStats[i] ?? 0;
                        push();
                        fill(col);
                        text(\`\$\{name\}: \`, width/128, height/3 + (textLeading() * i));
                        fill(255);
                        text(hit, width/128 + textWidth(game.hitValues.map(v => v.name).sort((a, b) => b.length - a.length)[0] + ": "), height/3 + (textLeading() * i))
                        pop();
                    }),
                    fill(255),
                    text("M/G: " + pulsusPlus.game.ratio, width/128, height/3 + (textLeading() * (game.hitValues.length + 0))),
                    text("UR: " + pulsusPlus.game.UR, width/128, height/3 + (textLeading() * (game.hitValues.length + 1))),
                    /*millis() - pulsusPlus.game.lastCalc > 100 * Math.max(1, pulsusPlus.game.hitStatsSumReal / 750) && */ pulsusPlus.game.calculatedUR && pulsusPlus.game.hitStatsSum !== pulsusPlus.game.hitStatsSumReal && (
                        pulsusPlus.game.calculatedUR = false,
                        pulsusPlus.thread((gsd, arr) => { return gsd(arr) },
                            pulsusPlus.getStandardDeviation.toString(), JSON.stringify(game.sectionPerformance.filter(p => p[1] !== 4).map(p => p[2]/2 * 1e4))
                        ).then(response => {
                            pulsusPlus.game.UR = round(response);
                            pulsusPlus.game.calculatedUR = true;
                        }),
                        pulsusPlus.game.ratio = (game.hitStats[0] > 0 || game.hitStats[1] > 0 ? (game.hitStats[0] >= game.hitStats[1] ? (game.hitStats[1] > 0 ? (round(game.hitStats[0] / game.hitStats[1], 2) + ":1") : "1:0") : (game.hitStats[0] > 0 ? ("1:" + round(game.hitStats[1] / game.hitStats[0], 2)) : "0:1")) : "0:0"),
                        pulsusPlus.game.hitStatsSum = pulsusPlus.game.hitStatsSumReal,
                        pulsusPlus.game.lastCalc = millis()
                    ),
                    pulsusPlus.game.hitStatsSumReal = 0,
                    text(\`\$\{pulsusPlus.game.hw\} HW (\\u00B1\$\{pulsusPlus.game.hwMs\}ms)\`, width/128, height/3 + (textLeading() * (game.hitValues.length + 2))),
                    pop()
                ),
                (pulsusPlus.settings.showOverlay && !game.mods.auto) && (
                    push(),
                    drawingContext.globalAlpha = game.guiAlpha,
                    rectMode(CORNER),
                    strokeWeight(width/512),
                    stroke(255),
                    fill(0, 255/2),
                    translate(width - 3*width/32 - width/128, height - height/16 - 3*width/32 - width/128),
                    square(-width/512/2, -width/512/2, 3*width/32 + width/512),
                    textAlign(CENTER),
                    noStroke(),
                    fill(255),
                    textSize(width/64),
                    text(pulsusPlus.game.kps.length + " KPS", -width/512/2 + (3*width/32 + width/512)/2, -width/512/2 - textLeading()),
                    colorMode(RGB),
                    [...Array(9).keys()].forEach(index => {
                        const boxSize = width/32;
                        if(!(game.keysHeld[index] || game.keysPressed[index])) return;
                        push();
                        colorMode(HSB);
                        translate(width/32 * (index % 3), width/32 * Math.floor(index/3));
                        if(game.replay.on) {
                            if(!(game.keysHeld[index] || game.keysPressed[index])) return;
                            fill(color(0, 0, 255));
                        } else {
                            const colL = color(pulsusPlus.settings.overlayLetters.hue, pulsusPlus.settings.overlayLetters.saturation, pulsusPlus.settings.overlayLetters.brightness);
                            const colN = color(pulsusPlus.settings.overlayNum.hue, pulsusPlus.settings.overlayNum.saturation, pulsusPlus.settings.overlayNum.brightness);
                            if(pulsusPlus.pressedLetters[index] && pulsusPlus.pressedNum[index]) {
                                fill(lerpColor(colL, colN, .5));
                            } else if(pulsusPlus.pressedLetters[index]) {
                                fill(colL);
                            } else {
                                fill(colN);
                            }
                        }
                        square(0, 0, boxSize);
                        pop();
                    }),
                    pop()
                ),
            menu.settings.showScore &&`)
            .replace("mouseY<height", "!PulsusPlusWindow.allInstances.some(instance => instance.states.dragging) && mouseY < height")
            .replace(/mouseIsPressed&&\((.{1,2})\.time/, "mouseIsPressed && !PulsusPlusWindow.allInstances.some(instance => instance.states.dragging) && (game.time")
            .replace(/\{(.{1,2})\.sections\.splice/, `{
                if(pulsusPlus.settings.timingPoints && game.sections.length <= 1) {
                    popupMessage({
                        type: "error",
                        message: "PP_ERROR_TOO-LITTLE-BOOKMARKS"
                    });
                    return;
                };
                game.sections.splice
            `)
            .replace(/\*(.{1,2})\.timelineOffset,(.{1,2})\.timeScroll/, `*0,game.timeScroll`)
            .replace(/\((.{1,2})\.timelineTickFor.*?ms"\)/, `(
                (pulsusPlus.settings.timingPoints
                ? (Math.round(1000 * (pulsusPlus.convertTime(game.time - pulsusPlus.targetSection.time) * pulsusPlus.targetSection.bpm/60)) / 3).toFixed(3) + " (" + pulsusPlus.targetSection.bpm + "BPM, " + round(pulsusPlus.convertTime(1e3 * pulsusPlus.targetSection.time)) + "ms + " + pulsusPlus.targetSection.offset + "ms)"
                : game.timelineTickFor(game.time) + " (" + game.timelineBPM + ") (" + lang("milliseconds_short", langSel, game.timelineOffset) + ")")
                + "\\n" + formatTime(pulsusPlus.convertTime(game.time) * 1e3, "min:sec:ms")
            `)
        };
        musicManager.musicTime = ${pulsusPlus.functionReplace(musicManager.musicTime, "start", ``)
            .replace(/console\.log/g, "(function(){})")
            .replace("seek((", `seek(-(Timeout.pending("retry") ? 3000 * game.mods.bpm : 0)/1e3 + (`)
        };
        musicManager.resultsScreen = ${pulsusPlus.functionReplace(musicManager.resultsScreen, "start", `
            const vmax = width > height ? width / 64 : height / 64;
            if(!pulsusPlus.resultsScreenAppeared) {
                pulsusPlus.game.sectionScroll = 0;
                pulsusPlus.game.sectionScrollDis = 0;
                pulsusPlus.game.sectionOverflow = 0;
                pulsusPlus.game.sectionHitbox = false;
                pulsusPlus.thread((gsd, arr) => { return gsd(arr) },
                    pulsusPlus.getStandardDeviation.toString(), JSON.stringify(game.sectionPerformance.filter(p => p[1] !== 4).map(p => p[2]/2 * 1e4))
                ).then(response => {
                    pulsusPlus.game.UR = round(response);
                }),
                pulsusPlus.game.ratio = (game.hitStats[0] > 0 || game.hitStats[1] > 0 ? (game.hitStats[0] >= game.hitStats[1] ? (game.hitStats[1] > 0 ? (round(game.hitStats[0] / game.hitStats[1], 2) + ":1") : "1:0") : (game.hitStats[0] > 0 ? ("1:" + round(game.hitStats[1] / game.hitStats[0], 2)) : "0:1")) : "0:0");
                pulsusPlus.game.lastCalc = millis();
                pulsusPlus.game.hitStatsSum = game.hitStats.reduce((p, a) => p + a, 0);
                pulsusPlus.resultsScreenAppeared = true;
            }
            if(pulsusPlus.settings.fadeOnEnd) {
                lvlHowl[game.song].volume(lvlHowl[game.song].volume() + pulsusPlus.forceEase(0, lvlHowl[game.song].volume(), .025));
            };
            `)
            .replace(/!(.{1,2})\.scoreSubmitted.*?scoreSubmitted=!0\),/, "")
            .replace(/\("loading",(.{1,2})\):"";text\((.*?)\*3\),/, `("loading", langSel):"";`)
            .replace("4),textStyle(NORMAL)", "4),textAlign(LEFT, TOP),textStyle(NORMAL)")
            .replace("mods))", `mods)) + "\\nM/G: " + pulsusPlus.game.ratio + ", UR: " + pulsusPlus.game.UR`)
            .replace("+1];", `+1];
                push();
                const overflow = Math.max(0, ((1.25*height/32 * game.sections.length) + vmax - height/64 + matrix.get().y) - height);
                pulsusPlus.game.sectionOverflow = overflow/(height/32);
                if(overflow > 0) {
                    pulsusPlus.game.sectionHitbox = hitbox("rcorner", vmax, matrix.get().y, width/3 - 2*vmax, height);
                    push();
                    fill(theme.scrollbar);
                    rectMode(CORNER);
                    const scrollY = vmax - height/64;
                    const scrollH = Math.max(height/24, (height - (matrix.get().y + vmax - height/64))/pulsusPlus.game.sectionOverflow);
                    rect(width / 3 - 1.5 * vmax, scrollY + (((height - matrix.get().y - scrollY) - scrollH - vmax) * pulsusPlus.game.sectionScrollDis), width/256, scrollH, vmax)
                    pop();
                } else {
                    pulsusPlus.game.sectionHitbox = false;
                };
                pulsusPlus.game.sectionScrollDis += ease(pulsusPlus.game.sectionScroll, pulsusPlus.game.sectionScrollDis, .01);
                drawingContext.globalAlpha = constrain(((1.25*height/32 * (a+1) + vmax - (height/64) + matrix.get().y - (pulsusPlus.game.sectionScrollDis * (pulsusPlus.game.sectionOverflow + 1) * height/32)) - (vmax - height/64 + matrix.get().y))/(height/32), 0, 1)
                translate(0, -pulsusPlus.game.sectionScrollDis * (pulsusPlus.game.sectionOverflow + 1) * height/32);
            `)
            .replace(/\*a\+(.{1,2})\)\}/, "*a+vmax); pop()}")
        };
        musicManager.updateEditor = ${pulsusPlus.functionReplace(musicManager.updateEditor, /"holdRelease",(.{1,2})\.settings\.hitsoundVolume/, `"holdRelease",pulsusPlus.settings.holdReleaseVolume`)
            .replaceAll("mouseY<height", "!PulsusPlusWindow.allInstances.some(instance => instance.states.dragging) && mouseY < height")
            .replace("edit){", `edit) {
                if(pulsusPlus.settings.timingPoints) {
                    if(game.sections.length === 0) {
                        game.sections.push({
                            time: 0,
                            offset: 0,
                            name: "New Bookmark",
                            visible: false,
                            bpm: game.beat[0]?.[9] ?? 120,
                            color: 141,
                            saturation: 255,
                            brightness: 255
                        });
                        popupMessage({
                            type: "warning",
                            message: "PP_ERROR_TOO-LITTLE-BOOKMARKS-DETECTED",
                            keys: [game.beat[0]?.[9] ?? 120]
                        });
                    };
                    pulsusPlus.targetSection = game.sections.filter(section => section.time <= game.time).sort((a, b) => b.time - a.time)[0] ?? game.sections[0];
                    game.timelineBPM = pulsusPlus.targetSection.bpm;
                    game.timelineOffset = pulsusPlus.targetSection.offset;
                };
            `)
            .replace(/timeEnd=.*?,/, `timeEnd = typeof lvlHowl[game.song] === "undefined" ? getLevelDuration() : pulsusPlus.convertTime(lvlHowl[game.song]._duration - game.songOffset/1000, "pulsus"),`)
        }
        musicManager.updateGameplay = ${pulsusPlus.functionReplace(musicManager.updateGameplay, "start", `
                pulsusPlus.game.kps = pulsusPlus.game.kps.filter(t => millis()-1000 <= t);
            `)
            .replace(/noCursor\(\),/, `
                if(!(PulsusPlusWindow.allInstances.some(x => x.states.visible) || prmptingString.active || prmptingColor.active)) {noCursor()} else {cursor()};
                if(game.disMode === 1) {lvlHowl[game.song].volume(menu.settings.musicVolume/100 * (1 - pulsusPlus.retryProgress) * (Timeout.pending("skipStart") ? (200 + Timeout.remaining("skipStart"))/400 : 1) * (Timeout.pending("skipEnd") ? (400 - Timeout.remaining("skipEnd"))/400 : 1) )};
        `)};
        pauseAction = ${pulsusPlus.functionReplace(pauseAction, /case"retry"\:/, `case "retry": pulsusPlus.retryCount++; pulsusPlus.retryCountPos = 0; pulsusPlus.stopRetry = false;`)};
        popupMessage = ${pulsusPlus.functionReplace(popupMessage, "start", `
            if(e.message.indexOf("PP_ERROR") !== -1 && e.type === "error" && pulsusPlus.settings.hideErrors) return;    
        `)};
        pressKey = ${pulsusPlus.functionReplace(pressKey, /\)&&\((.{1,2})\.keysPressed/, ") && (game.replay.on && pulsusPlus.game.kps.push(millis()), game.keysPressed")};
        promptRes = ${pulsusPlus.functionReplace(promptRes, "start", `
            if(prmptingString.inp.search(/^\\\\DNE\\\\/) === -1) {
                try {
                    const buff = math.evaluate(prmptingString.inp) ?? prmptingString.inp;
                    if(typeof buff !== "number") throw Error("invalid exp");
                    prmptingString.inp = buff.toString();
                } catch(error) {};
            } else {
                prmptingString.inp = prmptingString.inp.substring(5); 
            };
        `)};
        queueServer = ${pulsusPlus.functionReplace(queueServer, "start", `
            if(e === undefined) {
                if(window.onbeforeunload !== null) {
                    window.alert("Hey! You've just stumped upon the worst bug you could ever find, if this message didn't exist, that is. Since it'd let you submit scores, and that, is pretty bad. So, we won't let you play the game with the extension on!\\nERROR CODE: 0");
                };
                window.onbeforeunload = null;
                location.reload();
                return;
            } else if(e === "saveNewScore") {
                if(window.onbeforeunload !== null) {
                    if(Math.ceil(Math.random()*10) === 10) {
                        window.alert("Hey. You stumbled upon the worst bug ever, you are submitting a score. There is nothing you can do, no salvation, no mercy, your name has been added to Tetro's ban list. Expect the CIA to be at your house tomorrow 12PM.\\nERROR CODE: 1");
                    } else {
                        window.alert("Hey! For some reason, your game's trying to submit a score. That's pretty bad, right? So, to make sure the ban hammer doesn't smash your cranium, the game will be restarted after you close this alert.\\nERROR CODE: 1");
                    };
                };
                window.onbeforeunload = null;
                location.reload();
                return;
            }`)};
        releaseKey = ${pulsusPlus.functionReplace(releaseKey, "start", `
            if(pulsusPlus.queuedPress[e]) {
                pulsusPlus.queuedPress[e] = false;
                return;
            };
        `)};
        saveGameData = ${pulsusPlus.functionReplace(saveGameData, "end", `
           localStorage.setItem("PulsusPlusSettings", JSON.stringify(pulsusPlus.settings));
           localStorage.setItem("PulsusPlusCustomThemes", JSON.stringify(pulsusPlus.themes));
        `)};
        sideView = ${pulsusPlus.functionReplace(sideView, "start", ``)
            .replace(/\.mods\.endPos=(.{1,2})\.startMS/, ".mods.endPos = P.startMS, pulsusPlus.game.mods.endPos = P.startMS")
            .replace(/"menu_song_copyID"/, `pulsusPlus.shiftKey ? "menu_lvl_new" : "menu_song_copyID"`)
            .replace(/"id"\)\.special\)/g, `"id").special, newGrabUser(newGrabLevelMeta(clevels[t], "id").author, "uuid").user)`)
        };
        soundManager.setVolume = ${pulsusPlus.functionReplace(soundManager.setVolume, /setVolume\(/g, `setVolume((pulsusPlus.settings.masterVolume/100) *`)
            .replace(/_undefined/g, "undefined")
            .replace(/idCheck/g, "soundManager.getSoundById")
            .replace(/sm2/g, "soundManager")
        };
        transitionScreen = ${pulsusPlus.functionReplace(transitionScreen, "start", `pulsusPlus.levelLoaded = false; if(e === "menu") {pulsusPlus.retryCount = 0};`)}
    `);

    const startPosIndex = menu.lvl.modsNSM.pages[0].items.findIndex(b => b.name === "mods_startPos");
    menu.lvl.modsNSM.pages[0].items[startPosIndex] = {
        type: "slider",
        var: [game.mods, "startPos"],
        name: "mods_startPos",
        hint: "PP_PRACTICE_SETUP_START-POS_HINT",
        min: 0,
        max: 0,
        step: 1000,
        display: () => {
            if(typeof clevels[menu.lvl.sel] === "object") {
                clevels[menu.lvl.sel].beat.sort((a, b) => a[1] - b[1]);
            };
            const lvlLength = clevels[menu.lvl.sel]?.local ? pulsusPlus.convertTime(1e3 * (clevels[menu.lvl.sel].beat[clevels[menu.lvl.sel].beat.length - 1][1] + (clevels[menu.lvl.sel].beat[clevels[menu.lvl.sel].beat.length - 1][5] ? clevels[menu.lvl.sel].beat[clevels[menu.lvl.sel].beat.length - 1][6] : 0)))
            : newGrabLevelMeta(clevels[menu.lvl.sel], "id").len;
            if(menu.lvl.modsNSM.pages[0].items[startPosIndex].max !== lvlLength) {
                game.mods.startPos = 0;
                menu.lvl.modsNSM.pages[0].items[startPosIndex].max = lvlLength;
            }
            return formatTime(game.mods.startPos, "min:sec");
        }
    };
    const endPosIndex = menu.lvl.modsNSM.pages[0].items.findIndex(b => b.name === "mods_endPos");
    menu.lvl.modsNSM.pages[0].items[endPosIndex] = {
        type: "slider",
        var: [pulsusPlus.game.mods, "endPos"],
        name: "mods_endPos",
        hint: "PP_PRACTICE_SETUP_END-POS_HINT",
        min: 0,
        max: 0,
        step: 1000,
        display: () => {
            const lvlLength = clevels[menu.lvl.sel]?.local ? pulsusPlus.convertTime(1e3 * (clevels[menu.lvl.sel].beat[clevels[menu.lvl.sel].beat.length - 1][1] + (clevels[menu.lvl.sel].beat[clevels[menu.lvl.sel].beat.length - 1][5] ? clevels[menu.lvl.sel].beat[clevels[menu.lvl.sel].beat.length - 1][6] : 0)))
            : newGrabLevelMeta(clevels[menu.lvl.sel], "id").len;
            if(menu.lvl.modsNSM.pages[0].items[endPosIndex].max !== lvlLength) {
                game.mods.endPos = 0;
                pulsusPlus.game.mods.endPos = lvlLength;
                menu.lvl.modsNSM.pages[0].items[endPosIndex].max = lvlLength;
            };
            if(lvlLength - pulsusPlus.game.mods.endPos < 1000) {
                game.mods.endPos = 0;
            } else {
                game.mods.endPos = pulsusPlus.game.mods.endPos;
            }
            return formatTime(pulsusPlus.game.mods.endPos, "min:sec");
        }
    }
    window.addEventListener("resize", (e) => {
        pulsusPlus.fullscreened = Math.abs(innerHeight - screen.height) < 150 && Math.abs(innerWidth - screen.width) < 300;
        if(pulsusPlus.fullscreened && pulsusPlus.settings.resolution !== "noResize") {
            resizeCanvas(...(pulsusPlus.settings.resolution === "native" ? [screen.width, screen.height] : pulsusPlus.settings.resolution.split("x").map(x => Number(x))));
            canvas.style.borderRadius = !pulsusPlus.settings.detailedCanvas || pulsusPlus.settings.resolution === "native" ? "" : ".75vmax";
        } else {
            canvas.style.borderRadius = "";
        }
        pulsusPlus.adjustCanvas();
    });

    window.addEventListener("dragover", (e) => {
        e.preventDefault();
    })
    window.addEventListener("drop", (e) => {
        e.preventDefault();
        if (e.dataTransfer.items) {
            pulsusPlus.fetchFileData([...e.dataTransfer.items].filter(item => item.kind === "file").map(item => item.getAsFile()))
                .then(data => {
                    data.forEach((item, index) => {
                        let type;
                        if(item[1].split(".")[item[1].split(".").length - 1] === "osu") type = "osu";
                        else if(item[0].split(",")[0].search(/\{"/) !== -1) type = "json";
                        else if(item[0].split(",")[0].search(/audio/) !== -1) type = "audio";
                        switch(type) {
                            case "json":
                                try {
                                    data[index][0] = JSON.parse(item[0]);
                                    data[index][2] = "json";
                                } catch(e) {
                                    popupMessage({
                                        type: "error",
                                        message: `PP_ERROR_IMPORT-JSON`,
                                        keys: [data[index][1]]
                                    });
                                    data.splice(index, 1);
                                    return;
                                };
                                break;
                            case "audio":
                                data[index][2] = "audio";
                                break;
                            case "osu":
                                data[index][2] = "osu";
                                break;
                            default:
                                popupMessage({
                                    type: "error",
                                    message: `PP_ERROR_WHAT-THE-FUCK`,
                                });
                                data.splice(index, 1);
                                return;
                        }
                    });
                    window.dispatchEvent(new CustomEvent("FilesDropped", {
                        detail: data
                    }));
                });
        } else {
            popupMessage({
                type: "error",
                message: "PP_ERROR_WHAT-THE-FUCK"
            })
        };
    });
    window.addEventListener("FilesDropped", (e) => {
        const data = e.detail.map(item => item[0]);
        const name = e.detail.map(item => item[1]);
        const fileType = e.detail.map(item => item[2]);
        let type;
        data.forEach((item, index) => {
            switch(fileType[index]) {
                case "json":
                    if(item.hasOwnProperty("name") && item.hasOwnProperty("values")) {
                        type = "theme";
                    } else if(item.hasOwnProperty("themeSel")) {
                        type = "settings";
                    } else if(item.hasOwnProperty("beat")) {
                        type = "level";
                    }
        
                    switch(type) {
                        case "theme":
                            pulsusPlus.importTheme([item, name[index]]);
                            break;
                        case "settings":
                            pulsusPlus.importSettings([item, name[index]]);
                            break;
                        case "level":
                            pulsusPlus.importLevel([item, name[index]]);
                            break;
                        default:
                            popupMessage({
                                type: "error",
                                message: `PP_ERROR_IMPORT-JSON`,
                                keys: [name[index]]
                            });
                            break;
                    };
                    break;
                case "audio":
                    try {
                        const audioType = name[index].match(/^(hitsound|holdRelease|comboBreak)\.[^/.]+$/)[0].replace(/\.[^/.]+$/, "");
                        if(item.substring(item.indexOf(',') + 1).length * 3/4 > 32e3) {
                            popupMessage({
                                type: "error",
                                message: "file_tooLarge",
                                keys: [getSize(item.substring(item.indexOf(',') + 1).length * 3/4), "32KB"]
                            });
                            return;
                        };
                        pulsusPlus.settings[audioType] = item;
                        lowLag.load(item, audioType);

                    } catch(e) {
                        popupMessage({
                            type: "error",
                            message: `PP_ERROR_INVALID-AUDIO`,
                            keys: [name[index]]
                        });
                        return;
                    }
                    break;
                case "osu":
                    if(!game.edit) break;
                    pulsusPlus.importOsu([item]);
                    break;
            };
        })
    });

    window.addEventListener("blur", (e) => {
        pulsusPlus.retry = null;
        pulsusPlus.retryDown = false;
        pulsusPlus.skip = false;
    });
});