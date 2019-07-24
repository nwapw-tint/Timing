var sessions = [];
var sessionRunning = false;

var blacklistedSites = [];
var onBlacklistedSite = false;
var bColor = "rgba(255, 0, 0, " + alpha + ")";

var currentSite = "";
var sitesVisited = [];

var timeout;

//The hidden timer
function timeoutUpdate() {
	if (sessionRunning) {
		sessions[0].time = Math.max(sessions[0].time - 1, 0);
		if (sessions[0].time == 0) {
			sessions.shift();
			updatePopupSessions();
			if (sessions.length == 0) {
				//alert("All sessions finished!");
				stopSession();
			} else {
				//alert("Session finished!");
				updateContentTint();
			}
		} else
			updatePopupSessions();
	}
}

//Starts a session
function startSession() {
	enableContentTint();
	if (!sessionRunning) {
		timeout = setInterval(timeoutUpdate, 1000);
		sessionRunning = true;
	}
}

//Stops a session
function stopSession() {
	clearInterval(timeout);
	disableContentTint();
	sessionRunning = false;
}

//Gets the tint
function getTint() {
	isCurrentTabBlacklisted();
	if (sessions.length > 0)
		return onBlacklistedSite ? bColor : sessions[0].color;
	else
		return CLEAR_COLOR;
}



/*-------------------------Communication-------------------------*/



var ports = [];

//Called when something connects to this
chrome.extension.onConnect.addListener((port) => {
	//Creates the capability to receive messages from different scripts
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
			case "sessions":
				sessions.push(msg.session);
				break;
			case "blacklistedSites":
				blacklistedSites.push(msg.blacklistedSite);
				updateContentTint();
			}
			break;
		case "shift":
			if (msg.place == "sessions") {
				sessions.shift();
				if (sessions.length == 0)
					stopSession();
			}
			break;
		case "update":
			switch (msg.place) {
			case "sessions":
				sessions = msg.sessions;
				if (sessions.length == 0)
					stopSession();
				else
					updateContentTint();
				break;
			case "bColor":
				bColor = msg.bColor;
				updateContentTint();
				break;
			}
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



/*-------------------------Update Content-------------------------*/



//Updates the content tint
function updateContentTint() {
	sendMessage({
		to: "content",
		from: "background",
		action: "tint",
		mode: "change",
		color: getTint()
	});
}

//Enables the content tint
function enableContentTint() {
	sendMessage({
		to: "content",
		from: "background",
		action: "tint",
		mode: "enable",
		id: "tint-color",
		color: getTint(),
		sessionRunning: sessionRunning
	});
}

//Disables the content tint
function disableContentTint() {
	sendMessage({
		to: "content",
		from: "background",
		action: "tint",
		mode: "disable"
	});
}



/*-------------------------Update Popup-------------------------*/



//Updates the popup sessions
function updatePopupSessions() {
	sendMessage({
		to: "popup",
		from: "background",
		action: "update",
		place: "sessions",
		sessions: sessions
	});
}

//Updates the popup sessions running
function updatePopupSessionRunning() {
	sendMessage({
		to: "popup",
		from: "background",
		action: "update",
		place: "sessionRunning",
		sessionRunning: sessionRunning
	});
}

//Updates the popup blacklisted sites
function updatePopupBlacklistedSites() {
	sendMessage({
		to: "popup",
		from: "backup",
		action: "update",
		place: "blacklistedSites",
		blacklistedSites: blacklistedSites
	});
}

//Updates the popup
function updatePopup() {
	updatePopupSessions();
	updatePopupSessionRunning();
	updatePopupBlacklistedSites();
}



/*-------------------------Blacklist-------------------------*/



//Updates if the current tab is blacklisted
function isCurrentTabBlacklisted() {
	let blacklisted = false;
	for (let i = 0; i < blacklistedSites.length && !blacklisted; i++)
		if (currentSite.url == blacklistedSites[i])
			blacklisted = true;
	onBlacklistedSite = blacklisted;
}



/*-------------------------Chrome Functions-------------------------*/



//Checks the current site to see if it has been filtered. If it hasn't been visited, add it to visited.
//Detects when the user changes tabs
chrome.tabs.onActivated.addListener((activeInfo) => {
	chrome.tabs.query({
		currentWindow: true,
		active: true
	}, (tabs) => {
		try {
			currentSite = {
				url: tabs[0].url,
				tabId: activeInfo.tabId
			};
			if (hasVisitedSite(currentSite))
				updateContentTint();
			else {
				sitesVisited.push(currentSite);
				chrome.tabs.reload(currentSite.tabId);
			}
			
			function hasVisitedSite(site) {
				for (let i = 0; i < sitesVisited.length; i++)
					if (sitesVisited[i].tabId == site.tabId)
						return true;
				return false;
			}
		} catch (error) {
			console.log("tabs are null");
		}
	});
});

chrome.omnibox.onInputEntered.addListener((txt) => {
	alert(txt);
});

//Invoked with Ctrl+Space
chrome.commands.onCommand.addListener((command) => {
	if (command == "display_text" && !sessionRunning)
		sendMessage({
			to: "content",
			from: "background",
			action: "add_text",
			text: sessions[0].name,
			time: sessions[0].time
		});
});
