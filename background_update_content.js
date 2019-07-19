//updates the 
function updateContentColor() {
	sendMessage({
		to: "content",
		from: "background",
		action: "tint",
		mode: "change",
		color: getTintColor()
	});
}


