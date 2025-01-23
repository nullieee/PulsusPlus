let PulsusPlusWindow;
window.addEventListener("SetupComplete", () => {
    PulsusPlusWindow = class {
        constructor(name, x, y, w, h, z, menu, options) {
            options = options || {};
            this.windowName = name;
            this.z = z;
            this.properties = [
                x,
                y,
                0,
                0
            ];
            this.propertiesDis = JSON.parse(JSON.stringify(this.properties));
            this.heightFixed = height/3.25*1.6;
            this.heightFixedDis = 1e-1;
            this.targetScale = [w, h];
            this.states = {
                visible: false,
                maximized: false,
                minimized: false,
                dragging: false,
            };
            this.topbarAction = function(action) {
                switch(action) {
                    case "toggle":
                        if(!pulsusPlus.settings.allowMultiple) {
                            PulsusPlusWindow.allInstances.filter(instance => instance.states.visible && instance.windowName !== this.windowName).forEach(instance => instance.topbarAction("close"));
                        };
                        if(this.states.visible) {
                            this.properties[2] = 1e-1;
                            this.properties[3] = 1e-1;
                            this.heightFixed = 1e-1;
                            if(!Timeout.pending(`${this.windowName}ToggleAnim`)) Timeout.set(`${this.windowName}ToggleAnim`, () => {
                                this.states.visible = false;
                            }, 50);
                        } else {
                            this.properties[2] = this.states.maximized ? width : this.targetScale[0] * width;
                            this.properties[3] = this.states.maximized ? height : this.targetScale[1] * width;
                            this.heightFixed = height/3.25*1.6;
                            this.states.visible = true;
                        };
                        break;
                    case "maximize":
                        if(this.states.maximized) {
                            this.properties[0] = JSON.parse(localStorage.getItem(`PULSUSPLUS_WINDOW-POS_${this.windowName}`))[0];
                            this.properties[1] = JSON.parse(localStorage.getItem(`PULSUSPLUS_WINDOW-POS_${this.windowName}`))[1];
                            this.properties[2] = this.targetScale[0] * width;
                            this.properties[3] = this.targetScale[1] * width;
                        } else {
                            this.properties[0] = 0;
                            this.properties[1] = 0;
                            this.properties[2] = width;
                            this.properties[3] = height - this.heightFixed/32;
                        };
                        this.states.maximized = !this.states.maximized;
                        menu.data.scroll = 0;
                        break;
                    case "minimize":
                        this.states.minimized = !this.states.minimized;
                        pulsusPlus.adjustCanvas();
                        break;
                    case "close":
                        if(this.states.visible) {
                            this.properties[2] = 1e-1;
                            this.properties[3] = 1e-1;
                            this.heightFixed = 1e-1;
                            if(!Timeout.pending(`${this.windowName}ToggleAnim`)) Timeout.set(`${this.windowName}ToggleAnim`, () => {
                                this.states.visible = false;
                            }, 50);
                        };
                        break;
                    default:
                        throw new Error(`Could not execute a topbar action for action "${action}" (in ${this.windowName})`);
                    };
                this.states.dragging = false;
            };
            this.topbarButtonsAlpha = [0, 0, 0]
            this.topbarButton = function(position, mode, color, borderRadius, draw) {
                const properties = [
                    (this.propertiesDis[0] + this.propertiesDis[2]) - (position * this.heightFixedDis/12),
                    this.propertiesDis[1],
                    this.heightFixedDis/12,
                    this.heightFixedDis/16
                ];
                const isMouseOver = hitbox(`${this.z}rcorner`, ...properties);
                this.topbarButtonsAlpha[position-1] += ease(isMouseOver ? 1 : 0, this.topbarButtonsAlpha[position-1], 0.25);
                push();
                colorMode(mode);
                rectMode(CORNER);
                noStroke();
                fill(...color, this.topbarButtonsAlpha[position-1]*100);
                rect(...properties, ...borderRadius);
                pop();
                draw();
            };
            this.menu = menu;
            this.menuHeight = 0;
            this.menuHeightDis = 0;
            this.distanceX = 0;
            this.distanceY = 0;
            this.render = function() {
                push();
                // Variables
                const x = this.propertiesDis[0];
                const y = this.propertiesDis[1];
                const w = this.propertiesDis[2];
                const h = this.propertiesDis[3];
                const ht = this.heightFixedDis;
                const borderRadius = this.states.maximized ? 0 : (w < h ? w : h) / 32;
                for(i in this.propertiesDis) {
                    this.propertiesDis[i] += ease(this.properties[i], this.propertiesDis[i], .15);
                }
                this.heightFixedDis += ease(this.heightFixed, this.heightFixedDis, .15);
                this.menuHeight = this.states.minimized || Timeout.pending(`${this.windowName}ToggleAnim`) ? 1e-1 : h*1.25;
                this.menuHeightDis += ease(this.menuHeight, this.menuHeightDis, .15);
                // Variables
                
                rectMode(CORNER);
                noStroke();
                fill(red(pulsusPlus.windowTheme.main), green(pulsusPlus.windowTheme.main), blue(pulsusPlus.windowTheme.main), pulsusPlus.settings.windowOpacity * 255/100);
                rect(x, y+ht/32, w, this.menuHeightDis/1.25, 0, 0, borderRadius, borderRadius);
                fill(pulsusPlus.windowTheme.topBar);
                rect(x, y, w, ht/16, 0, borderRadius, 0, 0);
                imageMode(CORNER);
                image(img.pulsusPlus, x+ht/256/2, y+ht/256/2, ht/16-ht/256, ht/16-ht/256);
                fill(pulsusPlus.windowTheme.text);
                textAlign(LEFT, CENTER);
                textSize(ht/16/1.25);
                fitText(`${lang("PP_NAME", langSel)} - ${lang(`PP_${this.windowName}_HEADER`, langSel)}`, x+ht/16*1.25, y+ht/16/2, w - 3*ht/12 - ht/16*1.25, ht/16);
                // Close
                this.topbarButton(1, RGB, [255, 0, 0], [0, borderRadius, 0, 0], function() {
                    stroke(pulsusPlus.windowTheme.text);
                    strokeWeight(ht/128);
                    line(x+w-ht/12 + (ht/12-ht/30)/2, y + (ht/16-ht/30)/2, x+w-ht/12 + (ht/12-ht/30)/2 + ht/30, y + (ht/16-ht/30)/2 + ht/30);
                    line(x+w-ht/12 + (ht/12-ht/30)/2, y + (ht/16-ht/30)/2 + ht/30 , x+w-ht/12 + (ht/12-ht/30)/2 + ht/30, y + (ht/16-ht/30)/2);
                });
                // Maximize
                this.topbarButton(2, RGB, [255, 255, 255], [0], function() {
                    rectMode(CORNER);
                    stroke(pulsusPlus.windowTheme.text);
                    strokeWeight(ht/128);
                    noFill();
                    square(x+w-ht/6 + (ht/12-ht/30)/2, y + (ht/16-ht/30)/2, ht/30);
                });
                // Minimize
                this.topbarButton(3, RGB, [255, 255, 255], [0], function() {
                    stroke(pulsusPlus.windowTheme.text);
                    strokeWeight(ht/128);
                    line(x+w-ht/6 + (ht/12-ht/30)/2 - ht/12, y + ht/32, x+w-ht/6 + (ht/12-ht/30)/2 - ht/12 + ht/30, y + ht/32);
                });
                this.menu.draw({
                    x: x,
                    y: y+ht/16,
                    width: w - w/32,
                    widthAbs: w,
                    height: (height / 16 * 10) * (1.6/height) * this.menuHeightDis * (this.states.maximized ? 1 : 1.25),
                    maxBarHeight: (height / 16 / 1.25) * (1.6/height) * this.menuHeightDis / (this.states.maximized ? 2 : 1.25),
                    buffer: (height / 16 * 12 / 128) * (1.6/height) * this.menuHeightDis / (this.states.maximized ? 2 : 1.25)
                }, this.z, this.menuHeightDis, ht/32);
                //fill(255, 0, 0, 100);
                //rect(x, y+ht/16, w, this.menuHeightDis/1.25-ht/32);
                pop();
            };
            this.scroll = function(direction) {
                const barHeight = (height / 16 / 1.25) * (1.6/height) * this.menuHeightDis / (this.states.maximized ? 2 : 1.25);
                const items = this.menu.pages[this.menu.data.page].items.length;
                const offset = ((height / 16 * 10) * (1.6/height) * this.menuHeightDis * (this.states.maximized ? 1 : 1.25))/8 + this.heightFixedDis/32;
                const maxHeight = ((barHeight * items) - (this.menuHeightDis/1.25 - offset) + barHeight);
                this.menu.data.scroll = constrain(this.menu.data.scroll + direction * (barHeight / maxHeight), 0, 1)
            };
            PulsusPlusWindow.allInstances.push(this);
        };
        static allInstances = [];
    };

    document.addEventListener("wheel", e => {
        const direction = e.deltaY > 0 ? 1 : -1;
        if(e.altKey) {
            pulsusPlus.settings.masterVolume = constrain(pulsusPlus.settings.masterVolume + (direction * -1) * (!e.shiftKey ? 5 : 1), 0, 100);
            if(!Timeout.pending("volRing") && !Timeout.pending("volFadeIn")) {
                Timeout.set("volFadeIn", () => {Timeout.set("volRing", () => {}, 1250)}, 100);
            };
            Timeout.set("volRing", () => {}, 1250);
            return;
        };
        if(pulsusPlus.game.sectionHitbox) {
            pulsusPlus.game.sectionScroll = constrain(pulsusPlus.game.sectionScroll + (1/pulsusPlus.game.sectionOverflow * direction), 0, 1);
        };
        if(!(pulsusPlus.altKey || PulsusPlusWindow.allInstances.some(instance => instance.states.visible && hitbox(instance.z + "rcorner", instance.properties[0], instance.properties[1], instance.properties[2], instance.heightFixed/16 + Math.max(0, instance.menuHeight/1.25 - instance.heightFixed/32)) || instance.states.dragging || instance.menu.data.dropdownHitbox))) {
            if(game.edit && !game.playing && getScroll() !== 0) {
                pulsusPlus.scrollTimeline(direction < 0 ? "LEFT" : "RIGHT", e.shiftKey);
            }
        }
        if(pulsusPlus.sMenu.mods) {
            for(let [k, v] of Object.entries(pulsusPlus.sMenu.modSliders).filter(entry => entry[1].hoverBg || entry[1].hoverBall)) {
                let min = v.invert ? v.max : v.min;
                let max = v.invert ? v.min : v.max;
                game.mods[k] = round(constrain(game.mods[k] + (e.ctrlKey ? 5 : 1) * (v.invert ? -1 : 1) * (direction/100), min, max), 2);
                v.hoverElementT = null;
                pulsusPlus.sMenu.currToolTip = null;
            }
        }
        if(pulsusPlus.sMenu.practice && pulsusPlus.sMenu.practiceHover) {
            pulsusPlus.sMenu.practiceScroll = constrain(pulsusPlus.sMenu.practiceScroll + direction, 0, pulsusPlus.sMenu.practiceScrollMax)
        }
        PulsusPlusWindow.allInstances.forEach((instance) => {
            if(hitbox(instance.z + "rcorner", instance.propertiesDis[0], instance.propertiesDis[1]+instance.heightFixed/16, instance.propertiesDis[2], instance.propertiesDis[3]-instance.heightFixed/32) && !instance.states.minimized || instance.menu.data.dropdownHitbox) {
                if(instance.menu.data.dropdownHitbox) {
                    instance.menu.pages[instance.menu.data.page].items.filter(x => x.type === "dropdown" && x?.open).forEach(dropdown => {
                        dropdown.scroll += 1/dropdown.options.length * direction;
                    })
                } else {
                    if(instance.menu.data.overflow === 0) return;
                    instance.scroll(direction);
                }
            };
        });
    })
    window.dispatchEvent(new CustomEvent("WindowClassMade"));
});