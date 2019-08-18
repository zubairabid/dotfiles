'use strict';

Connector.playerSelector = '#player-controls';

Connector.artistSelector = '#player-nowplaying [href^="/artist/"]';

Connector.trackSelector = '#player-nowplaying [href^="/track/"]';

Connector.trackArtSelector = [
	'.haarp-active .thumb', '.thumb'
];

Connector.isTrackArtDefault = (url) => url.includes('solid_color');

Connector.getUniqueID = () => {
	let trackUrl = $('#player-nowplaying [href^="/track/"]').attr('href');
	if (trackUrl) {
		return trackUrl.split('/').pop();
	}
	return null;
};

Connector.isPlaying = () => $('#playerPlay').hasClass('pause');

Connector.currentTimeSelector = '#player-time-position';

Connector.durationSelector = '#player-time-total';
