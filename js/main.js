// 응답코드 (Response Code)
var RC_SUCCESS = 0;
var RC_NOT_YOUR_TURN = 1;
var RC_NO_PERMISSION = 2;

// 참가요청에 대한 응답코드
var JOIN_SUCCESS = 0;
var JOIN_NO_NAME = 1;
var JOIN_NO_SEAT = 2;
var JOIN_ALREADY_EXISTS = 3;

// 게임 상태(Game Status)
var GS_WAITING = 0;
var GS_CHECK_INFORMATION = 1;
var GS_SET_UP_EXPEDITION = 2;
var GS_VOTE = 3;
var GS_EXPEDITIONARY = 4;
var GS_ASSASSINATION = 5;
var GS_WINNER = 6;

var MAX_PLAYER = 10;
var MIN_PLAYER = 5;
var MAX_ROUND = 5;
var MAX_VOTE = 5;

// 정체(identity)
var GOOD1 = 0;
var GOOD2 = 1;
var GOOD3 = 2;
var GOOD4 = 3;
var GOOD5 = 4;
var GOOD_MERLIN = 5;
var GOOD_PERCIVAL = 6;
var EVIL1 = 7;
var EVIL2 = 8;
var EVIL3 = 9;
var EVIL_MORDRED = 10;
var EVIL_ASSASSIN = 11;
var EVIL_MORCANA = 12;
var EVIL_OBERON = 13;
var IDENTITY_UNKNOWN = 14;
var IDENTITY_NOMAL = 15;

// 원정 결과
var EXPEDITION_SUCCESS = 0;
var EXPEDITION_FAIL = 1;

// 투표 결과
var APPROVE = 0;
var REJECT = 1;

//선, 악
var GOOD = 0;
var EVIL = 1;

var DATA_REQUEST_INTERVAL = 1000;

var gamedata;
var sequence = 0;
var mySeat;

// -------------------- update 함수 -------------------------

function updateTable() {
    redraw();
    showSeatAll(false);
    updatePlayer();
}

function updatePlayer() {
    for(var i = 0; i < gamedata.players.length; i++) {
        showSeat(gamedata.players[i].seat, true);
    }
}

// -------------------- init 함수 -------------------------

function init() {
    resize();
    initBoard();
    requestJoin(function(json) {
        console.log(json);
		mySeat = json.seat;
		if(json.code == JOIN_NO_NAME || json.code == JOIN_NO_SEAT) return;
		requestGameData();
		setInterval(requestGameData, DATA_REQUEST_INTERVAL);
    });
    
    function initBoard() {
        redraw();
        expeditionNomalAll();
        showRejectCountMarkAll(false);
    }
}

// -------------------- redraw 함수 -------------------------

function redraw() {
    redrawPlayers();
    redrawBoard();
    redrawButton();
}

function redrawPlayers() {
    var html = '';
    var profile;
    var profileImg;
    var name;

    for(var i = 0; i < MAX_PLAYER; i++) {
        name = "nickname";
        profile = "questionMark";
        profileImg = "questionMark";

        if(gamedata) {
            for(var playerIndex = 0; playerIndex < gamedata.players.length; playerIndex++) {
                var player = gamedata.players[playerIndex];

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

function redrawBoard() {
    var quests = [ 2, 3, 4, 3, 4 ];
    var goodCount = 0;
    var evilCount = 0;
    var isTowFailsRequired = false;
    
    if(gamedata) {
        var playerCount = gamedata.players.length;

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
    
    var html = 
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

function redrawButton() {
    if(!gamedata) return;

    showStartButton(gamedata.owner == mySeat && gamedata.status == GS_WAITING && gamedata.players.length >= MIN_PLAYER);
    showSettingButton(gamedata.owner == mySeat && gamedata.status == GS_WAITING);
}

// -------------------- request 함수 -------------------------

function requestGameData(callback) {
	request("/gamedata?seat=" + mySeat, function(data) {
		if(sequence >= data.sequence) return;
		sequence = data.sequence;
        gamedata = data;
        console.log(gamedata, sequence);
		updateTable();

		if(callback) callback();
	});
}

function requestJoin(callback) {
	request("/join" + location.search, callback);
}

function requestStart(callback) {
	request("/start" + location.search, callback);
}

function request(url, callback) {
	var xhr = new XMLHttpRequest();
		
	xhr.addEventListener("load", function() {
		var json = JSON.parse(xhr.responseText);
		if(callback) callback(json);
	});
	
	xhr.open("GET", url, true);
	xhr.send();
}

// -------------------- 화면 변환 함수 -------------------------

function showSeatAll(visible) {
    for(var i = 0; i < MAX_PLAYER; i++) {
       showSeat(i, visible);
    }
}

function expeditionNomalAll() {
    for(var i = 1; i <= MAX_ROUND; i++) {
        expeditionNomal(i);
    }
}

function showRejectCountMarkAll(visible) {
    for(var i = 1; i <= MAX_VOTE; i++) {
        showRejectCountMark(i, visible);
    }
}

function showSeat(seat, visible) {
    if(seat < 0 || seat >= MAX_PLAYER) return;
    
    document.querySelector(".seat" + seat).style.display = visible ? "flex" : "none";
}

function expeditionNomal(round) {
    document.querySelector(".quest" + round).classList.remove("expeditionSuccess");
    document.querySelector(".quest" + round).classList.remove("expeditionFail");
}

function expeditionSuccess(round) {
    document.querySelector(".quest" + round).classList.add("expeditionSuccess");
    document.querySelector(".quest" + round).classList.remove("expeditionFail");
}

function expeditionFail(round) {
    document.querySelector(".quest" + round).classList.remove("expeditionSuccess");
    document.querySelector(".quest" + round).classList.add("expeditionFail");
}

function showRejectCountMark(count, visible) {
    var element = document.querySelector(".rejectCount" + count);

    if(visible) element.classList.add("rejectCountMark");
    else element.classList.remove("rejectCountMark");
}

function showStartButton(visible) {
    document.querySelector(".startButton").style.display = visible ? "flex" : "none";
}

function showSettingButton(visible) {
    document.querySelector(".settingButton").style.display = visible ? "flex" : "none";
}

function showPopup(visible) {
    document.querySelector(".popup").style.display = visible ? "flex" : "none";
}

// -------------------- 이벤트 바인딩 -------------------------

document.addEventListener("DOMContentLoaded", function() {
    redraw();
    init();
    resize();
	bindEvents();
});

function bindEvents() {
    window.addEventListener("resize", function() {
        resize();
    });

    document.querySelector(".startButton").addEventListener("click", function() {
       requestStart(function(json) {
           
       });
    });

    document.querySelector(".settingButton").addEventListener("click", function() {
        showPopup(true);
    });

    document.querySelector(".closeButton").addEventListener("click", function() {
        showPopup(false);
    });

    document.addEventListener("contextmenu", function(event) {
        event.preventDefault();
    });

    document.addEventListener("selectstart", function(event) {
        event.preventDefault();
    });

    document.addEventListener("dragstart", function(event) {
        event.preventDefault();
    });
}

// -------------------- 기타 -------------------------

function resize() {
	var DEFAULT_WIDTH = 1919;
	var DEFAULT_HEIGHT = 1057;
	
	var ratioX = window.innerWidth / DEFAULT_WIDTH;
	var ratioY = window.innerHeight / DEFAULT_HEIGHT;
	var offsetX = (DEFAULT_WIDTH - window.innerWidth) / 2;
	var offsetY = (DEFAULT_HEIGHT - window.innerHeight) / 2;
	
	document.body.style.transform = "scale(" + Math.min(ratioX, ratioY) + ")";
	document.getElementById("container").style.transform = "translate(0px, " + (ratioY > 1 ? -offsetY : 0) + "px)";
	window.scrollTo(0, offsetY);
}