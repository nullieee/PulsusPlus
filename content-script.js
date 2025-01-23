chrome.storage.local.get(["toggleExtension"])
    .then(result => {
        if(result.toggleExtension === undefined) {
            chrome.storage.local.set({toggleExtension: true});
        };
        document.dispatchEvent(new CustomEvent("toggleLoaded", {detail: result.toggleExtension ?? true}));
    });
document.addEventListener("toggleLoaded", function(e) {
    if(!e.detail) return;
    const pulsusPlusContainer = document.createElement('div');
    pulsusPlusContainer.id = "pulsus-plus"
    pulsusPlusContainer.style.display = 'none';

    const extensionURL = document.createElement("meta");
    extensionURL.id = "extension-url";
    extensionURL.name = chrome.runtime.getURL("");
    pulsusPlusContainer.appendChild(extensionURL);

    for(file of [
        "src/mathjs.min.js", "src/timeout.js", "src/lodash.min.js", "src/jszip.min.js", "src/PulsusPlusWindow.js", "src/init.js", // Important stuff
        "src/menu.js", "src/customTheme.js", "src/gameplay.js", "src/editor.js", "src/keybinds.js", "src/extras.js", // Popup windows
        "src/keybindHandler.js" // Other utilities
        //"dist/bundle.js"    
    ]) {
        let script = document.createElement("script");
        script.src = chrome.runtime.getURL(file);
        script.onload = () => {
            pulsusPlusContainer.removeChild(script);
        };
        pulsusPlusContainer.appendChild(script);
    };

    document.head.appendChild(pulsusPlusContainer);

    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundSize = "cover";

    const bgLoading = document.createElement("div");
    bgLoading.id = "bg-loading";
    bgLoading.style.backgroundColor = "#000";
    bgLoading.style.width = "100%";
    bgLoading.style.height = "100%";
    bgLoading.style.opacity = "0";
    bgLoading.style.transition = "200ms";
    document.body.appendChild(bgLoading);

});