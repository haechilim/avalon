const http = require("http");
const fs = require("fs");
const mime = require("mime");

class Server {
	// 응답코드 (Response Code)
	RC_SUCCESS = 0;
	RC_NOT_YOUR_TURN = 1;
	RC_NO_PERMISSION = 2;

	// 참가요청에 대한 응답코드
	JOIN_SUCCESS = 0;
	JOIN_NO_NAME = 1;
	JOIN_NO_SEAT = 2;
	JOIN_ALREADY_EXISTS = 3;

	// 게임 상태(Game Status)
	GS_WAITING = 0;
	GS_CHECK_INFORMATION = 1;
	GS_SET_UP_EXPEDITION = 2;
	GS_VOTE = 3;
	GS_EXPEDITIONARY = 4;
	GS_ASSASSINATION = 5;
	GS_WINNER = 6;

	MAX_PLAYER = 10;
	MIN_PLAYER = 5;

	// 정체(identity)
	GOOD1 = 0;
	GOOD2 = 1;
	GOOD3 = 2;
	GOOD4 = 3;
	GOOD5 = 4;
	GOOD_MERLIN = 5;
	GOOD_PERCIVAL = 6;
	EVIL1 = 7;
	EVIL2 = 8;
	EVIL3 = 9;
	EVIL_MORDRED = 10;
	EVIL_ASSASSIN = 11;
	EVIL_MORCANA = 12;
	EVIL_OBERON = 13;
	IDENTITY_UNKNOWN = 14;
	IDENTITY_NOMAL = 15;

	//플래이어 상태
	PARTICIPANT = 0;
	OBSERVER = 1;

	// 원정 결과
	EXPEDITION_SUCCESS = 0;
	EXPEDITION_FAIL = 1;

	// 투표 결과
	APPROVE = 0;
	REJECT = 1;

	//선, 악
	GOOD = 0;
	EVIL = 1;

	gamedata = {
		owner: -1,
		leader: -1,
		leftBadge: -1,
		voteResult: -1,
		expeditionResults: [-1, -1, -1, -1, -1],
		rejectCountPosition: 0,
		players: [],
		status: this.GS_WAITING,
		winners: -1,
		sequence: 0
	};
	
	constructor() {}

	createServer() {
		http.createServer((request, response) => {
			const url = request.url;

			console.log("요청 URL: ", url);
			
			const urlPath = this.getUrlPath(url);
			const filepath = this.getFilePath(urlPath);
			const contentType = mime.getType(filepath);
			const parameter = this.getUrlParameters(url);
			const isText = this.isText(contentType);
			
			switch(urlPath) {
				case "/gamedata":
					this.jsonResponse(response, this.gamedata);
					return;
		
				case "/join":
					this.jsonResponse(response, this.join(parameter.name, parameter.seat));
					return;
		
				case "/start":
					this.jsonResponse(response, this.start(parameter.seat));
					return;
			}
				
			isText ? fs.readFile(filepath, "utf-8", content) : fs.readFile(filepath, content);
			
			function content(error, data) {
				if(error) {
					response.writeHead(404, {
						"content-type": "text/plain; charset=utf-8"
					});
						
					response.end("File Not Found");
				}
				else {
					response.writeHead(200, {
						"content-type": contentType + (isText ? "; charset=utf-8" : ""),
						"cache-control": isText ? "no-cache" : "max-age=31536000"
					});
						
					response.end(data);
				}
			}
		}).listen(8888);
		console.log("server start");
	}

	jsonResponse(response, data) {
		response.writeHead(200, {
			"content-type": "application/json; charset=utf-8",
			"cache-control": "no-cache"
		});
			
		response.end(JSON.stringify(data));
	}
	
	// ----------------------------------------
	
	getUrlPath(url) {
		const index = url.indexOf("?");

		return index < 0 ? url : url.substr(0, index);
	}
	
	getUrlParameters(url) {
		let result = {};
		let parameters = parameterPart().split("&");
		
		for(let i = 0; i < parameters.length; i++) {
			let tokens = parameters[i].split("=");
			
			if(tokens.length < 2) continue;
			
			result[tokens[0]] = tokens[1];
		}
		
		return result;
		
		function parameterPart() {
			const tokens = url.split("?");

			return tokens.length > 1 ? tokens[1] : "";
		}
	}
	
	getFilePath(urlPath) {
		if(urlPath == "/") return "avalon.html";
		
		return urlPath.substr(1, urlPath.length - 1);
	}
	
	// ----------------------------------------
	
	isBinary(type) {
		return !(type.startsWith("text") || type == "application/javascript");
	}
	
	isText(contentType) {
		return contentType == "text/html" || contentType == "text/css" || contentType == "application/javascript";
	}

	// ------------------- 게임 진행 주 로직 --------------------------

	join(name, seat) {
		let code = this.JOIN_SUCCESS;
		let _seat = -1;
		
		if(!name) code = this.JOIN_NO_NAME;
		else if(!seat || seat < 0 || seat >= this.MAX_PLAYER) code = this.JOIN_NO_SEAT;
		else {
			let player = this.getPlayerBySeat(seat);
			
			if(player) code = this.JOIN_ALREADY_EXISTS;
			else {
				this.newPlayer(name, seat);
				this.setOwner();
				this.gamedata.sequence++;
			}
			
			_seat = seat;
		}
		
		return {
			code: code,
			seat: _seat
		};
	}

	newPlayer(name, seat) {
		const player = {
			name: name,
			seat: seat,
			identity: -1,
			vote: -1,
			expedition: -1,
			status: this.gamedata.status == this.GS_WAITING ? this.PARTICIPANT : this.OBSERVER
		};

		this.gamedata.players.push(player);
	}

	start(seat) {
		let code;

		if(this.gamedata.owner != seat) code = RC_NO_PERMISSION;
		else this.gamedata.status = this.GS_CHECK_INFORMATION;

		return {
			code: code,
		};
	}

	// ------------------- 플래이어 관련 함수 --------------------------

	setOwner() {
		if(this.gamedata.players.length <= 0) return;
		
		this.gamedata.owner = this.gamedata.players[0].seat;
	}

	// ------------------- 편의 함수 --------------------------

	getPlayerBySeat(seat) {
		for(let i = 0; i < this.gamedata.players.length; i++) {
			const player = this.gamedata.players[i];

			if(player.seat == seat) return player;
		}

		return null;
	}
}

module.exports = Server;