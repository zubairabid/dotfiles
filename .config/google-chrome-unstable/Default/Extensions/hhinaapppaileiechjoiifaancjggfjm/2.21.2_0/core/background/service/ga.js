'use strict';

/**
 * Implementation of Measurement Protocol. Includes Universal Analytics
 * tracking code and provides methods for sending data.
 *
 * https://developers.google.com/analytics/devguides/collection/protocol/v1/
 *
 * Does not track anything automatically.
 */
define((require) => {
	// eslint-disable-next-line no-unused-vars
	const Options = require('storage/options');

	const GA_URL = 'https://www.google-analytics.com/collect';
	const GA_TRACKING_ID = 'UA-16968457-1';
	const GA_CLIENT_ID = getClientId();
	const GA_PROTOCOL_VERSION = 1;

	/**
	 * Send 'event' hit.
	 * @param  {String} ec Event category
	 * @param  {String} ea Event action
	 * @param  {String} el Event label
	 */
	function event(ec, ea, el) {
		sendRequest({ t: 'event', ec, ea, el });
	}

	/**
	 * Send 'pageview' hit.
	 * @param  {String} dp Document path
	 */
	function pageview(dp) {
		sendRequest({ t: 'pageview', dp });
	}

	/**
	 * Send request to Google Analytics API.
	 * @param  {Object} query Payload data
	 */
	async function sendRequest(query) {
		if (!await isAllowed()) {
			return;
		}

		query.v = GA_PROTOCOL_VERSION;
		query.tid = GA_TRACKING_ID;
		query.cid = GA_CLIENT_ID;

		try {
			fetch(GA_URL, {	method: 'POST', body: $.param(query) });
		} catch (e) {
			console.error(`Error sending report to Google Analytics: ${e}`);
		}
	}

	/**
	 * Get client ID. Generate new one if previously client ID is missing.
	 * @return {String} Client ID
	 */
	function getClientId() {
		let clientId = readClientId();

		if (clientId === null) {
			clientId = generateClientId();
			saveClientId(clientId);
		}

		return clientId;
	}

	/**
	 * Read client ID from cookie.
	 * It was previously stored by 'analytics.js'.
	 * @return {String} Client ID
	 */
	function readClientId() {
		let match = document.cookie.match('(?:^|;)\\s*_ga=([^;]*)');
		if (match) {
			let gaCookieValue = match[1];
			let rawGaCid = decodeURIComponent(gaCookieValue);
			return rawGaCid.match(/(\d+\.\d+)$/)[1];
		}

		return null;
	}

	/**
	 * Generate new client ID. The format of ID is compatible with
	 * 'analytics.js' script.
	 * @return {String} Client ID
	 */
	function generateClientId() {
		let random1 = Math.round(2147483647 * Math.random());
		let random2 = Math.round(2147483647 * Math.random());
		let clientId = `${random1}.${random2}`;

		return clientId;
	}

	/**
	 * Save client ID to cookie.
	 * @param  {String} clientId Client ID
	 */
	function saveClientId(clientId) {
		document.cookie = `_ga=GA1.1.${clientId}`;
	}

	/**
	 * Check if GA tracking is allowed by user.
	 * @return {Boolean} True if GA is allowed; false otherwise
	 */
	async function isAllowed() {
		return !(await Options.getOption(Options.DISABLE_GA));
	}

	return { event, pageview };
});
