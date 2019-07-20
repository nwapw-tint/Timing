//Updates the content tint
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
		id: "tint-color",
		color: getTint()
	});
}

//Disables the content tint
function disableContentTint() {
	sendMessage({
		to: "content",
		from: "background",
		action: "tint",
		mode: "disable"
	});
}