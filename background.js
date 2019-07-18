var ports = [];

//Called when something connects to this
chrome.extension.onConnect.addListener((port) => {
	//Creates the capability to receive messages from
	port.onMessage.addListener((msg) => {
		if (msg.to == "background") {
			console.log(msg);
			switch (msg.action) {
			case "open":
				console.log("The port \"" + port.name + "\" has been connected");
				if (port.name == "popup") {
					updatePopupSessions();
					updatePopupBlacklistedSites();
					updatePopupSessionRunning();
				}
				break;
			case "timer":
				switch (msg.mode) {
				case "start":
					startSession();
					break;
				case "stop":
					stopSession();
					break;
				}
				break;
			case "push":
				switch (msg.place) {
				case "colors":
					sessionsWColors.push(msg.wColor);
					sessionsBColors.push(msg.bColor);
					break;
				case "sessions":
					sessions.push(msg.time);
					break;
				case "blacklistedSites":
					blacklistedSites.push(msg.blacklistedSite);
				}
			case "checkRunning":
				if (sessionRunning) {
					stopSession();
					startSession();
				}
				isCurrentTabBlacklisted();
				console.log(onBlacklistedSite);
				break;
			}
		}
	});
	port.index = ports.length;
	
	port.onDisconnect.addListener(() => {
		if (port.index = -1)
			return;
		port.index = -1;
		console.log("The port \"" + port.name + "\" has been disconnected");
		ports.splice(port.index, 1);
	});
	ports.push(port);
});

//Sends a message through all of its ports
function sendMessage(msg) {
	for (port of ports)
		if (port.index != -1)
			port.postMessage(msg);
}



/*-------------------------End of Communication-------------------------*/



//Detects when the user changes tabs
chrome.tabs.onActivated.addListener((activeInfo) => {
	for (port of ports)
		if (port.name == "content") {
			port.index = -1;
			console.log("The port \"" + port.name + "\" has been disconnected");
			ports.splice(port.index, 1);
		}
	chrome.tabs.reload(activeInfo.tabId);
});



const CLEAR_COLOR = {
	r: 255,
	g: 255,
	b: 255,
	a: 0
};

var sessions = [];
var sessionRunning = false;

var sessionsWColors = [];
var sessionsBColors = [];
var blacklistedSites = [];
var onBlacklistedSite = false;

function showSecondTimeout() {
	setTimeout(() => {
		if (sessionRunning) {
			sessions[0] = Math.max(sessions[0] - 1, 0);
			if (sessions[0] == 0) {
				const s = sessions;
				const w = sessionsWColors;
				const b = sessionsBColors;
				sessions.shift();
				sessionsWColors.shift();
				sessionsBColors.shift();
				updatePopupSessions();
				if (sessions.length == 0) {
					alert("All sessions finished!");
					sessionRunning = false;
					sendMessage({
						to: "content",
						from: "background",
						action: "tint",
						mode: "disable"
					});
				} else {
					alert("Session finished!");
					sessions = s;
					sessionsWColors = w;
					sessionsBColors = b;
					updateContentColor();
					showSecondTimeout();
				}
			} else {
				updatePopupSessions();
				showSecondTimeout();
			}
		}
	}, 1000);
}

function startSession() {
	if (!sessionRunning)
		showSecondTimeout();
	sessionRunning = true;
	sendMessage({
		to: "content",
		from: "background",
		action: "tint",
		mode: "enable",
		id: "tint-color",
		color: rgbToHex(getNextTintColor()),
		opacity: getNextTintColor().a / 255,
		duration: 100
	});
}

function stopSession() {
	sessionRunning = false;
	sendMessage({
		to: "content",
		from: "background",
		action: "tint",
		mode: "disable"
	});
}
/*-------------------------Update Popup-------------------------*/


function updatePopupSessions() {
	sendMessage({
		to: "popup",
		from: "background",
		action: "update",
		place: "sessions",
		sessions: sessions
	});
}

function updatePopupBlacklistedSites() {
	sendMessage({
		to: "popup",
		from: "backup",
		action: "update",
		place: "blacklistedSites",
		blacklistedSites: blacklistedSites
	});
}

function updatePopupSessionRunning() {
	sendMessage({
		to: "popup",
		from: "background",
		action: "update",
		place: "sessionRunning",
		sessionRunning: sessionRunning
	});
}


/*-------------------------Update Content-------------------------*/


function updateContentColor() {
	sendMessage({
		to: "content",
		from: "background",
		action: "tint",
		mode: "change",
		color: getNextTintColor()
		//TODO: Remember, this also changes depending
		//on the current tab being blacklisted or not
	});
}


/**/


function getNextTintColor() {
	if (sessions.length > 0)
		if (onBlacklistedSite)
			return sessionsBColors[0];
		else
			return sessionsWColors[0];
	else
		return CLEAR_COLOR;
}

function rgbToHex(color) {
	return "#" + byteToHex(color.r) + byteToHex(color.g) + byteToHex(color.b);
	function byteToHex(c) {
		let hex = Number(c).toString(16);
		if (hex.length < 2)
			hex = "0" + hex;
		return hex;
	}
}


/*-------------------------Blacklist Code-------------------------*/


function isCurrentTabBlacklisted() {
	chrome.tabs.query({
		currentWindow: true,
		active: true
	}, (tabs) => {
		let currentSite = tabs[0].url;
		let blacklisted = false;
		for (let i = 0; i < blacklistedSites.length && !blacklisted; i++)
			if (currentSite == blacklistedSites[i])
				blacklisted = true;
		onBlacklistedSite = blacklisted;
	});
}


/*-------------------------Experimental-------------------------*/
taskText = "make skynet";
chrome.omnibox.onInputEntered.addListener((txt) => {
	alert(txt);
});
chrome.commands.onCommand.addListener((command) => {
	if(command == "display_text")
	{
		alert("sending message to addText");
		displayText(taskText);
	}
});
/*-------------------------Display Text (ctrl+space)-------------------------*/
function displayText(taskText){
	sendMessage({
		to: "addText",
		from: "background",
		action: "addText",
		text: taskText+sessions[0] //TODO: convert to readable time
	});

}