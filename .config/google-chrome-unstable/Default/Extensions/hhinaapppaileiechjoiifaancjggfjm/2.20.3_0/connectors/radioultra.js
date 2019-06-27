'use strict';

/*
 * This connector currently covers Radio ULTRA, Наше Радио, RockFM,
 * Radio JAZZ and Best FM which have the same web player.
 */

Connector.playerSelector = '#jp_container_1';

Connector.artistSelector = '.track-info .artist';

Connector.trackSelector = '.track-info .song';

Connector.isPlaying = () => $('#jp_container_1').hasClass('jp-state-playing');
