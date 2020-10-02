var http = require("http");
var fs = require("fs");
var mime = require("mime");

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
var GS_RESULT = 5;	// 원정이 성공인지 실패인지 확인하는 단계
var GS_ASSASSINATION = 6;	// 선의 세력이 원정을 3번 성공할시 어쌔신이 멀린을 암살하는 단계
var GS_WINNER = 7;	// 게임 종료, 승자팀 발표 단계

var MAX_PLAYER = 10;
var MIN_PLAYER = 5;

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

var gamedata = {
	owner: -1,	// 처음 들어온 사람의 자리번호를 준다
	leader: -1,	// 시작은 방장이고 한 원정이 끝나거나 투표가 반대되면 1 증가시킴 현재 플래이어수를 넘기면 다시 0으로 돌아옴
	leftBadge: -1,	// 남아 있는 배지로 [현재 라운드에 원정대수 - 현재 리더가 부여해준 배지 개수] 이다
	voteResult: -1,	// 투표 완료후에 원정이 찬성인지 반대인지 최종으로 알려줌
	expeditionResult: [],	// 원정 결과로 크기 5의 배열 각 배열요소에 원정이 성공했는지 실패했는지를 알려줌
	rejectCountPosition: 0,	// 원정대 투표가 연속적으로 실패할때마다 증가시킴 5가되면 악이 승리
	players: [],	// 플래이어 수의 크기를 가지는 배열(최대 인원수는 넘지 않음) ********* 세부 내용은 별도 자료 제공 *********
	status: GS_WAITING,	// 게임의 상태 게임중인지 투표중인지 등등 필요한 게임 상태가 있을시 상수 만들기
	winners: -1,	// 이긴 팀을 표시
	sequence: 1	// 데이터를 주기적으로 뿌리는데 데이터가 변경되어 클라이언트 쪽에 이를 알릴때 사용되는 변수 값만 증가시켜주면 된다...
};

// ------------------- 전송 요청 처리 --------------------------

var server = http.createServer(function(request, response) {
	console.log("요청 URL: ", request.url);
	
	var urlPath = getUrlPath(request.url);
	var filepath = getFilePath(urlPath);
	var contentType = mime.getType(filepath);
	var parameter = getUrlParameters(request.url);
	
	switch(urlPath) {
		case "/data":
			jsonResponse(response, gamedata);
			return;
	}
		
	if(isText(contentType))	fs.readFile(filepath, "utf-8", content);
	else fs.readFile(filepath, content);
	
	function content(error, data) {
		if(error) {
			response.writeHead(404, {
				"content-type": "text/plain; charset=utf-8"
			});
				
			response.end("File Not Found");
		}
		else {
			response.writeHead(200, {
				"content-type": contentType + (isText(contentType) ? "; charset=utf-8" : ""),
				"cache-control": isText(contentType) ? "no-cache" : "max-age=31536000"
			});
				
			response.end(data);
		}
	}
});

server.listen(8888);
console.log("서버 on");

// ----------------------------------------

function jsonResponse(response, data) {
	response.writeHead(200, {
		"content-type": "application/json; charset=utf-8",
		"cache-control": "no-cache"
	});
		
	response.end(JSON.stringify(data));
}

// ----------------------------------------

function getUrlPath(url) {
	var index = url.indexOf("?");
	return index < 0 ? url : url.substr(0, index);
}

function getUrlParameters(url) {
	var result = {};
	var part = parameterPart();
	var parameters = part.split("&");
	
	for(var i = 0; i < parameters.length; i++) {
		var tokens = parameters[i].split("=");
		
		if(tokens.length < 2) continue;
		
		result[tokens[0]] = tokens[1];
	}
	
	return result;
	
	
function parameterPart() {
		var tokens = url.split("?");
		return tokens.length > 1 ? tokens[1] : "";
	}
}

function getFilePath(urlPath) {
	if(urlPath == "/") return "poker.html";
	
	return urlPath.substr(1, urlPath.length - 1);
}

// ----------------------------------------

function isBinary(type) {
	return !(type.startsWith("text") || type == "application/javascript");
}

function isText(contentType) {
	return contentType == "text/html" || contentType == "text/css" || contentType == "application/javascript";
}