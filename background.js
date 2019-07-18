//experimental 
chrome.omnibox.onInputEntered.addListener(
    function(txt) {
        alert(txt);
    });
chrome.commands.onCommand.addListener(function(command) {
    if(command == "displayText")
    {
        chrome.tabs.executeScript({
            file: 'addText.js'
            })
    }
    });