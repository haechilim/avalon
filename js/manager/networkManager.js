class NetworkUtil {
    constructor() {}

    // 응답코드 (Response Code)
    static RC_SUCCESS = 0;
	static RC_NOT_YOUR_TURN = 1;
	static RC_NO_PERMISSION = 2;
	static RC_NO_MERLIN = 3;
	static RC_NO_ASSASSIN = 4;

    // 참가요청에 대한 응답코드
    static JOIN_SUCCESS = 0;
    static JOIN_NO_NAME = 1;
    static JOIN_NO_SEAT = 2;
    static JOIN_ALREADY_EXISTS = 3;

    // 게임 상태(Game Status)
    static GS_WAITING = 0;
    static GS_CHECK_INFORMATION = 1;
    static GS_SET_UP_EXPEDITION = 2;
    static GS_VOTE = 3;
    static GS_EXPEDITIONARY = 4;
    static GS_ASSASSINATION = 5;
    static GS_WINNER = 6;

    static MAX_PLAYER = 10;
    static MIN_PLAYER = 5;
    static MAX_ROUND = 5;
    static MAX_VOTE = 5;

    // 정체(identity)
    static GOOD_MERLIN = 0;
    static GOOD_PERCIVAL = 1;
    static GOOD1 = 2;
    static GOOD2 = 3;
    static GOOD3 = 4;
    static GOOD4 = 5;
    static GOOD5 = 6;
    static EVIL_MORDRED = 7;
    static EVIL_ASSASSIN = 8;
    static EVIL_MORCANA = 9;
    static EVIL_OBERON = 10;
    static EVIL1 = 11;
    static EVIL2 = 12;
    static EVIL3 = 13;
    static IDENTITY_UNKNOWN = 14;
    static IDENTITY_NOMAL = 15;

    // 원정 결과
    static EXPEDITION_SUCCESS = 0;
    static EXPEDITION_FAIL = 1;

    // 투표 결과
    static APPROVE = 0;
    static REJECT = 1;

    //선, 악
    static GOOD = 0;
    static EVIL = 1;

    static DATA_REQUEST_INTERVAL = 1000;

    static request(url, callback) {
        const xhr = new XMLHttpRequest();
            
        xhr.addEventListener("load", () => {
            if(callback) callback(JSON.parse(xhr.responseText));
        });
        
        xhr.open("GET", url, true);
        xhr.send();
    }
}

export default NetworkUtil;