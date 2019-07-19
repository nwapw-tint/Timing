function isCurrentTabBlacklisted() {
	let blacklisted = false;
	for (let i = 0; i < blacklistedSites.length && !blacklisted; i++)
		if (currentSite == blacklistedSites[i])
			blacklisted = true;
	onBlacklistedSite = blacklisted;
}
