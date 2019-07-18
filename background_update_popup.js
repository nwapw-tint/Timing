function updatePopupSessions() {
	sendMessage({
		to: "popup",
		from: "background",
		action: "update",
		place: "sessions",
		sessions: sessions
	});
}

function updatePopupBlacklistedSites() {
	sendMessage({
		to: "popup",
		from: "backup",
		action: "update",
		place: "blacklistedSites",
		blacklistedSites: blacklistedSites
	});
}

function updatePopupSessionRunning() {
	sendMessage({
		to: "popup",
		from: "background",
		action: "update",
		place: "sessionRunning",
		sessionRunning: sessionRunning
	});
}
