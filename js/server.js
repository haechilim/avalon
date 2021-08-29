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

//플래이어 상태
var PARTICIPANT = 0;
var OBSERVER = 1;

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
	owner: -1,
	leader: -1,
	leftBadge: -1,
	voteResult: -1,
	expeditionResults: [-1, -1, -1, -1, -1],
	rejectCountPosition: 0,
	players: [],
	status: GS_WAITING,
	winners: -1,
	sequence: 0
};

// ------------------- 게임 진행 주 로직 --------------------------

function join(name, seat) {
	var code = JOIN_SUCCESS;
	var _seat = -1;
	
	if(!name) code = JOIN_NO_NAME;
	else if(!seat || seat < 0 || seat >= MAX_PLAYER) code = JOIN_NO_SEAT;
	else {
		var player = getPlayerBySeat(seat);
		
		if(player) code = JOIN_ALREADY_EXISTS;
		else {
			newPlayer(name, seat);
			setOwner();
			gamedata.sequence++;
		}
		
		_seat = seat;
	}
	
	return {
		code: code,
		seat: _seat
	};

	function newPlayer(name, seat) {
		player = {
			name: name,
			seat: seat,
			identity: -1,
			vote: -1,
			expedition: -1,
			status: gamedata.status == GS_WAITING ? PARTICIPANT : OBSERVER
		};

		gamedata.players.push(player);
	}
}

function start(seat) {
	var code;

	if(gamedata.owner != seat) code = RC_NO_PERMISSION;
	else {
		gamedata.status = GS_CHECK_INFORMATION;
	}

	return {
		code: code,
	};
}

// ------------------- 플래이어 관련 함수 --------------------------

function setOwner() {
	if(gamedata.players.length <= 0) return;
	
	gamedata.owner = gamedata.players[0].seat;
}

// ------------------- 편의 함수 --------------------------

function getPlayerBySeat(seat) {
	for(var i = 0; i < gamedata.players.length; i++) {
		var player = gamedata.players[i];

		if(player.seat == seat) return player;
	}

	return null;
}

// ------------------- 전송 요청 처리 --------------------------

var server = http.createServer(function(request, response) {
	console.log("요청 URL: ", request.url);
	
	var urlPath = getUrlPath(request.url);
	var filepath = getFilePath(urlPath);
	var contentType = mime.getType(filepath);
	var parameter = getUrlParameters(request.url);
	
	switch(urlPath) {
		case "/gamedata":
			jsonResponse(response, gamedata);
			return;

		case "/join":
			jsonResponse(response, join(parameter.name, parameter.seat));
			return;

		case "/start":
			jsonResponse(response, start(parameter.seat));
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
console.log("server start");

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
	if(urlPath == "/") return "avalon.html";
	
	return urlPath.substr(1, urlPath.length - 1);
}

// ----------------------------------------

function isBinary(type) {
	return !(type.startsWith("text") || type == "application/javascript");
}

function isText(contentType) {
	return contentType == "text/html" || contentType == "text/css" || contentType == "application/javascript";
}