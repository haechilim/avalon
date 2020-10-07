// 응답코드 (Response Code)
var RC_SUCCESS = 0;
var RC_NOT_YOUR_TURN = 1;
var RC_NO_PERMISSION = 2;

// 참가요청에 대한 응답코드
var JOIN_SUCCESS = 0;
var JOIN_NO_NAME = 1;
var JOIN_ALREADY_EXISTS = 2;

// 게임 상태(Game Status)
var GS_WAITING = 0;	// 게임 시작전
var GS_CHECK_INFORMATION = 1;	// 멀린이나 악의 세력들이 정체를 확인하는 단계
var GS_SET_UP_EXPEDITION = 2;	// 원정대장이 원정을 꾸리는 단계
var GS_VOTE = 3;	// 원정에 대해 찬성하는지 반대하는지를 투표하는 투표단계
var GS_EXPEDITIONARY = 4;	// 원정대를 성공시킬지 실패시킬지 플래이어들의 원정 단계
var GS_ASSASSINATION = 5;	// 선의 세력이 원정을 3번 성공할시 어쌔신이 멀린을 암살하는 단계
var GS_WINNER = 6;	// 게임 종료, 승자팀 발표 단계

var MAX_PLAYER = 10;
var MIN_PLAYER = 5;
var MAX_ROUND = 5;
var MAX_VOTE = 5;

// 정체(identity)
var GOOD_NORMAL = 0;	// 일반 시민(선)
var GOOD_MERLIN = 1;	// 멀린(선)	모드레드를 제외한 악의 정체를 앎
var GOOD_PERCIVAL = 2;	// 퍼시벌(선) 멀린이 누군지를 앎
var EVIL_NORMAL = 3;	// 일반 악(임포스터ㅋㅋ)
var EVIL_MORDRED = 4;	// 모드레드(악)	멀린에게 발각되지 않음
var EVIL_ASSASSIN = 5;	// 어쌔신(악) 선이 승리할 경우 선을 암살할수 있음 멀린일 경우 악의 승
var EVIL_MORCANA = 6;	// 모르가나(악) 퍼시벌이 멀린을 확인할때 멀린인척을 할수있음(퍼시벌은 멀린이 2명 보이고 추리해야뎀)
var EVIL_OBERON = 7;	// 오베론(악) 악끼리 정체를 공유하지 않음(밸런스 조절용 트롤 캐ㅋㅋㅋ)

// 원정 결과
var EXPEDITION_SUCCESS = 0;
var EXPEDITION_FAIL = 1;

// 투표 결과
var APPROVE = 0;
var REJECT = 1;

//선, 악
var GOOD = 0;
var EVIL = 1;

var gamedata;

// -------------------- init 함수 -------------------------

function init() {
    showSeatAll(false);
    expeditionNomalAll();
    showRejectCountMarkAll(false);
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

// -------------------- 이벤트 바인딩 -------------------------

document.addEventListener("DOMContentLoaded", function() {
    init();
	bindEvents();
});

function bindEvents() {
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