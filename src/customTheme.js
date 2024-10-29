window.addEventListener("WindowClassMade", function() {

    // - Related variables - //
    // themes but it's in init
    // - Related variables - //

    // - Settings menu - //
    /*
        buttonDown: color(54,54,125,255),
        buttonText: color(255,255,255,255),
        buttonUp: color(101,99,191,255),
        checkmark: color(0,225,255,255),
        dropdown: color(33,33,104,255),
        keybindDown: color(24,24,95,255),
        keybindUp: color(71,69,161,255),
        lightTheme: false,
        main: color(33,33,43,255),
        modText: color(62,229,173,255),
        overlayShade: color(23,23,33,255),
        scrollbar: color(93,149,208,255),
        select: color(59,50,67,255),
        shade: color(23,23,33,255),
        text: color(255,255,255,255),
        textDown: color(150,150,150,255)
    */
    pulsusPlus.customThemeNSM = new pulsusPlus.newPulsusPlusMenu([{
        title: "PP_THEME_EDITOR_HEADER",
        items: []
    }, {
        title: "PP_THEME_BROWSER_HEADER",
        items: [{
            type: "string",
            var: [pulsusPlus, "themeSearch"],
            name: "PP_THEME_BROWSER_SEARCH",
            hint: "PP_THEME_BROWSER_SEARCH_HINT",
            allowEmpty: true
        }, {
            type: "dropdown",
            var: [pulsusPlus, "themeSearchFor"],
            name: "PP_THEME_BROWSER_SEARCH-FOR",
            hint: "PP_THEME_BROWSER_SEARCH-FOR_HINT",
            labels: ["PP_THEME_BROWSER_SEARCH-FOR_LABEL_NAME", "PP_THEME_BROWSER_SEARCH-FOR_LABEL_AUTHOR"],
            options: ["name", "author"]
        }, {
            type: "dropdown",
            var: [pulsusPlus, "themeSort"],
            name: "PP_THEME_BROWSER_SORT",
            hint: "PP_THEME_BROWSER_SORT_HINT",
            labels: ["PP_THEME_BROWSER_SORT_LABEL_NAME-ASC", "PP_THEME_BROWSER_SORT_LABEL_NAME-DESC", "PP_THEME_BROWSER_SORT_LABEL_AUTHOR-ASC", "PP_THEME_BROWSER_SORT_LABEL_AUTHOR-DESC"],
            options: ["name_asc", "name_desc", "author_asc", "author_desc"]
        }, {
            type: "button",
            name: "PP_THEME_BROWSER_APPLY",
            hint: "PP_THEME_BROWSER_APPLY_HINT",
            event: () => {pulsusPlus.updateThemesPage()}
        }, {
            type: "divider",
            name: "_blank",
            hint: "_blank"
        }]
    }]);
    Object.entries(pulsusPlus.bufferTheme).forEach(entry => {
        if(typeof entry[1] === "boolean") {
            pulsusPlus.customThemeNSM.pages[0].items.push({
                type: "boolean",
                var: [pulsusPlus.bufferTheme, entry[0]],
                name: "PP_THEME_EDITOR_" + entry[0].toUpperCase(),
                hint: "PP_THEME_EDITOR_" + entry[0].toUpperCase() + "_HINT"
            });
            return;
        };
        pulsusPlus.customThemeNSM.pages[0].items.push({
            type: "color",
            name: "PP_THEME_EDITOR_" + entry[0].toUpperCase(),
            hint: "PP_THEME_EDITOR_" + entry[0].toUpperCase() + "_HINT",
            mode: HSB,
            multiple: false,
            hue: [pulsusPlus.bufferTheme[entry[0]], "0"],
            saturation: [pulsusPlus.bufferTheme[entry[0]], "1"],
            brightness: [pulsusPlus.bufferTheme[entry[0]], "2"]
        })
    });
    // - Settings menu - //

    // - Define x, y, width and height for the popup window - //
    let scales = [
        pulsusPlus.staticScales.horizontal[0],
        pulsusPlus.staticScales.horizontal[1]
    ];
    let xy = pulsusPlus.getLocal("PULSUSPLUS_WINDOW-POS_THEME", [width/2 - 16/9*width/8, height/2 - 9/16*width/6*1.25]);
    xy[0] = constrain(xy[0], 0, width-scales[0] * width/height);
    xy[1] = constrain(xy[1], 0, height-scales[1] * width/height);
    let properties = [
        ...xy,
        ...scales
    ];
    // - Define x, y, width and height for the popup window - //

    // The good stuff
    pulsusPlus.customTheme = new PulsusPlusWindow("THEME", ...properties, 2, pulsusPlus.customThemeNSM);
    eval(`
        adjustCanvas = ${pulsusPlus.functionReplace(adjustCanvas, /.=..\[..\.settings\.themeSel\]/, `
            theme = pulsusPlus.settings.themeSel === -1 ? themes[menu.settings.themeSel] : pulsusPlus.themes[pulsusPlus.settings.themeSel].values;
            if(pulsusPlus.settings.themeSel !== pulsusPlus.themeSelBuffer) {
                push();
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
                pulsusPlus.customTheme.menu.pages[0].items = [];
                Object.entries(pulsusPlus.bufferTheme).forEach(entry => {
                    if(typeof entry[1] === "boolean") {
                        pulsusPlus.customTheme.menu.pages[0].items.push({
                            type: "boolean",
                            var: [pulsusPlus.bufferTheme, entry[0]],
                            name: "PP_THEME_EDITOR_" + entry[0].toUpperCase(),
                            hint: "PP_THEME_EDITOR_" + entry[0].toUpperCase() + "_HINT"
                        });
                        return;
                    };
                    pulsusPlus.customTheme.menu.pages[0].items.push({
                        type: "color",
                        name: "PP_THEME_EDITOR_" + entry[0].toUpperCase(),
                        hint: "PP_THEME_EDITOR_" + entry[0].toUpperCase() + "_HINT",
                        mode: HSB,
                        multiple: false,
                        hue: [pulsusPlus.bufferTheme[entry[0]], "0"],
                        saturation: [pulsusPlus.bufferTheme[entry[0]], "1"],
                        brightness: [pulsusPlus.bufferTheme[entry[0]], "2"]
                    })
                });
                pulsusPlus.themeSelBuffer = pulsusPlus.settings.themeSel;
                pop();
            } else {
                push();
                Object.entries(pulsusPlus.bufferTheme).forEach(entry => {
                    if(typeof entry[1] !== "object") {
                        pulsusPlus.themes[Math.max(0, pulsusPlus.settings.themeSel)].values[entry[0]] = entry[1];
                        return;
                    }
                    colorMode(HSB);
                    const eColor = color(...entry[1]);
                    colorMode(RGB);
                    pulsusPlus.themes[Math.max(0, pulsusPlus.settings.themeSel)].values[entry[0]] = color(red(eColor), green(eColor), blue(eColor));
                    pulsusPlus.updateThemeState();
                });
                pop();
            };
        `)};
    `);
});