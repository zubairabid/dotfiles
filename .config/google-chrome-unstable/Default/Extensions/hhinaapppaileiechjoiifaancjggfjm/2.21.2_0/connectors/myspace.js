'use strict';

Connector.playerSelector = '#player';

Connector.artistSelector = '.track .artist';

Connector.trackSelector = '.track .title';

Connector.isPlaying = () => !$('#footer').hasClass('paused');
