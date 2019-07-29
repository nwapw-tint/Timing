var sessions = [];
var sessionRunning = false, onChromeSite = false;

var currentSite = "";
var sitesVisited = [];
var timeout;

var theme;
//The hidden timer
function timeoutUpdate() {
	if (sessionRunning) {
		sessions[0].time = Math.max(sessions[0].time - 1, 0);
		if (sessions[0].time == 0) {
			sessions.shift();
			updatePopupSessions();
			if (sessions.length == 0) {
				stopSession();
			} else {
				updateContentTint();
			}
		} else {
			updatePopupSessions();
		}
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
	removeContentTint();
	sessionRunning = false;
}

//Gets the tint
function getTint() {
	if (sessions.length > 0) {
		return sessions[0].color;
	} else {
		return CLEAR_COLOR;
	}
}



/*-------------------------Communication-------------------------*/



var ports = [];

//Called when something connects to this
chrome.extension.onConnect.addListener((port) => {
	//Creates the capability to receive messages from different scripts
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

//Sends a message through all of its ports
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

//Enables the content tint
function enableContentTint() {
	sendMessage({
		to: "content",
		from: "background",
		action: "tint",
		mode: "enable",
		color: getTint()
	});
}

//Pauses the content tint
function pauseContentTint() {
	sendMessage({
		to: "content",
		from: "background",
		action: "tint",
		mode: "pause"
	});
}

//Removes the content tint
function removeContentTint(){
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
		color: getTint()
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
		sessionRunning: sessionRunning,
		runningBeforeOnChromeSite: runningBeforeOnChromeSite
	});
}

//Updates the popup theme
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

//Updates the popup start stop button
function updatePopupStartStopButton() {
	sendMessage({
		to: "popup",
		from: "background",
		action: "update",
		place: "start_stop",
		disabled: onChromeSite
	});
}

//Updates the popup
function updatePopup() {
	updatePopupSessions();
	updatePopupSessionRunning();
	updatePopupTheme();
	updatePopupStartStopButton();
}



/*-------------------------Chrome Functions-------------------------*/

var runningBeforeOnChromeSite = false;

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
			console.log("onActivated calls check on"+ currentSite.url);
			useBlacklist(currentSite.url);
			if (currentSite.url.indexOf("chrome://") == 0) {
				onChromeSite = true;
				updatePopupStartStopButton();
				if (sessionRunning) {
					runningBeforeOnChromeSite = true;
					sessionRunning = false;
					updatePopupSessionRunning();
				}
			} else if (onChromeSite) {
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
		} catch (error) {
			console.log("tabs are null");
		}
	});
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	console.log("onUpdated calls on "+tab.url);
	useBlacklist(tab.url);
});

chrome.tabs.onCreated.addListener(function(tab) {  
	console.log("onCreated calls on "+tab.url);
	useBlacklist(tab.url);
});
//use case: whenever the active tab updates its url.
function useBlacklist(url)
{
	var blacklist;
	chrome.storage.sync.get('sites', function(items) {
		if (typeof items.sites === 'undefined') 
		{
			console.log("we tried to check the blacklist, but it hasn't been set yet")
		} 
		else 	
		{
			blacklist = items.sites.split('\n')
			for(i = 0; i<blacklist.length; i++)
			{
				console.log("checking "+blacklist[i]+" against "+url+" which is "+url.includes(blacklist[i]))
				if(url.includes(blacklist[i]))
				{
					console.log("sending blackout");
					sendBlackout();
				}
			}
		}
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
