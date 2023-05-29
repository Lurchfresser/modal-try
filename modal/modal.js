let activated = false;
let preActivated = false;

let onReviewPage = window.location.href.endsWith("reviews");


let modalImport;
let modalClass;
let modal;
let shadow;

window.onload = async function importModule() {
    const src = chrome.runtime.getURL('modules/modalStyle.js');
    modalImport = await import(src);
    const css = (await chrome.storage.local.get("modalCSS"))["modalCSS"];
    const html = (await chrome.storage.local.get("modalHTML"))["modalHTML"];
    modalClass = new modalImport.default(html,css);
    modal = modalClass.modal;
    shadow = modalClass.shadow;
    if (window.location.href.endsWith("reviews")) {
        await Start();
    }
}

let defaultTemplate;

async function applyDefaultTemplate() {
    await chrome.storage.local.get(["def"]).then((result) => {
        template = templates.find(e => e.name === result), () => {
            template = templates[0]
        };
    });
    template = template ?? templates[0];
    defaultTemplate = template;
}

async function Start() {
    //no jquery Event Listeners, because in vanilla they can't get attached twice
    document.addEventListener("pointerlockchange", lockChangeAlert);

    window.addEventListener("mousemove", pointerLockMouseMove);

    window.addEventListener("keydown", modalKeyControls);

    window.addEventListener("mouseup", modalMouseControls);

    loadObserver.observe(document.documentElement, {childList: true, subtree: true});

    append();
    await chrome.storage.local.get(["templates"]).then((result) => {
        templates = result.templates;
    });
    await applyDefaultTemplate();
}

async function startFromHistoryStateChange() {
    loadObserver.observe(document.documentElement, {childList: true, subtree: true});
    activated = false;
    preActivated = false;

    modalClass = new modalImport.default;
    modal = modalClass.modal;
    shadow = modalClass.shadow;

    modalSelected = 9;

    lastSelectedX = [];
    lastSelectedY = [];

    document.addEventListener("pointerlockchange", lockChangeAlert);

    window.addEventListener("mousemove", pointerLockMouseMove);

    window.addEventListener("keydown", modalKeyControls);

    window.addEventListener("mouseup", modalMouseControls);

    await Start();
}

async function endFromHistoryStateChange() {
    loadObserver.disconnect();
    reviewObserver.disconnect();
    reviewContentBody = undefined;
    selectedReviewcard = undefined;
    userName = undefined;

    replyTextArea = undefined;

    template = undefined;
    templates = undefined;

    NavIsShown = true;

    document.removeEventListener("pointerlockchange", lockChangeAlert);
    window.removeEventListener("mousemove", pointerLockMouseMove);
    window.removeEventListener("keydown", modalKeyControls);
    window.removeEventListener("mouseup", modalMouseControls);
}

async function startFromAppChange(){
    loadObserver.disconnect();
    reviewObserver.disconnect();
    reviewContentBody = undefined;
    selectedReviewcard = undefined;
    userName = undefined;

    replyTextArea = undefined;


    loadObserver.observe(document.documentElement, {childList: true, subtree: true});
    activated = false;
    preActivated = false;
}

function append() {
    document.querySelector("body").appendChild(shadow);
}


//check if the review containing div has been loaded
let loadObserver = new MutationObserver(function (mutations) {
    if (document.getElementsByClassName("maingrid__content content").length !== 0) {
    }
    //mit added Note vielleicht performanter
    if (document.getElementsByClassName("content__body__main reviews-content-body").length !== 0) {
        reviewContentBody = document.getElementsByClassName("content__body__main reviews-content-body")[0];
        reviewObserver.observe(reviewContentBody,
            {childList: true, subtree: true});
        loadObserver.disconnect();
    }
});
let reviewContentBody;
let reviewObserver = new MutationObserver(function (mutations) {
    for (let mutation of mutations) {
        if (mutation.addedNodes.length >= 0 || mutation.removedNodes.length >= 0) {
            for (let addedNote of mutation.addedNodes) {
                if (addedNote.className === "reviewcard__starrating") {
                    addedNote.parentElement.parentElement.parentElement.onmouseenter = (e) => {
                        selectReviewcard(e)
                    };
                    addedNote.parentElement.parentElement.parentElement.onmouseleave = (e) => {
                        deSelectReviewcard(e)
                    };
                }
            }
        }
        if (mutation.removedNodes.length >= 0) {
            for (let removedNode of mutation.removedNodes) {
                //können bei Antworten auch andere Divs removed werden
                if (removedNode.tagName === "DIV" && removedNode?.firstElementChild?.firstElementChild?.firstElementChild.className === "reviewcard__container") {
                    removedNode.firstElementChild.firstElementChild.firstElementChild.removeEventListener("onmouseenter", selectReviewcard);
                    removedNode.firstElementChild.firstElementChild.firstElementChild.removeEventListener("onmouseleave", deSelectReviewcard);
                }
            }
        }
    }
});

let selectedReviewcard;
let userName;

function selectReviewcard(e) {
    if (preActivated) {
        selectedReviewcard = e.target;
        userName = $(selectedReviewcard).find(".reviewcard__username").text().trim();
        e.target.style.border = "1px solid black";
        //TODO richter border Radius finden
        e.target.style.borderRadius = "5px";
        e.target.addEventListener("click", startModal);
    }
}

function deSelectReviewcard(e) {
    if (selectedReviewcard === e.target) {
        selectedReviewcard = undefined;
        userName = undefined;
    }
    e.target.style.borderWidth = "0px";

    e.target.removeEventListener("click", startModal);
}

let pointerLockAvailable = true;
//so startModal doesnt get executed, when it is waiting for the Pointerlock to become available again
let isStartModalRunning = false;

//Antwort abschicken, Reviewcard global varaible, delete textarea
async function startModal(e) {
    let target = $(e.target);
    //if is for the cancelbutton and textarea to work without triggering the modal
    if (!(target.text().trim() === "Cancel" && target.prop("tagName") === "BUTTON")
        && !isStartModalRunning && !target.parents(".reviewcard__replywrap")[0]) {
        isStartModalRunning = true;
        let replyButton = $(this).find(".reviewcard__reviewfooter__reply:visible:contains(' Reply')")[0];
        let editReplyButton = $(this).find(".button.is-smaller.is-outlined-primary:visible")[0];
        //this is for unanswered reviews
        if (replyButton) {
            //remove and add Eventlistener, because the clickfunction would trigger the function recursivly
            this.removeEventListener("click", startModal);
            replyButton.click();
            this.addEventListener("click", startModal);
            //textarea needs 1 milisec to be loaded
        }
        //this is for answered reviews
        else if (editReplyButton) {
            this.removeEventListener("click", startModal);
            editReplyButton.click();
            this.addEventListener("click", startModal);
        }
        //waits until pointerlock is available after exiting it
        if (pointerLockAvailable instanceof Promise) {
            await pointerLockAvailable;
        }
        await handleTextarea(this);
        await positionModal(this);
        isStartModalRunning = false;
    }
}

async function handleTextarea(that){
    replyTextArea = that.querySelector("textarea");
    //if review is unopened, textarea needs a bit of time to open
    while (!replyTextArea) {
        await sleep(1);
        replyTextArea = that.querySelector("textarea");
    }
    replyTextArea.focus({preventScroll:true});
    if (!replyTextArea.value.startsWith("Hallo")) {
        if (userName !== ""){
            replyTextArea.value = "Hallo " + userName + ", ";
        }
        else replyTextArea.value = "Hallo, ";
    }
    //separate if statement, because it could already been set
    if (replyTextArea.value.startsWith("Hallo, ")){
        replyTextArea.selectionStart = replyTextArea.selectionEnd = "Hallo, ".length;
    }
    else if (replyTextArea.value.startsWith("Hallo " + userName + ", ")){
        replyTextArea.selectionStart = replyTextArea.selectionEnd = ("Hallo " + userName + ", ").length;
    }
    else if (replyTextArea.value.indexOf(", ") !== -1){
        replyTextArea.selectionStart = replyTextArea.selectionEnd = replyTextArea.value.indexOf(", ") + 2;
    }
    else {
        //set caret at the End
        replyTextArea.selectionStart = replyTextArea.selectionEnd = replyTextArea.value.length;
    }
}


// https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API#simple_example_walkthrough
// anschauen und in finaler Version besser machen
async function positionModal(reviewCard) {
    let rect = reviewCard.getBoundingClientRect();
    let viewportHeight = $(":root")[0].clientHeight;
    let X;
    let Y;
    let modalWidth = modalClass.getWidth();
    let modalHeight = modalClass.getHeight();

    function testModalPosition() {
        //                    nach rechts, an der rechten, oberen Ecke positioniert
        if (isRoomForModal(rect.left + rect.width + 5, rect.top)) {
            X = rect.left + rect.width + 5;
            Y = rect.top;
        }
        //nach links, an der oberen, linken Ecke
        else if (isRoomForModal(rect.left - modalWidth - 5, rect.top)) {
            X = rect.left - modalWidth - 5;
            Y = rect.top;
        }        //nach oben an der linken, oberen Ecke
        else if (isRoomForModal(rect.left, rect.top - modalHeight - 5)) {
            X = rect.left;
            Y = rect.top - modalHeight - 5;
        }        //nach unten an der linken, oberen Ecke
        else if (isRoomForModal(rect.left, rect.bottom + 5)) {
            X = rect.left;
            Y = rect.bottom + 5;
        }
    }

    if (!isReviewcardFullyVisible(rect)) {
        reviewCard.scrollIntoView({block: "start", inline: "end"});
    }
    rect = reviewCard.getBoundingClientRect();
    testModalPosition();
    if (X && Y) {
        await showModal(X, Y);
    } else {
        let form = $(reviewCard).find("[name='replyForm']")[0];
        scrollContentIntoView(form, $(".maingrid__content.content")[0]);
        rect = getInnerRect(form);
        testModalPosition();
        if (X && Y) {
            await showModal(X, Y);
        } else {
            replyTextArea.scrollIntoView({block: "start", inline: "end"});
            rect = replyTextArea.getBoundingClientRect();
            testModalPosition();
            if (X && Y) {
                await showModal(X, Y);
            } else {
                X = 0;
                Y = viewportHeight - modalHeight;
                await showModal(X, Y);
            }
        }
    }
}

function isReviewcardFullyVisible(rect) {
    if (rect.left - $(".maingrid__nav").outerWidth() > 0 &&
        $(":root")[0].clientWidth - rect.right > 0 &&
        rect.top - $(".maingrid__header").outerHeight() > 0 &&
        $(":root")[0].clientHeight - rect.bottom > 0
    ) {
        return true;
    }
    return false;
}

function isRoomForModal(X, Y) {
    let modalWidth = modalClass.getWidth()
    let modalHeight = modalClass.getHeight()
    //Modal ist nicht oberhalb oder links vom Viewport
    if (X > 0 && Y > 0) {
        //Modal ist nicht rechts vom Viewport
        if (modalWidth + X < $(":root")[0].clientWidth) {
            if (modalHeight + Y < $(":root")[0].clientHeight) {
                return true;
            }
        }
    }
    return false;
}


async function showModal(X, Y) {
    if (!document.pointerLockElement) {
        await shadow.requestPointerLock();
        pointerLockAvailable = false;
        modalSelected = 9;
        lastSelectedX = [];
        lastSelectedY = [];
        modalClass.show(X, Y, modalSelected, template);
        activated = true;
        modalClass.showChoice(template);
    } else {
        throw new Error("A pointerLockElement exists already");
    }
}

async function hideModal() {
    modalClass.hide();
    activated = false;
    await document.exitPointerLock();
    template = defaultTemplate;
}

let modalSelected = 9;

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
            modalSelected = 4;
        } else if (angle <= 67.5) {
            modalSelected = 5;
        } else if (angle <= 112.5) {
            modalSelected = 6;
        } else if (angle <= 157.5) {
            modalSelected = 7;
        } else if (angle <= 202.5) {
            modalSelected = 8;
        } else if (angle <= 247.5) {
            modalSelected = 1;
        } else if (angle <= 292.5) {
            modalSelected = 2;
        } else if (angle <= 337.5) {
            modalSelected = 3;
        }

    }
    modalClass.select(modalSelected);
}


let replyTextArea;

async function confirmChoice() {
    let tab = template.tabs[modalSelected];
    //check if tab exists
    if (tab?.["depthlevel"] !== undefined) {
        if (tab["depthlevel"] !== 2) {
            let caretPoisition = replyTextArea.selectionEnd;
            let reply = replyTextArea.value;
            //text gets inserted at caret position, variable, so output.length stays consistent with depthlevel 1
            let output = modalClass.output(tab)
            replyTextArea.value = reply.substr(0,caretPoisition) + output + reply.substr(caretPoisition);
            //caret is now behind the inserted text
            replyTextArea.selectionEnd = replyTextArea.selectionStart = caretPoisition + output.length;
            //so the textarea srcolls always to the caret position
            replyTextArea.blur();
            replyTextArea.focus();
            let InputEvent = new Event("input", {bubbles: true, cancelable: true});
            //so replybutton becomes clickable
            replyTextArea.dispatchEvent(InputEvent);
        } else if (tab["depthlevel"] === 2) {
            template = tab;
            modalClass.showChoice(template);
        }
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getInnerRect(Element) {
    let boundingRect = Element.getBoundingClientRect();
    let newBoundingRect = new DOMRect(boundingRect.left + parseInt($(Element).css('padding-left')),
        boundingRect.top + parseInt($(Element).css('padding-top')),
        $(Element).width(),
        $(Element).height());
    return newBoundingRect;
}

function scrollContentIntoView(Element, scrollableParent) {
    Element.scrollIntoView({block: "start", inline: "end"});
    let X = parseInt($(Element).css('padding-right'));
    let Y = parseInt($(Element).css('padding-top'));
    scrollableParent.scrollBy(-X, -Y);
}

function findParentObject(obj, containingObject) {
    let cache;
    if (Object.values(containingObject["tabs"]).includes(obj)) {
        return containingObject;
    } else {
        if (containingObject["tabs"]) {
            Object.values(containingObject["tabs"]).forEach(val => {
                if (val["tabs"]) {
                    cache = findParentObject(obj, val);
                    if (cache) {
                        return cache;
                    }
                }
            })
        }
    }
    return cache;
}


async function lockChangeAlert() {
    if (!(document.pointerLockElement === shadow) && activated) {
        pointerLockAvailable = new Promise(resolve => setTimeout(resolve, 1300));
        await hideModal();
    }
}

function pointerLockMouseMove(e) {
    if (activated) {
        select(e);
    }
}

async function modalKeyControls(keyboardEvent) {
    let key = keyboardEvent.key;
    if (activated) {
        if (key === "Enter") {
            keyboardEvent.preventDefault();
            submitReview();
        } else if (key === "Escape") {
            await hideModal();
            pointerLockAvailable = true;
        } else if (key === "Dead") {
            keyboardEvent.preventDefault();
            let temp = findParentObject(template, defaultTemplate);
            if (temp) {
                template = temp;
                modalClass.showChoice(template);
            }
        }
    } else if ((key === "m" || key === "M") && keyboardEvent.ctrlKey) {
        if (preActivated) {
            preActivated = false;
        } else if (!preActivated) {
            preActivated = true;
        }
    }
}

async function modalMouseControls(e) {
    if (activated && e.button === 0) {
        await confirmChoice();
    }
}


function submitReview() {
    let submitButton = $(selectedReviewcard).find("button:visible:contains('Reply to this review')");
    //$(submitButton).trigger("click");
}


async function handleHistoryStateChange() {
    let url = window.location.href;
    if (onReviewPage) {
        if (!url.endsWith("reviews")) {
            await endFromHistoryStateChange();
        }
        else {
            console.log(reviewContentBody);
            startFromAppChange();
        }
    } else {
        if (url.endsWith("reviews")) {
            await startFromHistoryStateChange();
        }
    }
    onReviewPage = window.location.href.endsWith("reviews");
}

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
    if (request?.reason === "new template") {
    } else if (request?.reason === "hideNav") {
        NavIsShown = !request.checked;
    } else if (request?.reason === "isNavShown") {
        sendResponse({"NavIsShown": NavIsShown});
    } else if (request?.reason === "HistoryStateUpdated") {
        await handleHistoryStateChange();
    }
});