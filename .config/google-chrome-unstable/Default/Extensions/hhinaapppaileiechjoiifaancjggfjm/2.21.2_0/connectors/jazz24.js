'use strict';

Connector.playerSelector = '.radio-controls';

Connector.artistSelector = '.current-artist';

Connector.trackSelector = '.current-track';

Connector.albumSelector = '.current-album';

Connector.isPlaying = () => $('body').hasClass('is-playing');
