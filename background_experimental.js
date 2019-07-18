var taskText = "make skynet";

chrome.omnibox.onInputEntered.addListener((txt) => {
	alert(txt);
});
chrome.commands.onCommand.addListener((command) => {
	if (command == "display_text")
        displayText(taskText);
});
