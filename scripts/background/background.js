var sessions = [];
var sessionRunning = false, onChromeSite = false;

var currentSite = "";
var timeout;
var sitesVisited = [];
var theme;

// The hidden timer
function timeoutUpdate() {
	if (sessionRunning) {
		sessions[0].time = Math.max(sessions[0].time - 1, 0);
		if (sessions[0].time == 0) {
			sessions.shift();
			updatePopupSessions();
			if (sessions.length == 0) {
				stopSession();
				updatePopupETA()
			} else {
				setContentTint();
			}
		} else {
			updatePopupSessions();
		}
	}
}

// Starts a session
function startSession() {
	if (!sessionRunning) {
		timeout = setInterval(timeoutUpdate, 1000);
		sessionRunning = true;
	}
	console.log("enabling content tint");
	setContentTint();
	updatePopupETA();
	startPeriodicETAUpdate();
}

// Stops a session
function stopSession() {
	clearInterval(timeout);
	clearContentTint();
	sessionRunning = false;
}

// Gets the tint
function getTint() {
	if (sessions.length > 0) {
		return sessions[0].color;
	} else {
		return CLEAR_COLOR;
	}
}



/*-------------------------Communication-------------------------*/



var ports = [];

// Called when something connects to this
chrome.extension.onConnect.addListener((port) => {
	// Creates the capability to receive messages from different scripts
	port.onMessage.addListener((msg) => {
		if (msg.to != "background") {
			return;
		}
		switch (msg.action) {
			case "open":
				console.log("The port \"" + port.name + "\" has been connected");
				if (port.name == "popup") {
					updatePopup();
				}
				port.postMessage({
					to: port.name,
					from: "background",
					action: "open"
				});
				break;
			case "timer":
				if (currentSite.url.indexOf("chrome://") != 0) {
					switch (msg.mode) {
						case "start":
							console.log("attempting to start session")
							startSession();
							break;
						case "stop":
							stopSession();
							break;
					}
				}
				break;
			case "push":
				if (msg.place == "sessions") {
					sessions.push(msg.session);
					updatePopupETA();
				}
				break;
			case "shift":
				if (msg.place == "sessions") {
					sessions.shift();
					if (sessions.length == 0) {
						stopSession();
					}
				}
				break;
			case "update":
				switch (msg.place) {
					case "sessions":
						sessions = msg.sessions;
						if (sessions.length == 0) {
							stopSession();
						} else if (sessionRunning) {
							setContentTint();
						}
						updatePopupETA();
						break;
					case "theme":
						theme = msg.theme;
						break;
				}
				break;
			case "checkRunning":
				if (sessionRunning) {
					console.log("checkRunning calls setContentTint")
					setContentTint();
				}
				break;
			case "error":
				alert(msg.error);
				break;
		}
	});
	port.index = ports.length;

	port.onDisconnect.addListener(() => {
		if (port.index == -1) {
			return;
		}
		port.index = -1;
		console.log("The port \"" + port.name + "\" has been disconnected");
		ports.splice(port.index, 1);
	});
	ports.push(port);
});

// Sends a message through all of its ports
function sendMessage(msg) {
	for (port of ports) {
		if (port.index != -1) {
			port.postMessage(msg);
		}
	}
}



/*-------------------------Update Content-------------------------*/



//Updates the content tint to the specified color
function setContentTint() {
	sendMessage({
		to: "content",
		from: "background",
		action: "tint",
		mode: "set",
		color: getTint()
	});
}

// Pauses the content tint
function clearContentTint() {
	sendMessage({
		to: "content",
		from: "background",
		action: "tint",
		mode: "clear"
	});
}

// Clears the content text
function clearText() {
	sendMessage({
		to: "content",
		from: "background",
		action: "remove_text"
	});
}



/*-------------------------Update Popup-------------------------*/



// Updates the popup ETA
function updatePopupETA(text) {
	let updateText = "";
	let totalTime = 0;
	for (session of sessions) {
		totalTime += session.time;
	}
	if (totalTime != 0) {
		var d = new Date(); // For now
		d.setSeconds(d.getSeconds() + totalTime);
		latin = "AM";
		hourformatString = d.getHours();
		if (hourformatString > 11) {
			latin = "PM";
		}
		if (hourformatString > 12) {
			hourformatString -= 12;
		}
		minuteformatString = d.getMinutes();
		if (minuteformatString < 10) {
			minuteformatString = "0" + minuteformatString;
		}
		updateText = "ETA " + hourformatString + ":" + minuteformatString + " " + latin;
		if (sessions.length == 0) {
			updateText = "";
			alert("no sessions read by eta");
		};
	}
	sendMessage({
		to: "popup",
		from: "background",
		action: "update",
		place: "ETA",
		text: updateText
	});
}

// Updates the popup sessions
function updatePopupSessions() {
	sendMessage({
		to: "popup",
		from: "background",
		action: "update",
		place: "sessions",
		sessions: sessions
	});
}

// Updates the popup sessions running
function updatePopupSessionRunning() {
	sendMessage({
		to: "popup",
		from: "background",
		action: "update",
		place: "sessionRunning",
		sessionRunning: sessionRunning,
		runningBeforeOnChromeSite: runningBeforeOnChromeSite
	});
}

// Updates the popup theme
function updatePopupTheme() {
	if (theme) {
		sendMessage({
			to: "popup",
			from: "background",
			action: "update",
			place: "theme",
			theme: theme
		});
	}
}

// Updates the popup start stop button
function updatePopupStartStopButton() {
	sendMessage({
		to: "popup",
		from: "background",
		action: "update",
		place: "start_stop",
		currentSite: currentSite
	});
}

// Updates the popup
function updatePopup() {
	updatePopupETA();
	updatePopupSessions();
	updatePopupSessionRunning();
	updatePopupTheme();
	updatePopupStartStopButton();
}



/*-------------------------Chrome Functions-------------------------*/

var runningBeforeOnChromeSite = false;

// Checks the current site to see if it has been filtered. If it hasn't been visited, add it to visited
function updateTabInfo(url, tabId) {
	currentSite = {
		url: url,
		tabId: tabId
	};
	if (currentSite.url.indexOf("chrome://") == 0) {
		onChromeSite = true;
		updatePopupStartStopButton();
		if (sessionRunning) {
			runningBeforeOnChromeSite = true;
			sessionRunning = false;
			updatePopupSessionRunning();
		}
	} else if (onChromeSite && currentSite.url.indexOf("chrome://") != 0) {
		onChromeSite = false;
		updatePopupStartStopButton();
		if (sessions.length > 0 && runningBeforeOnChromeSite) {
			runningBeforeOnChromeSite = false;
			sessionRunning = true;
			updatePopupSessionRunning();
		}
	}
	if (hasVisitedSite(currentSite)) {
		setContentTint();
	} else {
		sitesVisited.push(currentSite);
		chrome.tabs.reload(currentSite.tabId);
	}
	function hasVisitedSite(site) {
		for (let i = 0; i < sitesVisited.length; i++) {
			if (sitesVisited[i].tabId == site.tabId) {
				return true;
			}
		}
		return false;
	}
}

// Detects when the user changes tabs
chrome.tabs.onActivated.addListener((activeInfo) => {
	clearText();
	console.log("Activated");
	chrome.tabs.query({
		currentWindow: true,
		active: true
	}, (tabs) => {
		try {
			updateTabInfo(tabs[0].url, activeInfo.tabId);
			console.log("Success");
		} catch (error) {
			console.log("tabs are null");
		}
	});
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	console.log("onUpdated calls on " + tab.url);
	updateTabInfo(tab.url, tabId);
});

chrome.tabs.onCreated.addListener((tab) => {
	console.log("onCreated calls on " + tab.url);

});

var commandedRecently = false;

//Invoked with Ctrl + Space
chrome.commands.onCommand.addListener((command) => {
	if(commandedRecently){return;}
	commandedRecently = true;
	if (command == "display_text" && sessionRunning) {
		console.log("sending display text message");
		sendMessage({
			to: "content",
			from: "background",
			action: "add_text",
			text: sessions[0].name,
			time: sessions[0].time
		});
		setTimeout(() => {
			commandedRecently = false;
		}, textDisplayLength);
	}
});

// Invoked immediately
(() => {
	chrome.tabs.getSelected(null, (tab) => {
		currentSite = {
			url: tab.url,
			tabId: tab.id
		};
		sitesVisited.push(currentSite);
		onChromeSite = true;
		if (sessionRunning) {
			runningBeforeOnChromeSite = true;
			sessionRunning = false;
			updatePopupSessionRunning();
		}
		updatePopupStartStopButton();
	});
})();



/*-------------------------ETA-------------------------*/



chrome.alarms.onAlarm.addListener(() => {
	updatePopupETA();
});

function startPeriodicETAUpdate() {
	chrome.alarms.create({
		periodInMinutes: 1
	});
}
