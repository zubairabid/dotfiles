'use strict';

Connector.playerSelector = '#player-infos';

Connector.artistSelector = '#now-playing .artist';

Connector.trackSelector = '#now-playing .title';

Connector.trackArtSelector = '#cover-container img';

Connector.isPlaying = () => $('#status').text() === 'odtwarzanie';
