window.addEventListener("WindowClassMade", function() {

    // - Related variables - //

    // - Related variables - //

    // - Settings menu - //
    pulsusPlus.gameplayNSM = new pulsusPlus.newPulsusPlusMenu([
    {
        title: "PP_GAMEPLAY_GENERAL_HEADER",
        items: 
        [{
            type: "slider",
            var: [menu.settings, "bgDim"],
            name: "settings_backgroundDim",
            hint: "settings_backgroundDim_sub",
            min: 0,
            max: 100,
            step: 1,
            display: ()=>lang("percentage", langSel, menu.settings.bgDim.toFixed(0))
        }, {
            type: "slider",
            var: [pulsusPlus.settings, "masterVolume"],
            name: "PP_GAMEPLAY_GENERAL_MASTER-VOLUME",
            hint: "PP_GAMEPLAY_GENERAL_MASTER-VOLUME_HINT",
            min: 0,
            max: 100,
            step: 1,
            display: ()=>{
                if(pulsusPlus.masterVolumeBuffer !== pulsusPlus.settings.masterVolume) {
                    lvlHowl.filter(h => typeof h === "object").forEach(h => h.volume(h.volume()));
                    pulsusPlus.masterVolumeBuffer = pulsusPlus.settings.masterVolume;
                };
                return lang("percentage", langSel, pulsusPlus.settings.masterVolume.toFixed(0))
            }
        }, {
            type: "slider",
            var: [menu.settings, "musicVolume"],
            name: "settings_musicVolume",
            hint: "settings_musicVolume_sub",
            min: 0,
            max: 100,
            step: 1,
            display: ()=> {
                if(game.edit && typeof lvlHowl[game.song] !== "undefined") {
                    if(lvlHowl[game.song].volume() !== menu.settings.musicVolume/100) lvlHowl[game.song].volume(menu.settings.musicVolume/100)
                }
                return lang("percentage", langSel, menu.settings.musicVolume.toFixed(0));
            }
        }, {
            type: "string",
            var: [pulsusPlus.settings, "hitsound"],
            name: "PP_GAMEPLAY_GENERAL_HITSOUND",
            hint: "PP_GAMEPLAY_GENERAL_HITSOUND_HINT",
            allowEmpty: true,
            display: () => pulsusPlus.settings.hitsound.search(/data:audio\/.*base64,/) !== -1 ? "[Base64 Audio]" : pulsusPlus.settings.hitsound,
            after: () => {
                pulsusPlus.testAudio(pulsusPlus.settings.hitsound)
                    .then(status => {
                        switch (status) {
                            case "success":
                                lowLag.load(pulsusPlus.settings.hitsound, "hitsound");
                                break;
                            default:
                                lowLag.load("/client/resources/sound/hitsound02.mp3", "hitsound")
                                if(pulsusPlus.settings.hitsound === "") {
                                    popupMessage({
                                        type: "success",
                                        message: `PP_SUCCESS_AUDIO-RESET`,
                                        keys: ["hitsound"]
                                    });
                                } else {
                                    popupMessage({
                                        type: "error",
                                        message: `PP_ERROR_AUDIO-${status.toUpperCase()}`,
                                        keys: ["hitsound"]
                                    });
                                };
                                pulsusPlus.settings.hitsound = "";
                                break;
                        };
                    });
                return;
            }
        }, {
            type: "slider",
            var: [menu.settings, "hitsoundVolume"],
            name: "settings_hitsoundVolume",
            hint: "settings_hitsoundVolume_sub",
            min: 0,
            max: 100,
            step: 1,
            display: ()=>lang("percentage", langSel, menu.settings.hitsoundVolume.toFixed(0))
        }, {
            type: "string",
            var: [pulsusPlus.settings, "holdRelease"],
            name: "PP_GAMEPLAY_GENERAL_HOLDRELEASE",
            hint: "PP_GAMEPLAY_GENERAL_HOLDRELEASE_HINT",
            allowEmpty: true,
            display: () => pulsusPlus.settings.holdRelease.search(/data:audio\/.*base64,/) !== -1 ? "[Base64 Audio]" : pulsusPlus.settings.holdRelease,
            after: () => {
                pulsusPlus.testAudio(pulsusPlus.settings.holdRelease)
                    .then(status => {
                        switch (status) {
                            case "success":
                                lowLag.load(pulsusPlus.settings.holdRelease, "holdRelease");
                                break;
                            default:
                                lowLag.load("/client/resources/sound/holdRelease.mp3", "holdRelease")
                                if(pulsusPlus.settings.holdRelease === "") {
                                    popupMessage({
                                        type: "success",
                                        message: `PP_SUCCESS_AUDIO-RESET`,
                                        keys: ["holdRelease"]
                                    });
                                } else {
                                    popupMessage({
                                        type: "error",
                                        message: `PP_ERROR_AUDIO-${status.toUpperCase()}`,
                                        keys: ["holdRelease"]
                                    });
                                };
                                pulsusPlus.settings.holdRelease = "";
                                break;
                        };
                    });
                return;
            }
        }, {
            type: "slider",
            var: [pulsusPlus.settings, "holdReleaseVolume"],
            name: "PP_GAMEPLAY_GENERAL_HOLDRELEASE-VOLUME",
            hint: "PP_GAMEPLAY_GENERAL_HOLDRELEASE-VOLUME_HINT",
            min: 0,
            max: 100,
            step: 1,
            display: ()=>lang("percentage", langSel, pulsusPlus.settings.holdReleaseVolume.toFixed(0))
        }, {
            type: "string",
            var: [pulsusPlus.settings, "comboBreak"],
            name: "PP_GAMEPLAY_GENERAL_COMBOBREAK",
            hint: "PP_GAMEPLAY_GENERAL_COMBOBREAK_HINT",
            allowEmpty: true,
            display: () => pulsusPlus.settings.comboBreak.search(/data:audio\/.*base64,/) !== -1 ? "[Base64 Audio]" : pulsusPlus.settings.comboBreak,
            after: () => {
                pulsusPlus.testAudio(pulsusPlus.settings.comboBreak)
                    .then(status => {
                        switch (status) {
                            case "success":
                                lowLag.load(pulsusPlus.settings.comboBreak, "comboBreak");
                                break;
                            default:
                                lowLag.load("/client/resources/sound/comboBreak.mp3", "comboBreak")
                                if(pulsusPlus.settings.comboBreak === "") {
                                    popupMessage({
                                        type: "success",
                                        message: `PP_SUCCESS_AUDIO-RESET`,
                                        keys: ["comboBreak"]
                                    });
                                } else {
                                    popupMessage({
                                        type: "error",
                                        message: `PP_ERROR_AUDIO-${status.toUpperCase()}`,
                                        keys: ["comboBreak"]
                                    });
                                };
                                pulsusPlus.settings.comboBreak = "";
                                break;
                        };
                    });
                return;
            }
        }, {
            type: "slider",
            var: [menu.settings, "comboBreakVolume"],
            name: "settings_comboBreakVolume",
            hint: "settings_comboBreakVolume_sub",
            min: 0,
            max: 100,
            step: 1,
            display: ()=>lang("percentage", langSel, menu.settings.comboBreakVolume.toFixed(0))
        }, {
            type: "boolean",
            var: [pulsusPlus.settings, "fixDC"],
            name: "PP_GAMEPLAY_GENERAL_FIX-DC",
            hint: "PP_GAMEPLAY_GENERAL_FIX-DC_HINT"
        }]
    }, {
        title: "settings_header_notes",
        items: [{
            type: "slider",
            name: "settings_beatThickness",
            var: [menu.settings, "beatThickness"],
            min: 0.5,
            max: 10,
            step: .1,
            hint: "settings_beatThickness_sub"
        }, {
            type: "slider",
            name: "settings_holdThickness",
            var: [menu.settings, "holdThickness"],
            min: 0.5,
            max: 10,
            step: .1,
            hint: "settings_holdThickness_sub"
        }, {
            type: "slider",
            name: "settings_holdProgressThickness",
            var: [menu.settings, "holdProgressThickness"],
            min: 0.5,
            max: 10,
            step: .1,
            hint: "settings_holdProgressThickness_sub"
        }, {
            type: "slider",
            name: "settings_holdAngle",
            var: [menu.settings, "holdAngle"],
            min: 0,
            max: 359,
            step: 1,
            hint: "settings_holdAngle_sub",
            display: ()=>lang("degrees", langSel, menu.settings.holdAngle.toFixed(0))
        }, {
            name: "settings_holdDirection",
            type: "dropdown",
            hint: "settings_holdDirection_sub",
            var: [menu.settings, "holdDirection"],
            options: [0, 1],
            labels: ["cw", "ccw"]
        }, {
            type: "slider",
            name: "settings_beatTransparency",
            var: [menu.settings, "noteEdgeOpacity"],
            min: 0,
            max: 100,
            step: 1,
            hint: "settings_beatTransparency_sub",
            display: ()=>lang("percentage", langSel, menu.settings.noteEdgeOpacity.toFixed(0))
        }, {
            type: "slider",
            name: "settings_holdProgressOpacity",
            var: [menu.settings, "holdProgressOpacity"],
            min: 0,
            max: 100,
            step: 1,
            hint: "settings_holdProgressOpacity_sub",
            display: ()=>lang("percentage", langSel, menu.settings.holdProgressOpacity.toFixed(0))
        }, {
            type: "slider",
            name: "settings_notePaneOpacity",
            var: [menu.settings, "notePaneOpacity"],
            min: 0,
            max: 100,
            step: 1,
            hint: "settings_notePaneOpacity_sub",
            display: ()=>lang("percentage", langSel, menu.settings.notePaneOpacity.toFixed(0))
        }]
    }, {
        title: "settings_header_particles",
        items: [{
            type: "slider",
            name: "settings_hitParticles",
            var: [menu.settings, "hitParticlesThickness"],
            min: 0,
            max: 10,
            step: .1,
            hint: "settings_hitParticles_sub"
        }, {
            type: "slider",
            name: "settings_hitParticlesOpacity",
            var: [menu.settings, "hitParticlesOpacity"],
            min: 0,
            max: 100,
            step: 1,
            hint: "settings_hitParticlesOpacity_sub",
            display: ()=>lang("percentage", langSel, menu.settings.hitParticlesOpacity.toFixed(0))
        }, {
            type: "slider",
            name: "settings_hitParticlesSpread",
            var: [menu.settings, "hitParticlesSpread"],
            min: 0,
            max: 10,
            step: 1,
            hint: "settings_hitParticlesSpread_sub"
        }, {
            type: "slider",
            name: "settings_hitParticlesDuration",
            var: [menu.settings, "hitParticlesDuration"],
            min: 50,
            max: 500,
            step: 50,
            hint: "settings_hitParticlesDuration_sub",
            display: ()=>lang("milliseconds_short", langSel, menu.settings.hitParticlesDuration.toFixed(0))
        }, {
            type: "boolean",
            var: [menu.settings, "disableMarvelouses"],
            name: "settings_disableMarvelouses",
            hint: "settings_disableMarvelouses_sub"
        }, {
            type: "boolean",
            var: [menu.settings, "disableGreats"],
            name: "settings_disableGreats",
            hint: "settings_disableGreats_sub"
        }, {
            type: "boolean",
            var: [menu.settings, "disableGoods"],
            name: "settings_disableGoods",
            hint: "settings_disableGoods_sub"
        }, {
            type: "boolean",
            var: [menu.settings, "disableOks"],
            name: "settings_disableOks",
            hint: "settings_disableOks_sub"
        }, {
            type: "boolean",
            var: [menu.settings, "disableMisses"],
            name: "settings_disableMisses",
            hint: "settings_disableMisses_sub"
        }]
    }, {
        title: "settings_header_gui",
        items: [{
            type: "slider",
            name: "settings_headerWidth",
            var: [menu.settings, "headerWidth"],
            min: 0,
            max: 10,
            step: 1,
            hint: "settings_headerWidth_sub"
        }, {
            name: "settings_boardOverlayType",
            type: "dropdown",
            hint: "settings_boardOverlayType_sub",
            var: [menu.settings, "overlayText"],
            options: [!1, 3, 2],
            labels: ["default", "settings_keyboard_typeLETTERS", "settings_keyboard_typeNUMPAD"]
        }, {
            type: "slider",
            name: "settings_boardOverlay",
            var: [menu.settings, "boardOverlay"],
            min: 0,
            max: 100,
            step: 1,
            hint: "settings_boardOverlay_sub",
            display: ()=>lang("percentage", langSel, menu.settings.boardOverlay.toFixed(0))
        }, {
            type: "slider",
            name: "settings_tilePush",
            var: [menu.settings, "tilePush"],
            min: 0,
            max: 10,
            step: 1,
            hint: "settings_tilePush_sub"
        }, {
            type: "boolean",
            var: [menu.settings, "showAccuracy"],
            name: "settings_showAccuracy",
            hint: "settings_showAccuracy_sub"
        }, {
            type: "boolean",
            var: [menu.settings, "showProgress"],
            name: "settings_showProgress",
            hint: "settings_showProgress_sub"
        }, {
            type: "boolean",
            var: [menu.settings, "showHP"],
            name: "settings_showHP",
            hint: "settings_showHP_sub"
        }, {
            type: "boolean",
            var: [menu.settings, "showJudgements"],
            name: "settings_showJudgements",
            hint: "settings_showJudgements_sub"
        }, {
            type: "boolean",
            var: [menu.settings, "showUR"],
            name: "settings_showUR",
            hint: "settings_showUR_sub"
        }, {
            type: "dropdown",
            var: [pulsusPlus.settings, "scoreSystem"],
            name: "PP_GAMEPLAY_GUI_SCORING-SYSTEM",
            hint: "PP_GAMEPLAY_GUI_SCORING-SYSTEM_HINT",
            options: ["pulsus", "PSC"],
            labels: ["PP_GAMEPLAY_GUI_SCORING-SYSTEM_LABEL_PULSUS", "PP_GAMEPLAY_GUI_SCORING-SYSTEM_LABEL_PSC"]
        }, {
            type: "boolean",
            var: [menu.settings, "showScore"],
            name: "settings_showScore",
            hint: "settings_showScore_sub"
        }, {
            type: "boolean",
            var: [menu.settings, "showCombo"],
            name: "settings_showCombo",
            hint: "settings_showCombo_sub"
        }, {
            type: "boolean",
            var: [menu.settings, "showSections"],
            name: "settings_showSections",
            hint: "settings_showSections_sub"
        }, {
            type: "divider",
            name: "_blank",
            hint: "_blank"
        }, {
            type: "boolean",
            var: [pulsusPlus.settings, "showMods"],
            name: "PP_GAMEPLAY_GUI_SHOW-MODS",
            hint: "PP_GAMEPLAY_GUI_SHOW-MODS_HINT"
        }, {
            type: "boolean",
            var: [pulsusPlus.settings, "showDetailedJudgements"],
            name: "PP_GAMEPLAY_GUI_SHOW-DETAILED-JUDGEMENTS",
            hint: "PP_GAMEPLAY_GUI_SHOW-DETAILED-JUDGEMENTS_HINT"
        }, {
            type: "boolean",
            var: [pulsusPlus.settings, "showOverlay"],
            name: "PP_GAMEPLAY_GUI_SHOW-OVERLAY",
            hint: "PP_GAMEPLAY_GUI_SHOW-OVERLAY_HINT"
        }, {
            type: "color",
            name: "PP_GAMEPLAY_GUI_OVERLAY-COL-LETTERS",
            hint: "PP_GAMEPLAY_GUI_OVERLAY-COL-LETTERS_HINT",
            mode: HSB,
            multiple: false,
            hue: [pulsusPlus.settings.overlayLetters, "hue"],
            saturation: [pulsusPlus.settings.overlayLetters, "saturation"],
            brightness: [pulsusPlus.settings.overlayLetters, "brightness"]
        }, {
            type: "color",
            name: "PP_GAMEPLAY_GUI_OVERLAY-COL-NUM",
            hint: "PP_GAMEPLAY_GUI_OVERLAY-COL-NUM_HINT",
            mode: HSB,
            multiple: false,
            hue: [pulsusPlus.settings.overlayNum, "hue"],
            saturation: [pulsusPlus.settings.overlayNum, "saturation"],
            brightness: [pulsusPlus.settings.overlayNum, "brightness"]
        }, {
            type: "boolean",
            var: [pulsusPlus.settings, "showOverlayKps"],
            name: "PP_GAMEPLAY_GUI_SHOW-OVERLAY-KPS",
            hint: "PP_GAMEPLAY_GUI_SHOW-OVERLAY-KPS_HINT"
        }, {
            type: "boolean",
            var: [pulsusPlus.settings, "showOverlayMax"],
            name: "PP_GAMEPLAY_GUI_SHOW-OVERLAY-MAX",
            hint: "PP_GAMEPLAY_GUI_SHOW-OVERLAY-MAX_HINT"
        }, {
            type: "boolean",
            var: [pulsusPlus.settings, "showOverlayTot"],
            name: "PP_GAMEPLAY_GUI_SHOW-OVERLAY-TOT",
            hint: "PP_GAMEPLAY_GUI_SHOW-OVERLAY-TOT_HINT"
        }]
    }
    ]);
    // - Settings menu - //

    // - Define x, y, width and height for the popup window - //
    let scales = [
        pulsusPlus.staticScales.horizontal[0],
        pulsusPlus.staticScales.horizontal[1]
    ];
    let xy = pulsusPlus.getLocal("PULSUSPLUS_WINDOW-POS_GAMEPLAY", [width/2 - 16/9*width/8, height/2 - 9/16*width/6*1.25]);
    xy[0] = constrain(xy[0], 0, width-scales[0] * width/height);
    xy[1] = constrain(xy[1], 0, height-scales[1] * width/height);
    let properties = [
        ...xy,
        ...scales
    ];
    // - Define x, y, width and height for the popup window - //

    // The good stuff
    pulsusPlus.gameplay = new PulsusPlusWindow("GAMEPLAY", ...properties, 4, pulsusPlus.gameplayNSM);
});