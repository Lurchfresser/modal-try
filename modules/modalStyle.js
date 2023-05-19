export default class modalClass {
    shadow = document.createElement("div");
    shadowRoot;
    modal = document.createElement("div");
    modalContent;
    subModalContents = [];
    primeSubModalColor = "crimson";
    secondSubModalColor = "#e8e513";
    depthColor0 = "black";
    depthColor1 = "blue";
    depthColor2 = "green";


    constructor(html, css) {
        this.shadow.style.display = "none";
        this.shadow.style.position  = "absolute";

        this.shadowRoot = this.shadow.attachShadow({mode: "open"});

        this.modal.innerHTML = html;
        this.shadowRoot.appendChild(this.modal);

        let modalStyleTag = document.createElement("style");
        modalStyleTag.innerHTML = css;
        this.shadowRoot.appendChild(modalStyleTag);

        $(this.modal).find(".submodalcontent")
            .each((index, subModalContent) => this.subModalContents.push(subModalContent));

        this.subModalContents.sort((a,b)=>{
            if (a.id < b.id){return -1;}
            else            {return 1}
        })
    }

    getWidth() {
        return $(this.shadow).outerWidth();
    };

    getHeight() {
        return $(this.shadow).outerHeight();
    };

    hide() {
        this.shadow.style.display = "none";
    }

    show(X, Y, modalSelected) {
        for (let i = 0; i < this.subModalContents.length; i++) {
            this.subModalContents[i].style.backgroundColor = this.primeSubModalColor;
        }
        this.subModalContents[modalSelected-1].style.backgroundColor = this.secondSubModalColor;
        this.shadow.style.display = "block";
        this.shadow.style.left = (X).toString() + "px";
        this.shadow.style.top = (Y).toString() + "px";
    }

    showChoice(template) {
        for (let tab in template.tabs) {
            this.subModalContents[parseInt(tab)-1].innerHTML = "";

            let header = document.createElement("h2");
            header.textContent = template.tabs[tab].header;
            header.style.height = "20%";
            header.style.fontSize = "16px";
            header.style.overflow = "hidden";
            this.subModalContents[parseInt(tab)-1].appendChild(header);

            let content = document.createElement("div");
            content.style.overflow = "hidden";
            let contentwrapper = document.createElement("div");
            contentwrapper.style.columnWidth = "100px";
            contentwrapper.style.height = "100%";
            content.appendChild(contentwrapper);
            switch (template.tabs[tab]["depthlevel"]) {
                case 2:
                    this.subModalContents[parseInt(tab)-1].style.borderColor = this.depthColor2;
                    break;
                case 1:
                    this.subModalContents[parseInt(tab)-1].style.borderColor = this.depthColor1;
                    break;
                case 0:
                    this.subModalContents[parseInt(tab)-1].style.borderColor = this.depthColor0;
                    contentwrapper.textContent = this.output(template.tabs[tab]);
                    this.subModalContents[parseInt(tab)-1].appendChild(content);
                    break;
            }
        }
    }

    select(modalSelected) {
        for (let i = 0; i < this.subModalContents.length; i++) {
            this.subModalContents[i].style.backgroundColor = this.primeSubModalColor;
        }
        this.subModalContents[modalSelected-1].style.backgroundColor = this.secondSubModalColor;
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

}
