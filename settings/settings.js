let sel = document.getElementById("templates");
let templateDiv = document.getElementById("template_container");
let templates;
let template;
let defaultTemplate;

let modalClass;
let modal;
let shadow;

window.onload = async () => {
    await getTemplates();
    await applyDefaultTemplate();
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

async function applyDefaultTemplate() {
    await chrome.storage.local.get(["def"]).then((result) => {
        template = templates.find(e => e.name === result), () => {
            template = templates[0]
        };
    });
    template = template ?? templates[0];
    defaultTemplate = template;
}

async function getModules() {
    const src = chrome.runtime.getURL('modules/modalStyle.js');
    let modalImport = await import(src);
    const css = (await chrome.storage.local.get("modalCSS"))["modalCSS"];
    const html = (await chrome.storage.local.get("modalHTML"))["modalHTML"];
    modalClass = new modalImport.default(html, css);
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
    modalClass.show(0, 0, 9, template);
    shadow.style.position = "inherit";
    loadTemplate();
    for (let subModalContent of modalClass.subModalContents) {
        let id = parseInt(subModalContent.id);
        //for interacting with the tab and seeing the color
        subModalContent.onmouseover = (e) => {
            modalClass.select(id)
        };
        //for adding the text to the test-textarea or going down 1 tab
        subModalContent.onclick = (e) => {
            if (template.tabs[id]["depthlevel"] === 2) {
                template = template.tabs[id];
                modalClass.showChoice(template);
            } else {
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
    document.addEventListener("click", (e) => {
        hideContextMenu();
    })
    document.getElementById("contextMenuEdit").onclick = (e) => {
        if (template.tabs?.[contextMenuTarget.id] === undefined) {
            template.tabs[contextMenuTarget.id] = {
                depthlevel: 0,
                text: "This is a new template",
                header: "new template"
            }
        }
        editedTab = template.tabs[contextMenuTarget.id];
        StartEditingTemplate();
    }
}

let contextmenuActivated = false;
let contextMenuTarget;

function showContextMenu(e) {
    document.getElementById("contextMenu").style.display = "block";
    document.getElementById("contextMenu").style.left = e.x + "px";
    document.getElementById("contextMenu").style.top = e.y + "px";
    contextmenuActivated = true;
    contextMenuTarget = $(e.target).closest(".submodalcontent")[0];
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

function StartEditingTemplate() {
    //for disabling the controls on the modal
    modal.style.pointerEvents = "none";
    modalClass.select(null);

    //changes the color of the modal
    document.getElementById("body_color").addEventListener("change",updateSubmodalcolor,false);
    document.getElementById("body_color").addEventListener("input",updateSubmodalcolor,false);

    document.getElementById("header").value = editedTab.header;
    document.getElementById("header").disabled = false;
    document.getElementById("depthlevel_select").disabled = false;
    document.getElementById("depthlevel_select").value = editedTab["depthlevel"].toString();
    document.getElementById("body_color").disabled = false;
    document.getElementById("body_color").value = editedTab["bodyColor"];
    if (editedTab["depthlevel"] === 0) {
        textareaEdit.value = editedTab.text;
        textareaEdit.disabled = false;
    } else if (editedTab["depthlevel"] === 1) {
        textareaEdit.value = JSON.stringify(editedTab["texts"]);
        textareaEdit.disabled = false;
    } else if (editedTab["depthlevel"] === 2) {
        textareaEdit.value = "";
        textareaEdit.disabled = true;
    }
}

function updateSubmodalcolor(){
    contextMenuTarget.style.backgroundColor = document.getElementById("body_color").value;
}

document.getElementById("submitChange").addEventListener("click", submitTemplateChange);

document.getElementById("discardChange").addEventListener("click", discardTemplateChange);

async function submitTemplateChange() {
    if (parseInt(depthlevelSelect.value) !== editedTab.depthlevel) {
        delete editedTab["text"];
        delete editedTab["texts"];
        delete editedTab["tabs"];
        editedTab.depthlevel = parseInt(depthlevelSelect.value);
    }

    editedTab.header = document.getElementById("header").value;

    if (editedTab["depthlevel"] === 0) {
        editedTab.text = textareaEdit.value;
    } else if (editedTab["depthlevel"] === 1) {
        try {
            let input = JSON.parse(textareaEdit.value);
            if (Array.isArray(input)) {
                let temp = true;
                for (let myVar of input) {
                    if (typeof myVar !== 'string') {
                        temp = false;
                    }
                }
                if (temp) {
                    editedTab["texts"] = input;
                } else {
                    alert("Ungültiges Format");
                }
            }
        } catch (ex) {
            alert("Ungültiges Format");
        }
    } else if (editedTab["depthlevel"] === 2) {
        editedTab["tabs"] = {};
    }

    resetEdditing();

    await chrome.storage.local.set({"templates": templates});
    modalClass.showChoice(template)
}

function resetEdditing() {
    modal.style.pointerEvents = "auto";

    document.getElementById("body_color").value = "#000000";

    textareaEdit.value = "";
    textareaEdit.disabled = true;
    document.getElementById("depthlevel_select").disabled = true;
    document.getElementById("depthlevel_select").value = "u";
    document.getElementById("header").disabled = true;
    document.getElementById("header").value = "";
    editedTab = undefined;
}

function discardTemplateChange() {
    if (confirm("Alle Änderungen verwerfen?")) {
        resetEdditing()
    }
}

let depthlevelSelect = document.getElementById("depthlevel_select");

depthlevelSelect.addEventListener("change", changeTemplateDephtlevel);

function changeTemplateDephtlevel(e) {
    let newDephtLevel = parseInt(depthlevelSelect.value);
    if (newDephtLevel !== editedTab.depthlevel) {
        switch (newDephtLevel) {
            case 0:
                textareaEdit.value = "";
                textareaEdit.disabled = false;
                break;
            case 1:
                textareaEdit.value = '["",""]';
                textareaEdit.disabled = false;
                break;
            case 2:
                textareaEdit.value = "";
                textareaEdit.disabled = true;
                break;

        }
    } else {
        StartEditingTemplate();
    }
}

$("#test").on("click", () => {
    for (let testtemplate of templates) {
        addColor(testtemplate);
    }

    function addColor(testtemplate) {
        testtemplate["bodyColor"] = "crimson";
        if (testtemplate["depthlevel"] === 2) {
            Object.values(testtemplate["tabs"]).forEach(addColor)
        }
    }

    console.log(JSON.stringify(templates));
})
