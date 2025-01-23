window.addEventListener("WindowClassMade", function() {

    // - Related variables - //
    pulsusPlus.savedKeybinds = pulsusPlus.getLocal("PulsusPlusKeybinds", {
        keybinds: { str: "Shift + Tab" },
        menu: { str: "Ctrl + 1" },
        customTheme: { str: "Ctrl + 2" },
        gameplay: { str: "Ctrl + 3" },
        editor: { str: "Ctrl + 4" },
        extras: { str: "Ctrl + 5" },

        randomMap: { str: "F2" },
        scrollUp: { str: "ArrowUp" },
        scrollDown: { str: "ArrowDown" },
        playLvl: { str: "Enter" },
        editLvl: { str: "Ctrl + Enter" },
        openMods: { str: "F1" },
        openLeaderboard: { str: "F3" },
        openPractice: { str: "F4" },
        bookmarkLevel: { str: "Ctrl + B" },
        copyLevel: { str: "Ctrl + C" },
        exportLevel: { str: "Ctrl + E" },

        openSettings: { str: "Ctrl + O" },
        openSideMenu: { str: "Tab" },
        switchLvlTab: { str: "Alt + Q" },
        switchAwarded: { str: "Alt + W" },
        switchSort: { str: "Alt + A" },
        switchQuery: { str: "Alt + S" },
        createLevel: { str: "Alt + P" },
        search: { str: "Shift + Space" },
        clearSearch: { str: "Ctrl + Backspace" },
        importLevel: { str: "Ctrl + I" },

        continue: { str: "Enter" },
        retry: { str: "Tab" },
        quit: { str: "Shift" },
        skip: { str: "Space" },

        jumpFirst: { str: "Z" },
        jumpLast: { str: "V" },
        addBookmark: { str: "Ctrl + B" },
        previousBookmark: { str: "ArrowDown" },
        nextBookmark: { str: "ArrowUp" },
        objType: { str: "Q" },
        editMode: { str: "E" },
        holdLength: { str: "R" },
        clickMode: { str: "F" },
        timelineSnap: { str: "S" },
        reverseSnap: { str: "Shift + S" },
        selectAll: { str: "Ctrl + A" },
        deselectAll: { str: "Tab" },
        deleteSelected: { str: "Delete" },
        setPlacecol: { str: "X" },
        takePlacecol: { str: "Shift + X" },
        setSelectioncol: { str: "C" },
        applySelectioncol: { str: "Shift + C" },
        rotateClockwise: { str: "Ctrl + ." },
        rotateCounter: { str: "Ctrl + ," },
        flipHorizontal: { str: "Ctrl + H" },
        flipVertical: { str: "Ctrl + J" },
        noteFade: { str: "Alt + O" },
        toggleHidden: { str: "Alt + I" },

        printScreen: { str: "F12" },
        toggleDebug: { str: "Alt + L" },
    });
    pulsusPlus.keybindsType = {
        keybinds: "window",
        menu: "window",
        customTheme: "window",
        gameplay: "window",
        editor: "window",
        extras: "window",

        randomMap: "lvl",
        scrollUp: "lvl",
        scrollDown: "lvl",
        playLvl: "lvl",
        editLvl: "lvl",
        openMods: "menu",
        openLeaderboard: "lvl",
        openPractice: "menugame",
        bookmarkLevel: "lvl",
        copyLevel: "lvl",
        exportLevel: "lvl",

        openSettings: "menu",
        openSideMenu: "menu",
        switchLvlTab: "menu",
        switchAwarded: "menu",
        switchSort: "menu",
        switchQuery: "menu",
        createLevel: "menu",
        search: "menu",
        clearSearch: "menu",
        importLevel: "menu",

        retry: "game",
        skip: "game",
        continue: "game",
        quit: "game",

        noteFade: "editor",
        toggleHidden: "editor",
        addBookmark: "editor",
        nextBookmark: "editor",
        previousBookmark: "editor",
        jumpFirst: "editor",
        jumpLast: "editor",
        objType: "editor",
        editMode: "editor",
        holdLength: "editor",
        clickMode: "editor",
        selectAll: "editor",
        deselectAll: "editor",
        deleteSelected: "editor",
        setPlacecol: "editor",
        takePlacecol: "editor",
        setSelectioncol: "editor",
        applySelectioncol: "editor",
        rotateClockwise: "editor",
        rotateCounter: "editor",
        flipHorizontal: "editor",
        flipVertical: "editor",
        timelineSnap: "editor",
        reverseSnap: "editor",

        printScreen: "all",
        toggleDebug: "all"
    }
    Object.keys(pulsusPlus.savedKeybinds).forEach((bind) => pulsusPlus.savedKeybinds[bind].active = false);

    const langNames = {};
    Object.keys(pulsusPlus.savedKeybinds).forEach(x => langNames[x] = x.replace(/([a-z])([A-Z])/, "$1-$2").toUpperCase());
    // - Related variables - //

    function keybindNSMButton(name, window) {
        if(name === "divider") {
            return {
                type: "divider",
                name: "_blank",
                hint: "_blank"
            }
        } else if(typeof name === "object") {
            if(name[1] === "checkmark") {
                return {
                    type: "boolean",
                    var: [pulsusPlus.settings, name[0]],
                    name: `PP_KEYBINDS_${window}_${name[0].replace(/([a-z])([A-Z])/, "$1-$2").toUpperCase()}`,
                    hint: `PP_KEYBINDS_${window}_${name[0].replace(/([a-z])([A-Z])/, "$1-$2").toUpperCase()}_HINT`
                }
            }
            return {
                type: "info",
                var: [pulsusPlus, "dump"],
                name: `PP_KEYBINDS_${window}_${name[0].replace(/([a-z])([A-Z])/, "$1-$2").toUpperCase()}`,
                hint: `PP_KEYBINDS_${window}_${name[0].replace(/([a-z])([A-Z])/, "$1-$2").toUpperCase()}_HINT`,
                display: function() {
                    return name[1] ?? "bwaa";
                }
            }
        } else {
            return {
                type: "keybind",
                var: [pulsusPlus.savedKeybinds, name],
                name: `PP_KEYBINDS_${window}_${langNames[name]}`,
                hint: `PP_KEYBINDS_${window}_${langNames[name]}_HINT`
            };
        }
    }

    // - Settings menu - //
    pulsusPlus.keybindsNSM = new pulsusPlus.newPulsusPlusMenu([{
        title: "PP_KEYBINDS_POPUP_HEADER",
        items: [...[
            "keybinds",
            "menu",
            "customTheme",
            "gameplay",
            "editor",
            "extras"
        ].map(k => keybindNSMButton(k, "POPUP")), /*{
            type: "boolean",
            var: [pulsusPlus.settings, "cycleArrowKeys"],
            name: "PP_KEYBINDS_POPUP_CYCLE-MENUS-ARROWS",
            hint: "PP_KEYBINDS_POPUP_CYCLE-MENUS-ARROWS_HINT"
        },*/ {
            type: "boolean",
            var: [pulsusPlus.settings, "allowMultiple"],
            name: "PP_KEYBINDS_POPUP_ALLOW-MULTIPLE",
            hint: "PP_KEYBINDS_POPUP_ALLOW-MULTIPLE_HINT"
        }, {
            type: "boolean",
            var: [pulsusPlus.settings, "keybindFocus"],
            name: "PP_KEYBINDS_POPUP_KEYBIND-FOCUS",
            hint: "PP_KEYBINDS_POPUP_KEYBIND-FOCUS_HINT"
        }]
    }, {
        title: "PP_KEYBINDS_MENU_HEADER",
        items: [...[
            "playLvl",
            "editLvl",
            "bookmarkLevel",
            "copyLevel",
            "importLevel",
            "exportLevel",
            "scrollUp",
            "scrollDown",
            "randomMap",
            "openLeaderboard",
            ["mpMode", "checkmark"],
            "openMods",
            "openPractice",
    
            "divider",
    
            "createLevel",
            "openSettings",
            "openSideMenu",

            "divider",

            "search",
            "clearSearch",
            "switchLvlTab",
            "switchAwarded",
            "switchSort",
            "switchQuery",
            ].map(k => keybindNSMButton(k, "MENU"))]
    }, {
        title: "PP_KEYBINDS_GAMEPLAY_HEADER",
        items: [...[
            "continue",
            "retry",
            "quit",
            "skip"
        ].map(k => keybindNSMButton(k, "GAMEPLAY"))]
    }, {
        title: "PP_KEYBINDS_EDITOR_HEADER",
        items: [...[
            ["scrollTimelinesmall", "A/D/Scroll"],
            ["scrollTimelinebig", "Shift + A/D/Scroll"],
            "jumpFirst",
            "jumpLast",
            "addBookmark",
            "previousBookmark",
            "nextBookmark",

            "divider",

            "objType",
            "editMode",
            "holdLength",
            "clickMode",
            "timelineSnap",
            "reverseSnap",

            "divider",

            "selectAll",
            "deselectAll",
            "deleteSelected",
            "setPlacecol",
            "takePlacecol",
            "setSelectioncol",
            "applySelectioncol",
            "rotateClockwise",
            "rotateCounter",
            "flipHorizontal",
            "flipVertical",
            ["moveSelectionsmall", "J/K"],
            ["moveSelectionbig", "Shift + J/K"],

            "divider",
            
            ["playbackSpeedbig", "Ctrl + Up/Down"],
            ["playbackSpeedsmall", "Ctrl + Shift + Up/Down"],
            "noteFade",
            "toggleHidden"
        ].map(k => keybindNSMButton(k, "EDITOR"))]
    }, {
        title: "PP_KEYBINDS_MISC_HEADER",
        items: [...[
            ["masterVolbig", "Alt + Up/Down/Scroll"],
            ["masterVolsmall", "Alt + Shift + Up/Down/Scroll"],
            "printScreen",
            "toggleDebug"
        ].map(k => keybindNSMButton(k, "MISC"))]
    }]);
    // - Settings menu - //

    // - Define x, y, width and height for the popup window - //
    let scales = [
        pulsusPlus.staticScales.horizontal[0],
        pulsusPlus.staticScales.horizontal[1]
    ];
    let xy = pulsusPlus.getLocal("PULSUSPLUS_WINDOW-POS_KEYBINDS", [width/2 - 16/9*width/8, height/2 - 9/16*width/6*1.25]);
    xy[0] = constrain(xy[0], 0, width-scales[0] * width/height);
    xy[1] = constrain(xy[1], 0, height-scales[1] * width/height);
    let properties = [
        ...xy,
        ...scales
    ];
    // - Define x, y, width and height for the popup window - //

    // The good stuff
    pulsusPlus.keybinds = new PulsusPlusWindow("KEYBINDS", ...properties, 1, pulsusPlus.keybindsNSM);
});