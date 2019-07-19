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
			case "sessions":
				sessions.push(msg.session);
				break;
			case "blacklistedSites":
				blacklistedSites.push(msg.blacklistedSite);
				updateContentColor();
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
			if (msg.place == "sessions")
				sessions = msg.sessions;
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
