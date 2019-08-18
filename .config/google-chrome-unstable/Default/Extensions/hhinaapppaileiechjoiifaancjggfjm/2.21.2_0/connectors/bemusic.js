'use strict';

/*
 * This connector is for BeMusic music streaming engines.
 */

setupConnector();

function setupConnector() {
	if (isOldBeMusic()) {
		setupOldBeMusicPlayer();
	} else {
		setupNewBeMusicPlayer();
	}
	setupCommonProps();
}

function isOldBeMusic() {
	return $('body').attr('ng-app') !== undefined;
}

function setupNewBeMusicPlayer() {
	Connector.playerSelector = 'player-controls';

	Connector.getArtist = () => {
		let artist = $('.current-track .artist-name span').first();
		return artist.get(0).firstChild.textContent;
	};

	Connector.pauseButtonSelector = [
		'player-controls .icon-pause',
		'player-controls .pause-track'
	];
}

function setupOldBeMusicPlayer() {
	Connector.playerSelector = '#player-controls';

	Connector.getArtist = () => {
		let artist = $('.current-track .info .artist').first();
		return artist.get(0).firstChild.textContent;
	};

	Connector.pauseButtonSelector = '#player-controls .icon-pause';

	Connector.getUniqueID = () => {
		try {
			let lastTrack = JSON.parse(localStorage.getItem('last-track'));
			if (lastTrack) {
				return lastTrack.value.id.toString();
			}
		} catch (e) {
		}

		return null;
	};
}

function setupCommonProps() {
	Connector.trackSelector = '.current-track .track-name';

	Connector.trackArtSelector = '.current-track img';

	Connector.durationSelector = '.track-length';

	Connector.currentTimeSelector = '.elapsed-time';
}
