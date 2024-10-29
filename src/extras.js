window.addEventListener("WindowClassMade", function() {

    // - Related variables - //
    // themes but it's in init
    // - Related variables - //

    // - Settings menu - //
    pulsusPlus.extrasNSM = new pulsusPlus.newPulsusPlusMenu([{
        title: "PP_EXTRAS_MENU_HEADER",
        items: [{
            type: "boolean",
            var: [pulsusPlus.settings, "gaySex"],
            name: "PP_EXTRAS_MENU_GAY-SEX",
            hint: "PP_EXTRAS_MENU_GAY-SEX_HINT"
        }]
    }
    ]);
    // - Settings menu - //

    // - Define x, y, width and height for the popup window - //
    let scales = [
        pulsusPlus.staticScales.vertical[0],
        pulsusPlus.staticScales.vertical[1]
    ];
    let xy = pulsusPlus.getLocal("PULSUSPLUS_WINDOW-POS_EXTRAS", [width/2 - 16/9*width/8, height/2 - 9/16*width/6*1.25]);
    xy[0] = constrain(xy[0], 0, width-scales[0] * width/height);
    xy[1] = constrain(xy[1], 0, height-scales[1] * width/height);
    let properties = [
        ...xy,
        ...scales
    ];
    // - Define x, y, width and height for the popup window - //

    // The good stuff
    pulsusPlus.extras = new PulsusPlusWindow("EXTRAS", ...properties, 2, pulsusPlus.extrasNSM);
});