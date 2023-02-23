export default class modal {

    modal;
    modalContent;
    subModalContents = [];
    primeSubModalColor = "crimson";
    secondSubModalColor = "#e8e513";
    depthColor0 = "black";
    depthColor1 = "blue";
    depthColor2 = "green";


    constructor() {

        this.modal = document.createElement("div");
        this.modalContent = document.createElement("div");

        for (let i = 0; i < 9; i++) {
            this.tempSubModal = document.createElement("div");
            this.modal.appendChild(this.tempSubModal);
            this.subModalContents.push(this.tempSubModal);
            this.tempSubModal.style.backgroundColor = this.primeSubModalColor;
            this.tempSubModal.style.height = "100px";
            this.tempSubModal.style.width = "100px";
            this.tempSubModal.style.border = "3px solid";
            this.tempSubModal.style.boxSizing = "border-box";
            this.tempSubModal.id = this.divToTemplate(i);
        }

        this.modal.style.backgroundColor = "aqua";
        this.modal.style.height = "300px";
        this.modal.style.width = "300px";
        this.modal.style.display = "none";
        this.modal.style.flexWrap = "wrap";
        this.modal.style.justifyContent = "space-between";
        this.modal.style.position = "fixed";
        this.modal.style.boxSizing = "inherit";

    }

    hide() {
        this.modal.style.display = "none";
    }

    show(X, Y, modalSelected) {
        for (let i = 0; i < this.subModalContents.length; i++) {
            this.subModalContents[i].style.backgroundColor = this.primeSubModalColor;
        }
        this.subModalContents[modalSelected].style.backgroundColor = this.secondSubModalColor;
        this.modal.style.display = "flex";
        this.modal.style.left = (X).toString() + "px";
        this.modal.style.top = (Y).toString() + "px";
    }

    showChoice(template) {
        for (let tab of Object.keys(template.tabs)) {
            this.subModalContents[this.templateToDiv(tab)].textContent = template.tabs[tab].header;
            switch (template.tabs[tab]["depthlevel"]) {
                case 2:
                    this.subModalContents[this.templateToDiv(tab)].style.borderColor = this.depthColor2;
                    break;
                case 1:
                    this.subModalContents[this.templateToDiv(tab)].style.borderColor = this.depthColor1;
                    break;
                case 0:
                    this.subModalContents[this.templateToDiv(tab)].style.borderColor = this.depthColor0;
                    break;
            }
        }
    }

    select(modalSelected) {
        for (let i = 0; i < this.subModalContents.length; i++) {
            this.subModalContents[i].style.backgroundColor = this.primeSubModalColor;
        }
        this.subModalContents[modalSelected].style.backgroundColor = this.secondSubModalColor;
    }


    output(tab) {
        if (tab["depthlevel"] === 0) {
            return tab.text;
        } else if (tab["depthlevel"] === 1) {
            return tab["texts"][Math.floor(Math.random() * tab["texts"].length)];
        } else if (tab["depthlevel"] === 2) {
            return tab.tabs;
        }
    }


    templateToDiv(tem) {
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
                return 4;
        }
    }

    divToTemplate(Div) {
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
}
