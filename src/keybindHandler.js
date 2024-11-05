window.addEventListener("WindowClassMade", function(){
    pulsusPlus.cycleOrder = Object.keys(pulsusPlus).filter(key => pulsusPlus[key] instanceof PulsusPlusWindow).sort((a, b) => pulsusPlus[a].z - pulsusPlus[b].z);
    document.addEventListener("keydown", function(e) {
        pulsusPlus.shiftKey = e.shiftKey;
        if(e.code === "Backspace" && gameScreen === "game" && !game.edit && !game.failed && !game.paused) {
            pulsusPlus.stopRetry = true;
        }
        const keybind = pulsusPlus.keybindToString(e);
        if(!Object.values(pulsusPlus.savedKeybinds).map(v => v.str).includes(keybind) && gameScreen === "game" && (game.edit || (!game.edit && !game.failed && !game.paused && !game.replay.on && !game.mods.auto && !e.repeat))) {
            for(let i = 0; i < game.keys.length; i++) {
                if(game.edit && game.editorMode === 0 && !e.repeat && !prmptingString.active && !prmptingColor.active && game.menuSize <= .1) {
                    if(e.code.search(/(Digit|Numpad(?![A-Za-z]))/) !== -1 && e.code.search(/0/) === -1) {
                        let key = [6, 7, 8, 3, 4, 5, 0, 1, 2][parseInt(e.code.substring(e.code.search(/Numpad/) === -1 ? 5 : 6))-1];
                        if(game.beat.some(beat => beat[0] === key && beat[1] === round((game.time - game.timelineOffset*game.bpm/60/1e3) * (1/game.snap) * (game.timelineBPM / game.bpm)) / (1/game.snap * (game.timelineBPM / game.bpm)) + game.timelineOffset * game.bpm/60/1e3)) {
                            if(game.timelineMode === "scroll") {
                                game.beat = game.beat.filter(beat => !(beat[0] === key && beat[1] === round((game.time - game.timelineOffset*game.bpm/60/1e3) * (1/game.snap) * (game.timelineBPM / game.bpm)) / (1/game.snap * (game.timelineBPM / game.bpm)) + game.timelineOffset * game.bpm/60/1e3));
                            } else {
                                const hovered = game.beat.map((beat, index) => [beat[0] === key && beat[1] === round((game.time - game.timelineOffset*game.bpm/60/1e3) * (1/game.snap) * (game.timelineBPM / game.bpm)) / (1/game.snap * (game.timelineBPM / game.bpm)) + game.timelineOffset * game.bpm/60/1e3, index]).filter(index => index[0]).map(index => index[1]);
                                const deselect = hovered.filter(index => game.selectedBeats.indexOf(index) !== -1).length === hovered.length;
                                if(!e.ctrlKey) {
                                    game.selectedBeats.push(...hovered);
                                    game.selectedBeats = Array.from(new Set(game.selectedBeats));
                                } else {
                                    game.selectedBeats = hovered;
                                }
                                if(deselect) {
                                    game.selectedBeats = game.selectedBeats.filter(index => !hovered.includes(index));
                                }
                            }
                        } else if(game.timelineMode === "scroll") {
                            game.beat.push([
                                key,
                                round((game.time - game.timelineOffset*game.bpm/60/1e3) * (1/game.snap) * (game.timelineBPM / game.bpm)) / (1/game.snap * (game.timelineBPM / game.bpm)) + game.timelineOffset * game.bpm/60/1e3,
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
                const isLetters = e.code.includes("Key");
                if(Array.isArray(game.keys[i])) {
                    for(let j = 0; j < game.keys[i].length; j++) {
                        if(e.code === game.keys[i][j]) {
                            pulsusPlus.game.kps.push(millis());
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
        }
        if(keybind === "F2" && !menu.lvl.loading && menu.screen === "lvl" && gameScreen === "menu") {
            menu.lvl.sel = Math.floor(clevels.length * Math.random());
            
            const topOffset = height / 16 + height / 24;
            const cardHeight = height / 12;
            const fixedHeight = height - topOffset;
            const lvls = clevels.length;
            const lvlIndex = menu.lvl.sel;

            menu.lvl.scroll = constrain(
                (11 * fixedHeight * (-cardHeight * ((2*lvlIndex) + 1) + fixedHeight))
              / (24 * (fixedHeight - (cardHeight * lvls)))
            , 0, height - (height / 16 + height / 24 + (height - (height / 16 + height / 24)) / 12));

            lowLag.play("scroll", pulsusPlus.settings.sfxVolume/100);
        }
        if((keybind === "ArrowUp" || keybind === "ArrowDown") && !menu.lvl.loading && menu.screen === "lvl" && gameScreen === "menu") {
            const direction = keybind.search(/up/gi) !== -1 ? -1 : 1;
            if(menu.lvl.sel === false || (menu.lvl.sel === 0 && direction === -1) || (menu.lvl.sel === clevels.length - 1 && direction === 1)) return;
            menu.lvl.sel = constrain(menu.lvl.sel + direction, 0, clevels.length - 1);
            
            const topOffset = height / 16 + height / 24;
            const cardHeight = height / 12;
            const fixedHeight = height - topOffset;
            const lvls = clevels.length;
            const lvlIndex = menu.lvl.sel;
            menu.lvl.scroll = constrain(constrain(
                menu.lvl.scroll,

                (11 * fixedHeight * (fixedHeight - cardHeight * (lvlIndex + 1)) )
              / (12 * (fixedHeight - (cardHeight * lvls))),

              (11 * fixedHeight * lvlIndex * cardHeight)
              / (12 * ((cardHeight * lvls) - fixedHeight))
            ), 0, height - (height / 16 + height / 24 + (height - (height / 16 + height / 24)) / 12));
            
            lowLag.play("scroll", pulsusPlus.settings.sfxVolume/100);
        } else if (keybind === "Enter" && !prmptingString.active) {
            if(menu.lvl.sel === false || e.repeat) return;
            const state = getLevelDownloadState(clevels[menu.lvl.sel])
            if(state === 0) {
                newGrabLevel(clevels[menu.lvl.sel], "id", true);
            } else if(state === 2 && !menu.lvl.loading && gameScreen !== "game") {
                loadLevel(menu.lvl.sel);
            };
        }
        if(pulsusPlus.settings.cycleArrowKeys && e.altKey && e.key.search(/(arrowup|arrowdown)/gi) !== -1) {
            let active = 0;
            pulsusPlus.cycleOrder.forEach((window) => {
                if(pulsusPlus[window].states.visible) active++;
            });
            if(active > 1 && !Timeout.pending("CycleAnimation")) {
                if(Timeout.pending("KeybindError")) return;
                Timeout.set("KeybindError", ()=>{}, 500);
                popupMessage({
                    type: "error",
                    message: "PP_ERROR_ARROW-CYCLE"
                });
                return;
            }
            let done = false;
            pulsusPlus.cycleOrder.forEach((window) => {
                if(pulsusPlus[window].states.visible && !done && !Timeout.pending("CycleAnimation")) {
                    Timeout.set("CycleAnimation", ()=>{}, 100);
                    pulsusPlus[window].topbarAction("toggle");
                    pulsusPlus[pulsusPlus.cycleOrder[Math.abs(
                        (pulsusPlus.cycleOrder.indexOf(window) + (e.key.search(/up/gi) !== -1 ? 1 : (pulsusPlus.cycleOrder.indexOf(window)-1<0 ? -pulsusPlus.cycleOrder.length+1 : -1)))
                        % pulsusPlus.cycleOrder.length)
                    ]].topbarAction("toggle");
                    done = true;
                }
            });
        }
        if(Object.values(pulsusPlus.savedKeybinds).some((bind) => bind.active)) {
            pulsusPlus.currentKeybind = keybind;
        } else {
            Object.keys(pulsusPlus.savedKeybinds).forEach((bind) => {
                if(keybind === pulsusPlus.savedKeybinds[bind].str) {
                    switch(bind) {
                        case "retry":
                            if(gameScreen === "game" && (game.disMode === 1 || game.disMode === 2) && !e.repeat && !game.edit) {
                                if(Timeout.pending("retry")) {
                                    pulsusPlus.retryDown = true;
                                    return;
                                }
                                pulsusPlus.retry = millis();
                            }
                            break;
                        case "skip":
                            if(gameScreen === "game" && game.disMode === 1 && !e.repeat && !game.edit && !game.paused && !Timeout.pending("skipStart") && !Timeout.pending("skipEnd") && !pulsusPlus.skipAuto && (game.beat.length !== 0 ? game.beat[game.beat.length - 1][1] > game.time : false)) {
                                pulsusPlus.skip = true;
                            };
                            break;
                        default:
                            if(e.repeat) return;
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
                            if(!pulsusPlus[bind].states.visible || (pulsusPlus[bind].states.visible && pulsusPlus[bind].z === PulsusPlusWindow.allInstances.filter(e => e.states.visible).map(e => e.z).sort((a, b) => b-a)[0])) {
                                pulsusPlus[bind].topbarAction("toggle");
                            };
                            if(!(pulsusPlus[bind].states.visible && pulsusPlus[bind].z === PulsusPlusWindow.allInstances.filter(e => e.states.visible).map(e => e.z).sort((a, b) => b-a)[0])) {
                                pulsusPlus[bind].z = 99;
                                PulsusPlusWindow.allInstances.sort((a,b) => a.z-b.z);
                                let newIndexes = [...Array(PulsusPlusWindow.allInstances.length).keys()].map(x => x+1);
                                PulsusPlusWindow.allInstances.map((e, i) => e.z = newIndexes[i]);
                            };
                    };
                };
            });
            if(keybind === "Ctrl + P" && Object.values(pulsusPlus.savedKeybinds).filter(bind => bind.str === "Ctrl + P").length === 0 && localStorage.getItem("printer") === null && Math.ceil(Math.random()*3) === 3) {
                localStorage.setItem("printer", true);
                pulsusPlus.printer = true;
            }
        };
    });
    document.addEventListener("keyup", function(e) {
        pulsusPlus.shiftKey = e.shiftKey;
        if(gameScreen === "game" && !game.edit && !game.failed && !game.paused && !game.replay.on && !game.mods.auto && !e.repeat) {
            const isLetters = e.code.includes("Key");
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
        const keybind = pulsusPlus.keybindToString(e);
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
            const hovered = game.beat.map((beat, index) => [Math.abs(pulsusPlus.convertTime(game.time - beat[1])) <= game.snap / (game.timelineBPM/60) / 2 && (round(pulsusPlus.convertTime(beat[1]) / (game.snap / (game.timelineBPM/60)), 6)*game.snap) % game.snap === 0, index]).filter(index => index[0]).map(index => index[1]);
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
    })
});