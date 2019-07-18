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
		console.log(msg);
		if (msg.action == "tint") {
			if (msg.mode == "enable")
				enableTint(msg.id, msg.color, msg.opacity, msg.duration);
			else if (msg.mode == "disable")
				disableTint();
			else if (msg.mode == "change")
				setTintColor(rgbToHex(msg.color));
		} else if (msg.action == "add_text") {
            addText(msg.text);
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
