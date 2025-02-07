// PulsusPlus configurations

const pulsusPlus = {
    version: "gamma-v1.1",
    dev: true,
    updateNotice: false,
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
        holding: 0,
        noteTimes: [],
        noteEndTimes: [],
        barProgress: 0,
        breakProgress: 0,
        UR: 0,
        hitStatsSumReal: 0,
        hitStatsSum: 0,
        ratio: "0:0",
        lastCalc: 0,
        lvlDuration: 0,
        hwUnrounded: 0,
        hw: 0,
        hwMs: 0,
        kps: [],
        maxKps: 0,
        totKps: 0,
        overlayStats: [false, false, false],
        overlayStatsCount: 0,
        calculatedUR: true,
        loaded: false,
        sectionScroll: 0,
        sectionScrollDis: 0,
        sectionHitbox: false,
        sectionOverflow: 0,
        score: 0
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
    resultsScreenAppeared: false,
    sMenu: {
        lvlSel: false,
        tab: 0,
        lastSel: false,
        mods: false,
        modsY: 0,
        modsYDis: 0,
        practice: false,
        practiceY: 0,
        practiceYDis: 0,
        modBtn: {},
        modsS: {},
        currToolTip: null,
        practiceDisabled: false,
        practiceHover: false,
        practiceSelected: -1,
        practiceBtnHover: [],
        practiceSections: [],
        practiceScroll: 0,
        practiceScrollDis: 0,
        practiceScrollMax: 0,
        practiceStart: [1, 0], //[0] -> mode (section 0 / time 1) [1] time
        practiceEnd: [1, 0],
        practiceUsed: false
    },
    prmptingString: false,
    masterVolumeDis: 0,
    printing: false,
    backgrounds: {
        blank: "",
        black: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
    },
    dump: null
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
pulsusPlus.modNames = {
    auto: "AT",
    bpm: "BPM",
    foresight: "FS",
    hitWindow: "HW", 
    noFail: "NF", 
    noRelease: "NR",
    hidden: "HD",
    flashlight: "FL",
    instantFail: "IF",
    perfect: "PF",
    random: "RD",
    mirror: "MR",
    noPitch: "NP",
    noEffects: "NE"
};
pulsusPlus.getMods = function(mods) {
    
    let result = [];
    Object.entries(pulsusPlus.modNames).forEach(entry => {
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
// Damn consts
pulsusPlus.forceSetObjectParameters = function(params) {
    let final = "";
    for(param of Object.entries(params)) {
        // [0] -> name, [1][0] -> minified, [1][1] -> property check, [1][2] -> minified name
        if(typeof param[1][0][param[1][1]] === "undefined") {
            alert("This version of PulsusPlus seems to be outdated! Please try updating it, if the error still persists, let the dev team know!\\nERROR CODE: 2")
        };
        final += `Object.defineProperty(globalThis,'${param[0]}',{get:()=>{return ${param[1][2]}},set:(val)=>{${param[1][2]}=val}});`
    };
    eval(final);
}
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

pulsusPlus.downloadJSON = function(filename, dataObjToWrite, JSZipType) {
    if(typeof JSZipType === "string") {
        switch(JSZipType) {
            case "phz":
            case "pls":
                let zip = new JSZip();
                zip.file(filename, JSON.stringify(dataObjToWrite));
                zip.generateAsync({ type: "blob", compression: "DEFLATE" }).then(blob => {
                    const pseudoDownload = document.createElement("a");
                    const downloadURL = window.URL.createObjectURL(blob);
                    pseudoDownload.href = downloadURL;
                    pseudoDownload.download = `${dataObjToWrite.title.replace(/[^a-zA-Z0-9 ]/g, '')}.${pulsusPlus.settings.lvlExportMode}`;
                    pseudoDownload.click();
                    URL.revokeObjectURL(downloadURL);
                });
                break;
        }
        return;
    }
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
        if(file.type.search(/json/) !== -1 || file.type.search(/text/) !== -1 || (file.type === "" && file.name.split(".")[file.name.split(".").length - 1].match(/chart|osu/))) {
            fr.readAsText(file);
        } else if(file.type.search(/audio/) !== -1) {
            fr.readAsDataURL(file);
        } else {
            if(/\.(phz|pls)$/.exec(file.name)) {
                let jsz = new JSZip();
                jsz.loadAsync(file).then(zip => {
                    zip.files[Object.keys(zip.files)[0]].async('string').then(fileData => {
                        fr.readAsText(new Blob([fileData], {
                            type: "application/json"
                        }));
                    });
                });
            } else {
                reject(`Unsupported file type "${file.type === "" ? file.name.split(".")[file.name.split(".").length - 1] : file.type}"`);
            }
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
const chImport = document.createElement("input")
chImport.className = "pulsus-plus";
chImport.id = "ch-import";
chImport.addEventListener("change", (e) => {
    if(!e.target.files || [...e.target.files].length !== 1) return;
    pulsusPlus.fetchFileData([...e.target.files])
        .then(data => {
            data.forEach(result => pulsusPlus.importCH(result));
        });
});
document.body.appendChild(chImport);
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
levelImport.accept += ", .phz, .pls";
osuImport.accept = ".osu, .txt";
osuImport.multiple = false;
chImport.accept = ".chart";
chImport.multiple = false;
songImport.accept = "audio/*";
songImport.multiple = false;

// Set in-game variables

function completeSetup() {

    // Functions and objects
    pulsusPlus.setParameters({
        addSection: ["function", /sections\.push\(\{time:/],
        adjustCanvas: ["function", /resizeCanvas/],
        calcScoreMulti: ["function", /log\(\.5\)/],
        calcTextWidth: ["function", /if\(textFont/],
        checkHolds: ["function", /disMode&&!0===(.{1,2})\.keysHeld\[.*?\]/],
        clickMenu: ["object", "screens"], // This is actually a function lol
        copyLevel: ["function", /message:"menu_lvl_copied"/],
        copyObject: ["function", /\{if\(void 0!==.{1,2}\)return J/],
        copyToClipboard: ["function", "navigator.clipboard.writeText"],
        createLevel: ["function", `New Map",`],
        cycleSnap: ["function", /\.snap=\.25/],
        drawDifficultyCircle: ["function", /new (.{1,2})\(.*?\)\.draw\(.*?\)\}/],
        drawDiscord: ["function", /discord:!1/],
        drawProfile: ["function", "menu_account_joinedSince"],
        drawScreens: ["function", /\,"hidden"\!==/],
        ease: ["function", /return Number\.isNaN\(.{1,2}\)/],
        fitText: ["function", /textSize\(min/],
        formatTime: ["function", /"min:sec"===/],
        game: ["object", "beat"],
        getKey: ["function", /if\((.{1,2})\.length<=1\)/],
        getLevelDownloadState: ["function", /\?1:0:2/],
        getLevelDuration: ["function", /\.ar<(.{1,2})\.hw/],
        getLevelLength: ["function", /return (.{1,2})\/(.{1,2})\*60/],
        getMods: ["function", /"mods_none"/],
        getObject: ["function", /return .{1,2}\[.{1,2}\[.{1,2}\.length-1\]\]/],
        getScroll: ["function", /:navigator\.userAgent/],
        getSelectedLevel: ["function", /sel\?"number"==/],
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
        mapBeat: ["function", /beat\.some/],
        menu: ["object", "settings"],
        menuLoadDropdown: ["object", "finishFade"],
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
        prmptingStringUpdate: ["function", /"\\n"===/],
        promptColor: ["function", /hsbNSM\.pages/],
        promptRes: ["function", /"number"===.{1,2}\.check/],
        promptString: ["function", /\.allowEmptyString=!0/],
        queueServer: ["function", /(.{1,2})\.queueType\.unshift/],
        quitEditor: ["function", /"menu","game"/],
        refreshLevels: ["function", /case"dateDesc":return/],
        releaseKey: ["function", /newScore\.release\.push/],
        resetclevels: ["function", /\{return .{1,2}=\[\]/],
        saveGameData: ["function", /setItem\("pulsusGammaLvlScores/],
        scrollTimeline: ["function", /"LEFT"===/],
        server: ["object", "newGrabbedLevels"],
        setObject: ["function", /(.{1,2})\[(.{1,2})\[(.{1,2})\.length-1\]\]=(.{1,2})/],
        sideView: ["function", /(.{1,2})\.startMS/],
        theme: ["object", "main"],
        togglePlayback: ["function", /\.playing=!0/],
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
        DifficultyCircle: ["variable", drawDifficultyCircle, /new (.{1,2})\(/, 1] // This is a class
    });
    // Damn consts
    pulsusPlus.forceSetObjectParameters({
        practiceSetup: [vt, "computeSections", "vt"],
        deleteConfirmation: [_o, "rotateTrans", "_o"]
    })

    // I'm sorry i have to do this
    eval(`
        pulsusPlus.scrollTimeline = ${pulsusPlus.functionReplace(scrollTimeline, "4", "1/game.snap").replace("16", "4/game.snap")};
        scrollTimeline = function(){};
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
        defaultBg: "blank",
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
        lvlExportMode: "json",
        masterVolume: 100,
        mpMode: true,
        noteFade: true,
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
        scoreSystem: "pulsus",
        sfxVolume: 50,
        showDetailedJudgements: true,
        showMods: true,
        showOverlay: true,
        showOverlayKps: true,
        showOverlayMax: true,
        showOverlayTot: true,
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

    pulsusPlus.importCH = function(data) {
        console.log(data)
        const resolution = parseInt(data[0].replace(/ /g, "").split("Resolution=")[1].split(/[A-Za-z]/)[0]);
        let timings = data[0].replace(/(\n|\r\n)/g, "LINEBREAK").replace(/ /g, "").match(/\[SyncTrack\](.*?)\}/)[1].split("LINEBREAK").filter(x => x.match(/B/));
        let points = [];
        timings.forEach((timing, index) => {
            /*
            The calculation of time in seconds from one tick position to the next at a constant BPM is defined as follows-
            (tickEnd - tickStart) / resolution * 60.0 (seconds per minute) / bpm
            Therefore to calculate the time any event takes place requires precalculation of the times between all the BPM events that come before it.
            */
            let secondsBeforeTiming = 0;
            let startTime = 0
            const tickStart = parseInt(timing.replace(/=.*$/, ""))/resolution;
            const bpm = parseInt(timing.replace(/^.*B/, ""))/1000;
            if(index !== 0) {
                const lastTiming = points[index-1];
                secondsBeforeTiming = lastTiming.startTime;
                startTime = round(secondsBeforeTiming + (tickStart - lastTiming.tickStart) * 60000 / lastTiming.bpm)
            }
            points[index] = {
                startTime, tickStart, bpm
            }
        });
        points.sort((a, b) => a.tickStart - b.tickStart);
        let firstTime = lodash.cloneDeep(points[0]);
        points.forEach(point => {
            point.startTime -= firstTime.startTime;
            point.tickStart -= firstTime.tickStart;
        })
        function timeFromTick(tick) {
            let finalTime = 0;
            let sectionBPM = points.filter(p => p.tickStart <= tick);
            sectionBPM = sectionBPM[sectionBPM.length - 1].bpm;
            while(tick > 0) {
                let filteredPoints = points.filter(p => p.tickStart < tick)
                const currSection = filteredPoints[filteredPoints.length - 1];
                const ticksElapsed = tick - currSection.tickStart;
                finalTime += round(ticksElapsed * 60000 / currSection.bpm);
                tick -= ticksElapsed;
            }
            return [finalTime, sectionBPM];
        }

        let sections = data[0].replace(/(\n|\r\n)/g, "LINEBREAK").match(/\[Events\](.*?)\}/)[1].split("LINEBREAK").filter(x => x.match(/"section/)).map(section => {
            const name = section.replace(/(^.*?section |"$)/g, "");
            const tickStart = parseInt(section.replace(/(-.*$)/g, ""))/resolution;
            const [startTime, bpm] = timeFromTick(tickStart);
            return {
                name, startTime, tickStart, bpm
            }
        });
        points = points.filter(point => !sections.some(section => point.tickStart === section.tickStart));
        console.log(sections, points)
        const changes = [...sections, ...points].map(point => {
            const isSection = typeof point.name !== "undefined"
            return {
                name: isSection ? point.name : `${point.bpm}BPM`,
                time: pulsusPlus.convertTime(point.startTime/1000, "pulsus"),
                offset: point.startTime,
                bpm: point.bpm,
                color: isSection ? 141 : 0,
                saturation: isSection ? 255 : 205,
                brightness: 255,
                visible: isSection
            }
        });
        game.sections = changes;
        popupMessage({
            type: "success",
            message: "PP_SUCCESS_CH-IMPORT",
            keys: [timings.length, sections.length]
        });
        
    }

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
        game.sections = changes;
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

    pulsusPlus.jumpTo = function(timePulsus) {
        if(game.playing) togglePlayback();
        game.time = timePulsus;;
        if(game.playing) togglePlayback();
    }

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
        levels.saved[index].ar = 1;
        levels.saved[index].hw = 1;
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
    };

    pulsusPlus.computeSections = function() {
        const lvlSel = getSelectedLevel();
        if(!lvlSel || typeof lvlSel?.sections === "undefined") {
            return [];
        } else {
            const sections = lvlSel.sections.filter(section => section.visible);
            pulsusPlus.sMenu.practiceScroll = 0;
            pulsusPlus.sMenu.practiceScrollDis = 0;
            pulsusPlus.sMenu.practiceScrollMax = Math.max(((sections.length * height/12) - (height-height/8-height/24+height/48 - height/6))/(height/12), 0);
            pulsusPlus.sMenu.practiceBtnHover = [...Array(sections.length).keys()].map(x => [-1, 0]);
            pulsusPlus.sMenu.practiceSelected = -1;
            pulsusPlus.sMenu.practiceStart = [1, 0];
            pulsusPlus.sMenu.practiceEnd = [1, pulsusPlus.game.lvlDuration];
            return sections.map(section => {
                push();
                colorMode(HSB);
                const col = color(section.color, section.saturation, section.brightness);
                pop();
                return {
                    name: section.name,
                    color: col,
                    time: section.time / lvlSel.bpm * 60 * 1e3,
                    hover: false,
                    hoverDis: 0
                }
            });
        }
    }

    pulsusPlus.lvlSelAction = function(action) {
        if(clevels.length === 0) return;
        const topOffset = height / 16 + height / 24;
        const cardHeight = height / 12;
        const fixedHeight = height - topOffset;
        const lvls = clevels.length;
        switch(action) {
            case "randomMap":
                menu.lvl.sel = Math.floor(clevels.length * Math.random());


                menu.lvl.scroll = constrain(
                    (11 * fixedHeight * (-cardHeight * ((2*menu.lvl.sel) + 1) + fixedHeight))
                  / (24 * (fixedHeight - (cardHeight * lvls)))
                , 0, height - (height / 16 + height / 24 + (height - (height / 16 + height / 24)) / 12));
    
                lowLag.play("scroll", pulsusPlus.settings.sfxVolume/100);
                break;
            case "scrollUp":
            case "scrollDown":
                const direction = action.search(/up/gi) !== -1 ? -1 : 1;
                if(menu.lvl.sel === false) {
                    if(direction === -1) return;
                    menu.lvl.sel = 0;
                } else {
                    if((menu.lvl.sel === 0 && direction === -1) || (menu.lvl.sel === clevels.length - 1 && direction === 1)) return;
                    menu.lvl.sel = constrain(menu.lvl.sel + direction, 0, clevels.length - 1);
                }

                menu.lvl.scroll = constrain(constrain(
                    menu.lvl.scroll,
    
                    (11 * fixedHeight * (fixedHeight - cardHeight * (menu.lvl.sel + 1)) )
                  / (12 * (fixedHeight - (cardHeight * lvls))),
    
                  (11 * fixedHeight * menu.lvl.sel * cardHeight)
                  / (12 * ((cardHeight * lvls) - fixedHeight))
                ), 0, height - (height / 16 + height / 24 + (height - (height / 16 + height / 24)) / 12));
                
                lowLag.play("scroll", pulsusPlus.settings.sfxVolume/100);
                break;
        }
    };

    pulsusPlus.refreshLvl = function() {
        levels.search = [];
        menu.lvl.scroll = 0;
        menu.lvl.sel = false;
        menu.lvl.searchSent = false;
        menu.lvl.viewSkip = 0;
    };

    pulsusPlus.sMenu.modBtn = Object.fromEntries(Object.keys(pulsusPlus.modNames).filter(m => typeof game.mods[m] === "boolean" && m !== "noPitch").map(x => {
        return [x, {
            hover: false,
            hoverDis: 0,
            click: false,
            clickDis: 0,
            hitbox: false,
            hitboxT: null,
            pressed: false
        }]
    }));

    pulsusPlus.modButton = function(name, x, y) {
        const nameAc = pulsusPlus.modNames[name];
        const vw = width / 48;
        const curr = pulsusPlus.sMenu.modBtn[name];
        curr.hoverDis += ease(((mouseIsPressed && mouseButton === LEFT && curr.hitbox) || curr.pressed ? .2 : 0) + (curr.hover ? .2 : 0), curr.hoverDis, .2);
        curr.clickDis += ease(game.mods[name] ? .8 : 0, curr.clickDis, .2);
        x += vw*1.5;
        y += vw*1.5;
        const totalDis = curr.hoverDis + curr.clickDis;
        push();
        rectMode(CENTER);
        curr.hitbox = pulsusPlus.modsHitbox("rcenter", matrix.get().x + x, matrix.get().y + y, vw*(3 * (1 + totalDis * .2)), vw*(3 * (1 + totalDis * .2)));
        if(curr.hitboxT === null && curr.hitbox) {
            curr.hitboxT = millis();
        } else if(curr.hitboxT !== null && !curr.hitbox) {
            curr.hitboxT = null;
        }
        curr.hover = curr.hitbox;
        translate(-totalDis*.2 * vw*1.5, -totalDis*.2 * vw*1.5);
        angleMode(DEGREES);
        translate(x - vw*1.5, y - vw*1.5);
        rotate(22.5/5 * curr.clickDis/.8);
        scale(1 + totalDis * .2);
        translate(vw*1.5, vw*1.5)
        noStroke();
        fill(lerpColor(theme.buttonDown, theme.buttonUp, totalDis));
        rect(0, 0, vw*3, vw*3, vw/3);
        textAlign(CENTER, CENTER);
        textStyle(NORMAL);
        textSize(vw*1.5);
        fill(theme.text);
        text(nameAc, 0, 0);
        pop();
        if(curr.hitboxT !== null) {
            if(millis() - curr.hitboxT >= 750) {
                pulsusPlus.sMenu.currToolTip = name;
            }
        }
    };

    pulsusPlus.sMenu.modSliders = Object.fromEntries(Object.keys(pulsusPlus.modNames).filter(m => typeof game.mods[m] === "number" && !m.match(/pos/gi)).map(x => {
        return [x, {
            hoverElementT: null,
            ballPosDis: 0,
            hoverBall: false,
            hoverBallDis: 0,
            hoverBg: false,
            hoverBgDis: 0,
            drag: false,
            focused: false,
            min: null,
            max: null,
            invert: null,
            index: null
        }]
    }));

    pulsusPlus.modSlider = function(name, x, y, min, max, invertSlider, index) {
        const vw = width / 48;
        const curr = pulsusPlus.sMenu.modSliders[name];
        if(curr.min === null) {
            curr.min = min;
            curr.max = max;
            curr.ballPosDis = game.mods[name];
            curr.invert = invertSlider;
            curr.index = index;
            if(index === 0) curr.focused = true;
        };
        curr.ballPosDis += ease(game.mods[name], curr.ballPosDis, .4);
        const progress = (curr.ballPosDis - curr.min) / (curr.max - curr.min);
        let hoverElement = pulsusPlus.modsHitbox("rcorner", matrix.get().x + x - vw*8, matrix.get().y - vw, vw*16, vw*3);
        if(curr.hoverElementT === null && hoverElement) {
            curr.hoverElementT = millis();
        } else if(curr.hoverElementT !== null && !hoverElement) {
            curr.hoverElementT = null;
        };
        curr.hoverBallDis += ease((curr.hoverBall || curr.drag ? .6 : 0) + (curr.drag ? .4 : 0), curr.hoverBallDis, .2);
        curr.hoverBgDis += ease((curr.hoverBg && !curr.hoverBall ? 1 : 0), curr.hoverBgDis, .2);
        push();
        textAlign(CENTER);
        textSize(vw);
        fill(theme.text);
        translate(x, y);
        colorMode(RGB);
        text(lang("mods_" + name, langSel), 0, -vw/2);
        translate(0, vw);
        rectMode(CENTER);
        fill(255);
        if(curr.focused) {
            strokeWeight(vw/12);
            stroke(theme.select);
        } else {
            noStroke();
        }
        rect(0, 0, vw*14, vw/5 + (curr.hoverBgDis * vw/10), vw/8);
        curr.hoverBg = pulsusPlus.modsHitbox("rcenter", matrix.get().x, matrix.get().y, vw*14, vw/5 + vw*1.5) && !curr.drag;
        fill(lerpColor(theme.buttonDown, theme.buttonUp, curr.hoverBallDis));
        translate(vw*7 * (progress*2 - 1), 0);
        angleMode(DEGREES);
        rotate(742.5 * progress);
        scale(1 + (.2 * curr.hoverBallDis));
        rect(0, 0, vw/1.15, vw/1.15, vw/8);
        curr.hoverBall = pulsusPlus.modsHitbox("rcenter", matrix.get().x, matrix.get().y, vw/2 + vw/1.15 * (1 + (.2 * curr.hoverBallDis)), vw/2 + vw/1.15 * (1 + (.2 * curr.hoverBallDis)));
        rotate(-742.5 * progress);
        noStroke();
        textSize(vw/2);
        const modValue = lang("mods_multiplier", langSel, round(game.mods[name], 2));
        rect(0, 0, textWidth(modValue) + vw/8, textLeading(), vw/8);
        fill(theme.text);
        text(modValue, 0, -vw/1.25/2/2);
        pop();
        if(curr.hoverElementT !== null) {
            if(millis() - curr.hoverElementT >= 750) {
                pulsusPlus.sMenu.currToolTip = name;
            }
        }
    };

    pulsusPlus.sMenu.practiceSliders = Object.fromEntries(["startPos", "endPos"].map(x => {
        return [x, {
            ballPosDis: 0,
            hoverBall: false,
            hoverBallDis: 0,
            hoverBg: false,
            hoverBgDis: 0,
            drag: false,
            focused: false,
            min: null,
            max: null,
            index: null
        }]
    }));

    pulsusPlus.practiceSlider = function(name, x, y, index) {
        const vw = width / 48;
        const curr = pulsusPlus.sMenu.practiceSliders[name];
        if(curr.min === null) {
            curr.min = 0;
            curr.max = pulsusPlus.game.lvlDuration;
            curr.ballPosDis = game.mods[name];
            curr.index = index;
            if(index === 0) curr.focused = true;
        };
        curr.ballPosDis += ease(game.mods[name], curr.ballPosDis, .4);
        const progress = (curr.ballPosDis - curr.min) / (curr.max - curr.min);
        curr.hoverBallDis += ease((curr.hoverBall || curr.drag ? .6 : 0) + (curr.drag ? .4 : 0), curr.hoverBallDis, .2);
        curr.hoverBgDis += ease((curr.hoverBg && !curr.hoverBall ? 1 : 0), curr.hoverBgDis, .2);
        push();
        textAlign(CENTER);
        textSize(vw);
        fill(theme.text);
        translate(x, y);
        colorMode(RGB);
        text(lang("mods_" + name, langSel), 0, -vw/2);
        translate(0, vw);
        rectMode(CENTER);
        fill(255);
        if(curr.focused) {
            strokeWeight(vw/12);
            stroke(theme.select);
        } else {
            noStroke();
        }
        rect(0, 0, vw*24, vw/5 + (curr.hoverBgDis * vw/10), vw/8);
        curr.hoverBg = pulsusPlus.modsHitbox("rcenter", matrix.get().x, matrix.get().y, vw*24, vw/5 + vw*1.5) && !curr.drag;
        fill(lerpColor(theme.buttonDown, theme.buttonUp, curr.hoverBallDis));
        translate(vw*12 * (progress*2 - 1), 0);
        angleMode(DEGREES);
        rotate(742.5 * progress);
        scale(1 + (.2 * curr.hoverBallDis));
        rect(0, 0, vw/1.15, vw/1.15, vw/8);
        curr.hoverBall = pulsusPlus.modsHitbox("rcenter", matrix.get().x, matrix.get().y, vw/2 + vw/1.15 * (1 + (.2 * curr.hoverBallDis)), vw/2 + vw/1.15 * (1 + (.2 * curr.hoverBallDis)));
        rotate(-742.5 * progress);
        noStroke();
        textSize(vw/2);
        const modValue = formatTime(game.mods[name], "min:sec");
        rect(0, 0, textWidth(modValue) + vw/8, textLeading(), vw/8);
        fill(theme.text);
        text(modValue, 0, -vw/1.25/2/2);
        pop();
    };

    pulsusPlus.practiceSetup = function(x, y, w) {
        // pulsusPlus.sMenu.practiceDisabled
        // pulsusPlus.sMenu.practiceSections
        // pulsusPlus.sMenu.end/startPos
        const vw = width / 48;
        const vh = height/48;
        const containerHeight = height-height/8-height/24+vh - height/6;
        push();
        translate(0, height * (pulsusPlus.sMenu.practiceYDis - 1));
        colorMode(RGB);
        fill(0, 200);
        rectMode(CORNER);
        noStroke();
        rect(0, 0, width, height);
        textAlign(CENTER, TOP);
        textStyle(BOLD);
        fill(theme.text);
        textSize(width/24);
        text("Practice Setup", width/2, height/32);
        
        // height/12 vert
        translate(0, height/8);
        translate(vw, 0);
        fill(theme.main);
        rectMode(CORNER);
        rect(0, -vh, width/3, height-height/8-height/24+vh, vw/1.5);
        fill(theme.shade);
        rect(vw/1.5, height/12-vh, width/3-vw/.75, containerHeight);
        pulsusPlus.sMenu.practiceHover = pulsusPlus.modsHitbox("rcorner", matrix.get().x + vw/1.5, matrix.get().y + height/12-vh, width/3-vw/.75, containerHeight)
        if(pulsusPlus.sMenu.practiceDisabled) {
            textSize(height/40);
            textStyle(ITALIC);
            fill(200)
            text("Select a map to set up practice!", width/6, height/12);
        } else {
            if(pulsusPlus.sMenu.practiceSections.length === 0) {
                push();
                textSize(height/40);
                textStyle(ITALIC);
                fill(200)
                text("This map has no sections!", width/6, height/12);
                pop();
            } else {
                push();
                translate(vw/1.5, height/12-vh)
                let scroll = pulsusPlus.sMenu.practiceScrollDis;
                pulsusPlus.sMenu.practiceScrollDis += ease(pulsusPlus.sMenu.practiceScroll, pulsusPlus.sMenu.practiceScrollDis, .35)
                if(pulsusPlus.sMenu.practiceScrollMax > 0) {
                    push();
                    const scrollProgress = scroll/pulsusPlus.sMenu.practiceScrollMax;
                    const factor = Math.min(pulsusPlus.sMenu.practiceScrollMax, 32);
                    const scrollHeight = containerHeight - (factor * (containerHeight/32 + height/24/32));
                    fill(theme.scrollbar);
                    if(pulsusPlus.sMenu.practiceScrollMax > 32) {
                        rect(width/3-vw/.75/2, -scrollHeight + (containerHeight + scrollHeight) * scrollProgress, vw/3, scrollHeight);
                    } else {
                        rect(width/3-vw/.75/2, (containerHeight - scrollHeight) * scrollProgress, vw/3, scrollHeight);
                    }
                    pop();
                }
                
                for(let i = 0; i < pulsusPlus.sMenu.practiceSections.length; i++) {
                    const hover = pulsusPlus.modsHitbox("rcorner", matrix.get().x, matrix.get().y + height/12 * (i - scroll), width/3-vw/.75, height/12);
                    pulsusPlus.sMenu.practiceBtnHover[i][0] = hover ? i : -1;
                    pulsusPlus.sMenu.practiceBtnHover[i][1] += ease(pulsusPlus.sMenu.practiceSelected === i ? 1 : hover ? .4 : 0, pulsusPlus.sMenu.practiceBtnHover[i][1], .25);
                    if(height/12 * (i - scroll) >= containerHeight || height/12 * (i - scroll) <= -height/12) continue;
                    push();
                    const section = pulsusPlus.sMenu.practiceSections[i];
                    translate(0, height/12 * (i - scroll));
                    fill(lerpColor(lerpColor(i%2 === 0 ? theme.shade : theme.overlayShade, color(0,0,0), .15), theme.select, pulsusPlus.sMenu.practiceBtnHover[i][1]));
                    rect(0, 0, width/3-vw/.75, height/12);
                    textStyle(NORMAL);
                    fill(theme.text);
                    textSize(height/48);
                    textAlign(CENTER, CENTER);
                    fitText(section.name, width/6-vw/1.5, height/24, width/4, height/24)
                    textSize(height/48/1.5);
                    textStyle(ITALIC);
                    fill(lerpColor(theme.text, color(0,0,0,0), .35));
                    textAlign(LEFT, TOP);
                    text("Section " + (i + 1), vw/4, vh/4);
                    textAlign(RIGHT, TOP);
                    text("Time: " + formatTime(round(section.time), "min:sec"), width/3-vw/.75 - vw/4, vw/4);
                    pop();
                }
                fill(theme.main);
                rect(0, -height/12, width/3 - 2*vw/1.5, height/12);
                rect(0, containerHeight, width/3 - 2*vw/1.5, height/12);
                pop();
            }
        }
        fill(theme.text);
        textSize(height/20);
        textStyle(BOLD);
        text("Sections", width/6, 0);
        translate(vw/2 + width/3 + vw*11/2, 0);

        pulsusPlus.modMenuButton(6, gameScreen === "game" && pulsusPlus.sMenu.practiceUsed ? "Retry" : "Close", width - matrix.get().x - vw - vw*11/2, vw*3/2 + 2 * (vw*3 + vh/2), vw*11, vw*3, () => {
            if(gameScreen === "game" && pulsusPlus.sMenu.practiceUsed) {
                pauseAction("retry");
            }
            pulsusPlus.sMenu.practice = false;
            pulsusPlus.sMenu.practiceY = 0;
            pulsusPlus.sMenu.lastSel = clevels[menu.lvl.sel];
        });
        
        if(pulsusPlus.sMenu.practiceDisabled) {
            pop();
            return;
        }

        push();
        translate(-matrix.get().x + width/3 + vw + vw/2, vw*3/2 + 3 * (vw*3 + vh/2))
        pulsusPlus.practiceSlider("startPos", (width - matrix.get().x)/2, 0, 0);
        pulsusPlus.practiceSlider("endPos", (width - matrix.get().x)/2, vw*3 + vh/2, 1);
        pop();

        pulsusPlus.modMenuButton(3, "Set Start", 0, vw*3/2, vw*11, vw*3, () => {
            console.log("asd")
            pulsusPlus.sMenu.practiceStart = [0, pulsusPlus.sMenu.practiceSelected];
            game.mods.startPos = pulsusPlus.sMenu.practiceSections[pulsusPlus.sMenu.practiceSelected].time;
            pulsusPlus.sMenu.practiceUsed = true;
        }, pulsusPlus.sMenu.practiceSelected === -1 || (pulsusPlus.sMenu.practiceSelected === pulsusPlus.sMenu.practiceEnd[1] && pulsusPlus.sMenu.practiceEnd[0] === 0));
        pulsusPlus.modMenuButton(4, "Set End", 0, vw*3/2 + vw*3 + vh/2, vw*11, vw*3, () => {
            pulsusPlus.sMenu.practiceEnd = [0, pulsusPlus.sMenu.practiceSelected];
            game.mods.endPos = pulsusPlus.sMenu.practiceSections[pulsusPlus.sMenu.practiceSelected].time;
            pulsusPlus.sMenu.practiceUsed = true;
        }, pulsusPlus.sMenu.practiceSelected === -1  || pulsusPlus.sMenu.practiceSections[pulsusPlus.sMenu.practiceSelected]?.time === 0 || (pulsusPlus.sMenu.practiceSelected === pulsusPlus.sMenu.practiceStart[1] && pulsusPlus.sMenu.practiceStart[0] === 0));
        pulsusPlus.modMenuButton(5, "Reset", 0, vw*3/2 + 2 * (vw*3 + vh/2), vw*11, vw*3, () => {
            pulsusPlus.sMenu.practiceStart = [1, 0];
            pulsusPlus.sMenu.practiceEnd = [1, pulsusPlus.game.lvlDuration];
            game.mods.startPos = 0;
            game.mods.endPos = pulsusPlus.game.lvlDuration;
            pulsusPlus.sMenu.practiceUsed = true;
        });

        translate(vw/2 + vw*11/2, 0);
        textSize(height/24);
        textStyle(NORMAL);
        textAlign(LEFT, TOP);
        const startMode = pulsusPlus.sMenu.practiceStart[0];
        const startValue = pulsusPlus.sMenu.practiceStart[1];
        fitText(`From: ${
            startMode === 0 ? pulsusPlus.sMenu.practiceSections[startValue].name : (
                formatTime(startValue, "min:sec") + (startValue === 0 ? " (Start)" : "")
            )
        }`, 0, 0, width-matrix.get().x - vw, vw*3/2);
        translate(0, vw*2);
        const endMode = pulsusPlus.sMenu.practiceEnd[0];
        const endValue = pulsusPlus.sMenu.practiceEnd[1];
        fitText(`To: ${
            endMode === 0 ? pulsusPlus.sMenu.practiceSections[endValue].name : (
                formatTime(endValue, "min:sec") + (endValue === pulsusPlus.game.lvlDuration ? " (End)" : "")
            )
        }`, 0, 0, width-matrix.get().x - vw, vw*3/2);
        pop();
    };

    pulsusPlus.modMenuBtns = [];

    pulsusPlus.modMenuButton = function(index, name, x, y, w, h, action, disabled) {
        if(typeof pulsusPlus.modMenuBtns[index] === "undefined") {
            pulsusPlus.modMenuBtns[index] = {
                hover: false,
                hoverDis: 0,
                pressed: false,
                pressedDis: 0,
                disabledDis: 0,
                action: action
            }
        };
        const btn = pulsusPlus.modMenuBtns[index];
        if(!btn.hover && btn.pressed) {
            btn.pressed = false;
        };
        btn.hoverDis += ease(btn.hover ? .2 : 0, btn.hoverDis, .2);
        btn.pressedDis += ease(btn.pressed ? .4 : 0, btn.pressedDis, .2);
        btn.disabledDis += ease(disabled ? .5 : 0, btn.disabledDis, .2);
        const scaleProg = btn.hoverDis + btn.pressedDis;
        push();
        translate(x, y);
        btn.hover = !disabled && pulsusPlus.modsHitbox("rcenter", matrix.get().x, matrix.get().y, w + w*.2*scaleProg, h + h*.2*scaleProg);
        rectMode(CENTER);
        scale(1 + scaleProg*.2)
        fill(lerpColor(lerpColor(theme.buttonDown, color(0,0,0), btn.disabledDis), theme.buttonUp, scaleProg));
        rect(0, 0, w, h, width/128 * scaleProg);
        textAlign(CENTER, CENTER);
        fill(lerpColor(theme.text, color(0,0,0), btn.disabledDis));
        textSize(width/48/12);
        textStyle(NORMAL);
        fitText(name, 0, 0, w/1.25, h/1.5);
        pop();
    }

    pulsusPlus.sMenu.modsS = ["noEffects", "noFail", "noRelease", "hidden", "instantFail", "flashlight", "auto", "mirror", "random"];

    pulsusPlus.resetMods = function() {
        for(i in game.mods) {
            if(i !== "offset" && !i.match(/(start|end)pos/gi)) {
                game.mods[i] = game.modsDef[i];
            }
        }
    };

    pulsusPlus.modMenu = function() {
        const vw = width / 48;
        push();
        translate(0, height * (pulsusPlus.sMenu.modsYDis - 1));
        rectMode(CORNER);
        colorMode(RGB);
        fill(0, 200);
        noStroke();
        rect(0, 0, width, height);
        textAlign(CENTER, TOP);
        textStyle(BOLD);
        fill(theme.text);
        textSize(width/24);
        text("Mods", width/2, height/32);
        translate(2*vw, height/6);
        fill(0, 175);
        rect(-vw, -vw, vw*13, vw*15.5, vw);
        rect((width/2)-vw*8 - 2*vw, -vw, vw*16, vw*3*3, vw);
        rect(width-vw*14 - 2*vw, -vw, vw*13, vw*3*3 + vw*3.5, vw);
        for(i in pulsusPlus.sMenu.modsS) {
            pulsusPlus.modButton(pulsusPlus.sMenu.modsS[i], vw*4*(i%3), vw*4*(Math.floor(i/3)));
        };
        translate(-vw/2, vw*12.5);
        textSize(vw);
        textStyle(NORMAL);
        fill(255);
        fitText(lang("mods_scoreMultiplier", langSel, calcScoreMulti(Object.fromEntries(Object.entries(game.mods).map(m => {if(m[0].match(/(start|end)pos/gi)) {return [m[0], 0]} else {return m}})))), vw*6, 0, vw*12, width/32);
        translate(-matrix.get().x + width/2, -matrix.get().y + height/6 + height * (pulsusPlus.sMenu.modsYDis - 1));
        pulsusPlus.modSlider("bpm", 0, 0, .5, 2, false, 0);
        pulsusPlus.modSlider("foresight", 0, vw*3, 2, .25, true, 1);
        pulsusPlus.modSlider("hitWindow", 0, vw*6, 2, .25, true, 2);
        translate(-matrix.get().x + width-vw*14, -matrix.get().y + height/6 + height * (pulsusPlus.sMenu.modsYDis - 1));
        pulsusPlus.modMenuButton(0, "Reset Mods", vw*11/2+vw, vw*3/2, vw*11, vw*3, pulsusPlus.resetMods);
        pulsusPlus.modMenuButton(1, "Practice Setup", vw*11/2+vw, vw*3.5 + vw*3/2, vw*11, vw*3, () => {
            pulsusPlus.sMenu.mods = false;
            pulsusPlus.sMenu.modsY = 0;
            if(typeof pulsusPlus.sMenu.lastSel === "object") {
                if(pulsusPlus.sMenu.lastSel.stars !== clevels[menu.lvl.sel].stars) {
                    pulsusPlus.sMenu.practiceSections = pulsusPlus.computeSections();
                }
            } else if(pulsusPlus.sMenu.lastSel !== clevels[menu.lvl.sel]) {
                pulsusPlus.sMenu.practiceSections = pulsusPlus.computeSections();
            }
            pulsusPlus.sMenu.lastSel = clevels[menu.lvl.sel];
            pulsusPlus.sMenu.practice = true;
            pulsusPlus.sMenu.practiceY = 1});
        pulsusPlus.modMenuButton(2, "Close", vw*11/2+vw, vw*7 + vw*3/2, vw*11, vw*3, () => {pulsusPlus.sMenu.mods = false; pulsusPlus.sMenu.modsY = 0; pulsusPlus.sMenu.lastSel = clevels[menu.lvl.sel]});

        if(pulsusPlus.sMenu.currToolTip !== null) {
            push();
            textSize(vw/2);
            translate(mouseX -matrix.get().x + vw/2, mouseY - matrix.get().y + vw/4 - (vw + textLeading()));
            rectMode(CORNER);
            colorMode(RGB);
            fill(0, 175);
            rect(0, -vw/4, textWidth(lang("mods_" + pulsusPlus.sMenu.currToolTip + "_sub", langSel)) + vw, vw + textLeading(), vw/4);
            textAlign(LEFT);
            fill(255);
            textStyle(NORMAL);
            text(`${lang("mods_" + pulsusPlus.sMenu.currToolTip, langSel)}\n${lang("mods_" + pulsusPlus.sMenu.currToolTip + "_sub", langSel)}`, vw/2, 0)
            pop();
        }
        pop();
    }

    pulsusPlus.renderExtraMenus = function() {
        pulsusPlus.sMenu.modsYDis += ease(pulsusPlus.sMenu.modsY, pulsusPlus.sMenu.modsYDis, .1);
        pulsusPlus.sMenu.practiceYDis += ease(pulsusPlus.sMenu.practiceY, pulsusPlus.sMenu.practiceYDis, .1);
        if(pulsusPlus.sMenu.modsYDis >= 1e-3) {
            pulsusPlus.modMenu();
        }
        if(pulsusPlus.sMenu.practiceYDis >= 1e-3) {
            pulsusPlus.practiceSetup();
        }
    };

    pulsusPlus.calculateScore = function(type, resultsScreen) {
        let score = 0;
        switch(type) {
            case "pulsus":
                return resultsScreen ? game.scoreFinal * calcScoreMulti(game.mods, true) : game.scoreDis;
            case "PSC":
                const marvs = game.hitStats[0];
                const greats = game.hitStats[1];
                const goods = game.hitStats[2];
                const oks = game.hitStats[3];
                const misses = game.hitStats[4];
                const offTimes = goods + oks;
    
                const calcAcc = (marvs + .975*greats + .5*goods + .1*oks)/game.beat.length;
                const inpScore = 1e6 * Math.pow(1 - (misses + .25*offTimes)/game.beat.length, .5*misses);
                const accScore = 1e6 * Math.pow(calcAcc, 3);
                score = .75*accScore + .25*inpScore;
                break;
            case "korean":
    
                break;
        };
        pulsusPlus.game.score += ease(score, pulsusPlus.game.score, .35);
        return pulsusPlus.game.score;
    }

    formatTime = function(timeMs, format) {
        const removeMillis = format === "min:sec"
        const time = timeMs/1000;
        let absTime = Math.abs(time);
        const min = Math.floor(absTime/60);
        const sec = (absTime%60 < 10 ? "0" : "") + (absTime%60).toFixed(3);
        return `${round(time, 6) < 0 ? "-" : ""}${min}:${removeMillis ? sec.replace(/\.(.{3})/, "") : sec}`;
    };

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
    Object.keys(langs).forEach(key => {
        langs[key]["edit_hint_keybinds_array"] = [];
    })

    // sounds
    lowLag.load(pulsusPlus.fromExtension("static/sound/scroll.wav"), "scroll");
    lowLag.load(pulsusPlus.fromExtension("static/sound/load.wav"), "load");
    lowLag.load(pulsusPlus.fromExtension("static/sound/retry.wav"), "retry");
    lowLag.load(pulsusPlus.fromExtension("static/sound/skip.wav"), "skip");
    lowLag.load(pulsusPlus.fromExtension("static/sound/shutter.mp3"), "shutter");

    // version check

    fetch(pulsusPlus.fromExtension("manifest.json"))
    .then(data => data.json())
    .then(response => {
        fetch("https://raw.githubusercontent.com/nullieee/PulsusPlus/refs/heads/master/manifest.json")
        .then(d => d.json())
        .then(r => {
            if(r.version !== response.version || pulsusPlus.dev) {
                pulsusPlus.updateNotice = true;
            };
        })
    })
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
    eval(`
        addSection = ${pulsusPlus.functionReplace(addSection, /offset:.*?\.timelineOffset/, "offset:pulsusPlus.convertTime(game.time*1e3)")
        }
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
            .replace(/"(objType|editMode|holdLength|clickMode|timelineSnap)"/g, `"$1", true`)
            .replace(/modsDef\[t\]/, "modsDef[t], game.mods.endPos = pulsusPlus.game.lvlDuration, pulsusPlus.sMenu.practiceStart = [1, 0], pulsusPlus.sMenu.practiceEnd = [1, pulsusPlus.game.lvlDuration]")
            .replace(/,(.{1,2})\.lvl\.showMods=!(.{1,2})\.lvl\.showMods/g, `,(() => {
                if(pulsusPlus.settings.mpMode) {
                    pulsusPlus.sMenu.mods = !pulsusPlus.sMenu.mods;
                    pulsusPlus.sMenu.modsY = pulsusPlus.sMenu.mods ? 1 : 0;
                } else {
                    menu.lvl.showMods = !menu.lvl.showMods; 
                }
            })()`)
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
            levels.saved[levels.saved.length - 1].bg = pulsusPlus.backgrounds[pulsusPlus.settings.defaultBg],
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
        cycleSnap = ${pulsusPlus.functionReplace(cycleSnap, "start", `
            if(e.search(/objType|editMode|holdLength|clickMode|timelineSnap/) !== -1 && override !== true) return;
            `, ["override"])
            .replace("=.25))", "= .25 : game.snap = .25); pulsusPlus.snap = game.snap;")
            .replace(/&&\((.{1,2})\.snap/, "? game.snap")
        };
        drawDifficultyCircle = ${pulsusPlus.functionReplace(drawDifficultyCircle, /\)\.draw\(/, `,gaySex).draw(`, ["gaySex"])};
        drawDiscord = ${pulsusPlus.functionReplace(drawDiscord, /modsDef\[d\]/, "modsDef[d] && !d.match(/pos/gi)")}
        drawProfile = ${pulsusPlus.functionReplace(drawProfile, /"id"\)\.special\)/g, `"id").special, newGrabUser(newGrabLevelMeta(clevels[t], "id").author, "uuid").user)`)}
        drawScreens = ${pulsusPlus.functionReplace(drawScreens, /"vsync"/s, `
            pulsusPlus.windowTheme = pulsusPlus.settings.themeSel === -1 ? pulsusPlus.themes[theme.lightTheme ? 1 : 0].values : pulsusPlus.themes[pulsusPlus.settings.themeSel].values;
            PulsusPlusWindow.allInstances.filter(instance => instance.states.visible).sort((a, b) => a.z - b.z).forEach(instance => instance.render())
            if(pulsusPlus.printer) {
                pulsusPlus.setPrinterOnFire();
            };
            const vmax = width > height ? width / 64 / 1.25 : height / 64 / 1.25;
            pulsusPlus.renderExtraMenus();
            if(pulsusPlus.printing !== false || Timeout.pending("printEnd")) {
                const vmax = width > height ? width / 64 / 1.25 : height / 64 / 1.25;
                push();
                drawingContext.globalAlpha = pulsusPlus.printing === false ? Timeout.remaining("printEnd")/250 : Math.min((millis() - pulsusPlus.printing)/250, 1)
                push();
                rectMode(CENTER);
                colorMode(RGB);
                stroke(255);
                strokeWeight(vmax/6);
                translate(vmax*4, height-vmax*4);
                rotate(22.5 + sin((millis()/1000/2)%1*90) * 360);
                fill(0, 125, 205);
                rect(0, 0, vmax*4);
                rotate(-22.5 + cos((millis()/1000/2)%1*90) * 360);
                fill(0, 175, 255);
                rect(0, 0, vmax*4);
                pop();
                push();
                textAlign(CENTER, BOTTOM);
                textSize(vmax*5);
                fill(255);
                noStroke();
                for(let i = 0; i<3; i++) {
                    text(".", vmax*4 + ((i-1) * textWidth(".")), height-vmax*3.75 + sin(i*30 + millis()/1000 * 360) * vmax*.5);
                }
                pop();
                pop();
            };
            pulsusPlus.masterVolumeDis += ease(pulsusPlus.settings.masterVolume, pulsusPlus.masterVolumeDis, .25)
            if(Timeout.pending("volFadeIn") || Timeout.pending("volRing")) {
                push();
                const fadingIn = Timeout.pending("volFadeIn");
                if(fadingIn) {
                    drawingContext.globalAlpha = (100 - Timeout.remaining("volFadeIn"))/100;
                };
                const fadingOut = Timeout.remaining("volRing") <= 150;
                if(fadingOut) {
                    drawingContext.globalAlpha = Timeout.remaining("volRing")/150
                };
                stroke(theme.buttonDown);
                strokeWeight(vmax * .75);
                colorMode(RGB);
                fill(0, 0, 0, 100);
                ellipseMode(CORNER);
                ellipse(width-vmax*9.5, height-vmax*9.5, vmax*8);
                stroke(theme.buttonUp);
                angleMode(DEGREES);
                noFill();
                arc(width-vmax*9.5, height-vmax*9.5, vmax*8, vmax*8, -90, Math.max(-89, (360*pulsusPlus.masterVolumeDis/100) - 90));
                textSize(vmax*1.5);
                textAlign(CENTER, CENTER);
                fill(theme.text);
                noStroke();
                text(round(pulsusPlus.settings.masterVolume) + "%", width-vmax*9.5 + vmax*4, height-vmax*9.5 + vmax*4);
                textSize(vmax);
                text("Master Volume", width-vmax*9.5 + vmax*4, height-vmax*9.5 - vmax*1.5);
                pop();
            };
            if(pulsusPlus.updateNotice && gameScreen === "click") {
                push();
                fill(255);
                noStroke();
                textSize(width/48);
                textStyle(BOLD);
                text("It seems you are running an outdated/pre-release version of PulsusPlus.\\ndo NOT report any bugs! We only take in bugs from the latest distribution build of the extension.", width/2, 9/16 * 2 * width/12/1.5);
                pop();
            }
            "vsync"
            `)
            .replace(/"game"!==.*?-a\),pop\(\)\),/, `
            gameScreen !== "game" && (
                colorMode(HSB),
                fill(255 * ((millis()/1000/10)%1), 102, 255),
                text(\`PulsusPlus \$\{pulsusPlus.version + (pulsusPlus.dev ? "-dev" : "")\}\`, a, height-a-(2*textLeading())),
                fill(theme.text),
                text(d + "\\nTetroGem 2025", a, height-a)
            ),pop()),
            `)
            .replace(`case"success"`, `case "warning": r = color(255, 175, 0);break;case "success"`)
            .replace(/\?\((.{1,2})\.loaded=!0/, "&& pulsusPlus.game.loaded ? (game.loaded = true")
        };
        getKey = ${pulsusPlus.functionReplace(getKey, "start", `if(e === "Enter") return "\\n";`)}
        getMods = ${pulsusPlus.functionReplace(getMods, /0!==e\.endPos/, "0!==e.endPos && pulsusPlus.game.lvlDuration !== e.endPos")};
        getScroll = ${pulsusPlus.functionReplace(getScroll, "start", `
            if(pulsusPlus.sMenu.mods || pulsusPlus.sMenu.practice || pulsusPlus.altKey || PulsusPlusWindow.allInstances.some(instance => instance.states.visible && hitbox(instance.z + "rcorner", instance.properties[0], instance.properties[1], instance.properties[2], instance.heightFixed/16 + Math.max(0, instance.menuHeight/1.25 - instance.heightFixed/32)) || instance.states.dragging || instance.menu.data.dropdownHitbox)) {
                return false;
            };
        `, ["mods"])};
        hitbox = ${pulsusPlus.functionReplace(hitbox, "start", `
            if(pulsusPlus.sMenu.mods || pulsusPlus.sMenu.practice || drawingContext.globalAlpha <= .05 || pulsusPlus.printer || PulsusPlusWindow.allInstances.some(instance => instance.states.dragging)) return false;
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
        pulsusPlus.modsHitbox = ${pulsusPlus.functionReplace(hitbox, "pulsusPlus.sMenu.mods", "false")};
        Howl.prototype.volume = ${pulsusPlus.functionReplace(Howl.prototype.volume, /(vol =|vol=)/, "vol = (pulsusPlus.settings.masterVolume/100) *")}
        loadLevel = ${pulsusPlus.functionReplace(loadLevel, "start", `
        `)
            .replace("lvl.loading=!0)", `lvl.loading=!0)
            pulsusPlus.game.loaded = false;
            pulsusPlus.sMenu.mods = false;
            pulsusPlus.sMenu.practice = false;
            if(Math.abs(getSelectedLevel().len - game.mods.endPos) < 1000) {
                game.mods.endPos = getSelectedLevel().len;
            }
            if(game.edit) {
                pulsusPlus.sMenu.practiceSelected = -1;
                pulsusPlus.sMenu.practiceStart = [1, 0];
                pulsusPlus.sMenu.practiceEnd = [1, pulsusPlus.game.lvlDuration];    
            } else if(pulsusPlus.sMenu.lastSel === clevels[menu.lvl.sel]) {
                game.mods.startPos = pulsusPlus.sMenu.practiceStart[0] === 1 ? pulsusPlus.sMenu.practiceStart[1] : pulsusPlus.sMenu.practiceSections[pulsusPlus.sMenu.practiceStart[1]].time;
                game.mods.endPos = pulsusPlus.sMenu.practiceEnd[0] === 1 ? pulsusPlus.sMenu.practiceEnd[1] : pulsusPlus.sMenu.practiceSections[pulsusPlus.sMenu.practiceEnd[1]].time;
            }
            pulsusPlus.game.kps = [];
            pulsusPlus.game.maxKps = 0;
            pulsusPlus.game.totKps = 0;
            pulsusPlus.resultsScreenAppeared = false;
            pulsusPlus.game.UR = 0;
            pulsusPlus.sMenu.practiceUsed = false;
            pulsusPlus.game.noteTimes = game.beat.map(beat => beat[1]).sort((a, b) => a - b);
            pulsusPlus.game.hwUnrounded = (clevels[menu.lvl.sel]?.local ? clevels[menu.lvl.sel].hw : (newGrabLevelMeta(clevels[menu.lvl.sel], "id").hw ?? newGrabLevelMeta(clevels[menu.lvl.sel], "id").ar)) * game.mods.hitWindow;
            pulsusPlus.game.hw = round(pulsusPlus.game.hwUnrounded, 2);
            pulsusPlus.game.hwMs = round((pulsusPlus.convertTime(game.hw) * 1e3) * game.hitValues[game.hitValues.length - 2].timing);
            pulsusPlus.game.barProgress = 0;
            pulsusPlus.game.breakProgress = 1;
            pulsusPlus.game.holding = 0;
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
            PulsusPlusWindow.allInstances.filter(instance => instance.states.visible && !instance.states.dragging).forEach((instance) => {
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
                if(Math.max(0, pulsusPlus.settings.retryTime) === 0) {
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
            if(game.beat.length !== 0 ? (game.beat[game.beat.length - 1][1] - game.time <= 0) : true) return;
            if(!lvlHowl[game.song].playing() && !game.paused && !game.edit && game.time - game.beat[0][1] < -pulsusPlus.convertTime(2, "pulsus")) {
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
            if(prevNoteEndTime !== prevNoteTime) {
                pulsusPlus.game.holding = prevNoteEndTime;
            }
            if((prevNoteEndTime >= game.time && !isStart)) {
                pulsusPlus.skip = false;
                pulsusPlus.skipAuto = false;
                return;
            };
            const breakProgress = (untilNext - 4)/(spacing - 4);
            pulsusPlus.game.breakProgress += pulsusPlus.forceEase(breakProgress, pulsusPlus.game.breakProgress, .1);
            let skippable, drawable, progStart, progEnd;
            if(isStart) {
                skippable = untilNext > 4 && (pulsusPlus.game.holding === 0 || game.time >= pulsusPlus.game.holding);
                drawable = untilNext > 3.5 && (pulsusPlus.game.holding === 0 || game.time >= pulsusPlus.game.holding);
                progStart = 1;
            } else {
                skippable = untilNext > 4 && spacing > 8 && (pulsusPlus.game.holding === 0 || game.time >= pulsusPlus.game.holding);
                drawable = untilNext > 3.5 && spacing > 8 && (pulsusPlus.game.holding === 0 || game.time >= pulsusPlus.game.holding);
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
            .replace(/\((.{1,2})\.scoreDis\)/, "(pulsusPlus.calculateScore(pulsusPlus.settings.scoreSystem))")
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
                            pulsusPlus.getStandardDeviation.toString(), JSON.stringify(game.sectionPerformance.filter(p => p[1] !== 4).map(p => pulsusPlus.convertTime(p[2] * pulsusPlus.game.hwUnrounded * 1e4 * game.mods.bpm)))
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
                    noStroke(),
                    fill(255),
                    push(),
                    textSize(width/64),
                    translate(0, textLeading() * -pulsusPlus.game.overlayStatsCount),
                    pulsusPlus.game.overlayStats[0] && (
                        textAlign(LEFT),
                        text("KPS", -width/512/2, -width/512/2),
                        textAlign(RIGHT),
                        text(pulsusPlus.game.kps.length, -width/512/2 + 3*width/32 + width/512, -width/512/2),
                        translate(0, textLeading())
                    ),
                    pulsusPlus.game.overlayStats[1] && (
                        textAlign(LEFT),
                        text("MAX", -width/512/2, -width/512/2),
                        textAlign(RIGHT),
                        text(pulsusPlus.game.maxKps, -width/512/2 + 3*width/32 + width/512, -width/512/2) ,
                        translate(0, textLeading())                   
                    ),
                    pulsusPlus.game.overlayStats[2] && (
                        textAlign(LEFT),
                        text("TOT", -width/512/2, -width/512/2),
                        textAlign(RIGHT),
                        text(pulsusPlus.game.totKps, -width/512/2 + 3*width/32 + width/512, -width/512/2)
                    ),
                    pop(),
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
                ? (Math.round(1000 * (pulsusPlus.convertTime(game.time - pulsusPlus.targetSection.time) * pulsusPlus.targetSection.bpm/60)) / 1000).toFixed(3) + " (" + pulsusPlus.targetSection.bpm + "BPM, " + round(pulsusPlus.convertTime(1e3 * pulsusPlus.targetSection.time)) + "ms + " + round(pulsusPlus.targetSection.offset) + "ms)"
                : game.timelineTickFor(game.time) + " (" + game.timelineBPM + ") (" + lang("milliseconds_short", langSel, game.timelineOffset) + ")")
                + "\\n" + formatTime(pulsusPlus.convertTime(game.time) * 1e3, "min:sec:ms")
            `)
            .replace(/0!==(.{1,2})\.mods\.endPos/, "pulsusPlus.game.lvlDuration !== game.mods.endPos")
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
                    pulsusPlus.getStandardDeviation.toString(), JSON.stringify(game.sectionPerformance.filter(p => p[1] !== 4).map(p => pulsusPlus.convertTime(p[2] * pulsusPlus.game.hwUnrounded * 1e4 * game.mods.bpm)))
                ).then(response => {
                    pulsusPlus.game.UR = round(response);
                }),
                pulsusPlus.game.ratio = (game.hitStats[0] > 0 || game.hitStats[1] > 0 ? (game.hitStats[0] >= game.hitStats[1] ? (game.hitStats[1] > 0 ? (round(game.hitStats[0] / game.hitStats[1], 2) + ":1") : "1:0") : (game.hitStats[0] > 0 ? ("1:" + round(game.hitStats[1] / game.hitStats[0], 2)) : "0:1")) : "0:0");
                pulsusPlus.game.lastCalc = millis();
                pulsusPlus.game.hitStatsSum = game.hitStats.reduce((p, a) => p + a, 0);
                pulsusPlus.resultsScreenAppeared = true;
                if(!game.failed) {
                    pulsusPlus.retryCount = 0;
                };
                pulsusPlus.game.kps = [];
                pulsusPlus.game.maxKps = 0;
                pulsusPlus.game.totKps = 0;
            }
            if(pulsusPlus.settings.fadeOnEnd) {
                lvlHowl[game.song].volume((lvlHowl[game.song].volume() + pulsusPlus.forceEase(0, lvlHowl[game.song].volume(), .025)) / (pulsusPlus.settings.masterVolume / 100));
            };
            `)
            .replace(/!(.{1,2})\.scoreSubmitted.*?scoreSubmitted=!0\),/, "")
            .replace(/\("loading",(.{1,2})\):"";text\((.*?)\*3\),/, `("loading", langSel):"";`)
            .replace("4),textStyle(NORMAL)", "4),textAlign(LEFT, TOP),textStyle(NORMAL)")
            .replace("mods))", "mods)) + `\\nM/G: ${pulsusPlus.game.ratio}, UR: ${pulsusPlus.game.UR} (${lang('PP_SCORING_' + pulsusPlus.settings.scoreSystem, langSel)})`")
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
            .replace(/game_score",(.*?)width/, `game_score", langSel, round(pulsusPlus.calculateScore(pulsusPlus.settings.scoreSystem, true))), width`)
        };
        musicManager.scanBeats = ${pulsusPlus.functionReplace(musicManager.scanBeats, /(?<!-)..\.hw/gi, "(!pulsusPlus.settings.noteFade && game.edit ? 0 : game.hw)")}
        musicManager.updateAll = ${pulsusPlus.functionReplace(musicManager.updateAll, /:(.{1,2})\.menu=\!(.{1,2})\.menu/, ":game.menu = (prmptingString.fade <= 1e-6 ? !game.menu : game.menu)")}
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
                    if(typeof lvlHowl[game.song] !== "undefined") {
                        if(round(menu.settings.musicVolume/100 * pulsusPlus.settings.masterVolume/100, 6) !== round(lvlHowl[game.song].volume(), 6)) {
                            lvlHowl[game.song].volume(menu.settings.musicVolume/100);
                        }
                    }
                };
            `)
            .replace(/timeEnd=.*?,/, `timeEnd = typeof lvlHowl[game.song] === "undefined" ? getLevelDuration() : pulsusPlus.convertTime(lvlHowl[game.song]._duration - game.songOffset/1000, "pulsus"),`)
        }
        musicManager.updateGameplay = ${pulsusPlus.functionReplace(musicManager.updateGameplay, "start", `
                if(pulsusPlus.settings.showOverlay) {
                    pulsusPlus.game.kps = pulsusPlus.game.kps.filter(t => millis()-1000 <= t);
                    if(pulsusPlus.game.kps.length > pulsusPlus.game.maxKps) {
                        pulsusPlus.game.maxKps = pulsusPlus.game.kps.length;
                    }
                    pulsusPlus.game.overlayStats = [pulsusPlus.settings.showOverlayKps, pulsusPlus.settings.showOverlayMax, pulsusPlus.settings.showOverlayTot];
                    pulsusPlus.game.overlayStatsCount = pulsusPlus.game.overlayStats.filter(x => x).length;
                }
            `)
            .replace(/noCursor\(\),/, `
                if(!(PulsusPlusWindow.allInstances.some(x => x.states.visible) || prmptingString.active || prmptingColor.active)) {noCursor()} else {cursor()};
                if(game.disMode === 1) {lvlHowl[game.song].volume(menu.settings.musicVolume/100 * (1 - pulsusPlus.retryProgress) * (Timeout.pending("skipStart") ? (200 + Timeout.remaining("skipStart"))/400 : 1) * (Timeout.pending("skipEnd") ? (400 - Timeout.remaining("skipEnd"))/400 : 1) )};
        `)};
        pauseAction = ${pulsusPlus.functionReplace(pauseAction, /case"retry"\:/, `case "retry": pulsusPlus.retryCount++; pulsusPlus.retryCountPos = 0; pulsusPlus.stopRetry = false;`)
            .replace(`case"menu":`, `case "menu":if(millis() - menuLoadDropdown.dropTime <= 500) return;`)
        };
        popupMessage = ${pulsusPlus.functionReplace(popupMessage, "start", `
            if(e.message.indexOf("PP_ERROR") !== -1 && e.type === "error" && pulsusPlus.settings.hideErrors) return;    
        `)};
        pressKey = ${pulsusPlus.functionReplace(pressKey, /\)&&\((.{1,2})\.keysPressed/, ") && (game.replay.on && pulsusPlus.game.kps.push(millis()), game.keysPressed")};
        prmptingStringUpdate = ${pulsusPlus.functionReplace(prmptingStringUpdate, "start", `
            if(pulsusPlus.prmptingString) {
                pulsusPlus.prmptingString = false;
                return;
            };    
        `).replace(/"\\n"===(.*?),1\)/, "continue")};
        promptRes = ${pulsusPlus.functionReplace(promptRes, "start", `
            if(prmptingString.check === "string") {
                if(pulsusPlus.shiftKey && e === "submit") {
                    prmptingStringUpdate(getKey("Enter"));
                    return;
                }
            }
            if(prmptingString.check === "number") {
                try {
                    const buff = math.evaluate(prmptingString.inp) ?? prmptingString.inp;
                    if(typeof buff !== "number") throw Error("invalid exp");
                    prmptingString.inp = buff.toString();
                } catch(error) {};
            };
        `)};
        promptString = ${pulsusPlus.functionReplace(promptString, "start", `
            pulsusPlus.prmptingString = true;
            Timeout.set(() => pulsusPlus.prmptingString = false, 100);    
        `)}
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
        quitEditor = ${pulsusPlus.functionReplace(quitEditor, "end", `;
            pulsusPlus.sMenu.practiceSections = pulsusPlus.computeSections();
            game.mods.startPos = 0;
            game.mods.endPos = pulsusPlus.game.lvlDuration;
            game.mods.hidden = false;
        `)}
        releaseKey = ${pulsusPlus.functionReplace(releaseKey, "start", `
            if(pulsusPlus.queuedPress[e]) {
                pulsusPlus.queuedPress[e] = false;
                return;
            };
        `)};
        saveGameData = ${pulsusPlus.functionReplace(saveGameData, "end", `
           localStorage.setItem("PulsusPlusSettings", JSON.stringify(pulsusPlus.settings));
           localStorage.setItem("PulsusPlusCustomThemes", JSON.stringify(pulsusPlus.themes));
        `)
            .replace(/localStorage\.setItem\("pulsusGammaNewLvl.*?\.saved\)\),/, `if(game.edit || gameScreen !== "game") {localStorage.setItem("pulsusGammaNewLvl", JSON.stringify(levels.saved))}`)
        };
        sideView = ${pulsusPlus.functionReplace(sideView, "start", ``)
            .replace(/"menu_song_copyID"/, `pulsusPlus.shiftKey ? "menu_lvl_new" : "menu_song_copyID"`)
            .replace(/"id"\)\.special\)/g, `"id").special, newGrabUser(newGrabLevelMeta(clevels[t], "id").author, "uuid").user)`)
            .replace(/,(.{1,2})\.lvl\.showMods\?(.{1,2})\.lvl\.modsX/, `,
            (pulsusPlus.sMenu.lvlSel !== clevels[menu.lvl.sel] || pulsusPlus.sMenu.tab !== menu.lvl.tab || pulsusPlus.game.lvlDuration === 0) && (() => {
                pulsusPlus.sMenu.lvlSel = clevels[menu.lvl.sel];
                pulsusPlus.sMenu.tab = menu.lvl.tab;
                const sel = clevels[menu.lvl.sel];
                const isLocal = typeof sel === "object";
                let duration = 0;
                if(isLocal) {
                    lvl = sel;
                    lvl.beat.sort((a, b) => (a[1] + (a[5] === 1 ? a[6] : 0)) - (b[1] + (b[5] === 1 ? b[6] : 0)));
                    duration = getLevelLength(lvl.beat, lvl.bpm);
                } else {
                    lvl = newGrabLevelMeta(sel, "id");
                    duration = lvl.len;
                };
                game.mods.startPos = 0;
                game.mods.endPos = duration;
                pulsusPlus.game.lvlDuration = duration;
                Object.keys(pulsusPlus.sMenu.practiceSliders).forEach(key => { pulsusPlus.sMenu.practiceSliders[key].max = duration });
                game.mods.endPos = duration;
                game.modsDef.endPos = duration;
            })(),
            Bt.lvl.showMods ? Bt.lvl.modsX`)
            .replace(/mods_scoreMultiplier",.*?\.mods\)/, `mods_scoreMultiplier", langSel, calcScoreMulti(Object.fromEntries(Object.entries(game.mods).map(m => {if(m[0].match(/(start|end)pos/gi)) {return [m[0], 0]} else {return m}})))`)
        };
        soundManager.setVolume = ${pulsusPlus.functionReplace(soundManager.setVolume, /setVolume\(/g, `setVolume((pulsusPlus.settings.masterVolume/100) *`)
            .replace(/_undefined/g, "undefined")
            .replace(/idCheck/g, "soundManager.getSoundById")
            .replace(/sm2/g, "soundManager")
        };
        transitionScreen = ${pulsusPlus.functionReplace(transitionScreen, "start", `pulsusPlus.levelLoaded = false; if(e === "menu") {pulsusPlus.retryCount = 0};`)}
    `);

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
                        else if(item[1].split(".")[item[1].split(".").length - 1] === "chart") type = "ch";
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
                            case "ch":
                                data[index][2] = "ch";
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
                case "ch":
                    if(!game.edit) break;
                    pulsusPlus.importCH([item]);
                    break;
            };
        })
    });

    window.addEventListener("blur", (e) => {
        pulsusPlus.retry = null;
        pulsusPlus.retryDown = false;
        pulsusPlus.skip = false;
        pulsusPlus.altKey = false;
        pulsusPlus.shiftKey = false;
    });
});