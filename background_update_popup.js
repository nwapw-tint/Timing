//Updates the popup sessions
function updatePopupSessions() {
	sendMessage({
		to: "popup",
		from: "background",
		action: "update",
		place: "sessions",
		sessions: sessions
	});
}

//Updates the popup sessions running
function updatePopupSessionRunning() {
	sendMessage({
		to: "popup",
		from: "background",
		action: "update",
		place: "sessionRunning",
		sessionRunning: sessionRunning
	});
}

//Updates the popup blacklisted sites
function updatePopupBlacklistedSites() {
	sendMessage({
		to: "popup",
		from: "backup",
		action: "update",
		place: "blacklistedSites",
		blacklistedSites: blacklistedSites
	});
}

//Updates the popup
function updatePopup() {
	updatePopupSessions();
	updatePopupSessionRunning();
	updatePopupBlacklistedSites();
}
