var sessions = [];
var sessionRunning = false;

var blacklistedSites = [];
var onBlacklistedSite = false;
var bColor = "rgba(255, 0, 0, " + alpha + ")";

var currentSite = "";
var sitesVisited = [];

//The hidden timer
function showSecondTimeout() {
	setTimeout(() => {
		if (sessionRunning) {
			sessions[0].time = Math.max(sessions[0].time - 1, 0);
			if (sessions[0].time == 0) {
				const s = sessions;
				sessions.shift();
				updatePopupSessions();
				if (sessions.length == 0) {
					//alert("All sessions finished!");
					stopSession();
				} else {
					//alert("Session finished!");
					sessions = s;
					updateContentTint();
					showSecondTimeout();
				}
			} else {
				updatePopupSessions();
				showSecondTimeout();
			}
		}
	}, 1000);
}

//Starts a session
function startSession() {
	if (!sessionRunning) {
		sessionRunning = true;
		showSecondTimeout();
	}
	enableContentTint();
}

//Stops a session
function stopSession() {
	sessionRunning = false;
	disableContentTint();
}

//Gets the tint
function getTint() {
	isCurrentTabBlacklisted();
	if (sessions.length > 0)
		return onBlacklistedSite ? bColor : sessions[0].color;
	else
		return CLEAR_COLOR;
}
