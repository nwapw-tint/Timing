var ports = [];

//Called something connects to this
chrome.extension.onConnect.addListener((port) => {
	//Creates the capability to receive messages from
	port.onMessage.addListener((msg) => {
		if (msg.to == "background") {
			if (msg.action == "open") {
				console.log("The port \"" + port.name + "\" has been connected");
				sendMessage({
					to: port.name,
					from: "background",
					action: "connected"
				});
			} else {
				console.log("ERROR");
				console.log(msg);
			}
		}
	});
	port.index = ports.length;
	
	port.onDisconnect.addListener((msg) => {
		ports.splice(port.index, 1);
		console.log("The port \"" + port.name + "\" has been disconnected");
	});
	ports.push(port);
});

//Sends a message through all of its ports
function sendMessage(msg) {
	for (port of ports)
		port.postMessage(msg);
}



/*-------------------------End of Communication-------------------------*/



var sessions = [];
var currentSessionTime = 0;
var sessionRunning = false;

var whitelistedColor = {"r": 0, "g": 255, "b": 0, "a": 100};
var blacklistedColor = {"r": 255, "g": 0, "b": 0, "a": 100};
var blacklistedSites = [];