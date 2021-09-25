import NetworkUtil from "./networkManager.js";

class DrawManager {
    constructor() {}

    static initBoard(gamedata) {
        this.redraw(gamedata);
        this.expeditionNomalAll();
        this.showRejectCountMarkAll(false);
    }

    static updateTable(gamedata, mySeat) {
        this.redraw(gamedata, mySeat);
        this.showSeatAll(false);
        this.updatePlayer(gamedata);
    }

    static redraw(gamedata, mySeat) {
        this.redrawPlayers(gamedata);
        this.redrawBoard(gamedata);
        this.redrawButton(gamedata, mySeat);
    }
    
    static redrawPlayers(gamedata) {
        let html = '';
        let profile;
        let profileImg;
        let name;
    
        for(let i = 0; i < NetworkUtil.MAX_PLAYER; i++) {
            name = "nickname";
            profile = "questionMark";
            profileImg = "questionMark";
    
            if(gamedata) {
                for(let playerIndex = 0; playerIndex < gamedata.players.length; playerIndex++) {
                    let player = gamedata.players[playerIndex];
    
                    if(player.seat == i) name = player.name;
                }
            }
    
            html += 
            '<div class="player seat' + i + '">' +
                '<div class="identity opacity">' +
                    '<img class="' + profile + '" src="image/' + profileImg + '.png" alt="">' +
                '</div>' +
                '<div class="nickname">' + name + '</div>' +
            '</div>';
        }
    
        document.querySelector(".playerContainer").innerHTML = html;
    }
    
    static redrawBoard(gamedata) {
        let quests = [ 2, 3, 4, 3, 4 ];
        let goodCount = 0;
        let evilCount = 0;
        let isTowFailsRequired = false;
        
        if(gamedata) {
            const playerCount = gamedata.players.length;
    
            setBackgroundImage(playerCount);
    
            switch(playerCount) {
                case 5:
                    quests = [ 2, 3, 2, 3, 3 ];
                    goodCount = 3;
                    evilCount = 2;
                    break;
    
                case 6:
                    quests = [ 2, 3, 4, 3, 4 ];
                    goodCount = 4;
                    evilCount = 2;
                    break;
    
                case 7:
                    quests = [ 2, 3, 3, 4, 4 ];
                    isTowFailsRequired = true;
                    goodCount = 4;
                    evilCount = 3;
                    break;
    
                case 8:
                    quests = [ 3, 4, 4, 5, 5 ];
                    isTowFailsRequired = true;
                    goodCount = 5;
                    evilCount = 3;
                    break;
    
                case 9:
                    quests = [ 3, 4, 4, 5, 5 ];
                    isTowFailsRequired = true;
                    goodCount = 6;
                    evilCount = 3;
                    break;
    
                case 10:
                    quests = [ 3, 4, 4, 5, 5 ];
                    isTowFailsRequired = true;
                    goodCount = 6;
                    evilCount = 4;
                    break;
            }
        }
        
        let html = 
        '<div class="expeditionResultContainer">' +
            '<div class="expeditionResult quest1 drop-shadow-light">' + quests[0] + '</div>' +
            '<div class="expeditionResult quest2 drop-shadow-light">' + quests[1] + '</div>' +
            '<div class="expeditionResult quest3 drop-shadow-light">' + quests[2] + '</div>' +
            '<div class="expeditionResult quest4 drop-shadow-light">' +
                '<div>' + quests[3] + '</div>' +
                '<div class="twoFailText">' + TowFailsRequired() + '</div>' +
            '</div>' +
            '<div class="expeditionResult quest5 drop-shadow-light">' + quests[4] + '</div>' +
        '</div>' +
    
        '<div class="rejectCountContainer">' +
            '<div class="rejectCount rejectCount1 drop-shadow-light">1</div>' +
            '<div class="rejectCount rejectCount2 drop-shadow-light">2</div>' +
            '<div class="rejectCount rejectCount3 drop-shadow-light">3</div>' +
            '<div class="rejectCount rejectCount4 drop-shadow-light">4</div>' +
            '<div class="rejectCount rejectCount5 drop-shadow-light">5</div>' +
            
            '<div class="playerNumberContainer">' +
                '<div class="goodCount drop-shadow-light">' + goodCount + '</div>' +
                '<div class="vsText drop-shadow-light">VS</div>' +
                '<div class="evilCount drop-shadow-light">' + evilCount + '</div>' +
            '</div>' +
        '</div>';
    
        document.querySelector(".board").innerHTML = html;
    
        function TowFailsRequired() {
            return isTowFailsRequired ? 'Two fails required' : '';
        }
    
        function setBackgroundImage(playerCount) {
            if(playerCount <= 5) playerCount = 5;
    
            document.querySelector(".container").style.backgroundImage = "url('image/" + playerCount + "pSheet.jpg')";
        }
    }
    
    static redrawButton(gamedata, mySeat) {
        if(!gamedata) return;
    
        this.showStartButton(gamedata.owner == mySeat && gamedata.status == NetworkUtil.GS_WAITING && gamedata.players.length >= NetworkUtil.MIN_PLAYER);
        this.showSettingButton(gamedata.owner == mySeat && gamedata.status == NetworkUtil.GS_WAITING);
    }

    // -------------------- 화면 변환 함수 -------------------------

    static updatePlayer(gamedata) {
        for(let i = 0; i < gamedata.players.length; i++) {
            this.showSeat(gamedata.players[i].seat, true);
        }
    }

    static showSeatAll(visible) {
        for(let i = 0; i < NetworkUtil.MAX_PLAYER; i++) {
        this.showSeat(i, visible);
        }
    }

    static expeditionNomalAll() {
        for(let i = 1; i <= NetworkUtil.MAX_ROUND; i++) {
            this.expeditionNomal(i);
        }
    }

    static showRejectCountMarkAll(visible) {
        for(let i = 1; i <= NetworkUtil.MAX_VOTE; i++) {
            this.showRejectCountMark(i, visible);
        }
    }

    static showSeat(seat, visible) {
        if(seat < 0 || seat >= NetworkUtil.MAX_PLAYER) return;
        
        document.querySelector(".seat" + seat).style.display = visible ? "flex" : "none";
    }

    static expeditionNomal(round) {
        document.querySelector(".quest" + round).classList.remove("expeditionSuccess");
        document.querySelector(".quest" + round).classList.remove("expeditionFail");
    }

    static expeditionSuccess(round) {
        document.querySelector(".quest" + round).classList.add("expeditionSuccess");
        document.querySelector(".quest" + round).classList.remove("expeditionFail");
    }

    static expeditionFail(round) {
        document.querySelector(".quest" + round).classList.remove("expeditionSuccess");
        document.querySelector(".quest" + round).classList.add("expeditionFail");
    }

    static showRejectCountMark(count, visible) {
        const element = document.querySelector(".rejectCount" + count);

        if(visible) element.classList.add("rejectCountMark");
        else element.classList.remove("rejectCountMark");
    }

    static showStartButton(visible) {
        document.querySelector(".startButton").style.display = visible ? "flex" : "none";
    }

    static showSettingButton(visible) {
        document.querySelector(".settingButton").style.display = visible ? "flex" : "none";
    }

    static showPopup(visible) {
        document.querySelector(".popup").style.display = visible ? "flex" : "none";
    }

    static redrawSelectIdentity(element, id, selected) {
        const color = id <= 6 ? "#00ff00" : "#ff0000";

        element.querySelector(".identity").style.borderColor = selected ? "#ffffff" : color;
        element.querySelector(".identityText").style.color = selected ? "#ffffff" : color;
    }
}

export default DrawManager;