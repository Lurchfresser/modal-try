let sel = document.getElementById("templates");
let templateDiv = document.getElementById("template_container");
let templates;
let template;

let modalClass;
let modal;

window.onload = async () => {
    await chrome.storage.local.get(["templates"]).then((result) => {
        templates = result["templates"];
    });
    const src = chrome.runtime.getURL('modules/modalStyle.js');
    let modalImport = await import(src);
    modalClass = new modalImport.default;
    modal = modalClass.modal;

    for (let i = 0; i < templates.length; i++) {
        let option = document.createElement("option");
        option.textContent = templates[i].name;
        sel.appendChild(option);
    }
    document.querySelector("body").appendChild(modal);
    modalClass.show(150,150,4);
    modal.style.position = "inherit";
    loadTemplate();
    modal.onmouseover = (e)=>{
        modalClass.select(Array.prototype.slice.call(modal.children).indexOf(e.target));
    }
}

sel.addEventListener("change",loadTemplate)

function loadTemplate(){
    template = templates[sel.selectedIndex];
    modalClass.showChoice(template);
}