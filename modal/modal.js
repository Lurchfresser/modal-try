let activated = false;
let preActivated = false;
let modal = document.createElement("div");
let modalContent = document.createElement("div");
let subModalContents = [];
//modal.appendChild(modalContent);


let primeSubModalColor = "crimson";
let secondSubModalColor = "#e8e513";
let depthColor0 = "black";
let depthColor1 = "blue";
let depthColor2 = "green";

for (let i = 0; i < 9; i++) {
    let tempSubModal = document.createElement("div");
    modal.appendChild(tempSubModal);
    subModalContents.push(tempSubModal);
    tempSubModal.style.backgroundColor = primeSubModalColor;
    tempSubModal.style.height = "100px";
    tempSubModal.style.width = "100px";
    tempSubModal.style.border = "3px solid";

}

modal.style.backgroundColor = "aqua";
modal.style.height = "300px";
modal.style.width = "300px";
modal.style.display = "none";
modal.style.flexWrap = "wrap";
modal.style.justifyContent = "space-between";
modal.style.position = "fixed";

window.onload = async () => await Start();

async function applyDefaultTemplate() {
    await chrome.storage.local.get(["def"]).then((result) => {
        template = templates.find(e => e.name = result), () => {
            template = templates[0]
        };
    });
    template = template ?? templates[0];
}

async function Start() {
    append();
    await chrome.storage.local.get(["templates"]).then((result) => {
        templates = result.templates;
    });
    await applyDefaultTemplate();
}

function append() {
    document.querySelector("body").appendChild(modal);
}

let mouseX = 0;
let mouseY = 0;

document.querySelector("body").onmousemove = (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
}
document.addEventListener("keydown", async (key) => {
    if ((key.key == "m" || key.key == "M") && key.ctrlKey) {
        if (activated) {
            await hideModal()
        }
        else if (!preActivated){
            preActivated = true;
        }
    } else if (key.key == "Escape" && activated) {
        await hideModal();
    } else if (key.key == "Enter" && activated) {
        await confirmChoice();
    }
});


let reviewCardContainerSet = new Set;
let disAbleMaingridIf = true;
//check if the review containing div has been loaded
let loadObserver = new MutationObserver(function(mutations) {
    /*for (let mutation of mutations){
        for (let addedNote of mutation.addedNodes){
            if (addedNote.className === "maingrid__content content" && disAbleMaingridIf){
                document.getElementsByClassName("maingrid__content content")[0].addEventListener("scroll",(e)=>{
                    scrollEventListener(e);
                });
                disAbleMaingridIf = false;
            }
        }
    }*/
    if (document.getElementsByClassName("maingrid__content content").length !== 0){
        //console.log(document.getElementsByClassName("maingrid__content content")[0]);
    }
        //mit added Note vielleicht performanter
    if (document.getElementsByClassName("content__body__main reviews-content-body").length !== 0){
        reviewContentBody = document.getElementsByClassName("content__body__main reviews-content-body")[0];
        reviewObserver.observe(reviewContentBody,
            {childList:true,subtree:true});
        loadObserver.disconnect();
    }
});
loadObserver.observe(document.documentElement,{childList:true,subtree:true});
let reviewContentBody;
let reviewObserver = new MutationObserver(function(mutations) {
    for (let mutation of mutations){
        if (mutation.addedNodes.length >= 0 || mutation.removedNodes.length >= 0){
            for (let addedNote of mutation.addedNodes){
                if (addedNote.className === "reviewcard__starrating"){
                    reviewCardContainerSet.add(addedNote.parentElement.parentElement.parentElement);
                    addedNote.parentElement.parentElement.parentElement.onmouseenter = (e)=>{selectReviewcard(e)};
                    addedNote.parentElement.parentElement.parentElement.onmouseleave = (e)=>{deSelectReviewcard(e)};
                }
            }
        }
        if (mutation.removedNodes.length >= 0){
            for (let removedNode of mutation.removedNodes){
                if (removedNode.tagName === "DIV"){
                    removedNode.firstElementChild.firstElementChild.firstElementChild.removeEventListener("onmouseenter",selectReviewcard);
                    removedNode.firstElementChild.firstElementChild.firstElementChild.removeEventListener("onmouseleave",deSelectReviewcard);
                    reviewCardContainerSet.delete(removedNode.firstElementChild.firstElementChild.firstElementChild);
                }
            }
        }
    }
});

let selectedReviewcard;

function selectReviewcard(e){
    if (preActivated) {
        selectedReviewcard = e.target;
        e.target.style.border = "1px solid black";
        //ist glaube ich nicht ganz der korrekte borderRadius
        e.target.style.borderRadius = "5px";

        e.target.onclick(startModal(e));
    }
}
function deSelectReviewcard(e){
    if (selectedReviewcard === e.target){
        selectedReviewcard = undefined;
    }
    e.target.style.borderWidth = "0px";

    e.target.removeEventListener("click",startModal(e));
}


function startModal(e){
    if (e.target.getElementsByClassName("reviewcard__reviewfooter__reply")){
        console.log(e.target);
    }
}

window.onkeydown = function (e) {
    if (activated) {
        return !(e.key == "Spacebar" || e.key == " ");
    }
};

function isUserReviewCard(target) {
    let temp = true;
    while (temp) {
        if (target.tagName === "AR-USERREVIEW-CARD") {
            return target;
        } else if (target.tagName === "BODY") {
            return false;
        } else {
            target = target.parentElement;
        }
    }
}

function lockChangeAlert() {
    if (!(document.pointerLockElement === modal) && activated) {
        hideModal();
    }
}

//document.addEventListener("pointerlockchange", lockChangeAlert, false);

// https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API#simple_example_walkthrough
// anschauen und in finaler Version besser machen
async function showModal() {
    modalSelected = 4;
    lastSelectedX = [];
    lastSelectedY = [];
    for (let i = 0; i < subModalContents.length; i++) {
        subModalContents[i].style.backgroundColor = primeSubModalColor;
    }
    subModalContents[modalSelected].style.backgroundColor = secondSubModalColor;
    modal.style.display = "flex";
    modal.style.left = (mouseX - 150).toString() + "px";
    modal.style.top = (mouseY - 150).toString() + "px";
    activated = true;
    //firefox akzeptiert nicht, später ändern
    await modal.requestPointerLock();
    showChoice();
}

async function hideModal() {
    modal.style.display = "none";
    activated = false;
    await document.exitPointerLock();
}

let modalSelected = 4;

let lastSelectedX = [];
let lastSelectedY = [];

function select(e) {

    while (lastSelectedX.length > 5) {
        lastSelectedX.pop();
    }

    while (lastSelectedY.length > 5) {
        lastSelectedY.pop();
    }
    lastSelectedX.unshift(e.movementX);
    lastSelectedY.unshift(e.movementY);


    if (lastSelectedX[0]) {
        let angle = Math.degrees(Math.atan2(average(lastSelectedY), average(lastSelectedX)));

        if (angle <= 22.5 || angle >= 337.5) {
            modalSelected = 5;
        } else if (angle <= 67.5) {
            modalSelected = 8;
        } else if (angle <= 112.5) {
            modalSelected = 7;
        } else if (angle <= 157.5) {
            modalSelected = 6;
        } else if (angle <= 202.5) {
            modalSelected = 3;
        } else if (angle <= 247.5) {
            modalSelected = 0;
        } else if (angle <= 292.5) {
            modalSelected = 1;
        } else if (angle <= 337.5) {
            modalSelected = 2;
        }

    }
    for (let i = 0; i < subModalContents.length; i++) {
        subModalContents[i].style.backgroundColor = primeSubModalColor;
    }
    subModalContents[modalSelected].style.backgroundColor = secondSubModalColor;
}

function showChoice() {
    for (let tab of Object.keys(template.tabs)) {
        subModalContents[TemplateToDiv(tab)].textContent = template.tabs[tab].header;
        switch (template.tabs[tab]["depthlevel"]) {
            case 2:
                subModalContents[TemplateToDiv(tab)].style.borderColor = depthColor2;
                break;
            case 1:
                subModalContents[TemplateToDiv(tab)].style.borderColor = depthColor1;
                break;
            case 0:
                subModalContents[TemplateToDiv(tab)].style.borderColor = depthColor0;
                break;
        }
    }
}

async function confirmChoice() {
    switch (template.tabs[divToTemplate(modalSelected)]?.["depthlevel"]) {
        case 2: {
            console.log(template);
            template = template.tabs[divToTemplate(modalSelected)];
            await showModal();
            showChoice();
            break;
        }
        case 1:
            break;
        case 0:
            break;
    }

}

let template;
let templates;

let NavIsShown = true;


Math.degrees = function (radians) {
    let temp = Math.round(radians * (180 / Math.PI));
    if (temp < 0) {
        temp = (360 + temp) % 360;
    }
    return temp;
}

function average(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function TemplateToDiv(tem) {
    switch (tem) {
        //eigene funktion um Zahlen zu "übersetzen"
        case 1:
        case "1":
            return 0;
        case 2:
        case "2":
            return 1;
        case 3:
        case "3":
            return 2;
        case 4:
        case "4":
            return 5;
        case 5:
        case "5":
            return 8;
        case 6:
        case "6":
            return 7;
        case 7:
        case "7":
            return 6;
        case 8:
        case "8":
            return 3;
        case 9:
        case "9":
            return 5;
    }
}

function divToTemplate(Div) {
    switch (Div) {
        case 0:
            return "1";
        case 1:
            return "2";
        case 2:
            return "3";
        case 3:
            return "8";
        case 4:
            return "9";
        case 5:
            return "4";
        case 6:
            return "7";
        case 7:
            return "6";
        case 8:
            return "5";

    }
}

document.addEventListener("mousemove", (e) => {
    if (document.pointerLockElement === modal) {
        select(e);
    }
})


chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
    if (request?.reason === "updated") {
        await Start();
    }
    //wenn Modal aktiv ist response senden, so dass select wieder zurück gesetzt wird
    else if (request?.reason === "new template") {
    } else if (request?.reason === "hideNav") {
        NavIsShown = !request.checked;
    } else if (request?.reason === "isNavShown") {
        sendResponse({"NavIsShown": NavIsShown});
    }
});

