const CLEAR_COLOR = {
	r: 255,
	g: 255,
	b: 255,
	a: 0
};

var sessions = [];
var sessionRunning = false;

var currentSessionTime = 0;
var sessionsWColors = [];
var sessionsBColors = [];
var blacklistedSites = [];
var onBlacklistedSite = false;

var sitesVisited = [];

function showSecondTimeout() {
	setTimeout(() => {
		if (sessionRunning) {
			sessions[0] = Math.max(sessions[0] - 1, 0);
			if (sessions[0] == 0) {
				const s = sessions;
				const w = sessionsWColors;
				const b = sessionsBColors;
				sessions.shift();
				sessionsWColors.shift();
				sessionsBColors.shift();
				updatePopupSessions();
				if (sessions.length == 0) {
					//alert("All sessions finished!");
					sessionRunning = false;
					sendMessage({
						to: "content",
						from: "background",
						action: "tint",
						mode: "disable"
					});
				} else {
					//alert("Session finished!");
					sessions = s;
					sessionsWColors = w;
					sessionsBColors = b;
					updateContentColor();
					showSecondTimeout();
				}
			} else {
				updatePopupSessions();
				showSecondTimeout();
			}
		}
	}, 1000);
}

function startSession() {
	if (!sessionRunning)
		showSecondTimeout();
	sessionRunning = true;
	sendMessage({
		to: "content",
		from: "background",
		action: "tint",
		mode: "enable",
		id: "tint-color",
		color: getTintColor(),
		duration: 100
	});
}

function stopSession() {
	sessionRunning = false;
	sendMessage({
		to: "content",
		from: "background",
		action: "tint",
		mode: "disable"
	});
}

function getTintColor() {
	// isCurrentTabBlacklisted();
	if (sessions.length > 0)
		// if (onBlacklistedSite)
		// 	return sessionsBColors[0];
		// else
			return sessionsWColors[0];
	else
		return CLEAR_COLOR;
}
