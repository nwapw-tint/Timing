var sessions = [];
var isSessionRunning;

chrome.storage.sync.set({sessionRunning: 0})

chrome.storage.onChanged.addListener(function(changes, areaName){sessionRunning()});

function sessionRunning()
{
	chrome.storage.sync.get('sessionRunning', function(result) {
		isSessionRunning = result.sessionRunning;
	  });
}

chrome.storage.sync.set({'currentSite':""});
onChromeSite = false;
var alpha = 0.32;
var timeout;
var theme;
// The hidden timer
function timeoutUpdate() {
	if (isSessionRunning) {
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
	if (!isSessionRunning) {
		timeout = setInterval(timeoutUpdate, 1000);
		chrome.storage.sync.set({'sessionRunning': 1});
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
	chrome.storage.sync.set({'sessionRunning': 0});
}

// Gets the tint
function getTint() {
	if (sessions.length > 0) {
		carray = sessions[0].color.split(',');
		finalColor= carray[0]+","+carray[1]+","+carray[2]+","+alpha+")";
		console.log(finalColor);
		return finalColor;
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
			case "setVars":
				setVars();
				break;
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
						} else if (isSessionRunning) {
							setContentTint();
						}
						updatePopupETA();
						break;
					case "theme":
						theme = msg.theme;
						break;
				}
				break;
			case "setInitStatus":
				console.log("setting initial state")
				if (isSessionRunning) {
					setContentTint();
				} else{clearContentTint()}
				break;
			case "updateAlpha":
				updateAlpha(msg.dalpha);
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

function setVars()
{
	if(sessions[0])
	{
	chrome.storage.sync.set({text: sessions[0].name});
	chrome.storage.sync.set({time: sessions[0].time});
	} else {console.log("no sessions found")}
}

//Updates the content tint to the specified color
function setContentTint() {
	console.log("setContentTint");
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
	console.log("clearContentTint")
	sendMessage({
		to: "content",
		from: "background",
		action: "tint",
		mode: "clear"
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
		sessionRunning: isSessionRunning,
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

// Updates the popup start stop button with chrome status
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
		if (isSessionRunning) {
			runningBeforeOnChromeSite = true;
			chrome.storage.sync.set({'sessionRunning': 0});

			updatePopupSessionRunning();
		}
	} else if (onChromeSite && currentSite.url.indexOf("chrome://") != 0) {
		onChromeSite = false;
		updatePopupStartStopButton();
		if (sessions.length > 0 && runningBeforeOnChromeSite) {
			runningBeforeOnChromeSite = false;
			chrome.storage.sync.set({'sessionRunning': 1});
			console.log("sessionRunning set to TRUE");
			updatePopupSessionRunning();
		}
	}
	if(isSessionRunning){
	setContentTint();}
}

// Detects when the user changes tabs
chrome.tabs.onActivated.addListener((activeInfo) => {
	chrome.tabs.query({
		currentWindow: true,
		active: true
	}, (tabs) => {
		try {
			updateTabInfo(tabs[0].url, activeInfo.tabId);
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

// Invoked immediately
(() => {
	chrome.tabs.getSelected(null, (tab) => {
		currentSite = {
			url: tab.url,
			tabId: tab.id
		};
		onChromeSite = true;
		if (isSessionRunning) {
			runningBeforeOnChromeSite = true;
			chrome.storage.sync.set({'sessionRunning': 0});
			updatePopupSessionRunning();
		}
		updatePopupStartStopButton();
	});
})();

function updateAlpha(dalpha)
{
alpha = alpha+ dalpha;
setContentTint();
}

/*-------------------------ETA-------------------------*/



chrome.alarms.onAlarm.addListener(() => {
	updatePopupETA();
});

function startPeriodicETAUpdate() {
	chrome.alarms.create({
		periodInMinutes: 1
	});
}
