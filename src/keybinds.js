window.addEventListener("WindowClassMade", function() {

    // - Related variables - //
    pulsusPlus.savedKeybinds = pulsusPlus.getLocal("PulsusPlusKeybinds", {
        keybinds: { str: "Shift + Tab" },
        menu: { str: "Ctrl + 1" },
        customTheme: { str: "Ctrl + 2" },
        gameplay: { str: "Ctrl + 3" },
        editor: { str: "Ctrl + 4" },
        extras: { str: "Ctrl + 5" },

        retry: { str: "Tab" },
        skip: { str: "Space" }
    });
    Object.keys(pulsusPlus.savedKeybinds).forEach((bind) => pulsusPlus.savedKeybinds[bind].active = false);
    // - Related variables - //

    // - Settings menu - //
    pulsusPlus.keybindsNSM = new pulsusPlus.newPulsusPlusMenu([{
        title: "PP_KEYBINDS_MENU_HEADER",
        items: 
        [{
            type: "keybind",
            var: [pulsusPlus.savedKeybinds, "keybinds"],
            name: "PP_KEYBINDS_MENU_KEYBINDS",
            hint: "PP_KEYBINDS_MENU_KEYBINDS_HINT"
        }, {
            type: "keybind",
            var: [pulsusPlus.savedKeybinds, "menu"],
            name: "PP_KEYBINDS_MENU_MENU",
            hint: "PP_KEYBINDS_MENU_MENU_HINT"
        }, {
            type: "keybind",
            var: [pulsusPlus.savedKeybinds, "customTheme"],
            name: "PP_KEYBINDS_MENU_CUSTOM-THEME",
            hint: "PP_KEYBINDS_MENU_CUSTOM-THEME_HINT"
        }, {
            type: "keybind",
            var: [pulsusPlus.savedKeybinds, "gameplay"],
            name: "PP_KEYBINDS_MENU_GAMEPLAY",
            hint: "PP_KEYBINDS_MENU_GAMEPLAY_HINT"
        }, {
            type: "keybind",
            var: [pulsusPlus.savedKeybinds, "editor"],
            name: "PP_KEYBINDS_MENU_EDITOR",
            hint: "PP_KEYBINDS_MENU_EDITOR_HINT"
        }, {
            type: "keybind",
            var: [pulsusPlus.savedKeybinds, "extras"],
            name: "PP_KEYBINDS_MENU_EXTRAS",
            hint: "PP_KEYBINDS_MENU_EXTRAS_HINT"
        }, {
            type: "boolean",
            var: [pulsusPlus.settings, "cycleArrowKeys"],
            name: "PP_KEYBINDS_MENU_CYCLE-MENUS-ARROWS",
            hint: "PP_KEYBINDS_MENU_CYCLE-MENUS-ARROWS_HINT"
        }, {
            type: "boolean",
            var: [pulsusPlus.settings, "allowMultiple"],
            name: "PP_KEYBINDS_MENU_ALLOW-MULTIPLE",
            hint: "PP_KEYBINDS_MENU_ALLOW-MULTIPLE_HINT"
        }, {
            type: "boolean",
            var: [pulsusPlus.settings, "keybindFocus"],
            name: "PP_KEYBINDS_MENU_KEYBIND-FOCUS",
            hint: "PP_KEYBINDS_MENU_KEYBIND-FOCUS_HINT"
        }]
    }, {
        title: "PP_KEYBINDS_GAMEPLAY_HEADER",
        items: [{
            type: "keybind",
            var: [pulsusPlus.savedKeybinds, "retry"],
            name: "PP_KEYBINDS_GAMEPLAY_RETRY",
            hint: "PP_KEYBINDS_GAMEPLAY_RETRY_HINT"
        }, {
            type: "keybind",
            var: [pulsusPlus.savedKeybinds, "skip"],
            name: "PP_KEYBINDS_GAMEPLAY_SKIP",
            hint: "PP_KEYBINDS_GAMEPLAY_SKIP_HINT"
        }]
    }]);
    // - Settings menu - //

    // - Define x, y, width and height for the popup window - //
    let scales = [
        pulsusPlus.staticScales.vertical[0],
        pulsusPlus.staticScales.vertical[1]
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