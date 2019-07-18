
chrome.omnibox.onInputEntered.addListener((txt) => {
	alert(txt);
});
var taskText = "make skynet";
chrome.commands.onCommand.addListener((command) => {
	if (command == "display_text")
	{
	sendMessage({
		to: "content",
		from: "background",
		action: "add_text",
		text: taskText,
		time: sessions[0]
	})
	}
});
