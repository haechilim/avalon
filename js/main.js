import Util from "./util/util.js";
import NetworkManager from "./manager/networkManager.js";
import DrawManager from "./manager/DrawManager.js";

class Main {
    constructor() {
        this.gamedata;
        this.sequence = 0;
        this.mySeat;
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

    bindEvents() {
        window.addEventListener("resize", () => {
            Util.resize();
        });
    
        document.querySelector(".startButton").addEventListener("click", () => {
            NetworkManager.request("/start" + location.search, (json) => {
               
           });
        });
    
        document.querySelector(".settingButton").addEventListener("click", () => {
            DrawManager.showPopup(true);
        });
    
        document.querySelector(".closeButton").addEventListener("click", () => {
            DrawManager.showPopup(false);
        });
    
        document.addEventListener("contextmenu", (event) => {
            event.preventDefault();
        });
    
        document.addEventListener("selectstart", (event) => {
            event.preventDefault();
        });
    
        document.addEventListener("dragstart", (event) => {
            event.preventDefault();
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const main = new Main();
    main.init();
	main.bindEvents();
});

