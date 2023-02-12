chrome.runtime.onInstalled.addListener(async (details)=>{
    if(details.reason === "install" || details.reason === "update"){
        await fetch('templates.json')
            .then((response) => response.json())
            .then((data) => chrome.storage.local.set(data));
    }
    if (details.reason === "update"){
        await chrome.storage.local.get(["templates"]).then((result) => {
             console.log(result);
        });
    }
});
