let sel = document.getElementById("templates");
let templateDiv = document.getElementById("template_container");
let templates;
let template;

let modalClass;
let modal;
let shadow;

window.onload = async () => {
    await getTemplates();
    await getModules();
    buildSelection();
    buildModal();
    buildContextMenu();
}

async function getTemplates() {
    await chrome.storage.local.get(["templates"]).then((result) => {
        templates = result["templates"];
    });
}

async function getModules() {
    const src = chrome.runtime.getURL('modules/modalStyle.js');
    let modalImport = await import(src);
    const css = (await chrome.storage.local.get("modalCSS"))["modalCSS"];
    const html = (await chrome.storage.local.get("modalHTML"))["modalHTML"];
    modalClass = new modalImport.default(html,css);
    modal = modalClass.modal;
    shadow = modalClass.shadow;
}

function buildSelection() {
    for (let i = 0; i < templates.length; i++) {
        let option = document.createElement("option");
        option.textContent = templates[i].name;
        sel.appendChild(option);
    }
    sel.addEventListener("change", loadTemplate);
}

function buildModal() {
    document.getElementById("template_container").appendChild(shadow);
    modalClass.show(0, 0, 9);
    shadow.style.position = "inherit";
    loadTemplate();
    for (let subModalContent of modalClass.subModalContents){
        let id = parseInt(subModalContent.id);
        //for interacting with the tab and seeing the color
        subModalContent.onmouseover = (e)=>{modalClass.select(id)};
        //for adding the text to the test-textarea or going down 1 tab
        subModalContent.onclick = (e)=>{
            if (template.tabs[id]["depthlevel"] === 2){
                template = template.tabs[id];
                modalClass.showChoice(template);
            }
            else {
                document.getElementById("textarea_test").value += modalClass.output(template.tabs[id]);
            }
        }
    }
    modal.oncontextmenu = (e) => {
        e.preventDefault();
        showContextMenu(e);
    }
}

function buildContextMenu() {
    document.addEventListener("click", () => {
        hideContextMenu();
    })
    document.getElementById("contextMenuEdit").onclick = (e)=>{
        if (template.tabs?.[contextMenuTarget.id]) {
            editedTab = template.tabs[contextMenuTarget.id];
        }
        else {editedTab = undefined;}
        editTemplate();
    }
}

let contextmenuActivated = false;
let contextMenuTarget;

function showContextMenu(e) {
    document.getElementById("contextMenu").style.display = "block";
    document.getElementById("contextMenu").style.left = e.x + "px";
    document.getElementById("contextMenu").style.top = e.y + "px";
    contextmenuActivated = true;
    contextMenuTarget = e.target;
}

function hideContextMenu() {
    contextmenuActivated = false;
    document.getElementById("contextMenu").style.display = "none";
}


function loadTemplate() {
    template = templates[sel.selectedIndex];
    modalClass.showChoice(template);
}

let editedTab;
let textareaEdit = document.getElementById("textarea_edit");
function editTemplate() {
    if (editedTab) {
        if (editedTab["depthlevel"] === 0) {
            textareaEdit.value = editedTab.text;
        }else if (editedTab["depthlevel"] === 1) {
            textareaEdit.value = JSON.stringify(editedTab["texts"]);
        }
    }
}


document.getElementById("submitChange").addEventListener("click",submitChange);
async function submitChange(){
    if (editedTab){
        if (editedTab["depthlevel"] === 0){
            editedTab.text = textareaEdit.value;
        }
        else if (editedTab["depthlevel"] === 1){
            try {
                let input = JSON.parse(textareaEdit.value);
                if (Array.isArray(input)){
                    let temp = true;
                    for (let myVar of input){
                        if (typeof myVar !== 'string'){
                            temp = false;
                        }
                    }
                    if (temp){
                        editedTab["texts"] = input;
                    }
                    else {
                        alert("Ungültiges Format");
                    }
                }
            }
            catch (ex){
                alert("Ungültiges Format");
            }
        }
        await chrome.storage.local.set({"templates":templates});
    }
}