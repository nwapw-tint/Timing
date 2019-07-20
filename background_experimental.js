chrome.omnibox.onInputEntered.addListener((txt) => {
	alert(txt);
});

//Invoked with Ctrl+Space
chrome.commands.onCommand.addListener((command) => {
	if (command == "display_text")
		sendMessage({
			to: "content",
			from: "background",
			action: "add_text",
			text: sessions[0].name,
			time: sessions[0].time
		});
});
