window.addEventListener("WindowClassMade", function() {

    // - Related variables - //
    // settings but not here bc otherwise it breaks other menus
    let resolutionOptions = [[screen.width, screen.height, true], [2560, 1440], [1920, 1080], [1366, 768], [1280, 720], [640, 360], [2048, 1536], [1152, 864], [1024, 768], [800, 600], [640, 480]]
        .filter(x => x[0] <= screen.width && x[1] <= screen.height);
    resolutionOptions.forEach(option => {
        langs["en"][`PP_MENU_MISC_RESOLUTION_LABEL_${option[0]}x${option[1]}` + (option[2] ? "-NATIVE" : "")] = `${option[0]}x${option[1]}` + (option[2] ? " (native)" : "");
    });
    let resolutionLabels = resolutionOptions.map(x => `PP_MENU_MISC_RESOLUTION_LABEL_${x[0]}x${x[1]}` + (x[2] ? "-NATIVE" : ""));
    resolutionOptions = resolutionOptions.map(x => x[2] ? "native" : `${x[0]}x${x[1]}`);
    pulsusPlus.copyLevel = function(lvl) {
        if(lvl.local) {
            const index = levels.saved.length;
            levels.saved.push(lvl);
            levels.saved[index].title = `Copy of ${levels.saved[index].title}`;
            popupMessage({
                type: "success",
                message: "menu_lvl_copied"
            });
            return;
        }
        const map = newGrabLevelMeta(lvl, "id");
        if(map.id === 0) {
            return popupMessage({
                type: "error",
                message: "PP_ERROR_COPY-MAP_NO-SELECT"
            })
        }
        if(map.beat === "Metadata") {
            return popupMessage({
                type: "error",
                message: "PP_ERROR_COPY-MAP_NO-DOWNLOAD",
                keys: [map.title]
            })
        }
        copyLevel(clevels[menu.lvl.sel]);
    };
    // - Related variables - //

    // - Settings menu - //
    pulsusPlus.menuNSM = new pulsusPlus.newPulsusPlusMenu([
    {
        title: "PP_MENU_MENU_HEADER",
        items: 
        [{
            type: "boolean",
            var: [pulsusPlus.settings, "hideErrors"],
            name: "PP_MENU_MENU_HIDE-ERRORS",
            hint: "PP_MENU_MENU_HIDE-ERRORS_HINT"
        }, {
            type: "boolean",
            var: [pulsusPlus.settings, "fadeOnEnd"],
            name: "PP_MENU_MENU_FADE-ON-END",
            hint: "PP_MENU_MENU_FADE-ON-END_HINT"
        }, {
            type: "slider",
            var: [pulsusPlus.settings, "retryTime"],
            name: "PP_MENU_MENU_RETRY-TIME",
            hint: "PP_MENU_MENU_RETRY-TIME_HINT",
            min: 0,
            max: 1000,
            step: 50,
            display: ()=>`${pulsusPlus.settings.retryTime}ms`
        }, {
            type: "boolean",
            var: [pulsusPlus.settings, "replaceSliders"],
            name: "PP_MENU_MENU_REPLACE-SLIDERS",
            hint: "PP_MENU_MENU_REPLACE-SLIDERS_HINT"
        }, {
            type: "slider",
            var: [pulsusPlus.settings, "sfxVolume"],
            name: "PP_MENU_MENU_SFX-VOLUME",
            hint: "PP_MENU_MENU_SFX-VOLUME_HINT",
            min: 0,
            max: 100,
            step: 1,
            display: ()=>lang("percentage", langSel, pulsusPlus.settings.sfxVolume.toFixed(0))
        }, {
            type: "boolean",
            var: [pulsusPlus.settings, "preferredFSEnabled"],
            name: "PP_MENU_MENU_ENABLE-PREFERRED-FS",
            hint: "PP_MENU_MENU_ENABLE-PREFERRED-FS_HINT"
        }, {
            type: "number",
            var: [pulsusPlus.settings, "preferredFS"],
            name: "PP_MENU_MENU_PREFERRED-FS",
            hint: "PP_MENU_MENU_PREFERRED-FS_HINT",
            min: 0.025,
            max: 10,
            smallChange: .05,
            bigChange: .1,
            display: () => {return `${Number(pulsusPlus.settings.preferredFS.toPrecision(6))}FS`}
        }, {
            type: "boolean",
            var: [pulsusPlus.settings, "preferredHWEnabled"],
            name: "PP_MENU_MENU_ENABLE-PREFERRED-HW",
            hint: "PP_MENU_MENU_ENABLE-PREFERRED-HW_HINT"
        }, {
            type: "number",
            var: [pulsusPlus.settings, "preferredHW"],
            name: "PP_MENU_MENU_PREFERRED-HW",
            hint: "PP_MENU_MENU_PREFERRED-HW_HINT",
            min: 0.025,
            max: 10,
            smallChange: .05,
            bigChange: .1,
            display: () => {return `${Number(pulsusPlus.settings.preferredHW.toPrecision(6))}HW`}
        }, {
            type: "button",
            name: "PP_MENU_MENU_COPY-MAP",
            hint: "PP_MENU_MENU_COPY-MAP_HINT",
            event: () => {
                pulsusPlus.copyLevel(clevels[menu.lvl.sel]);
            }
        }, {
            type: "dropdown",
            var: [pulsusPlus.settings, "gameplayFileMode"],
            name: "PP_FILE-MODE",
            hint: "PP_FILE-MODE_HINT",
            options: ["file", "clipboard"],
            labels: ["PP_FILE-MODE_FILE", "PP_FILE-MODE_CLIPBOARD"]
        }, {
            type: "button",
            name: "PP_MENU_MENU_SETTINGS_IMPORT",
            hint: "PP_MENU_MENU_SETTINGS_IMPORT_HINT",
            event: () => {
                switch(pulsusPlus.settings.gameplayFileMode) {
                    case "file":
                        settingsImport.click();
                        break;
                    case "clipboard":
                        navigator.clipboard.readText().then(data => pulsusPlus.importSettings(data));
                        break;
                };
            }
        }, {
            type: "button",
            name: "PP_MENU_MENU_SETTINGS_EXPORT",
            hint: "PP_MENU_MENU_SETTINGS_EXPORT_HINT",
            event: () => {
                switch(pulsusPlus.settings.gameplayFileMode) {
                    case "file":
                        pulsusPlus.downloadJSON(`settings.json`, Object.fromEntries(Object.entries(menu.settings).filter(x => x[1].constructor.toString().search(/\[native code\]/) !== -1)));
                        break;
                    case "clipboard":
                        navigator.clipboard.writeText(JSON.stringify(Object.fromEntries(Object.entries(menu.settings).filter(x => x[1].constructor.toString().search(/\[native code\]/) !== -1))));
                        break;
                }
                popupMessage({
                    type: "success",
                    message: "PP_SUCCESS_EXPORTED-SETTINGS"
                });
            }
        }]
    }, {
        title: "PP_MENU_THEME_HEADER",
        items: 
        [{
            type: "dropdown",
            var: [pulsusPlus.settings, "themeSel"],
            name: "PP_MENU_THEME_SELECT",
            hint: "PP_MENU_THEME_SELECT_HINT",
            options: [-1, ...pulsusPlus.themes.map(x => pulsusPlus.themes.indexOf(x))],
            labels: ["PP_MENU_THEME_SELECT_LABEL_USE-VANILLA", ...pulsusPlus.themes.map(x => `PP_MENU_THEME_SELECT_LABEL_${x.name}`)]
        }, {
            type: "string",
            var: [pulsusPlus, "themeName"],
            name: "PP_MENU_THEME_NAME",
            hint: "PP_MENU_THEME_NAME_HINT",
            allowEmpty: false,
            after: () => {
                let index = pulsusPlus.settings.themeSel;
                if(index <= -1) {
                    popupMessage({
                        type: "error",
                        message: "PP_ERROR_NON-ITERABLE-THEME"
                    });
                    return;
                };
                langs["en"][`PP_MENU_THEME_SELECT_LABEL_${pulsusPlus.themeName}`] = pulsusPlus.themeName;
                pulsusPlus.menu.menu.pages[1].items[0].labels[index+1] = `PP_MENU_THEME_SELECT_LABEL_${pulsusPlus.themeName}`;
                pulsusPlus.themes[index].name = pulsusPlus.themeName;
                pulsusPlus.themeName = "";
            }
        }, {
            type: "button",
            name: "PP_MENU_THEME_ADD",
            hint: "PP_MENU_THEME_ADD_HINT",
            event: () => {
                let targetTheme = {name: "New Theme", values: [{
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
                }, {
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
                }][theme.lightTheme ? 1 : 0]};
                pulsusPlus.themes.push(targetTheme);
                pulsusPlus.themes[pulsusPlus.themes.length-1].name = "New Theme";
                langs["en"][`PP_MENU_THEME_SELECT_NEW-THEME`] = "New Theme";
                pulsusPlus.menu.menu.pages[1].items[0].labels.push(`PP_MENU_THEME_SELECT_NEW-THEME`);
                pulsusPlus.menu.menu.pages[1].items[0].options.push(pulsusPlus.themes.length-1);
                popupMessage({
                    type: "success",
                    message: "PP_SUCCESS_ADDED-THEME"
                });
                pulsusPlus.settings.themeSel = pulsusPlus.themes.length-1;
                pulsusPlus.updateThemeState();
            }
        }, {
            type: "button",
            name: "PP_MENU_THEME_REMOVE",
            hint: "PP_MENU_THEME_REMOVE_HINT",
            event: () => {
                let index = pulsusPlus.settings.themeSel;
                if(index <= 1) {
                    popupMessage({
                        type: "error",
                        message: "PP_ERROR_JUST-NO"
                    });
                    return;
                };
                pulsusPlus.menu.menu.pages[1].items[0].options.splice(index+1, 1);
                pulsusPlus.menu.menu.pages[1].items[0].options = Array.from(Array(pulsusPlus.menu.menu.pages[1].items[0].options.length).keys()).map(x => x-1);
                pulsusPlus.menu.menu.pages[1].items[0].labels.splice(index+1, 1);
                pulsusPlus.themes.splice(index, 1);
                pulsusPlus.settings.themeSel = pulsusPlus.menu.menu.pages[1].items[0].options[index];
                popupMessage({
                    type: "success",
                    message: "PP_SUCCESS_REMOVED-THEME"
                });
                pulsusPlus.updateThemeState();
            }
        }, {
            type: "button",
            name: "PP_MENU_THEME_RESET",
            hint: "PP_MENU_THEME_RESET_HINT",
            event: () => {
                let index = pulsusPlus.settings.themeSel;
                if(index === -1) {
                    popupMessage({
                        type: "error",
                        message: "PP_ERROR_JUST-NO"
                    });
                    return;
                };
                pulsusPlus.themes[index].values = [{
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
                }, {
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
                }][theme.lightTheme ? 1 : 0];
                pulsusPlus.themeSelBuffer = -10;
                popupMessage({
                    type: "success",
                    message: "PP_SUCCESS_RESET-THEME"
                });
                pulsusPlus.updateThemeState();
            }
        }, {
            type: "divider",
            name: "_blank",
            hint: "_blank"
        }, {
            type: "button",
            name: "PP_MENU_THEME_EDITOR",
            hint: "PP_MENU_THEME_EDITOR_HINT",
            event: () => {
                pulsusPlus.customTheme.topbarAction("toggle");
                if(pulsusPlus.customTheme.states.visible) {
                    pulsusPlus.customTheme.z = 99;
                    PulsusPlusWindow.allInstances.sort((a,b) => a.z-b.z);
                    let newIndexes = [...Array(PulsusPlusWindow.allInstances.length).keys()].map(x => x+1);
                    PulsusPlusWindow.allInstances.map((e, i) => e.z = newIndexes[i]);
                }
            }
        }, {
            type: "dropdown",
            var: [pulsusPlus.settings, "themeFileMode"],
            name: "PP_FILE-MODE",
            hint: "PP_FILE-MODE_HINT",
            options: ["file", "clipboard"],
            labels: ["PP_FILE-MODE_FILE", "PP_FILE-MODE_CLIPBOARD"]
        }, {
            type: "button",
            name: "PP_MENU_THEME_IMPORT",
            hint: "PP_MENU_THEME_IMPORT_HINT",
            event: () => {
                switch(pulsusPlus.settings.themeFileMode) {
                    case "file":
                        themeImport.click();
                        break;
                    case "clipboard":
                        navigator.clipboard.readText().then(data => pulsusPlus.importTheme(data));
                        break;
                };
            }
        }, {
            type: "button",
            name: "PP_MENU_THEME_EXPORT",
            hint: "PP_MENU_THEME_EXPORT_HINT",
            event: () => {
                let index = pulsusPlus.settings.themeSel;
                if(index <= -1) {
                    popupMessage({
                        type: "error",
                        message: "PP_ERROR_NON-ITERABLE-THEME"
                    });
                    return;
                };
                switch(pulsusPlus.settings.themeFileMode) {
                    case "file":
                        pulsusPlus.downloadJSON(`${pulsusPlus.themes[index].name.replace(/ /, "_") || "theme"}.json`, pulsusPlus.themes[index]);
                        break;
                    case "clipboard":
                        navigator.clipboard.writeText(JSON.stringify(pulsusPlus.themes[index]));
                        break;
                }
                popupMessage({
                    type: "success",
                    message: "PP_SUCCESS_EXPORTED-THEME"
                });
            }
        }]
    }, {
        title: "PP_MENU_MISC_HEADER",
        items: [{
            type: "boolean",
            var: [pulsusPlus.settings, "skipWelcome"],
            name: "PP_MENU_MENU_SKIP-WELCOME",
            hint: "PP_MENU_MENU_SKIP-WELCOME_HINT"
        }, {
            type: "boolean",
            var: [pulsusPlus.settings, "wave"],
            name: "PP_MENU_MISC_WAVE",
            hint: "PP_MENU_MISC_WAVE_HINT"
        }, {
            type: "string",
            var: [pulsusPlus.settings, "welcomeText"],
            name: "PP_MENU_MISC_WELCOME-TEXT",
            hint: "PP_MENU_MISC_WELCOME-TEXT_HINT",
            allowEmpty: true,
            after: () => {
                pulsusPlus.settings.welcomeText = pulsusPlus.settings.welcomeText.trim() || "welcome";
            }
        }, {
            type: "boolean",
            var: [pulsusPlus.settings, "syncWelcome"],
            name: "PP_MENU_MISC_SYNC-WELCOME",
            hint: "PP_MENU_MISC_SYNC-WELCOME_HINT"
        }, {
            type: "string",
            var: [pulsusPlus.settings, "tabName"],
            name: "PP_MENU_MISC_TAB-NAME",
            hint: "PP_MENU_MISC_TAB-NAME_HINT",
            allowEmpty: true,
            after: () => {
                document.title = pulsusPlus.settings.tabName
            }
        }, {
            type: "file",
            var: [pulsusPlus.settings, "tabIcon"],
            name: "PP_MENU_MISC_TAB-ICON",
            hint: "PP_MENU_MISC_TAB-ICON_HINT",
            fileType: "image",
            sizeLimit: 32e3,
            success: (e) => {
                pulsusPlus.settings.tabIcon = e.data;
                document.querySelector("link[rel='icon']").href = pulsusPlus.settings.tabIcon;
            },
            reset: () => {
                pulsusPlus.settings.tabIcon = pulsusPlus.defaultSettings.tabIcon;
                document.querySelector("link[rel='icon']").href = pulsusPlus.settings.tabIcon;
            }
        }, {
            type: "slider",
            var: [pulsusPlus.settings, "windowOpacity"],
            name: "PP_MENU_MENU_WINDOW-OPACITY",
            hint: "PP_MENU_MENU_WINDOW-OPACITY_HINT",
            min: 0,
            max: 100,
            step: 1,
            display: ()=>`${pulsusPlus.settings.windowOpacity}%`
        }, {
            type: "divider",
            name: "_blank",
            hint: "_blank"
        }, {
            type: "dropdown",
            var: [pulsusPlus.settings, "resolution"],
            name: "PP_MENU_MISC_RESOLUTION",
            hint: "PP_MENU_MISC_RESOLUTION_HINT",
            options: ["noResize", ...resolutionOptions],
            labels: ["PP_MENU_MISC_RESOLUTION_LABEL_NO-RESIZE", ...resolutionLabels]
        }, {
            type: "number",
            var: [pulsusPlus.settings, "canvasX"],
            name: "PP_MENU_MISC_CANVAS-X",
            hint: "PP_MENU_MISC_CANVAS-X_HINT",
            min: -100,
            max: 100,
            smallChange: 1,
            bigChange: 10,
            display: () => {return `${pulsusPlus.settings.canvasX}%`}
        }, {
            type: "number",
            var: [pulsusPlus.settings, "canvasY"],
            name: "PP_MENU_MISC_CANVAS-Y",
            hint: "PP_MENU_MISC_CANVAS-Y_HINT",
            min: -100,
            max: 100,
            smallChange: 1,
            bigChange: 10,
            display: () => {return `${pulsusPlus.settings.canvasY}%`}
        }, {
            type: "string",
            var: [pulsusPlus.settings, "backgroundURL"],
            name: "PP_MENU_MISC_BACKGROUND-URL",
            hint: "PP_MENU_MISC_BACKGROUND-URL_HINT",
            allowEmpty: true,
            after: () => {
                pulsusPlus.bgLoading.style.opacity = 1;
                Timeout.set(() => {
                    document.body.style.backgroundImage = "none";
                    pulsusPlus.testImage(pulsusPlus.settings.backgroundURL)
                        .then(status => {
                            switch(status) {
                                case "success":
                                    document.body.style.backgroundImage = `url("${pulsusPlus.settings.backgroundURL}")`;
                                    break;
                                default:
                                    popupMessage({
                                        type: "error",
                                        message: `PP_ERROR_BACKGROUND-URL-${status.toUpperCase()}`
                                    });
                                    pulsusPlus.settings.backgroundURL = "";
                                    document.body.style.backgroundImage = "";
                                    break;
                            };
                            pulsusPlus.bgLoading.style.opacity = 0;
                        });
                }, 300)
                return;
            }
        }, {
            type: "boolean",
            var: [pulsusPlus.settings, "detailedCanvas"],
            name: "PP_MENU_MENU_DETAILED-CANVAS",
            hint: "PP_MENU_MENU_DETAILED-CANVAS_HINT"
        }]
    }
    ]);
    // - Settings menu - //

    // - Define x, y, width and height for the popup window - //
    let scales = [
        pulsusPlus.staticScales.horizontal[0],
        pulsusPlus.staticScales.horizontal[1]
    ];
    let xy = pulsusPlus.getLocal("PULSUSPLUS_WINDOW-POS_MENU", [width/2 - 16/9*width/8, height/2 - 9/16*width/6*1.25]);
    xy[0] = constrain(xy[0], 0, width-scales[0] * width/height);
    xy[1] = constrain(xy[1], 0, height-scales[1] * width/height);
    let properties = [
        ...xy,
        ...scales
    ];
    // - Define x, y, width and height for the popup window - //

    // The good stuff
    pulsusPlus.menu = new PulsusPlusWindow("MENU", ...properties, 3, pulsusPlus.menuNSM);
});