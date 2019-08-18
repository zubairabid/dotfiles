'use strict';

const titleContainer = '[class*=PlayerControlsMetadata]';

Connector.playerSelector = '[class^=AudioVideoPlayerView-container]';

Connector.trackSelector = `${titleContainer} a[class*=MetadataPosterTitle]`;

Connector.albumSelector = `${titleContainer} [class*=MetadataPosterTitle-title] > a:nth-child(3)`;

Connector.artistSelector = `${titleContainer} [class*=MetadataPosterTitle-title] > a:nth-child(1)`;

Connector.timeInfoSelector = `${Connector.playerSelector} [class*=DurationRemaining-container]`;

// NOTE: Blob URLs used in Plex aren't supported by Firefox 67 and older.
Connector.trackArtSelector = [
	`${Connector.playerSelector} [class^=PosterCardImg-imageContainer] div`,
	'[class^=AudioVideoFullPlayer] [class^=PosterCardImg-imageContainer] div',
];

Connector.pauseButtonSelector = [
	`${Connector.playerSelector} [data-qa-id="pauseButton"]`,
	`${Connector.playerSelector} [class^=plex-icon-player-pause]`,
];

// For watch-it-later videos
Connector.artistTrackSelector = `${Connector.playerSelector} [class*=MetadataPosterTitle-title]`;

Connector.applyFilter(MetadataFilter.getYoutubeFilter());

Connector.getTrack = () => {
	if (Connector.getArtist()) {
		return $(Connector.trackSelector).text();
	}
	return null;
};
