function search(info, tab) {
	var src = info.srcUrl;
	if (src.indexOf('data:') == 0) {
		webkitNotifications.createNotification('img/icon-48.png', 'Error!', '"data:" URIs are not currently supported.').show();
		return;
	}
	var reqUrl = 'http://karmadecay.com/' + encodeURIComponent(src);
	chrome.tabs.create({url: reqUrl, selected: true });
}

chrome.contextMenus.create({'title': 'Search for this image on Karma Decay', 'contexts': ['image'], 'onclick': search});