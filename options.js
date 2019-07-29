var sites;
input = document.getElementById('sites');
function save_options() {
    sites = input.value;
    chrome.storage.sync.set({
      sites:sites
    }, function() {var status = document.getElementById('status');
    status.textContent = 'Just saved.';
    setTimeout(function() {
      status.textContent = 'Automatically Saved.';
    }, 750);
    sendSites(sites)});
  }

  function restore_options() {
    chrome.storage.sync.get({
      sites: "Enter sites to blacklist, separated by a newline."
    }, function(items) {
      document.getElementById('sites').value = items.sites;
    });
  }

document.addEventListener('DOMContentLoaded', restore_options);
input.addEventListener("blur", function(event){console.log("saving");save_options()});

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