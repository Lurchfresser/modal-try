chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === "install" || details.reason === "update") {
        await fetch('templates.json')
            .then((response) => response.json())
            .then((data) => chrome.storage.local.set(data));
    }
    if (details.reason === "update") {
        await chrome.storage.local.get(["templates"]).then((result) => {
            console.log(result);
        });
    }
});

chrome.webNavigation.onHistoryStateUpdated.addListener(async details => {
    try {
        await chrome.tabs.sendMessage(details.tabId,{reason: "HistoryStateUpdated",details:details});
    }catch (e){
        throw new Error("no Content Script on History state change");
    }
}, {url: [{urlPrefix: "https://web.appradar.com/projects"}]});