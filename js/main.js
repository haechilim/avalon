import Util from "./util/util.js";
import NetworkManager from "./manager/networkManager.js";
import DrawManager from "./manager/DrawManager.js";
import { scrypt } from "crypto";

class Main {
    constructor() {
        this.gamedata;
        this.sequence = 0;
        this.mySeat;
        this.selectedIdentity = [];
    }

// -------------------- init 함수 -------------------------

    init() {
        Util.resize();
        DrawManager.initBoard(this.gamedata);
        DrawManager.redraw();

        this.requestJoin(() => {
            this.requestGameData(this.mySeat, () => DrawManager.updateTable(this.gamedata, this.mySeat));
            setInterval(() => this.requestGameData(this.mySeat, () => DrawManager.updateTable(this.gamedata, this.mySeat)), NetworkManager.DATA_REQUEST_INTERVAL);
        });
    }

    requestJoin(callback) {
        NetworkManager.request("/join" + location.search, (json) => {
            console.log(json);
            this.mySeat = json.seat;
            if(json.code == NetworkManager.JOIN_NO_NAME || json.code == NetworkManager.JOIN_NO_SEAT) return;
            if(callback) callback();
        });
    }

    requestGameData(mySeat, callback) {
        NetworkManager.request("/gamedata?seat=" + mySeat, (data) => {
            if(this.sequence >= data.sequence) return;
            this.sequence = data.sequence;
            this.gamedata = data;
            console.log(this.gamedata, this.sequence);
 
            if(callback) callback();
        });
    }

    updateSelect(element) {
        const id = parseInt(element.id.slice(8));
        const selectedIdentity = this.selectedIdentity;
        const selected = selectedIdentity.includes(id);

        if(!selected) selectedIdentity.push(id);
        else this.updateSelectedIdentity(id);

        DrawManager.redrawSelectIdentity(element, id, selected);
    }

    updateSelectedIdentity(id) {
        let result = [];

        for(let i = 0; i < this.selectedIdentity.length; i++) {
            if(this.selectedIdentity[i] != id) result.push(this.selectedIdentity[i]);
        }

        this.selectedIdentity = result;
    }

    bindEvents() {
        window.addEventListener("resize", () => {
            Util.resize();
        });
    
        document.querySelector(".startButton").addEventListener("click", () => {
            if(this.gamedata.players.length < NetworkManager.MIN_PLAYER) alert("최소 5명의 플레이어가 있어야 게임을 시작할 수 있습니다.");
            else if(this.gamedata.players.length != this.selectedIdentity.length) alert("플레이어 수에 맞는 역할을 선택해주세요.");
            else {
                let value = "";

                for(let i = 0; i < this.selectedIdentity.length; i++) {
                    value += this.selectedIdentity[i] + " ";
                }

                NetworkManager.request("/start" + location.search + "&selectedIdentity=" + value.trim(), (json) => {
                    if(json.code == NetworkManager.RC_SUCCESS) {
                        
                    }
                    else if(json.code == NetworkManager.RC_NO_PERMISSION) alert("방장만 게임을 시작할 수 있습니다.");
                    else if(json.code == NetworkManager.RC_NO_MERLIN) alert("게임을 시작하기 위해서는 멀린(merlin)을 반드시 포함하여야 합니다.");
                    else if(json.code == NetworkManager.RC_NO_ASSASSIN) alert("게임을 시작하기 위해서는 어쌔신(assassin)을 반드시 포함하여야 합니다.");
                });
            }
        });
    
        document.querySelector(".settingButton").addEventListener("click", () => DrawManager.showPopup(true));
    
        document.querySelector(".closeButton").addEventListener("click", () => DrawManager.showPopup(false));

        document.querySelectorAll(".popup .settingContainer .identityContainer").forEach((element) => element.addEventListener("click", () => this.updateSelect(element)));
    
        document.addEventListener("contextmenu", (event) => event.preventDefault());
    
        document.addEventListener("selectstart", (event) => event.preventDefault());
    
        document.addEventListener("dragstart", (event) => event.preventDefault());
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const main = new Main();
    main.init();
	main.bindEvents();
});