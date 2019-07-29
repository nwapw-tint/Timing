var sessions = [];
var sessionRunning = false, onChromeSite = false;

var currentSite = "";
var sitesVisited = [];
var timeout;

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
				updateETA()
			} else {
				updateContentTint();
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
	if(!useBlacklist(currentSite.url))
	{
	console.log("enabling content tint");
	enableContentTint();
	updateETA();
	}
}

// Stops a session
function stopSession() {
	clearInterval(timeout);
	removeContentTint();
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
				updateETA();
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
				} else {
					updateContentTint();
				}
				updateETA();
				break;
			case "theme": 
				theme = msg.theme;
				break;
			}
			break;
		case "checkRunning":
			if (sessionRunning) {
				enableContentTint();
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
function updateContentTint() {
	sendMessage({
		to: "content",
		from: "background",
		action: "tint",
		mode: "change",
		color: getTint()
	});
}

// Enables the content tint
function enableContentTint() {
	sendMessage({
		to: "content",
		from: "background",
		action: "tint",
		mode: "enable",
		color: getTint()
	});
}

// Pauses the content tint
function pauseContentTint() {
	sendMessage({
		to: "content",
		from: "background",
		action: "tint",
		mode: "pause"
	});
}

// Removes the content tint
function removeContentTint() {
	sendMessage({
		to: "content",
		from: "background",
		action: "tint",
		mode: "remove"
	});
}

function sendBlackout(){
	sendMessage({
		to: "content",
		from: "background",
		action: "tint",
		mode: "blackout",
		text: sessions[0].name,
		time: sessions[0].time
	});
}



/*-------------------------Update Popup-------------------------*/



function updatePopupETA(text)
{
	sendMessage(
		{
			to: "popup",
			from: "background",
			action: "update",
			place: "ETA",
			text:text
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
	if (theme)
		sendMessage({
			to: "popup",
			from: "background",
			action: "update",
			place: "theme",
			theme: theme
		});
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
	//console.log("onActivated calls check on"+ currentSite.url);
	//useBlacklist(currentSite.url);
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
		updateContentTint();
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
	console.log("###onUpdated calls on " + tab.url);
	useBlacklist(tab.url);
	updateTabInfo(tab.url, tabId);
});

chrome.tabs.onCreated.addListener((tab) => {  
	console.log("###onCreated calls on " + tab.url);
	useBlacklist(tab.url);
});

// Use case: whenever the active tab updates its url
function useBlacklist(url) {
	let blacklist;
	chrome.storage.sync.get('sites', (items) => {
		if (items.sites === undefined) {
			console.log("we tried to check the blacklist, but it hasn't been set yet")
		} else {
			blacklist = items.sites.split('\n');
			for (let i = 0; i < blacklist.length; i++) {
				//console.log("checking " + blacklist[i] + " against " + url + " which is " + url.includes(blacklist[i]));
				// If a match is found and a session is running
				if (url.includes(blacklist[i]) && sessionRunning) {
					console.log("sent a blackout request");
					sendBlackout();
					return true;
				} else if(url.includes(blacklist[i])){console.log("a match was found but no session running")}
			}
		}
		return false;
	});
}

//Invoked with Ctrl+Space
chrome.commands.onCommand.addListener((command) => {
	if (command == "display_text" && sessionRunning) {
		sendMessage({
			to: "content",
			from: "background",
			action: "add_text",
			text: sessions[0].name,
			time: sessions[0].time
		});
	}
});

// Invoked immediately
(() => {
	chrome.tabs.getSelected(null, (tab) => {
		console.log(tab);
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

function updateETA()
{
	totalTime = 0;
	for(a of sessions)
	{
		totalTime += a.time;
	}
	var d = new Date(); // for now
	d.setSeconds(d.getSeconds() + totalTime);
	latin = "AM";
	hourformatString = d.getHours();
	if(hourformatString > 12){hourformatString-=12; latin = "PM"}
	updatePopupETA(hourformatString+":"+d.getMinutes()+" "+latin);
}