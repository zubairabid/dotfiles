'use strict';

define((require) => {
	const browser = require('webextension-polyfill');
	const Util = require('util/util');
	const Options = require('storage/options');

	const DEFAULT_OPTIONS_VALUES = {
		type: 'basic',
		iconUrl: browser.runtime.getURL('/icons/icon_chrome_128.png'),
	};

	/**
	 * Map of click listeners indexed by notification IDs.
	 * @type {Object}
	 */
	const clickListeners = {};

	/**
	 * Check if notifications are available.
	 * Chrome on Mac does not show notification while in fullscreen mode.
	 * @return {Boolean} Check result
	 */
	async function isAvailable() {
		let platform = await Util.getPlatformName();
		if (platform === 'mac') {
			return !(await Util.isFullscreenMode());
		}

		return true;
	}

	/**
	 * Check if notifications are allowed by user.
	 * @return {Boolean} Check result
	 */
	async function isAllowed() {
		return await Options.getOption(Options.USE_NOTIFICATIONS);
	}

	/**
	 * Set up listener for click on given notification.
	 * All clicks are handled internally and transparently passed to listeners, if any.
	 * Setting multiple listeners for single notification is not supported,
	 * the last set listener will overwrite any previous.
	 *
	 * @param {String} notificationId Notification ID
	 * @param {Function} callback Function that will be called on notification click
	 */
	function addOnClickedListener(notificationId, callback) {
		clickListeners[notificationId] = callback;
	}

	/**
	 * Remove onClicked listener for given notification.
	 * @param {String} notificationId Notification ID
	 */
	function removeOnClickedListener(notificationId) {
		if (clickListeners[notificationId]) {
			delete clickListeners[notificationId];
		}
	}

	/**
	 * Show notification.
	 * @param  {Object} options Notification options
	 * @param  {Function} onClicked Function that will be called on notification click
	 * @return {String} Notification ID
	 */
	async function showNotification(options, onClicked) {
		if (!await isAvailable()) {
			throw new Error('Notifications are not available');
		}

		if (typeof onClicked === 'function') {
			options.isClickable = true;
		}

		for (let key in DEFAULT_OPTIONS_VALUES) {
			if (options[key]) {
				continue;
			}

			let defaultValue = DEFAULT_OPTIONS_VALUES[key];
			options[key] = defaultValue;
		}

		const notificationId = await browser.notifications.create('', options);
		if (typeof onClicked === 'function') {
			addOnClickedListener(notificationId, onClicked);
		}

		return notificationId;
	}

	/**
	 * Show 'Now playing' notification.
	 * @param  {Object} song Copy of song instance
	 * @param  {Function} onClick Function that will be called on notification click
	 */
	async function showNowPlaying(song, onClick) {
		if (!await isAllowed()) {
			return;
		}

		let connectorLabel = song.metadata.label;

		let options = {
			iconUrl: song.getTrackArt() || browser.runtime.getURL('/icons/cover_art_default.png'),
			title: song.getTrack(),
			silent: true,
			message: song.getArtist(),
			contextMessage: connectorLabel
		};
		let notificationId = await showNotification(options, onClick);
		song.metadata.notificationId = notificationId;
	}

	/**
	 * Show error notification.
	 * @param  {String} message Notification message
	 * @param  {Function} onClick Function that will be called on notification click
	 */
	function showError(message, onClick = null) {
		const options = { title: i18n('notificationAuthError'), message };
		showNotification(options, onClick);
	}

	/**
	 * Show error notification if user is unable to sign in to service.
	 * @param  {Object} scrobbler Scrobbler instance
	 * @param  {Function} onClicked Function that will be called on notification click
	 */
	function showSignInError(scrobbler, onClicked) {
		let errorMessage = i18n('notificationUnableSignIn', scrobbler.label);
		showError(errorMessage, onClicked);
	}

	/**
	 * Show notification if song is not recognized.
	 * @param  {Function} onClicked Function that will be called on notification click
	 */
	async function showSongNotRecognized(onClicked) {
		if (!(await Options.getOption(Options.USE_UNRECOGNIZED_SONG_NOTIFICATIONS))) {
			return;
		}

		let options = {
			iconUrl: browser.runtime.getURL('icons/question.png'),
			title: i18n('notificationNotRecognized'),
			message: i18n('notificationNotRecognizedText')
		};
		showNotification(options, onClicked);
	}

	/**
	 * Show auth notification.
	 * @param  {Function} onClicked Function that will be called on notification click
	 */
	async function showAuthNotification(onClicked) {
		const options = {
			title: i18n('notificationConnectAccounts'),
			message: i18n('notificationConnectAccountsText'),
		};

		await showNotification(options, onClicked);
	}

	/**
	 * Completely remove notification.
	 * Do nothing if ID does not match any existing notification.
	 *
	 * @param  {String} notificationId Notification ID
	 */
	function remove(notificationId) {
		if (notificationId) {
			browser.notifications.clear(notificationId);
		}
	}

	function i18n(tag, ...context) {
		return browser.i18n.getMessage(tag, context);
	}

	browser.notifications.onClicked.addListener((notificationId) => {
		console.log(`Notification onClicked: ${notificationId}`);

		if (clickListeners[notificationId]) {
			clickListeners[notificationId](notificationId);
		}
	});
	browser.notifications.onClosed.addListener((notificationId) => {
		removeOnClickedListener(notificationId);
	});

	return {
		remove, showNowPlaying, showError, showSignInError,
		showAuthNotification, showSongNotRecognized
	};
});
