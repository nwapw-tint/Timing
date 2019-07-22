const CLEAR_COLOR = {
	r: 255,
	g: 255,
	b: 255,
	a: 0
};

var sessions = [];
var sessionRunning = false;

var currentSessionTime = 0;
var sessionsWColors = [];
var sessionsBColors = [];
var blacklistedSites = [];
var onBlacklistedSite = false;

var currentSite = "";
var sitesVisited = [];

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
					//alert("All sessions finished!");
					stopSession();
				} else {
					//alert("Session finished!");
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
		color: getTintColor(),
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

function getTintColor() {
	isCurrentTabBlacklisted();
	if (sessions.length > 0)
		if (onBlacklistedSite)
			return sessionsBColors[0];
		else
			return sessionsWColors[0];
	else
		return CLEAR_COLOR;
}
//COMMUNICATION
var ports = [];

//Called when something connects to this
chrome.extension.onConnect.addListener((port) => {
	//Creates the capability to receive messages from
	port.onMessage.addListener((msg) => {
		if (msg.to != "background")
			return;
		switch (msg.action) {
		case "open":
			console.log("The port \"" + port.name + "\" has been connected");
			if (port.name == "popup")
				updatePopup();
			port.postMessage({
				to: port.name,
				from: "background",
				action: "open"
			});
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
				updateContentColor();
			}
			break;
		case "shift":
			if (msg.place == "sessions")
				sessions.shift();
			if (sessions.length == 0)
				stopSession();
			break;
		case "checkRunning":
			isCurrentTabBlacklisted();
			if (sessionRunning) {
				stopSession();
				sessionRunning = true;
				startSession();
			}
			break;
		}
	});
	port.index = ports.length;
	
	port.onDisconnect.addListener(() => {
		if (port.index == -1)
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

//checks the current site to see if it has been filtered. If it hasn't been visited, add it to visited.
//Detects when the user changes tabs
chrome.tabs.onActivated.addListener((activeInfo) => {
	chrome.tabs.query({
		currentWindow: true,
		active: true
	}, (tabs) => {
		try {
			currentSite = tabs[0].url;
			if (sitesVisited.indexOf(currentSite) == -1) {
				sitesVisited.push(currentSite);
				chrome.tabs.reload(activeInfo.tabId);
			} else
				updateContentColor();
		} catch (error) {
			console.log("tabs are null");
		}
	});
});
//UPDATE_POPUP
function updatePopupSessions() {
	sendMessage({
		to: "popup",
		from: "background",
		action: "update",
		place: "sessions",
		sessions: sessions
	});
}

// TODO: Don't need the ports to the popup, just include the same file with all the variables

function updatePopupSessionRunning() {
	sendMessage({
		to: "popup",
		from: "background",
		action: "update",
		place: "sessionRunning",
		sessionRunning: sessionRunning
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

function updatePopup() {
	updatePopupSessions();
	updatePopupSessionRunning();
	updatePopupBlacklistedSites();
}
//EXPERIMENTAL
chrome.omnibox.onInputEntered.addListener((txt) => {
	alert(txt);
});
var taskText = "make skynet";
chrome.commands.onCommand.addListener((command) => {
	if (command == "display_text")
		sendMessage({
			to: "content",
			from: "background",
			action: "add_text",
			text: taskText,
			time: sessions[0]
		});
});
//UPDATE_CONTENT_COLOR
function updateContentColor() {
	sendMessage({
		to: "content",
		from: "background",
		action: "tint",
		mode: "change",
		color: getTintColor()
	});
}
function isCurrentTabBlacklisted() {
	let blacklisted = false;
	for (let i = 0; i < blacklistedSites.length && !blacklisted; i++)
		if (currentSite == blacklistedSites[i])
			blacklisted = true;
	onBlacklistedSite = blacklisted;
}

