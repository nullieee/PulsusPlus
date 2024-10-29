const checkmark = document.getElementById("toggle-extension");
chrome.storage.local.get(["toggleExtension"])
    .then(result => {
        if(result.toggleExtension === undefined) {
            chrome.storage.local.set({toggleExtension: true});
        };
        checkmark.checked = result.toggleExtension ?? true;
        checkmark.style.opacity = 1;
    });
checkmark.addEventListener("change", (e) => {
    chrome.storage.local.set({toggleExtension: e.target.checked})
});