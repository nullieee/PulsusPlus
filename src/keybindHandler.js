window.addEventListener("WindowClassMade", function(){
    pulsusPlus.cycleOrder = Object.keys(pulsusPlus).filter(key => pulsusPlus[key] instanceof PulsusPlusWindow).sort((a, b) => pulsusPlus[a].z - pulsusPlus[b].z);
    document.addEventListener("keydown", function(e) {
        pulsusPlus.shiftKey = e.shiftKey;
        pulsusPlus.altKey = e.altKey;
        if(e.metaKey) return;
        if(e.code === "Backspace" && gameScreen === "game" && !game.edit && !game.failed && !game.paused) {
            pulsusPlus.stopRetry = true;
        };
        let keybind = pulsusPlus.keybindToString(e);
        if(gameScreen === "game" && (game.edit || (!game.edit && !game.failed && !game.paused && !game.replay.on && !game.mods.auto && !e.repeat))) {
            (function(){
                for(let i = 0; i < game.keys.length; i++) {
                    if(game.edit && game.editorMode === 0 && !e.repeat && !prmptingString.active && !prmptingColor.active && game.menuSize <= .1) {
                        //if(Object.keys(pulsusPlus.savedKeybinds).some(key => (pulsusPlus.keybindsType[key] ?? "").search(/window|editor|all/gi) !== -1 && pulsusPlus.savedKeybinds[key]?.str === keybind)) return;
                        if((e.code.search(/(Numpad(?![A-Za-z]))/) !== -1 || (e.code.search(/(Digit(?![A-Za-z]))/) !== -1) && e.location === 3) && e.code.search(/0/) === -1) {
                            let key = [6, 7, 8, 3, 4, 5, 0, 1, 2][parseInt(e.code.substring(e.code.search(/Numpad/) === -1 ? 5 : 6))-1];
                            const beatTimeUnrounded = round((game.time - game.bpm / 60 / 1e3 * game.timelineOffset) * (1 / game.snap) * (game.timelineBPM / game.bpm)) / (1 / game.snap * (game.timelineBPM / game.bpm)) + game.bpm / 60 / 1e3 * game.timelineOffset;
                            const beatTime = round(beatTimeUnrounded*1e4)
                            if(game.beat.some(beat => beat[0] === key && round(beat[1]*1e4) === beatTime)) {
                                if(game.timelineMode === "scroll") {
                                    game.beat = game.beat.filter(beat => !(beat[0] === key && round(beat[1]*1e4) === beatTime));
                                } else {
                                    const selectedNotes = game.beat.map((beat, index) => [beat[0] === key && round(beat[1]*1e4) === beatTime, index]).filter(index => index[0]).map(index => index[1]);
                                    const deselect = selectedNotes.length > 0 && selectedNotes.some(index => game.selectedBeats.indexOf(index) !== -1);
                                    if(e.ctrlKey) {
                                        if(deselect) {
                                            game.selectedBeats = game.selectedBeats.filter(index => selectedNotes.indexOf(index) === -1);
                                        } else {
                                            game.selectedBeats.push(...selectedNotes);
                                        }
                                    } else {
                                        if(deselect && game.selectedBeats.length === selectedNotes.length) {
                                            game.selectedBeats = []
                                        } else {
                                            game.selectedBeats = selectedNotes;
                                        }
                                    }
                                    game.selectedBeats = Array.from(new Set(game.selectedBeats));
                                }
                            } else if(game.timelineMode === "scroll") {
                                game.beat.push([
                                    key,
                                    beatTimeUnrounded,
                                    false,
                                    0,
                                    false,
                                    game.objType,
                                    game.holdLength / (game.timelineBPM / game.bpm),
                                    0,
                                    0,
                                    game.timelineBPM,
                                    game.timelineOffset,
                                    game.beatColor,
                                    null,
                                    game.transitionIn,
                                    game.transitionOut,
                                    false,
                                    game.beatSaturation,
                                    game.beatBrightness
                                ])
                            }
                        };
                        return;
                    }
                    const isLetters = e.code.search(/Key/gi) !== -1;
                    if(Array.isArray(game.keys[i])) {
                        for(let j = 0; j < game.keys[i].length; j++) {
                            if(e.code === game.keys[i][j]) {
                                pulsusPlus.game.kps.push(millis());
                                pulsusPlus.game.totKps++;
                                if((isLetters && pulsusPlus.pressedLetters[i]) || (!isLetters && pulsusPlus.pressedNum[i])) return;
                                if(game.keysPressed[i] && pulsusPlus.settings.fixDC) {
                                    pulsusPlus.queuedPress[i] = true;
                                };
                                if(isLetters) {
                                    pulsusPlus.pressedLetters[i] = true;
                                } else {
                                    pulsusPlus.pressedNum[i] = true;
                                }
                            };   
                        }
                    } else if(e.code === game.keys[i]) {
                        pulsusPlus.game.kps.push(millis());
                        pulsusPlus.game.totKps++;
                        if((isLetters && pulsusPlus.pressedLetters[i]) || (!isLetters && pulsusPlus.pressedNum[i])) return;
                        if(game.keysPressed[i] && pulsusPlus.settings.fixDC) {
                            pulsusPlus.queuedPress[i] = true;
                        };
                        if(isLetters) {
                            pulsusPlus.pressedLetters[i] = true;
                        } else {
                            pulsusPlus.pressedNum[i] = true;
                        }
                    };
                };
            })()
        }
        if(e.location === 3) return;
        if(pulsusPlus.sMenu.mods) {
            let index = ["KeyQ", "KeyW", "KeyE", "KeyA", "KeyS", "KeyD", "KeyZ", "KeyX", "KeyC"].indexOf(e.code);
            if(index !== -1 && !e.repeat) {
                if(e.code === "KeyS") {
                    pulsusPlus.sMenu.modBtn.instantFail.pressed = false;
                    pulsusPlus.sMenu.modBtn.perfect.pressed = false;
                    if(game.mods.instantFail) {
                        game.mods.instantFail = false;
                        game.mods.perfect = true;
                        pulsusPlus.sMenu.modsS[4] = "perfect";
                        pulsusPlus.sMenu.modBtn.perfect = pulsusPlus.sMenu.modBtn.instantFail;
                        return;
                    } else if(game.mods.perfect) {
                        game.mods.instantFail = false;
                        game.mods.perfect = false;
                        pulsusPlus.sMenu.modsS[4] = "instantFail";
                        pulsusPlus.sMenu.modBtn.instantFail = pulsusPlus.sMenu.modBtn.perfect;
                        return;
                    } else {
                        game.mods.instantFail = true;
                    };
                } else {
                    game.mods[pulsusPlus.sMenu.modsS[index]] = !game.mods[pulsusPlus.sMenu.modsS[index]];
                    pulsusPlus.sMenu.modBtn[pulsusPlus.sMenu.modsS[index]].pressed = false;
                };
            }
            if(e.code.match(/arrow(left|right)/gi)) {
                const direction = e.code.match(/right/gi);
                Object.entries(pulsusPlus.sMenu.modSliders).filter(x => x[1].focused).forEach(x => {
                    const k = x[0];
                    const v = x[1];
                    const modifier = e.ctrlKey;
                    game.mods[k] = round(constrain(game.mods[k] + 0.01 * ((direction ? 1 : -1) * (v.invert ? -1 : 1)) * (modifier ? 5 : 1), v.invert ? v.max : v.min, v.invert ? v.min : v.max), 2);
                })
            };
            if(e.code.match(/arrow(up|down)/gi)) {
                const direction = e.code.match(/down/gi);
                if(!Object.values(pulsusPlus.sMenu.modSliders).some(v => v.focused)) {
                    pulsusPlus.sMenu.modSliders[direction ? "bpm" : "hitWindow"].focused = true;
                } else {
                    for(const [k, v] of Object.entries(pulsusPlus.sMenu.modSliders)) {
                        if(v.focused) {
                            v.focused = false;
                            for(const [k2, v2] of Object.entries(pulsusPlus.sMenu.modSliders)) {
                                if(v2.index === (v.index === 0 && !direction ? 2 : (v.index + (direction ? 1 : -1))%3)) {
                                    v2.focused = true;
                                    break;
                                }
                            }
                            break;
                        };
                    };
                }
            };
            if(e.code === "KeyR") {
                pulsusPlus.resetMods();
            }
        } if(pulsusPlus.sMenu.practice) {
            if(e.code.match(/arrow(left|right)/gi)) {
                const direction = e.code.match(/right/gi);
                Object.entries(pulsusPlus.sMenu.practiceSliders).filter(x => x[1].focused).forEach(x => {
                    const k = x[0];
                    const v = x[1];
                    const modifier = e.ctrlKey;
                    game.mods[k] = constrain(game.mods[k] + 1000 * (direction ? 1 : -1) * (modifier ? 5 : 1), v.min, v.max);
                    const pos = k.match(/start/gi) ? "practiceStart" : "practiceEnd";
                    pulsusPlus.sMenu[pos] = [1, game.mods[k]];
                    pulsusPlus.sMenu.practiceUsed = true; 
                })
            };
            if(e.code.match(/arrow(up|down)/gi)) {
                const direction = e.code.match(/down/gi);
                if(!Object.values(pulsusPlus.sMenu.practiceSliders).some(v => v.focused)) {
                    pulsusPlus.sMenu.practiceSliders[direction ? "startPos" : "endPos"].focused = true;
                } else {
                    if(pulsusPlus.sMenu.practiceSliders.startPos.focused) {
                        pulsusPlus.sMenu.practiceSliders.startPos.focused = false;
                        pulsusPlus.sMenu.practiceSliders.endPos.focused = true;
                    } else {
                        pulsusPlus.sMenu.practiceSliders.endPos.focused = false;
                        pulsusPlus.sMenu.practiceSliders.startPos.focused = true;
                    }
                }
            };
        };
        if(Object.values(pulsusPlus.savedKeybinds).some((bind) => bind.active)) {
            pulsusPlus.currentKeybind = keybind;
        } else {
            let keybindActived = false;
            Object.keys(pulsusPlus.savedKeybinds).forEach((bind) => {
                if(keybind === pulsusPlus.savedKeybinds[bind].str) {
                    if(pulsusPlus.keybindsType[bind] !== "all" && (pulsusPlus.sMenu.mods || pulsusPlus.sMenu.practice) && !bind.match(/open(Mods|Practice)/)) return;
                    switch(pulsusPlus.keybindsType[bind]) {
                        case "lvl":
                            if(!(!menu.lvl.loading && menu.screen === "lvl" && gameScreen === "menu")) return;
                            if(!(!prmptingString.active && !prmptingColor.active)) return;
                            if((menu.lvl.sel === false || e.repeat) && bind.search(/scroll|random/) === -1) return;
                            keybindActived = true;
                            switch(bind) {
                                case "randomMap":
                                    pulsusPlus.lvlSelAction("randomMap");
                                    break;
                                case "scrollUp":
                                    pulsusPlus.lvlSelAction("scrollUp");
                                    break;
                                case "scrollDown":
                                    pulsusPlus.lvlSelAction("scrollDown");
                                    break;
                                case "editLvl":
                                case "playLvl":
                                    const state = getLevelDownloadState(clevels[menu.lvl.sel]);
                                    if(state === 0 && !clevels[menu.lvl.sel].local) {
                                        newGrabLevel(clevels[menu.lvl.sel], "id", true);
                                    } else if(state === 2 || clevels[menu.lvl.sel].local) {
                                        game.edit = bind === "editLvl";
                                        loadLevel(menu.lvl.sel);
                                    };
                                    break;
                                case "openLeaderboard":
                                    if(!newGrabLevelMeta(clevels[menu.lvl.sel], "id").ranked) return;
                                    menu.lvl.showLeaderboard = menu.lvl.showMods || practiceSetup.active || !menu.lvl.showLeaderboard;
                                    menu.lvl.showMods = false;
                                    practiceSetup.active = false;
                                    break;
                                case "bookmarkLevel":
                                    if(getSelectedLevel().local) return;
                                    const lvlIndex = levels.saved.indexOf(clevels[menu.lvl.sel]);
                                    if(lvlIndex !== -1) {
                                        levels.scores.splice(lvlIndex, 1);
                                        levels.saved.splice(lvlIndex, 1);
                                        if(menu.lvl.tab === 0) {
                                            levels.search = [];
                                            menu.lvl.sel = false;
                                            menu.lvl.searchSent = false;
                                        }
                                    } else {
                                        levels.saved.push(clevels[menu.lvl.sel])
                                    }
                                    break;
                                case "copyLevel":
                                    pulsusPlus.copyLevel(clevels[menu.lvl.sel]);
                                    if(menu.lvl.tab === 0) {
                                        levels.search = [];
                                        menu.lvl.sel = false;
                                        menu.lvl.searchSent = false;
                                    }
                                    break;
                                case "exportLevel":
                                    pulsusPlus.exportLevel(clevels[menu.lvl.sel]);
                                    break;
                            };
                            break;
                        case "menu":
                            if(!(!menu.lvl.loading && (menu.screen === "lvl" || bind.search(/settings|sidemenu/gi) !== -1) && gameScreen === "menu")) return;
                            if(!(!prmptingString.active && !prmptingColor.active)) return;
                            if(e.repeat) return;
                            keybindActived = true;
                            switch(bind) {
                                case "openSettings":
                                    menu.screen = menu.screen === "settings" ? "lvl" : "settings";
                                    break;
                                case "openSideMenu":
                                    menu.side = !menu.side;
                                    break;
                                case "switchLvlTab":
                                    menu.lvl.tab = +!menu.lvl.tab;
                                    if(menu.lvl.tab === 1) {
                                        menu.lvl.sortMode = "starsAsc";
                                        menu.lvl.showUnranked = false;
                                    } else {
                                        menu.lvl.sortMode = "dateDesc";
                                        menu.lvl.showUnranked = true;
                                    }
                                    menu.lvl.search = "";
                                    pulsusPlus.refreshLvl();
                                    break;
                                case "openMods":
                                    if(!pulsusPlus.settings.mpMode) {
                                        if(menu.lvl.sel === false) return;
                                        menu.lvl.showMods = practiceSetup.active || menu.lvl.showLeaderboard || !menu.lvl.showMods;
                                        practiceSetup.active = false;
                                        menu.lvl.showLeaderboard = false;
                                        return;
                                    }
                                    pulsusPlus.sMenu.practice = false;
                                    pulsusPlus.sMenu.practiceY = 0;
                                    pulsusPlus.sMenu.mods = !pulsusPlus.sMenu.mods;
                                    pulsusPlus.sMenu.modsY = pulsusPlus.sMenu.mods ? 1 : 0;
                                    PulsusPlusWindow.allInstances.forEach((instance) => {
                                        instance.states.dragging = false;
                                    });
                                    pulsusPlus.sMenu.currToolTip = null;
                                    Object.keys(pulsusPlus.sMenu.modBtn).forEach(k => pulsusPlus.sMenu.modBtn[k].hitboxS = null);
                                    break;
                                case "switchAwarded":
                                    menu.lvl.showUnranked = !menu.lvl.showUnranked;
                                    pulsusPlus.refreshLvl();
                                    break;
                                case "switchSort":
                                    menu.lvl.sortMode = menu.lvl.sortModes[(menu.lvl.sortModes.indexOf(menu.lvl.sortMode)+1)%menu.lvl.sortModes.length];
                                    pulsusPlus.refreshLvl();
                                    break;
                                case "switchQuery":
                                    menu.lvl.searchMode = menu.lvl.searchModes[(menu.lvl.searchModes.indexOf(menu.lvl.searchMode)+1)%menu.lvl.searchModes.length];
                                    if(menu.lvl.search !== "") {
                                        pulsusPlus.refreshLvl();
                                    };
                                    break;
                                case "createLevel":
                                    createLevel();
                                    break;
                                case "search":
                                    promptString({
                                        var: [menu.lvl, "search"],
                                        title: "menu_lvl_search",
                                        type: "string",
                                        allowEmpty: true,
                                        after: pulsusPlus.refreshLvl
                                    });
                                    break;
                                case "clearSearch":
                                    if(menu.lvl.search === "") return;
                                    menu.lvl.search = "";
                                    pulsusPlus.refreshLvl();
                                    break;
                                case "importLevel":
                                    levelImport.click();
                                    break;
                            }
                            break;
                        case "game":
                            if(!(gameScreen === "game" && (game.disMode === 1 || game.disMode === 2) && !e.repeat && !game.edit)) return;
                            if(!(!prmptingString.active && !prmptingColor.active && !pulsusPlus.sMenu.practice)) return;
                            keybindActived = true;
                            switch(bind) {
                                case "retry":
                                    if(game.disMode === 2 && !game.failed) return;
                                    if(Timeout.pending("retry")) {
                                        pulsusPlus.retryDown = true;
                                        return;
                                    }
                                    pulsusPlus.retry = millis();
                                    break;
                                case "skip":
                                    if(game.disMode === 1 && !game.paused && !Timeout.pending("skipStart") && !Timeout.pending("skipEnd") && !pulsusPlus.skipAuto && (game.beat.length !== 0 ? game.beat[game.beat.length - 1][1] > game.time : false)) {
                                        pulsusPlus.skip = true;
                                    };
                                    break;
                                case "continue":
                                    if(!game.paused) return;
                                    if(game.resumeTime === false) {
                                        pauseAction("continue");
                                    }
                                    break;
                                case "quit":
                                    if(!game.paused && !(game.disMode === 2 && game.failed)) return;
                                    pauseAction("menu");
                                    break;
                            };
                            break;
                        case "menugame":
                            if(!(!prmptingString.active && !prmptingColor.active)) return;
                            if(e.repeat) return;
                            if(!(!menu.lvl.loading && (menu.screen === "lvl" || bind.search(/settings|sidemenu/gi) !== -1) && gameScreen === "menu") &&
                            !(gameScreen === "game" && game.disMode === 1 && game.paused && !game.edit)) return;
                            keybindActived = true;
                            switch(bind) {
                                case "openPractice":
                                    if(!pulsusPlus.settings.mpMode && gameScreen === "game") return;
                                    if(pulsusPlus.sMenu.practiceUsed && gameScreen === "game") return;
                                    if(!pulsusPlus.settings.mpMode) {
                                        if(menu.lvl.sel === false) return;
                                        practiceSetup.active = menu.lvl.showLeaderboard || !practiceSetup.active;
                                        menu.lvl.showLeaderboard = false;
                                        menu.lvl.showMods = practiceSetup.active;
                                        return;
                                    }
                                    pulsusPlus.sMenu.mods = false;
                                    pulsusPlus.sMenu.modsY = 0;
                                    pulsusPlus.sMenu.practice = !pulsusPlus.sMenu.practice;
                                    pulsusPlus.sMenu.practiceY = pulsusPlus.sMenu.practice ? 1 : 0;
                                    if(pulsusPlus.sMenu.practice && pulsusPlus.sMenu.lastSel !== clevels[menu.lvl.sel]) {
                                        pulsusPlus.sMenu.practiceSections = pulsusPlus.computeSections();
                                    } else if(pulsusPlus.sMenu.practice && pulsusPlus.sMenu.lastSel === clevels[menu.lvl.sel]) {
                                        game.mods.startPos = pulsusPlus.sMenu.practiceStart[0] === 1 ? pulsusPlus.sMenu.practiceStart[1] : pulsusPlus.sMenu.practiceSections[pulsusPlus.sMenu.practiceStart[1]].time;
                                        game.mods.endPos = pulsusPlus.sMenu.practiceEnd[0] === 1 ? pulsusPlus.sMenu.practiceEnd[1] : pulsusPlus.sMenu.practiceSections[pulsusPlus.sMenu.practiceEnd[1]].time;
                                    }
                                    if(menu.lvl.sel === false) {
                                        pulsusPlus.sMenu.practiceDisabled = true;
                                    } else {
                                        pulsusPlus.sMenu.practiceDisabled = false;
                                        pulsusPlus.sMenu.lastSel = clevels[menu.lvl.sel];
                                    }
                                    PulsusPlusWindow.allInstances.forEach((instance) => {
                                        instance.states.dragging = false;
                                    });
                                    break;
                            }
                            break;
                        case "editor":
                            if(!game.edit || (e.repeat && !bind.match(/(next|previous)bookmark/gi))) return;
                            if(!(!prmptingString.active && !prmptingColor.active)) return;
                            keybindActived = true;
                            switch(bind) {
                                case "jumpStart":
                                    if(game.playing) togglePlayback();
                                    game.time = 0;
                                    togglePlayback();
                                    break;
                                case "jumpFirst":
                                case "jumpLast":
                                    if(game.beat.length === 0) return;
                                    pulsusPlus.jumpTo(game.beat[bind.search(/first/gi) !== -1 ? 0 : game.beat.length - 1][1]);
                                    break;
                                case "addBookmark":
                                    const bookmarksOutside = game.sections.filter(section => round(section.time*1e4) !== round(game.time*1e4))
                                    if(bookmarksOutside.length !== game.sections.length) {
                                        Tt.sectionsSelected = [];
                                        game.sections = bookmarksOutside;
                                    } else {
                                        addSection();
                                    }
                                    break;
                                case "previousBookmark":
                                    const prevBookmark = game.sections
                                        .filter(section => round(section.time*1e4) < round(game.time*1e4))
                                        .sort((a, b) => b.time - a.time)[0];
                                    if(typeof prevBookmark === "undefined") return;
                                    pulsusPlus.jumpTo(prevBookmark.time);
                                    break;
                                case "nextBookmark":
                                    const nextBookmark = game.sections
                                        .filter(section => round(section.time*1e4) > round(game.time*1e4))
                                        .sort((a, b) => a.time - b.time)[0];
                                    if(typeof nextBookmark === "undefined") return;
                                    pulsusPlus.jumpTo(nextBookmark.time);
                                    break;
                                case "objType":
                                case "editMode":
                                case "holdLength":
                                case "clickMode":
                                case "timelineSnap":
                                    cycleSnap(bind, true);
                                    break;
                                case "reverseSnap":
                                    switch(game.snap) {
                                        case 1/4:
                                            game.snap = 1/12;
                                            break;
                                        case 1/8:
                                            game.snap = 1/4;
                                            break;
                                        case 1/16:
                                            game.snap = 1/8;
                                            game.timeScroll += 1/2;
                                            break;
                                        case 1/3:
                                            game.snap = 1/16;
                                            game.timeScroll += 1/4;
                                            break;
                                        case 1/6:
                                            game.snap = 1/3;
                                            game.timeScroll -= 1/4;
                                            break;
                                        case 1/12:
                                            game.snap = 1/6;
                                            break;
                                        default:
                                            game.snap = 1/4;
                                            break;
                                        }
                                    break;
                                case "selectAll":
                                    game.timelineMode = "select";
                                    if(game.editorMode === 0) {
                                        pulsusPlus.refreshBeat();
                                        game.selectedBeats = [...Array(game.beat.length).keys()];
                                    } else {
                                        pulsusPlus.refreshEffects();
                                        game.effectMultiSel = [...Array(game.effects.length).keys()];
                                    }
                                    break;
                                case "deselectAll":
                                    game.selectedBeats = [];
                                    game.effectMultiSel = [];
                                case "deleteSelected":
                                    if(game.timelineMode !== "select") return;
                                    if(game.editorMode === 0 && game.selectedBeats.length !== 0) {
                                        deleteConfirmation.activate("edit_delete_confirmNotes", [String(game.selectedBeats.length)], ()=>{
                                            const symbol = Symbol();
                                            for (const index of game.selectedBeats) {
                                                game.beat[index] = symbol;
                                            }
                                            game.beat = game.beat.filter(beat => beat !== symbol);
                                            game.selectedBeats = [];
                                        });
                                    } else if(game.effectMultiSel.length !== 0) {
                                        deleteConfirmation.activate("edit_delete_confirmEffects", [String(game.effectMultiSel.length)], ()=>{
                                            const symbol = Symbol();
                                            for (const index of game.effectMultiSel) {
                                                game.effects[index] = symbol;
                                            }
                                            game.effects = game.effects.filter(beat => beat !== symbol);
                                            game.effectMultiSel = [];
                                            game.effectMultiSelLast = !1;
                                            game.effectSelLast = !0;
                                            game.effectsTabSel = 0;
                                        });
                                    }
                                    break;
                                case "setPlacecol":
                                    if(game.editorMode !== 0) return;
                                    promptColor({
                                        hue: [game, "beatColor"],
                                        saturation: [game, "beatSaturation"],
                                        brightness: [game, "beatBrightness"],
                                        mode: HSB,
                                        title: "edit_select_item_beatColor"
                                    })
                                    break;
                                case "takePlacecol":
                                    if(game.editorMode !== 0 || game.selectedBeats.length === 0) return;
                                    game.beatColor = game.beat[game.selectedBeats[0]][11];
                                    game.beatSaturation = game.beat[game.selectedBeats[0]][16];
                                    game.beatBrightness = game.beat[game.selectedBeats[0]][17];
                                    break;
                                case "setSelectioncol":
                                    if(game.editorMode !== 0 || game.selectedBeats.length === 0) return;
                                    const selectedNotes = {
                                        time: [],
                                        holdLength: [],
                                        beatColor: [],
                                        beatSaturation: [],
                                        beatBrightness: []
                                    };    
                                    for (let i = 0; i < game.selectedBeats.length; i++) {
                                        selectedNotes.time.push([game.beat[game.selectedBeats[i]], "1"]);
                                        selectedNotes.holdLength.push([game.beat[game.selectedBeats[i]], "6"]);
                                        selectedNotes.beatColor.push([game.beat[game.selectedBeats[i]], "11"]);
                                        selectedNotes.beatSaturation.push([game.beat[game.selectedBeats[i]], "16"]);
                                        selectedNotes.beatBrightness.push([game.beat[game.selectedBeats[i]], "17"]);
                                    }
                                    promptColor({
                                        title: "edit_select_item_beatColor",
                                        mode: HSB,
                                        multiple: true,
                                        hues: selectedNotes.beatColor,
                                        saturations: selectedNotes.beatSaturation,
                                        brightnesses: selectedNotes.beatBrightness
                                    })
                                    break;
                                case "applySelectioncol":
                                    if(game.editorMode !== 0 || game.selectedBeats.length === 0) return;
                                    game.selectedBeats.forEach(index => {
                                        game.beat[index][11] = game.beatColor;
                                        game.beat[index][16] = game.beatSaturation;
                                        game.beat[index][17] = game.beatBrightness;
                                    });
                                    break;
                                case "rotateClockwise":
                                    if(game.editorMode !== 0 || game.selectedBeats.length === 0) return;
                                    mapBeat([2, 5, 8, 1, 4, 7, 0, 3, 6]);
                                    break;
                                case "rotateCounter":
                                    if(game.editorMode !== 0 || game.selectedBeats.length === 0) return;
                                    mapBeat([6, 3, 0, 7, 4, 1, 8, 5, 2]);
                                    break;
                                case "flipHorizontal":
                                    if(game.editorMode !== 0 || game.selectedBeats.length === 0) return;
                                    mapBeat([2, 1, 0, 5, 4, 3, 8, 7, 6]);
                                    break;
                                case "flipVertical":
                                    if(game.editorMode !== 0 || game.selectedBeats.length === 0) return;
                                    mapBeat([6, 7, 8, 3, 4, 5, 0, 1, 2])
                                    break;
                                case "noteFade":
                                    pulsusPlus.settings.noteFade = !pulsusPlus.settings.noteFade;
                                    break;
                                case "toggleHidden":
                                    game.mods.hidden = !game.mods.hidden;
                                    break;
                            }
                            break;
                        case "all":
                            keybindActived = true;
                            switch(bind) {
                                case "printScreen":
                                    if(e.repeat) return;
                                    if(pulsusPlus.printing !== false) return;
                                    let print = true;
                                    pulsusPlus.printing = millis();
                                    canvas.toBlob(function(blob) { 
                                            const item = new ClipboardItem({ "image/png": blob });
                                        navigator.clipboard.write([item]).catch(e => {
                                            popupMessage({
                                                type: "error",
                                                message: "PP_ERROR_PRINT-SCREEN"
                                            });
                                            print = false;
                                        }).then(() => {
                                            Timeout.set("printEnd", () => {}, Math.min(millis() - pulsusPlus.printing), 250);
                                            pulsusPlus.printing = false;
                                            if(!print) return;
                                            popupMessage({
                                                type: "success",
                                                message: "PP_SUCCESS_PRINT-SCREEN"
                                            });
                                            lowLag.play("shutter", pulsusPlus.settings.sfxVolume/100);
                                        })
                                    });
                                    break;
                                case "toggleDebug":
                                    menu.settings.debugOverlay = !menu.settings.debugOverlay;
                                    break;
                            };
                            break;
                        case "window":
                            if(e.repeat || e.location === 3) return;
                            if((screen === "click" || screen === "welcome" || menu.screen === "logo")) {
                                if(Timeout.pending("KeybindError")) return;
                                Timeout.set("KeybindError", ()=>{}, 500);
                                popupMessage({
                                    type: "error",
                                    message: "PP_ERROR_INVALID-MENU"
                                })
                                return;
                            };
                            if(!pulsusPlus.settings.keybindFocus) {
                                pulsusPlus[bind].topbarAction("toggle");
                                return;
                            };
                            keybindActived = true;
                            if(!pulsusPlus[bind].states.visible || (pulsusPlus[bind].states.visible && pulsusPlus[bind].z === PulsusPlusWindow.allInstances.filter(e => e.states.visible).map(e => e.z).sort((a, b) => b-a)[0])) {
                                pulsusPlus[bind].topbarAction("toggle");
                            };
                            if(!(pulsusPlus[bind].states.visible && pulsusPlus[bind].z === PulsusPlusWindow.allInstances.filter(e => e.states.visible).map(e => e.z).sort((a, b) => b-a)[0])) {
                                pulsusPlus[bind].z = 99;
                                PulsusPlusWindow.allInstances.sort((a,b) => a.z-b.z);
                                let newIndexes = [...Array(PulsusPlusWindow.allInstances.length).keys()].map(x => x+1);
                                PulsusPlusWindow.allInstances.map((e, i) => e.z = newIndexes[i]);
                            };
                            break;
                    };
                };
            });
            if(keybindActived) return;
            if(keybind === "Ctrl + P" && Object.values(pulsusPlus.savedKeybinds).filter(bind => bind.str === "Ctrl + P").length === 0 && localStorage.getItem("printer") === null && Math.ceil(Math.random()*3) === 3) {
                localStorage.setItem("printer", true);
                pulsusPlus.printer = true;
            }
            // FOrced binds
            // master vol
            if(e.code.match(/arrow(up|down)/gi) && e.altKey) {
                pulsusPlus.settings.masterVolume = constrain(pulsusPlus.settings.masterVolume + (e.code.search(/down/gi) === -1 ? 1 : -1) * (!e.shiftKey ? 5 : 1), 0, 100);
                if(!Timeout.pending("volRing") && !Timeout.pending("volFadeIn")) {
                    Timeout.set("volFadeIn", () => {Timeout.set("volRing", () => {}, 1250)}, 100);
                };
                Timeout.set("volRing", () => {}, 1250);
            }
            //editor
            if(game.edit && !prmptingString.active && !prmptingColor.active) {
                //playback speed
                if(e.code.match(/arrow(up|down)/gi) && e.ctrlKey && !e.repeat) {
                    game.playbackRate = constrain(round(game.playbackRate + (e.code.search(/down/gi) === -1 ? .01 : -.01) * (!e.shiftKey ? 25 : 5), 2), .25, 2);
                    pulsusPlus.playbackRate = game.playbackRate;
                    game.timeStart = millis();
                    game.playingOffset = game.time;
                }
                // scroll timeline
                if(e.code.match(/Key(A|D)$/)) {
                    pulsusPlus.scrollTimeline(e.code.match("KeyA") ? "LEFT" : "RIGHT", e.shiftKey);
                }
                // move selected beats
                if(e.code.match(/Key(J|K)$/) && game.selectedBeats.length !== 0 && game.editorMode === 0) {
                    game.selectedBeats.forEach(index => {
                        game.beat[index][1] += game.snap * (60/game.beat[game.selectedBeats[0]][9]) * (game.bpm/60) * (e.code.match(/KeyJ/) ? -1 : 1) * (e.shiftKey ? 1/game.snap : 1);
                    })
                }
            };
        };
    });
    document.addEventListener("keyup", function(e) {
        pulsusPlus.shiftKey = e.shiftKey;
        pulsusPlus.altKey = e.altKey;
        if(gameScreen === "game" && !game.edit && !game.failed && !game.paused && !game.replay.on && !game.mods.auto && !e.repeat) {
            const isLetters = e.code.search(/Key/gi) !== -1;
            for (var i = 0; i < game.keys.length; i++) {
                if (Array.isArray(game.keys[i])) {
                    for (var j = 0; j < game.keys[i].length; j++) {
                        if(e.code === game.keys[i][j]) {
                            if(isLetters) {
                                pulsusPlus.pressedLetters[i] = false;
                            } else {
                                pulsusPlus.pressedNum[i] = false;
                            };
                        }
                    }
                } else {
                    if(e.code === game.keys[i]) {
                        if(isLetters) {
                            pulsusPlus.pressedLetters[i] = false;
                        } else {
                            pulsusPlus.pressedNum[i] = false;
                        };
                    }
                };
            };
        };
        if(prmptingString.active) return;
        let keybind = pulsusPlus.keybindToString(e);
        Object.keys(pulsusPlus.savedKeybinds).forEach((bind) => {
            if(pulsusPlus.savedKeybinds[bind].active) {
                pulsusPlus.savedKeybinds[bind].str = pulsusPlus.currentKeybind;
                localStorage.setItem("PulsusPlusKeybinds", JSON.stringify(pulsusPlus.savedKeybinds));
            } else {
                if(keybind === pulsusPlus.savedKeybinds[bind].str) {
                    switch(bind) {
                        case "retry":
                            pulsusPlus.retry = null;
                            pulsusPlus.retryDown = false;
                            break;
                        case "skip":
                            pulsusPlus.skip = false;
                            break;
                    }
                };
            };
            pulsusPlus.savedKeybinds[bind].active = false
        });
    });

    document.addEventListener("contextmenu", function(e) {
        if(e.button === 2 && gameScreen === "game" && game.editorMode === 0 && game.timelineMode === "select"){
            const hovered = game.beat.map((beat, index) => [Math.abs(pulsusPlus.convertTime(game.time - beat[1])) <= game.snap / (game.timelineBPM/60) / 2 && Number.isInteger(round((round((pulsusPlus.convertTime(beat[1]) - beat[10]/1e3) / (game.snap / (game.timelineBPM/60)), 6)*game.snap) / game.snap, 6)), index]).filter(index => index[0]).map(index => index[1]);
            const deselect = hovered.filter(index => game.selectedBeats.indexOf(index) !== -1).length === hovered.length;
            if(hovered.length === 0) return;
            if(deselect) {
                game.selectedBeats = game.selectedBeats.filter(index => !hovered.includes(index));
                return;
            };
            if(e.ctrlKey) {
                game.selectedBeats.push(...hovered);
                game.selectedBeats = Array.from(new Set(game.selectedBeats));
            } else {
                game.selectedBeats = hovered;
            }
        }
    });

    document.addEventListener("click", function(e) {
        if(!pulsusPlus.sMenu.mods && !pulsusPlus.sMenu.practice) return;
        if(pulsusPlus.sMenu.practice) {
            if(pulsusPlus.sMenu.practiceHover) {
                const hovered = pulsusPlus.sMenu.practiceBtnHover.filter(b => b[0] !== -1);
                if(hovered.length !== 0) {
                    pulsusPlus.sMenu.practiceSelected = hovered[0][0];
                }
            }
        } else if(pulsusPlus.sMenu.mods) {
            Object.values(pulsusPlus.sMenu.modBtn).forEach(v => {
                v.hitboxS = null;
            });
            pulsusPlus.sMenu.currToolTip = null;
            Object.entries(pulsusPlus.sMenu.modBtn).filter(x => pulsusPlus.sMenu.modsS.includes(x[0]) && x[1].hitbox).forEach(x => {
                if(x[0] === "instantFail" && game.mods.instantFail) {
                    game.mods.instantFail = false;
                    game.mods.perfect = true;
                    pulsusPlus.sMenu.modsS[4] = "perfect";
                    pulsusPlus.sMenu.modBtn.perfect = pulsusPlus.sMenu.modBtn.instantFail;
                    return;
                } else if(x[0] === "perfect" && game.mods.perfect) {
                    game.mods.instantFail = false;
                    game.mods.perfect = false;
                    pulsusPlus.sMenu.modsS[4] = "instantFail";
                    pulsusPlus.sMenu.modBtn.instantFail = pulsusPlus.sMenu.modBtn.perfect;
                    return;
                };
                game.mods[x[0]] = !game.mods[x[0]]
            });
        }
        pulsusPlus.modMenuBtns.filter(btn => btn.pressed).forEach(btn => {
            btn.action();
            btn.pressed = false;
        })
    });

    document.addEventListener("mousedown", function(e) {
        if(pulsusPlus.sMenu.mods) {}
        Object.entries(pulsusPlus.sMenu.modSliders).filter(x => x[1].hoverBall || x[1].hoverBg).forEach(x => {
            const k = x[0];
            const v = x[1];
            v.dragStart = mouseX;
            if(v.hoverBg) {
                const sliderWidth = 7*width/24;
                if(v.hoverBg && !v.hoverBall && !v.drag) {
                    const sliderStart = width/2 - 7*width/48;
                    const sliderEnd = width/2 + 7*width/48;
                    v.dragStart = -1000;
                    const prog = (constrain(mouseX, sliderStart, sliderEnd) - sliderStart)/(sliderWidth);
                    game.mods[k] = round(v.min + (prog * (v.max - v.min)), 2);
                    v.focused = false;
                }
            };
            v.drag = true;
            v.dragEnd = mouseX;
        });
        Object.entries(pulsusPlus.sMenu.practiceSliders).filter(x => x[1].hoverBall || x[1].hoverBg).forEach(x => {
            const k = x[0];
            const v = x[1];
            v.dragStart = mouseX;
            if(v.hoverBg) {
                const sliderWidth = width/2;
                if(v.hoverBg && !v.hoverBall && !v.drag) {
                    const sliderStart = (131 * width/192) - width/4;
                    const sliderEnd = (131 * width/192) + width/4;
                    v.dragStart = -1000;
                    const prog = (constrain(mouseX, sliderStart, sliderEnd) - sliderStart)/(sliderWidth);
                    game.mods[k] = v.min + (prog * (v.max - v.min));
                    const pos = k.match(/start/gi) ? "practiceStart" : "practiceEnd";
                    pulsusPlus.sMenu[pos] = [1, game.mods[k]];
                    pulsusPlus.sMenu.practiceUsed = true; 
                    v.focused = false;
                }
            };
            v.drag = true;
            v.dragEnd = mouseX;
        });
        if(e.button !== 0) return;
        pulsusPlus.modMenuBtns.filter(btn => btn.hover).forEach(btn => {
            btn.pressed = true;
        });
    })

    document.addEventListener("mousemove", function(e) {
        if(!pulsusPlus.sMenu.mods && !pulsusPlus.sMenu.practice) return;
        Object.keys(pulsusPlus.sMenu.modBtn).filter(k => pulsusPlus.sMenu.modBtn[k].hitboxS !== null).filter(k => millis() - pulsusPlus.sMenu.modBtn[k].hitboxS <= 750).forEach(k => pulsusPlus.sMenu.modBtn[k].hitboxS = null);
        if(!Object.keys(pulsusPlus.sMenu.modBtn).some(k => pulsusPlus.sMenu.modBtn[k].hitboxS !== null)) {
            pulsusPlus.sMenu.currToolTip = null;
        };
        Object.keys(pulsusPlus.sMenu.modSliders).filter(k => pulsusPlus.sMenu.modSliders[k].hoverElementT !== null).filter(k => millis() - pulsusPlus.sMenu.modSliders[k].hoverElementT <= 750).forEach(k => pulsusPlus.sMenu.modSliders[k].hoverElementT = null);
        if(!Object.keys(pulsusPlus.sMenu.modSliders).some(k => pulsusPlus.sMenu.modSliders[k].hoverElementT !== null)) {
            pulsusPlus.sMenu.currToolTip = null;
        };
        Object.entries(pulsusPlus.sMenu.modSliders).filter(x => x[1].drag).forEach(x => {
            const k = x[0];
            const v = x[1];
            v.dragEnd = mouseX;
            const sliderWidth = 7*width/24;
            const sliderStart = width/2 - 7*width/48;
            const sliderEnd = width/2 + 7*width/48;
            const deltaDrag = v.dragEnd - v.dragStart;
            const deltaRange = v.invert ? (v.min - v.max) : (v.max - v.min);
            if(Math.abs(deltaDrag) >= sliderWidth/(deltaRange * 100)) {
                const prog = (constrain(mouseX, sliderStart, sliderEnd) - sliderStart)/(sliderWidth);
                game.mods[k] = round(v.min + (prog * (v.max - v.min)), 2);
            }
        });
        Object.entries(pulsusPlus.sMenu.practiceSliders).filter(x => x[1].drag).forEach(x => {
            const k = x[0];
            const v = x[1];
            v.dragEnd = mouseX;
            const sliderWidth = width/2;
            const sliderStart = (131 * width/192) - width/4;
            const sliderEnd = (131 * width/192) + width/4;
            const deltaDrag = v.dragEnd - v.dragStart;
            const deltaRange = v.max - v.min;
            if(Math.abs(deltaDrag) >= sliderWidth/(deltaRange * 100)) {
                const prog = (constrain(mouseX, sliderStart, sliderEnd) - sliderStart)/(sliderWidth);
                game.mods[k] = v.min + (prog * (v.max - v.min));
                const pos = k.match(/start/gi) ? "practiceStart" : "practiceEnd";
                pulsusPlus.sMenu[pos] = [1, game.mods[k]];
                pulsusPlus.sMenu.practiceUsed = true; 
            }
        });
    });

    document.addEventListener("mouseup", function(e) {
        if(pulsusPlus.sMenu.mods) {
            Object.entries(pulsusPlus.sMenu.modSliders).forEach(x => {
                const k = x[0];
                const v = x[1];
                v.hoverElementT = null;
                if(!v.hoverBall && !v.hoverBg) {
                    v.focused = false;
                };
                const sliderWidth = 7*width/24;
                const deltaRange = v.invert ? (v.min - v.max) : (v.max - v.min);
                if(v.drag) {
                    const deltaDrag = v.dragEnd - v.dragStart;
                    if(Math.abs(deltaDrag) <= sliderWidth/(deltaRange * 100)) {
                        v.focused = true;
                    }
                }
                v.drag = false;
                v.dragStart = null;
                v.dragEnd = null;
            });
        } else if(pulsusPlus.sMenu.practice) {
            Object.entries(pulsusPlus.sMenu.practiceSliders).forEach(x => {
                const k = x[0];
                const v = x[1];
                if(!v.hoverBall && !v.hoverBg) {
                    v.focused = false;
                };
                const sliderWidth = width/2;
                const deltaRange = v.max - v.min;
                if(v.drag) {
                    const deltaDrag = v.dragEnd - v.dragStart;
                    if(Math.abs(deltaDrag) <= sliderWidth/(deltaRange * 100)) {
                        v.focused = true;
                    }
                }
                v.drag = false;
                v.dragStart = null;
                v.dragEnd = null;
            });
        }
    });
});