var port = chrome.extension.connect({
	name: "content"
});

//Tells the background script the content script has opened
sendMessage({
	to: "background",
	from: "content",
	action: "open"
});

//Creates the capability to receive messages from the background script
port.onMessage.addListener((msg) => {
	console.log("content recieve");
	if (msg.to == "content") {
		console.log("content accept");
		console.log(msg);
		if (msg.place == "colors") {
			wColor = msg.wColor;
			bColor = msg.bColor;
		}
	} else
		console.log("content ignore");
});

//Creates the capability to send messages to the background script
function sendMessage(msg) {
	console.log("content send");
	port.postMessage(msg);
}



/*-------------------------End of Communication-------------------------*/



var wColor;
var bColor;