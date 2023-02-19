let currentTab;
document.getElementById("changebtn").addEventListener("click", async () => {
    await chrome.action.setBadgeText({
        text: sel.options[sel.selectedIndex].text,
        tabId: currentTab.id
    });
    if (!currentTab.url.startsWith("chrome")) {
        await chrome.tabs.sendMessage(
            currentTab.id, {
                "template": sel.options[sel.selectedIndex].text,
                "reason": "new template"
            }
        )
    }
});
document.getElementById("hideNav").addEventListener("change", async e => {
    if (currentTab.url.startsWith("https://web.appradar.com/projects/") && currentTab.url.endsWith("reviews")) {
        await chrome.tabs.sendMessage(
            currentTab.id, {
                "template": sel.options[sel.selectedIndex].text,
                "reason": "hideNav",
                "checked": e.target.checked
            }
        );
        if (e.target.checked) {
            await chrome.scripting.insertCSS({
                files: ["popup/Nav.css"],
                target: {tabId: currentTab.id},
            });

        } else {
            await chrome.scripting.removeCSS({
                files: ["popup/Nav.css"],
                target: {tabId: currentTab.id},
            });
        }
    }

})
let sel = document.getElementById("sel_template");
let templates;
window.onload = async () => {
    currentTab = await getCurrentTab();
    await chrome.storage.local.get(["templates"]).then((result) => {
        templates = result["templates"];
    });
    for (let i = 0; i < templates.length; i++) {
        let option = document.createElement("option");
        option.textContent = templates[i].name;
        sel.appendChild(option);
    }
    if (!currentTab.url.startsWith("chrome")) {
        await chrome.tabs.sendMessage(
            currentTab.id, {
                "reason": "isNavShown",
            }).then(response => {
            document.getElementById("hideNav").checked = !response["NavIsShown"];
        });
    }
}

async function getCurrentTab() {
    let queryOptions = {active: true, currentWindow: true};
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

async function applySettings(tab) {
    const response = await chrome.tabs.sendMessage(tab.id,);
    console.log(response);
}