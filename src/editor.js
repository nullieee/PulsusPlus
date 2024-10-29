window.addEventListener("WindowClassMade", function() {

    // - Related variables - //
    pulsusPlus.refreshBeat = function() {
        let beat = lodash.cloneDeep(game.beat);
        for(let i=0; i<beat.length; i++) {
            beat[i] = {val: beat[i], index: i}
        };
        let beatSorted = lodash.cloneDeep(beat).sort((a, b) => a.val[1] - b.val[1]).map(b => b.index);
        beat = beat.map(b => b.index);
        game.beat.sort((a, b) => a[1] - b[1]);
        game.selectedBeats = game.selectedBeats.map(b => beatSorted.indexOf(b));
        game.selectedBeats.sort((a, b) => a - b);
    };
    pulsusPlus.refreshEffects = function() {
        let effects = lodash.cloneDeep(game.effects);
        for(let i=0; i<effects.length; i++) {
            effects[i] = {val: effects[i], index: i}
        };
        let effectsSorted = lodash.cloneDeep(effects).sort((a, b) => a.val.time - b.val.time).map(b => b.index);
        effects = effects.map(b => b.index);
        game.effects.sort((a, b) => a.time - b.time);
        game.effectMultiSel = game.effectMultiSel.map(b => effectsSorted.indexOf(b));
        game.effectMultiSel.sort((a, b) => a - b);
    };
    pulsusPlus.editorOptions = {
        selectArea: "noConstrain",
        timeCondition: "tick",

        noteType: "any",
        holdType: "any",
        advNoteType: "any",
        snap: 0,
        selectStreamEnd: false,
        chordType: 0,
        
        effectType: "any",
        displayTrack: -1,

        gradientStart: {
            hue: 45,
            sat: 116,
            bri: 255
        },
        gradientEnd: {
            hue: 199,
            sat: 128,
            bri: 255
        },
        gradientStep: "index"
    }; pulsusPlus.editorOptionsBuffer = lodash.cloneDeep(pulsusPlus.editorOptions);
    
    pulsusPlus.randomizeColors = function(options) {
        push();
        colorMode(HSB);
        pulsusPlus.refreshBeat();
        const target = game.selectedBeats;
        for(let i = 0; i < target.length; i++) {
            let beat = game.beat[target[i]];
            const randomColor = color(Math.random() * 255, 100 + Math.random() * (255 - 100), 175 + Math.random() * (255 - 175));
            target.map(b => game.beat[b]).filter(b => b[1] === beat[1]).forEach(b => {
                b[11] = hue(randomColor);
                b[16] = saturation(randomColor);
                b[17] = brightness(randomColor);
            })
        }
        pop();
    };

    pulsusPlus.applyGradient = function(options, start, end) {
        push();
        colorMode(HSB);
        const from = color(start.hue, start.sat, start.bri);
        const to = color(end.hue, end.sat, end.bri);
        pulsusPlus.refreshBeat();
        const target = game.selectedBeats;
        let compare = Array.from(new Set(target.map(b => game.beat[b][1])));
        let gradientProg;
        let length;
        if(options.gradientStep === "index") {
            gradientProg = target.map(b => game.beat[b][1]).map(b => compare.indexOf(b));
            length = Array.from(new Set(gradientProg)).length - 1;
        } else {
            gradientProg = target.map(b => game.beat[b][1] - game.beat[target[0]][1]);
            length = game.beat[target[target.length - 1]][1] - game.beat[target[0]][1]
        };
        target.map(i => game.beat[i]).forEach((beat, i) => {
            const lerped = lerpColor(from, to, gradientProg[i]/length);
            beat[11] = hue(lerped);
            beat[16] = saturation(lerped);
            beat[17] = brightness(lerped);
        });
        pop();
    }

    pulsusPlus.applyFilter = function(options) {
        // start
        game.timelineMode = "select";
        const selectArea = options.selectArea;
        const timeCondition = options.timeCondition;
        if(game.editorMode === 0) {
            pulsusPlus.refreshBeat();
            const firstSelected = game.beat[game.selectedBeats[0]];
            const lastSelected = game.beat[game.selectedBeats[game.selectedBeats.length-1]];
            game.selectedBeats = [];
            const noteType = options.noteType;
            const snap = options.snap;
            const chordType = options.chordType;
            const advNoteType = options.advNoteType;
            const selectStreamEnd = options.selectStreamEnd;
            const holdType = options.holdType;
    
            let anchors = [];
            let chords = {};
            game.beat.forEach((b, i) => {
                const time = String(round(b[1], 6));
                if(typeof chords[time] === "undefined") {
                    chords[time] = [];
                    chords[time].push(i);
                } else {
                    chords[time].push(i)
                };
                if(i === game.beat.length - 1) return;
                if(b[5] === 0) return;
                let nextI = i;
                while(round(b[1] - game.beat[nextI][1], 6) === 0) {
                    if(++nextI >= game.beat.length - 1) return;
                };
                if(round(b[1] + b[6] - game.beat[nextI][1], 6) > 0) {
                    anchors.push(i);
                };
            });
            const chordSorted = Object.keys(chords).sort((a, b) => parseFloat(a) - parseFloat(b));
            // check selection area
            if(selectArea === "range" && (firstSelected === undefined || lastSelected === undefined || firstSelected === lastSelected)) {
                popupMessage({
                    type: "error",
                    message: "PP_ERROR_INVALID-RANGE"
                });
                throw new Error(lang("PP_ERROR_INVALID-RANGE", langSel));
            };
            game.beat.forEach((beat, index) => {
                // set parameters
                let time = String(round(beat[1], 6));
                const currTickIndex = chords[time]
                const currTick = currTickIndex.map(i => game.beat[i]);

                let prevBeat, nextBeat;
                let currTickPos = chordSorted.indexOf(time);
                if(currTickPos !== 0 && chordSorted[currTickPos+1] !== undefined) {
                    nextBeat = game.beat[chords[chordSorted[currTickPos + 1]][0]];
                    prevBeat = game.beat[chords[chordSorted[currTickPos - 1]][0]];
                };

                let isAnchor = anchors.indexOf(index) !== -1;

                // check chord type
                if(chordType !== 0) {
                    if(currTick.length !== chordType) return;
                };

                // hold specific stuff
                switch(holdType) {
                    case "any":
                        break;
                    case "anchor":
                        if(isAnchor && beat[5] === 1) break;
                        return;
                    case "noAnchor":
                        if(!isAnchor && beat[5] === 1) break;
                        return;
                };

                // check note type
                switch(noteType) {
                    case "any":
                        break;
                    case "beat":
                        if(!currTick.some(b => b[5] !== 0)) break;
                        return;
                    case "hold":
                        if(beat[5] === 1) break;
                        return;
                };

                // selection area
                switch(selectArea) {
                    case "noConstrain":
                        break;
                    case "before":
                        if(beat[1] <= game.time && (timeCondition === "tick" || (beat[1] + (beat[5] ? beat[6] : 0) <= game.time))) break;
                        return;
                    case "after":
                        if(beat[1] >= game.time) break;
                        return;
                    case "range":
                        if(beat[1] >= firstSelected[1] && beat[1] <= lastSelected[1]) break;
                        return;
                };

                // check snap & stream end
                switch(snap) {
                    case 0:
                        break;
                    default:
                        const nextIsStream = typeof nextBeat === "undefined" ? false : round(pulsusPlus.convertTime((beat[9]/60) * (nextBeat[1] - beat[1])), 6) === round(snap,6);
                        const lastIsStream = typeof prevBeat === "undefined" ? false : round(pulsusPlus.convertTime((beat[9]/60) * (beat[1] - prevBeat[1])), 6) === round(snap, 6);
                        if(advNoteType === "streamEnd") {
                            if(!(!nextIsStream && lastIsStream)) return;
                        };
                        if(advNoteType !== "streamEnd") {
                            if(!(nextIsStream || (selectStreamEnd && lastIsStream))) return;
                        };
                        break;
                };

                // check advanced note type
                switch(advNoteType) {
                    case "any":
                        break;
                    case "streamEnd":
                        break;
                    case "anchorEnd":
                        if(anchors.map(a => round(game.beat[a][1] + game.beat[a][6], 6)).indexOf(round(beat[1], 6)) !== -1) break;
                        return;
                    case "nestedAnchor":
                        if(isAnchor && anchors.map(a => [game.beat[a][1], game.beat[a][1] + game.beat[a][6]]).some(a => a[0] < beat[1] && a[1] > beat[1])) break;
                        return;
                };
                
                game.selectedBeats.push(...currTickIndex);
                game.selectedBeats = Array.from(new Set(game.selectedBeats));
            });
        } else {
            pulsusPlus.refreshEffects();
            const firstSelected = game.effects[game.effectMultiSel[0]];
            const lastSelected = game.effects[game.effectMultiSel[game.effectMultiSel.length-1]];
            game.effectMultiSel = [];
            const effectType = options.effectType;
            const displayTrack = options.displayTrack;
            // check selection area
            if(selectArea === "range" && (firstSelected === undefined || lastSelected === undefined || firstSelected === lastSelected)) {
                popupMessage({
                    type: "error",
                    message: "PP_ERROR_INVALID-RANGE"
                });
                throw new Error(lang("PP_ERROR_INVALID-RANGE", langSel));
            };

            game.effects.forEach((effect, index) => {

                // effect type
                switch(effectType) {
                    case "any":
                        break;
                    default:
                        if(effect.type === effectType) break;
                        return;
                };

                // display track
                switch(displayTrack) {
                    case -1:
                        break;
                    default:
                        if(effect.track === displayTrack) break;
                        return;
                };

                // selection area
                switch(selectArea) {
                    case "noConstrain":
                        break;
                    case "before":
                        if(effect.time <= game.time && (timeCondition === "tick" || (effect.time + effect.moveTime <= game.time))) break;
                        return;
                    case "after":
                        if(effect.time >= game.time) break;
                        return;
                    case "range":
                        if(effect.time >= firstSelected.time && effect.time <= lastSelected.time) break;
                        return;
                };

                game.effectMultiSel.push(index);
            });
        }
    };
    // - Related variables - //

    // - Settings menu - //
    pulsusPlus.editorNSM = new pulsusPlus.newPulsusPlusMenu([
    {
        title: "PP_EDITOR_GENERAL_HEADER",
        items: [{
            type: "number",
            var: [pulsusPlus, "playbackRate"],
            name: "PP_EDITOR_GENERAL_PLAYBACK-RATE",
            hint: "PP_EDITOR_GENERAL_PLAYBACK-RATE_HINT",
            min: 0.1,
            max: 2,
            smallChange: .1,
            bigChange: .25,
            update: () => {
                if(game.playbackRate !== pulsusPlus.playbackRate) {
                    game.playbackRate = constrain(pulsusPlus.playbackRate, 0.1, 2);
                    game.timeStart = millis();
                    game.playingOffset = game.time;
                }
            },
            display: () => round(game.playbackRate, 6) + "x"
        }, {
            type: "number",
            var: [pulsusPlus, "snap"],
            name: "PP_EDITOR_GENERAL_SNAP",
            hint: "PP_EDITOR_GENERAL_SNAP_HINT",
            min: 1/256,
            max: false,
            smallChange: 1/16,
            bigChange: 1/12,
            update: () => {
                if(game.snap !== pulsusPlus.snap) {
                    game.snap = pulsusPlus.snap;
                }
            },
            display: () => `1/${round(1/game.snap, 6)}`
        }, {
            type: "boolean",
            var: [pulsusPlus.settings, "timingPoints"],
            name: "PP_EDITOR_GENERAL_TIMING-POINTS",
            hint: "PP_EDITOR_GENERAL_TIMING-POINTS_HINT"
        }, {
            type: "button",
            name: "PP_EDITOR_GENERAL_IMPORT-OSU",
            hint: "PP_EDITOR_GENERAL_IMPORT-OSU_HINT",
            event: () => osuImport.click()
        }, {
            type: "button",
            name: "PP_EDITOR_GENERAL_NEW-DIFFICULTY",
            hint: "PP_EDITOR_GENERAL_NEW-DIFFICULTY_HINT",
            event: () => {
                const reference = clevels[menu.lvl.sel];
                if(typeof reference === "object") {
                    pulsusPlus.createNewDifficulty(reference);
                } else {
                    if(getLevelDownloadState(reference) !== 2) {
                        popupMessage({
                            type: "error",
                            message: "PP_ERROR_LEVEL-NOT-DOWNLOADED"
                        });
                        return;
                    };
                    pulsusPlus.createNewDifficulty(newGrabLevelMeta(reference, "id"));
                }
            }
        }, {
            type: "divider",
            name: "_blank",
            hint: "_blank"
        }, {
            type: "button",
            name: "PP_EDITOR_GENERAL_IMPORT-MAP",
            hint: "PP_EDITOR_GENERAL_IMPORT-MAP_HINT",
            event: () => {
                levelImport.click();
            }
        }, {
            type: "button",
            name: "PP_EDITOR_GENERAL_EXPORT-MAP",
            hint: "PP_EDITOR_GENERAL_EXPORT-MAP_HINT",
            event: () => {
                const reference = clevels[menu.lvl.sel];
                if(typeof reference !== "object" || reference.local !== true) {
                    popupMessage({
                        type: "error",
                        message: "PP_ERROR_LEVEL-NOT-LOCAL"
                    });
                    return;
                };
                pulsusPlus.downloadJSON(`${reference.title}.json`, reference)
            }
        }, {
            type: "divider",
            name: "_blank",
            hint: "_blank"
        }, {
            type: "button",
            name: "PP_EDITOR_GENERAL_IMPORT-SONG",
            hint: "PP_EDITOR_GENERAL_IMPORT-SONG_HINT",
            event: () => {
                if(!game.edit) {
                    popupMessage({
                        type: "error",
                        message: "PP_ERROR_NO-EDIT"
                    });
                    return;
                };
                songImport.click();
            }
        }, {
            type: "button",
            name: "PP_EDITOR_GENERAL_RESET-SONG",
            hint: "PP_EDITOR_GENERAL_RESET-SONG_HINT",
            event: () => {
                if(!game.edit) {
                    popupMessage({
                        type: "error",
                        message: "PP_ERROR_NO-EDIT"
                    });
                    return;
                };
                lvlHowl[game.song]._src = getSongInfo(game.song, "id").link;
                lvlHowl[game.song].load();
                popupMessage({
                    type: "success",
                    message: "PP_SUCCESS_SONG-RESET"
                })
            }
        }]
    }, {
        title: "PP_EDITOR_SELECT_HEADER",
        items: 
        [{
            type: "dropdown",
            var: [pulsusPlus.editorOptions, "noteType"],
            name: "PP_EDITOR_SELECT_NOTE-TYPE",
            hint: "PP_EDITOR_SELECT_NOTE-TYPE_HINT",
            options: ["any", "beat", "hold"],
            labels: ["PP_EDITOR_SELECT_NOTE-TYPE_LABEL_ANY", "PP_EDITOR_SELECT_NOTE-TYPE_LABEL_BEAT", "PP_EDITOR_SELECT_NOTE-TYPE_LABEL_HOLD"]
        }, {
            type: "dropdown",
            var: [pulsusPlus.editorOptions, "advNoteType"],
            name: "PP_EDITOR_SELECT_ADV-NOTE-TYPE",
            hint: "PP_EDITOR_SELECT_ADV-NOTE-TYPE_HINT",
            options: ["any", "anchorEnd", "streamEnd", "nestedAnchor"],
            labels: ["PP_EDITOR_SELECT_ADV-NOTE-TYPE_LABEL_ANY", "PP_EDITOR_SELECT_ADV-NOTE-TYPE_LABEL_ANCHOR-END", "PP_EDITOR_SELECT_ADV-NOTE-TYPE_LABEL_STREAM-END", "PP_EDITOR_SELECT_ADV-NOTE-TYPE_LABEL_NESTED-ANCHOR"]
        }, {
            type: "dropdown",
            var: [pulsusPlus.editorOptions, "holdType"],
            name: "PP_EDITOR_SELECT_HOLD-TYPE",
            hint: "PP_EDITOR_SELECT_HOLD-TYPE_HINT",
            options: ["any", "anchor", "noAnchor"],
            labels: ["PP_EDITOR_SELECT_HOLD-TYPE_LABEL_ANY", "PP_EDITOR_SELECT_HOLD-TYPE_LABEL_ANCHOR", "PP_EDITOR_SELECT_HOLD-TYPE_LABEL_NO-ANCHOR"]
        }, {
            type: "number",
            var: [pulsusPlus.editorOptions, "snap"],
            name: "PP_EDITOR_SELECT_SNAP",
            hint: "PP_EDITOR_SELECT_SNAP_HINT",
            min: 0,
            max: false,
            smallChange: 1/4,
            bigChange: 1/3,
            display: () => pulsusPlus.editorOptions.snap === 0 ? "Any" : round(pulsusPlus.editorOptions.snap, 6)
        }, {
            type: "boolean",
            var: [pulsusPlus.editorOptions, "selectStreamEnd"],
            name: "PP_EDITOR_SELECT_STREAM-END",
            hint: "PP_EDITOR_SELECT_STREAM-END_HINT"
        }, {
            type: "number",
            var: [pulsusPlus.editorOptions, "chordType"],
            name: "PP_EDITOR_SELECT_CHORD-TYPE",
            hint: "PP_EDITOR_SELECT_CHORD-TYPE_HINT",
            min: 0,
            max: 9,
            smallChange: 1,
            bigChange: 2,
            update: () => {pulsusPlus.editorOptions.chordType = Math.floor(pulsusPlus.editorOptions.chordType)},
            display: () => ["Any", "Singles", "Doubles", "Triples", "Quads", "Quints", "Sextuples", "Septuples", "Octuples", "Nonuples"][pulsusPlus.editorOptions.chordType] ?? "What"
        }, {
            type: "dropdown",
            var: [pulsusPlus.editorOptions, "selectArea"],
            name: "PP_EDITOR_SELECT_SELECT-AREA",
            hint: "PP_EDITOR_SELECT_SELECT-AREA_HINT",
            options: ["noConstrain", "before", "after", "range"],
            labels: ["PP_EDITOR_SELECT_SELECT-AREA_LABEL_NO-CONSTRAIN", "PP_EDITOR_SELECT_SELECT-AREA_LABEL_BEFORE", "PP_EDITOR_SELECT_SELECT-AREA_LABEL_AFTER", "PP_EDITOR_SELECT_SELECT-AREA_LABEL_RANGE"]
        }, {
            type: "dropdown",
            var: [pulsusPlus.editorOptions, "timeCondition"],
            name: "PP_EDITOR_SELECT_TIME-CONDITION",
            hint: "PP_EDITOR_SELECT_TIME-CONDITION_HINT",
            options: ["tick", "duration"],
            labels: ["PP_EDITOR_SELECT_TIME-CONDITION_LABEL_TICK", "PP_EDITOR_SELECT_TIME-CONDITION_LABEL_DURATION"]
        }, {
            type: "button",
            name: "PP_EDITOR_SELECT_APPLY",
            hint: "PP_EDITOR_SELECT_APPLY_HINT",
            event: () => {
                if(!game.edit) {
                    popupMessage({
                        type: "error",
                        message: "PP_ERROR_NO-EDIT"
                    });
                    return;
                };
                game.editorMode = 0;
                pulsusPlus.applyFilter(pulsusPlus.editorOptions);
            }
        }, {
            type: "divider",
            name: "_blank",
            hint: "_blank"
        }, {
            type: "button",
            name: "PP_EDITOR_SELECT_COPY-BUFFER",
            hint: "PP_EDITOR_SELECT_COPY-BUFFER_HINT",
            event: () => {
                if(game.selectedBeats.length === 0) {
                    popupMessage({
                        type: "error",
                        message: "PP_ERROR_INVALID-BUFFER-COPY"
                    });
                    return;
                };
                pulsusPlus.beatClipboard = lodash.cloneDeep(game.selectedBeats.map(i => game.beat[i]).sort((a, b) => a[1] - b[1]));
                const firstNoteTime = pulsusPlus.beatClipboard[0][1];
                pulsusPlus.beatClipboard.forEach(b => {
                    b[1] = pulsusPlus.convertTime(b[1] - firstNoteTime) * (b[9]/60);
                    b[6] = pulsusPlus.convertTime(b[6]) * (b[9]/60);
                });
                popupMessage({
                    type: "success",
                    message: "PP_SUCCESS_BUFFER-COPY"
                });
            }
        }, {
            type: "button",
            name: "PP_EDITOR_SELECT_PASTE-BUFFER",
            hint: "PP_EDITOR_SELECT_PASTE-BUFFER_HINT",
            event: () => {
                if(pulsusPlus.beatClipboard.length === 0) {
                    popupMessage({
                        type: "error",
                        message: "PP_ERROR_INVALID-BUFFER-PASTE"
                    });
                    return;
                }; if(!game.edit) {
                    popupMessage({
                        type: "error",
                        message: "PP_ERROR_NO-EDIT"
                    });
                    return;
                };
                game.editorMode = 0;
                game.timelineMode = "select";
                const bpmFactor = pulsusPlus.beatClipboard[0][9];
                pulsusPlus.beatClipboard.forEach(beat => {
                    const newBeat = lodash.cloneDeep(beat);
                    newBeat[10] = game.timelineOffset;
                    newBeat[9] = game.timelineBPM * (newBeat[9] / bpmFactor);
                    newBeat[1] = pulsusPlus.convertTime(newBeat[1] / (newBeat[9]/60), "pulsus");
                    newBeat[1] += game.time;
                    newBeat[6] = pulsusPlus.convertTime(newBeat[6] / (newBeat[9]/60), "pulsus");
                    game.beat.push(newBeat);
                    game.selectedBeats.push(game.beat.length - 1);
                });
                popupMessage({
                    type: "success",
                    message: "PP_SUCCESS_BUFFER-PASTE"
                })
            }
        }]
    }, {
        title: "PP_EDITOR_COLORS_HEADER",
        items: 
        [{
            type: "color",
            name: "PP_EDITOR_COLORS_GRADIENT-START",
            hint: "PP_EDITOR_COLORS_GRADIENT-START_HINT",
            mode: HSB,
            multiple: false,
            hue: [pulsusPlus.editorOptions.gradientStart, "hue"],
            saturation: [pulsusPlus.editorOptions.gradientStart, "sat"],
            brightness: [pulsusPlus.editorOptions.gradientStart, "bri"]
        }, {
            type: "color",
            name: "PP_EDITOR_COLORS_GRADIENT-END",
            hint: "PP_EDITOR_COLORS_GRADIENT-END_HINT",
            mode: HSB,
            multiple: false,
            hue: [pulsusPlus.editorOptions.gradientEnd, "hue"],
            saturation: [pulsusPlus.editorOptions.gradientEnd, "sat"],
            brightness: [pulsusPlus.editorOptions.gradientEnd, "bri"]
        }, {
            type: "dropdown",
            var: [pulsusPlus.editorOptions, "gradientStep"],
            name: "PP_EDITOR_GRADIENT-STEP",
            hint: "PP_EDITOR_GRADIENT-STEP_HINT",
            options: ["index", "time", "randomize"],
            labels: ["PP_EDITOR_GRADIENT-STEP_LABEL_INDEX", "PP_EDITOR_GRADIENT-STEP_LABEL_TIME", "PP_EDITOR_GRADIENT-STEP_LABEL_RANDOMIZE"]
        }, {
            type: "button",
            name: "PP_EDITOR_COLORS_GRADIENT-APPLY",
            hint: "PP_EDITOR_COLORS_GRADIENT-APPLY_HINT",
            event: () => {
                if(!game.edit) {
                    popupMessage({
                        type: "error",
                        message: "PP_ERROR_NO-EDIT"
                    });
                    return;
                } else if(game.selectedBeats.length === 0 && pulsusPlus.editorOptions.gradientStep !== "randomize") {
                    popupMessage({
                        type: "error",
                        message: "PP_ERROR_INVALID-GRADIENT"
                    });
                    return;
                } else if(pulsusPlus.editorOptions.gradientStep === "randomize") {
                    pulsusPlus.randomizeColors(pulsusPlus.editorOptions);
                } else {
                    pulsusPlus.applyGradient(pulsusPlus.editorOptions, pulsusPlus.editorOptions.gradientStart, pulsusPlus.editorOptions.gradientEnd);
                }
            }
        }]
    }, {
        title: "PP_EDITOR_EFFECTS_HEADER",
        /*
        effect type
        selection area
        */
        items: [{
            type: "dropdown",
            var: [pulsusPlus.editorOptions, "effectType"],
            name: "PP_EDITOR_EFFECTS_TYPE",
            hint: "PP_EDITOR_EFFECTS_TYPE_HINT",
            options: ["any", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
            labels: [
                "PP_EDITOR_EFFECTS_TYPE_LABEL_ANY",
                "edit_effects_type_moveBoard",
                "edit_effects_type_scaleBoard",
                "edit_effects_type_rotateBoard",
                "edit_effects_type_moveTile",
                "edit_effects_type_scaleTile",
                "edit_effects_type_rotateTile",
                "edit_effects_type_changeForesight",
                "edit_effects_type_opaqueBoard",
                "edit_effects_type_opaqueTile",
                "edit_effects_type_subtitle",
                "edit_effects_type_vignette",
                "edit_effects_type_letterbox",
                "edit_effects_type_colorTile",
                "edit_effects_type_colorOverlay",
                "edit_effects_type_trailTile"
            ]
        }, {
            type: "number",
            var: [pulsusPlus.editorOptions, "displayTrack"],
            name: "PP_EDITOR_EFFECTS_DISPLAY-TRACK",
            hint: "PP_EDITOR_EFFECTS_DISPLAY-TRACK_HINT",
            min: -1,
            max: 21,
            smallChange: .5,
            bigChange: 1,
            display: () => pulsusPlus.editorOptions.displayTrack === -1 ? "-1 (Any)" : pulsusPlus.editorOptions.displayTrack
        }, {
            type: "dropdown",
            var: [pulsusPlus.editorOptions, "selectArea"],
            name: "PP_EDITOR_SELECT_SELECT-AREA",
            hint: "PP_EDITOR_SELECT_SELECT-AREA_HINT",
            options: ["noConstrain", "before", "after", "range"],
            labels: ["PP_EDITOR_SELECT_SELECT-AREA_LABEL_NO-CONSTRAIN", "PP_EDITOR_SELECT_SELECT-AREA_LABEL_BEFORE", "PP_EDITOR_SELECT_SELECT-AREA_LABEL_AFTER", "PP_EDITOR_SELECT_SELECT-AREA_LABEL_RANGE"]
        }, {
            type: "dropdown",
            var: [pulsusPlus.editorOptions, "timeCondition"],
            name: "PP_EDITOR_SELECT_TIME-CONDITION",
            hint: "PP_EDITOR_SELECT_TIME-CONDITION_HINT",
            options: ["tick", "duration"],
            labels: ["PP_EDITOR_SELECT_TIME-CONDITION_LABEL_TICK", "PP_EDITOR_SELECT_TIME-CONDITION_LABEL_DURATION"]
        }, {
            type: "button",
            name: "PP_EDITOR_SELECT_APPLY",
            hint: "PP_EDITOR_SELECT_APPLY_HINT",
            event: () => {
                if(!game.edit) {
                    popupMessage({
                        type: "error",
                        message: "PP_ERROR_NO-EDIT"
                    });
                    return;
                };
                game.editorMode = 1;
                pulsusPlus.applyFilter(pulsusPlus.editorOptions);
            }
        }, {
            type: "divider",
            name: "_blank",
            hint: "_blank"
        }, {
            type: "button",
            name: "PP_EDITOR_SELECT_COPY-BUFFER",
            hint: "PP_EDITOR_SELECT_COPY-BUFFER_HINT",
            event: () => {
                if(game.effectMultiSel.length === 0) {
                    popupMessage({
                        type: "error",
                        message: "PP_ERROR_INVALID-BUFFER-COPY"
                    });
                    return;
                };
                pulsusPlus.effectClipboard = lodash.cloneDeep(game.effectMultiSel.map(i => game.effects[i]).sort((a, b) => a.time - b.time));
                const firstEffectTime = pulsusPlus.effectClipboard[0].time;
                pulsusPlus.beatClipboard.forEach(e => {
                    e.time = pulsusPlus.convertTime(e.time - firstEffectTime) * (e.bpm/60);
                    e.moveTime = pulsusPlus.convertTime(e.moveTime) * (e.bpm/60);
                });
                popupMessage({
                    type: "success",
                    message: "PP_SUCCESS_BUFFER-COPY"
                });
            }
        }, {
            type: "button",
            name: "PP_EDITOR_SELECT_PASTE-BUFFER",
            hint: "PP_EDITOR_SELECT_PASTE-BUFFER_HINT",
            event: () => {
                if(pulsusPlus.effectClipboard.length === 0) {
                    popupMessage({
                        type: "error",
                        message: "PP_ERROR_INVALID-BUFFER-PASTE"
                    });
                    return;
                }; if(!game.edit) {
                    popupMessage({
                        type: "error",
                        message: "PP_ERROR_NO-EDIT"
                    });
                    return;
                };
                game.editorMode = 1;
                game.timelineMode = "select";
                const bpmFactor = pulsusPlus.effectClipboard[0].bpm;
                pulsusPlus.effectClipboard.forEach(effect => {
                    const newEffect = lodash.cloneDeep(effect);
                    newEffect.offset = game.timelineOffset;
                    newEffect.bpm = game.timelineBPM * (newEffect.bpm / bpmFactor);
                    newEffect.time = pulsusPlus.convertTime(newEffect.time / (newEffect.bpm/60), "pulsus");
                    newEffect.time += game.time;
                    newEffect.moveTime = pulsusPlus.convertTime(newEffect.moveTime / (newEffect.bpm/60), "pulsus");
                    game.effects.push(newEffect);
                    game.effectMultiSel.push(game.effects.length - 1);
                });
                popupMessage({
                    type: "success",
                    message: "PP_SUCCESS_BUFFER-PASTE"
                })
            }
        }]
    }
    ]);
    // - Settings menu - //

    // - Define x, y, width and height for the popup window - //
    let scales = [
        pulsusPlus.staticScales.vertical[0],
        pulsusPlus.staticScales.vertical[1]
    ];
    let xy = pulsusPlus.getLocal("PULSUSPLUS_WINDOW-POS_EDITOR", [width/2 - 16/9*width/8, height/2 - 9/16*width/6*1.25]);
    xy[0] = constrain(xy[0], 0, width-scales[0] * width/height);
    xy[1] = constrain(xy[1], 0, height-scales[1] * width/height);
    let properties = [
        ...xy,
        ...scales
    ];
    // - Define x, y, width and height for the popup window - //

    // The good stuff
    pulsusPlus.editor = new PulsusPlusWindow("EDITOR", ...properties, 5, pulsusPlus.editorNSM);
    eval(`
        adjustCanvas = ${pulsusPlus.functionReplace(adjustCanvas, "end", `
            if(!lodash.isEqual(pulsusPlus.editorOptions, pulsusPlus.editorOptionsBuffer)) {
               //stuff
            }
        `)}
    `);
});