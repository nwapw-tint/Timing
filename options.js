var sites;
var input = document.getElementById('sites');

function saveOptions() {
	sites = input.value;
	chrome.storage.sync.set({
		sites: sites
	}, () => {
		var status = document.getElementById('status');
		status.textContent = 'Just Saved';
		setTimeout(() => {
			status.textContent = 'Automatically Saved';
		}, 750);
		sendSites(sites)
	});
}

function restoreOptions() {
	chrome.storage.sync.get({
		sites: "Enter sites to blacklist, separated by a new line."
	}, (items) => {
		document.getElementById('sites').value = items.sites;
	});
}

function sendSites(sites) {
    sendMessage({
        to: "background",
        from: "options",
        action: "blacklist",
        sites: sites
    });
}



/*-------------------------On Load-------------------------*/



document.addEventListener('DOMContentLoaded', () => {
	restoreOptions();
	input.addEventListener("blur", (e) => {
		console.log("saving");
		saveOptions();
	});
});



/*-------------------------Communiaction-------------------------*/



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
    switch (msg.action) {
	case "open":
		console.log("Connected to the background script");
		break;
	}
});

//Creates the capability to send messages to the background script
function sendMessage(msg) {
	port.postMessage(msg);
}
