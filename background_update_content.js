function updateContentColor() {
	sendMessage({
		to: "content",
		from: "background",
		action: "tint",
		mode: "change",
		color: getNextTintColor()
	});
}

function displayText(taskText) {
	sendMessage({
		to: "content",
		from: "background",
		action: "add_text",
		text: taskText + " "+timeToDigital(sessions[0])
	});
}
