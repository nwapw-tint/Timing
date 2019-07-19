const CLEAR_COLOR = {
	r: 255,
	g: 255,
	b: 255,
	a: 0
};

var sessions = [];
var sessionRunning = false;

var blacklistedSites = [];
var onBlacklistedSite = false;

var currentSite = "";
var sitesVisited = [];

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
	isCurrentTabBlacklisted();
	if (sessions.length > 0)
		return onBlacklistedSite ? bColor : sessions[0].color;
	else
		return CLEAR_COLOR;
}
