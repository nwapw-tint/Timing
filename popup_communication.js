var port = chrome.extension.connect({
	name: "popup"
});

//Tells the background script the content script has opened
sendMessage({
	to: "background",
	from: "popup",
	action: "open"
});

//Creates the capability to receive messages from the background script
port.onMessage.addListener((msg) => {
	if (msg.to == "popup") {
		//console.log(msg);
		if (msg.action == "update") {
			switch (msg.place) {
			case "sessions":
				sessions = msg.sessions;
				if (sessions.length == 0)
					sessionRunning = false;
				updateSessionText();
				break;
			case "blacklistedSites":
				blacklistedSites = msg.blacklistedSites;
				break;
			case "sessionRunning":
				sessionRunning = msg.sessionRunning;
				break;
			}
		}
	}
});

//Creates the capability to send messages to the background script
function sendMessage(msg) {
	port.postMessage(msg);
}
