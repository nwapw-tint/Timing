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
	if (msg.to == "content") {
		//console.log(msg);
		switch (msg.action) {
		case "tint":
			switch (msg.mode) {
			case "enable":
				enableTint(msg.id, msg.color, msg.duration);
				break;
			case "disable":
				disableTint();
				break;
			case "change":
				setTintColor(msg.color);
				break;
			}
			break;
		case "add_text":
			addText(msg.text, msg.time);
			break;
		}
	}
});

//Creates the capability to send messages to the background script
function sendMessage(msg) {
	port.postMessage(msg);
}

document.addEventListener('DOMContentLoaded', () => {
	sendMessage({
		to: "background",
		from: "content",
		action: "checkRunning"
	});
}, false);
