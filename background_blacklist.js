function isCurrentTabBlacklisted() {
	chrome.tabs.query({
		currentWindow: true,
		active: true
	}, (tabs) => {
		let currentSite = tabs[0].url
		console.log(tabs[0].url);
		let blacklisted = false;
		for (let i = 0; i < blacklistedSites.length && !blacklisted; i++)
			if (currentSite == blacklistedSites[i])
				blacklisted = true;
		onBlacklistedSite = blacklisted;
	});
}
