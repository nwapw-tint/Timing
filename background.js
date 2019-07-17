var ports = [];
var popupConnected = false;

//Called something connects to this
chrome.extension.onConnect.addListener((port) => {
	//Creates the capability to receive messages from
	port.onMessage.addListener((msg) => {
		console.log("background receive");
		if (msg.to == "background") {
			switch (msg.action) {
			case "open":
				console.log("background accept");
				console.log("The port \"" + port.name + "\" has been connected");
				if (port.name == "popup") {
					popupConnected = true;
					updatePopupSessions();
				}
				/*sendMessage({
					to: port.name,
					from: "background",
					action: "connected"
				});*/
				break;
			case "update":
				console.log("background accept");
				if (msg.place == "sessions") {
					switch (msg.mode) {
					case "push":
						sessions.push(msg.value);
						break;
					default:
						console.log("background reject");
						console.log(msg);
					}
				}
				break;
			case "start":
				console.log("background accept");
				if (msg.place == "timer") {
					startSession();
				}
				break;
			case "push":
				console.log("background accept");
				if (msg.place == "colors") {
					sessionsWColors.push(msg.wColor);
					sessionsBColors.push(msg.bColor);
				}
				break;
			default:
				console.log("background ignore");
				console.log(msg);
			}
		}
	});
	port.index = ports.length;
	
	port.onDisconnect.addListener((msg) => {
		if (port.name == "popup")
			popupConnected = false;
		ports.splice(port.index, 1);
		console.log("The port \"" + port.name + "\" has been disconnected");
	});
	ports.push(port);
});

//Sends a message through all of its ports
function sendMessage(msg) {
	for (port of ports)
		port.postMessage(msg);
}



/*-------------------------End of Communication-------------------------*/



const clearColor = {
	r: 255,
	g: 255,
	b: 255,
	a: 0
};

var sessions = [];
var currentSessionTime = 0;
var sessionRunning = false;
var sessionsWColors = [];
var sessionsBColors = [];
var blacklistedSites = [];

function showSecondTimeout() {
	setTimeout(() => {
		sessions[0] = Math.max(sessions[0] - 1, 0);
		if (sessions[0] == 0) {
			const s = sessions;
			const w = sessionsWColors;
			const b = sessionsBColors;
			sessions.shift();
			sessionsWColors.shift();
			sessionsBColors.shift();
			updatePopupSessions();
			updateContentColors();
			if (sessions.length == 0) {
				alert("All sessions finished!");
				sessionRunning = false;
			} else {
				alert("Session finished!");
				sessions = s;
				sessionsWColors = w;
				sessionsBColors = b;
				showSecondTimeout();
			}
		} else {
			updatePopupSessions();
			showSecondTimeout();
		}
	}, 1000);
}

function startSession() {
	sessionRunning = true;
	showSecondTimeout();
}

function updatePopupSessions() {
	sendMessage({
		to: "popup",
		from: "background",
		action: "update",
		place: "sessions",
		value: sessions
	});
}

function updateContentColors() {
	if (sessionsWColors.length > 0) {
		sendMessage({
			to: "content",
			from: "background",
			action: "update",
			place: "colors",
			wColor: sessionsWColors[0],
			bColor: sessionsBColors[0]
		});
	} else {
		sendMessage({
			to: "content",
			from: "background",
			action: "update",
			place: "colors",
			wColor: clearColor,
			bColor: clearColor
		});
	}
}