chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === "install" || details.reason === "update") {
        await fetch('templates.json')
            .then((response) => response.json())
            .then((data) => chrome.storage.local.set(data));
    }
    if (details.reason === "update") {
        await chrome.storage.local.get(["templates"]).then((result) => {
        });
        //sets modal HTML to Storage, so it can be requested from anywhere
        //TODO rewrite to be cleaner
        await fetch('modules/shadow_root/modal.html')
            .then(function (response) {
                // The API call was successful!
                return response.text();
            })
            .then(html => chrome.storage.local.set({modalHTML: html}));
        //sets modal CSS to Storage, so it can be requested from anywhere
        //TODO rewrite to be cleaner
        await fetch('modules/shadow_root/modal.css')
            .then(function (response) {
                // The API call was successful!
                return response.text();
            })
            .then((data) => chrome.storage.local.set({modalCSS: data}));
    }
});

chrome.webNavigation.onHistoryStateUpdated.addListener(async details => {
    try {
        await chrome.tabs.sendMessage(details.tabId, {reason: "HistoryStateUpdated", details: details});
    } catch (e) {
        throw new Error("no Content Script on History state change");
    }
}, {url: [{urlPrefix: "https://web.appradar.com/projects"}]});