function updateContentColor() {
	sendMessage({
		to: "content",
		from: "background",
		action: "tint",
		mode: "change",
		color: getTintColor()
	});
}

function displayText(taskText) {
	sendMessage({
		to: "content",
		from: "background",
		action: "add_text",
		text: taskText + timeToDigital(sessions[0])//TODO: convert to readable time
	});
}
