var ports = [];

//Called when something connects to this
chrome.extension.onConnect.addListener((port) => {
	//Creates the capability to receive messages from
	port.onMessage.addListener((msg) => {
		if (msg.to == "background") {
			//console.log(msg);
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
					updateContentColor();
				}
			case "checkRunning":
				if (sessionRunning) {
					stopSession();
					startSession();
				}
				// isCurrentTabBlacklisted();
				// console.log(onBlacklistedSite);
				break;
			}
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

//Detects when the user changes tabs
chrome.tabs.onActivated.addListener((activeInfo) => {
	chrome.tabs.query({
		currentWindow: true,
		active: true
	}, (tabs) => {
		try {
			let currentSite = tabs[0].url;
			if (sitesVisited.indexOf(currentSite) == -1) {
				sitesVisited.push(currentSite);
				chrome.tabs.reload(activeInfo.tabId);
			}
		} catch (error) {
			console.log("tabs are null");
		}
	});
});
