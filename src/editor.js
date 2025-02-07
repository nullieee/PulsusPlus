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
        subtitleText: "",
        subtitleMatch: "exact",
        displayTrackStart: 0,
        displayTrackEnd: 21,

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
            const rangeSelectValid = game.selectedBeats.length >= 2;
            const firstSelected = game.selectedBeats[0];
            const lastSelected = game.selectedBeats[game.selectedBeats.length-1];
            game.selectedBeats = [];
            const noteType = options.noteType;
            const snap = options.snap;
            const chordType = options.chordType;
            const advNoteType = options.advNoteType;
            const selectStreamEnd = options.selectStreamEnd;
            const holdType = options.holdType;
            const holdLength = options.holdLength;

            if(!rangeSelectValid && selectArea === "range") {
                popupMessage({
                    type: "error",
                    message: "PP_ERROR_INVALID-RANGE"
                });
                return;
            }

            const notes = lodash.cloneDeep(game.beat).map(note => {
                note[1] = round(pulsusPlus.convertTime(note[1]*1e4));
                note[6] = note[5] === 0 ? 0 : round(pulsusPlus.convertTime(note[6]*1e4))
                return {
                    time: note[1],
                    hold: note[5] === 1,
                    holdLength: note[6],
                    bpm: note[9]
                };
            });

            function areEqual(val1, val2) {
                return Math.abs(val1 - val2) <= 9
            }

            function getAdjecent(index, position) {
                if(position === "next") {
                    if(index < notes.length - 1) {
                        const note = notes[index];
                        let next = index + 1;
                        while(areEqual(note.time, notes[next]?.time)) { next++ };
                        if(next < notes.length) {
                            return notes[next];
                        }
                        return false;
                    }
                    return false;
                } else if(position === "prev") {
                    if(index > 0) {
                        const note = notes[index];
                        let prev = index - 1;
                        while(areEqual(note.time, notes[prev]?.time)) { prev-- };
                        if(prev >= 0) {
                            return notes[prev];
                        }
                        return false;
                    }
                    return false;
                }
                throw new Error(`Invalid position "${position}"`)
            }

            const anchors = [];
            const noteTimes = {};
            notes.forEach((note, index) => {
                let timeS = String(note.time);
                if(typeof noteTimes[timeS] === "undefined") {
                    noteTimes[timeS] = [index];
                } else {
                    noteTimes[timeS].push(index);
                }
                if(!note.hold) return;
                const next = getAdjecent(index, "next");
                if(!next) return;
                if(note.time + note.holdLength - 10 > next.time) {
                    anchors.push(index);
                }
            });

            notes.forEach((note, index) => {
                const currTime = round(pulsusPlus.convertTime(game.time*1e4));
                const noteTime = note.time + (timeCondition === "tick" ? 0 : note.holdLength);
                switch(selectArea) {
                    case "noConstrain":
                        break;
                    case "before":
                        if(noteTime > currTime) return;
                        break;
                    case "after":
                        if(noteTime < currTime) return;
                        break;
                    case "range":
                        if(noteTime < notes[firstSelected].time || noteTime > notes[lastSelected].time) return;
                }

                const next = getAdjecent(index, "next");
                const prev = getAdjecent(index, "prev");

                let timeS = String(note.time);
                const isHold = noteTimes[timeS].some(noteIndex => notes[noteIndex].hold);
                if(chordType !== 0) {
                    if(noteTimes[timeS].length !== chordType) return;
                }

                switch(noteType) {
                    case "any":
                        break;
                    case "beat":
                        if(isHold) return;
                        break;
                    case "hold":
                        if(!isHold) return;
                        break;
                }

                switch(advNoteType) {
                    case "any":
                        break;
                    case "anchorEnd":
                        if(!anchors.some(anchorIndex => areEqual(notes[anchorIndex].time + notes[anchorIndex].holdLength, note.time))) return;
                        break;
                    case "streamEnd":
                        if(snap === 0) break;
                        if(!prev) return;
                        if(round(prev.bpm/60e4/snap * (note.time - prev.time), 2) !== 1) return;
                        if(next && round(note.bpm/60e4/snap * ((next.time ?? 0) - note.time), 2) === 1) return;
                        break;
                    case "nestedAnchor":
                        if(!(anchors.some(anchorIndex => notes[anchorIndex].time + notes[anchorIndex].holdLength > note.time && note.time > notes[anchorIndex].time) && anchors.includes(index))) return;
                        break;
                }

                switch(holdType) {
                    case "any":
                        break;
                    case "anchor":
                        if(!anchors.some(anchorIndex => noteTimes[timeS].includes(anchorIndex))) return;
                        break;
                    case "noAnchor":
                        if(anchors.some(anchorIndex => noteTimes[timeS].includes(anchorIndex)) || !isHold) return;
                        break;
                }

                if(holdLength !== 0) {
                    if(round(note.bpm/60e4/holdLength * note.holdLength, 2) !== 1) return;
                }

                if(snap !== 0) {
                    if(selectStreamEnd) {
                        if(prev && round(prev.bpm/60e4/snap * (note.time - (prev.time ?? 0)), 2) !== 1
                            && next && round(note.bpm/60e4/snap * ((next.time ?? 0) - note.time), 2) !== 1) return;
                    } else {
                        if(!next) return;
                        if(round(note.bpm/60e4/snap * (next.time - note.time), 2) !== 1) return;
                    }
                }

                game.selectedBeats.push(...noteTimes[timeS]);
            });
            game.selectedBeats = Array.from(new Set(game.selectedBeats));
        } else {
            pulsusPlus.refreshEffects();
            const firstSelected = game.effects[game.effectMultiSel[0]];
            const lastSelected = game.effects[game.effectMultiSel[game.effectMultiSel.length-1]];
            const rangeSelectValid = game.effectMultiSel.length >= 2;
            game.effectMultiSel = [];
            const effectType = options.effectType;
            const subtitleText = options.subtitleText;
            const subtitleMatch = options.subtitleMatch;
            const displayTrackStart = options.displayTrackStart;
            const displayTrackEnd = options.displayTrackEnd;

            if(!rangeSelectValid && selectArea === "range") {
                popupMessage({
                    type: "error",
                    message: "PP_ERROR_INVALID-RANGE"
                });
                return;
            };

            const effects = lodash.cloneDeep(game.effects.map(effect => Object.fromEntries(Object.entries(effect)))).map(effect => {
                effect.time = round(pulsusPlus.convertTime(effect.time*1e4));
                effect.moveTime = round(pulsusPlus.convertTime(effect.moveTime*1e4));
                return effect
            });

            effects.forEach((effect, index) => {
                const currTime = round(pulsusPlus.convertTime(game.time*1e4));
                const effectTime = effect.time + (timeCondition === "tick" ? 0 : effect.moveTime);
                switch(selectArea) {
                    case "noConstrain":
                        break;
                    case "before":
                        if(effectTime > currTime) return;
                        break;
                    case "after":
                        if(effectTime < currTime) return;
                        break;
                    case "range":
                        if(effectTime < notes[firstSelected].time || effectTime > notes[lastSelected].time) return;
                }

                if(effect.track < displayTrackStart || effect.track > displayTrackEnd) return;

                if(effectType !== "any") {
                    if(effect.type !== effectType) return;
                    if(effectType === 9) { // subtitle
                        switch(subtitleMatch) {
                            case "exact":
                                if(effect.text !== subtitleText) return;
                                break;
                            case "includeText":
                                if(!effect.text.match(new RegExp(subtitleText, "g"))) return;
                        }
                    }

                }

                game.effectMultiSel.push(index);
            })
        }
    };

    pulsusPlus.exportLevel = function(lvl) {
        const exportWithJSZip = pulsusPlus.settings.lvlExportMode !== "json";
        if(lvl.local) {
            pulsusPlus.downloadJSON(`${lvl.title.replace(/[^a-zA-Z0-9 ]/g, '')}.json`, lvl, exportWithJSZip ? pulsusPlus.settings.lvlExportMode : undefined);
        } else {
            const map = newGrabLevelMeta(clevels[menu.lvl.sel], "id");
            if(getLevelDownloadState(clevels[menu.lvl.sel]) !== 2 || map.beat === "Metadata") {
                popupMessage({
                    type: "error",
                    message: "PP_ERROR_LEVEL-NOT-DOWNLOADED"
                });
                return;
            };
            pulsusPlus.downloadJSON(`${map.title}.json`, {
                ar: map.ar,
                author: map.author,
                beat: map.beat,
                bg: map.bg,
                bpm: map.bpm,
                copy: map.id,
                desc: map.desc,
                effects: map.effects,
                hpD: map.hpD,
                hw: map.hw,
                local: true,
                sections: map.sections,
                song: map.song,
                songOffset: map.songOffset,
                stars: map.stars,
                title: map.title
            }, exportWithJSZip ? pulsusPlus.settings.lvlExportMode : undefined)
        }
    }
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
            min: 0.25,
            max: 2,
            smallChange: .05,
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
            type: "boolean",
            var: [pulsusPlus.settings, "noteFade"],
            name: "PP_EDITOR_GENERAL_END-FADE",
            hint: "PP_EDITOR_GENERAL_END-FADE_HINT"
        }, {
            type: "dropdown",
            var: [pulsusPlus.settings, "defaultBg"],
            name: "PP_EDITOR_GENERAL_DEFAULT-BG",
            hint: "PP_EDITOR_GENERAL_DEFAULT-BG_HINT",
            options: ["blank", "black"],
            labels: ["PP_EDITOR_GENERAL_DEFAULT-BG_LABEL_BLANK", "PP_EDITOR_GENERAL_DEFAULT-BG_LABEL_BLACK"]
        }, {
            type: "button",
            name: "PP_EDITOR_GENERAL_IMPORT-OSU",
            hint: "PP_EDITOR_GENERAL_IMPORT-OSU_HINT",
            event: () => {
                if(!game.edit) {
                    popupMessage({
                        type: "error",
                        message: "PP_ERROR_NO-EDIT"
                    });
                    return;
                };
                osuImport.click()
            }
        }, {
            type: "button",
            name: "PP_EDITOR_GENERAL_IMPORT-CH",
            hint: "PP_EDITOR_GENERAL_IMPORT-CH_HINT",
            event: () => {
                if(!game.edit) {
                    popupMessage({
                        type: "error",
                        message: "PP_ERROR_NO-EDIT"
                    });
                    return;
                };
                chImport.click()
            }
        }, {
            type: "button",
            name: "PP_EDITOR_GENERAL_NEW-DIFFICULTY",
            hint: "PP_EDITOR_GENERAL_NEW-DIFFICULTY_HINT",
            event: () => {
                if(!menu.lvl.sel) {
                    popupMessage({
                        type: "error",
                        message: "PP_ERROR_NO-MAP-SELECTED"
                    });
                    return;
                };
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
            type: "dropdown",
            var: [pulsusPlus.settings, "lvlExportMode"],
            name: "PP_EDITOR_GENERAL_EXPORT-AS",
            hint: "PP_EDITOR_GENERAL_EXPORT-AS_HINT",
            options: ["json", "pls", "phz"],
            labels: ["PP_FILE_JSON", "PP_FILE_PULSEHAX-1", "PP_FILE_PULSEHAX-2"]
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
                if(!menu.lvl.sel) {
                    popupMessage({
                        type: "error",
                        message: "PP_ERROR_NO-MAP-SELECTED"
                    });
                    return;
                };
                pulsusPlus.exportLevel(clevels[menu.lvl.sel]);
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
            var: [pulsusPlus.editorOptions, "holdLength"],
            name: "PP_EDITOR_SELECT_HOLD-LENGTH",
            hint: "PP_EDITOR_SELECT_HOLD-LENGTH_HINT",
            min: 0,
            max: false,
            smallChange: 1/8,
            bigChange: 1/4,
            display: () => pulsusPlus.editorOptions.holdLength === 0 ? "Any" : round(pulsusPlus.editorOptions.holdLength, 6)
        }, {
            type: "number",
            var: [pulsusPlus.editorOptions, "snap"],
            name: "PP_EDITOR_SELECT_SNAP",
            hint: "PP_EDITOR_SELECT_SNAP_HINT",
            min: 0,
            max: false,
            smallChange: 1/8,
            bigChange: 1/4,
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
                game.selectedBeats = [];
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
            type: "string",
            var: [pulsusPlus.editorOptions, "subtitleText"],
            name: "PP_EDITOR_EFFECTS_SUBTITLE-TEXT",
            hint: "PP_EDITOR_EFFECTS_SUBTITLE-TEXT_HINT",
            allowEmpty: true
        }, {
            type: "dropdown",
            var: [pulsusPlus.editorOptions, "subtitleMatch"],
            name: "PP_EDITOR_EFFECTS_SUBTITLE-MATCH",
            hint: "PP_EDITOR_EFFECTS_SUBTITLE-MATCH_HINT",
            options: ["exact", "includeText"],
            labels: [
                "PP_EDITOR_EFFECTS_SUBTITLE-MATCH_LABEL_EXACT",
                "PP_EDITOR_EFFECTS_SUBTITLE-MATCH_LABEL_INCLUDE-TEXT"
            ]
        }, {
            type: "number",
            var: [pulsusPlus.editorOptions, "displayTrackStart"],
            name: "PP_EDITOR_EFFECTS_DISPLAY-TRACK-START",
            hint: "PP_EDITOR_EFFECTS_DISPLAY-TRACK-START_HINT",
            min: 0,
            max: 21,
            smallChange: .5,
            bigChange: 1
        }, {
            type: "number",
            var: [pulsusPlus.editorOptions, "displayTrackEnd"],
            name: "PP_EDITOR_EFFECTS_DISPLAY-TRACK-END",
            hint: "PP_EDITOR_EFFECTS_DISPLAY-TRACK-END_HINT",
            min: 0,
            max: 21,
            smallChange: .5,
            bigChange: 1
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
                pulsusPlus.effectClipboard.forEach(e => {
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
                game.effectMultiSel = [];
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
});