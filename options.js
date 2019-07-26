var sites;
function save_options() {
    sites = document.getElementById('sites').value;
    chrome.storage.sync.set({
      sites:sites
    }, function() {sendSites(sites)});
  }

  function restore_options() {
    chrome.storage.sync.get({
      sites: "Enter sites to blacklist, separated by a newline."
    }, function(items) {
      document.getElementById('sites').value = items.sites;
    });
  }

document.addEventListener('DOMContentLoaded', restore_options);
window.addEventListener("beforeunload", function(event){console.log("closing");save_options()});

var port = chrome.extension.connect({
	name: "options"
});

//Tells the background script the content script has opened
sendMessage({
	to: "background",
	from: "options",
	action: "open"
});

//Creates the capability to receive messages from the background script
port.onMessage.addListener((msg) => {
	if (msg.to != "options") {
		return;
    }
    //all message to all ports
});

//Creates the capability to send messages to the background script
function sendMessage(msg) {
	port.postMessage(msg);
}
function sendSites(sites)
{
    sendMessage({
        to: "background",
        from: "options",
        action: "blacklist",
        sites: sites
    })
}