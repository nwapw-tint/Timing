//Called when the popup loads
document.addEventListener('DOMContentLoaded', () => {
	let canvas = document.createElement('canvas');
	let context = canvas.getContext('2d');
	colorImg = document.getElementById('color_img');
	canvas.width = colorImg.width;
	canvas.height = colorImg.height;
	context.drawImage(colorImg, 0, 0);
	colorData = context.getImageData(0, 0, colorImg.width, colorImg.height);

	//Invoked when the mouse is moved
	window.addEventListener('mousemove', (e) => {
		mouseX = e.screenX - window.screenX - 11;
		mouseY = e.screenY - window.screenY - 9;
	}, false);

	//Invoked when the mouse is clicked
	window.addEventListener('click', (e) => {
		let color = getColorFrom(Math.floor((mouseX - colorImg.x) / 4), Math.floor((mouseY - colorImg.y) / 4));
		if (color)
			if (addToBlacklisted) {
				bColor = color;
				sendMessage({
					to: "background",
					from: "popup",
					action: "update",
					place: "bColor",
					bColor: color
				});
			} else
				nColor = color;
	});
	
	//Adds a session to the queue
	addClickListener('add_session_button', () => {
		var time = document.getElementById('time_input').value;
		if (time.length == 0)
			showError("Time is empty!");
		else if (isNaN(time)) {
			showError("Time is not a number!");
		} else if (time > maxTime)
			showError("Time is too long!");
		else
			addSession(time);
	});
	
	//Adds a blacklisted site
	addClickListener('add_site_button', () => {
		let site = document.getElementById('site_input').value;
		if (site.length == 0)
			showError("Site is empty!");
		else {
			let siteAlreadyBlacklisted = false;
			for (let i = 0; i < blacklistedSites.length && !siteAlreadyBlacklisted; i++)
				if (blacklistedSites[i] == site)
					siteAlreadyBlacklisted = true;
			if (!siteAlreadyBlacklisted) {
				blacklistedSites.push(site);
				sendMessage({
					to: "background",
					from: "popup",
					action: "push",
					place: "blacklistedSites",
					blacklistedSite: site
				});
				document.getElementById('site_input').value = "";
			}
		}
	});
	
	//Starts the session
	addClickListener('start_session_button', () => {
		if (sessions.length == 0)
			showError("No sessions!");
		else if (sessionRunning)
			showError("Session already started!");
		else {
			sessionRunning = true;
			sendMessage({
				to: "background",
				from: "popup",
				action: "timer",
				mode: "start"
			});
		}
	});
	
	//Pauses the session
	addClickListener('pause_session_button', () => {
		if (!sessionRunning)
			showError("Session not started!");
		else {
			sessionRunning = false;
			sendMessage({
				to: "background",
				from: "popup",
				action: "timer",
				mode: "stop"
			});
		}
	});
	
	addClickListener('normal_radio', () => {
		addToBlacklisted = false;
	});
	
	addClickListener('blacklisted_radio', () => {
		addToBlacklisted = true;
	});
}, false);
