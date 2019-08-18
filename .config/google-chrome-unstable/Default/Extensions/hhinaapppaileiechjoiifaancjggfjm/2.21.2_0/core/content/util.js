'use strict';

/**
 * Module that contains some useful helper functions.
 */

const Util = {
	youtubeTitleRegExps: [
		// Artist "Track", Artist: "Track", Artist - "Track", etc.
		{
			pattern: /(.+?)(\s|-|—|:)+\s*"(.+?)"/,
			groups: { artist: 1, track: 3 }
		},
		// Artist「Track」 (Japanese tracks)
		{
			pattern: /(.+?)「(.+?)」/,
			groups: { artist: 1, track: 2 }
		},
		// Track (... by Artist)
		{
			pattern: /([\w\d][\w\d\s]*?)\s+\([^)]*\s*by\s*([^)]+)+\)/,
			groups: { artist: 2, track: 1 }
		}
	],

	/**
	 * Extract artist and track from Youtube video title.
	 * @param  {String} videoTitle Youtube video title
	 * @return {Object} Object contains artist and track fields
	 */
	processYoutubeVideoTitle(videoTitle) {
		if (!videoTitle) {
			return this.makeEmptyArtistTrack();
		}

		// Remove [genre] or 【genre】 from the beginning of the title
		let title = videoTitle.replace(/^((\[[^\]]+\])|(【[^】]+】))\s*-*\s*/i, '');

		let [artist, track] = [null, null];

		// Try to match one of the regexps
		for (let regExp of this.youtubeTitleRegExps) {
			let artistTrack = title.match(regExp.pattern);
			if (artistTrack) {
				artist = artistTrack[regExp.groups.artist];
				track = artistTrack[regExp.groups.track];
				break;
			}
		}

		// No match? Try splitting, then.
		if (this.isArtistTrackEmpty({ artist, track })) {
			({ artist, track } = this.splitArtistTrack(title));
		}

		if (this.isArtistTrackEmpty({ artist, track })) {
			track = title;
		}

		return { artist, track };
	},

	/**
	 * Parse given video URL and return video ID.
	 * @param  {String} videoUrl Video URL
	 * @return {String} Video ID
	 */
	getYoutubeVideoIdFromUrl(videoUrl) {
		if (!videoUrl) {
			return null;
		}

		let match = videoUrl.match(this.videoIdRegExp);
		if (match) {
			return match[7];
		}

		return null;
	},

	/**
	 * Normalize given URL. Currently it only normalizes
	 * protocol-relative links.
	 * @param  {String} url URL, which is possibly protocol-relative
	 * @return {String} Normalized URL
	 */
	normalizeUrl(url) {
		if (!url) {
			return null;
		}

		return url.startsWith('//') ? location.protocol + url : url;
	},

	/**
	 * Convert given time-string into seconds.
	 * @param  {String} str Time-string in h:m:s format
	 * @return {Number} Seconds
	 */
	stringToSeconds(str) {
		if (!str) {
			return 0;
		}

		let s = str.toString().trim();
		let val = 0;
		let seconds = 0;

		let isNegative = s.startsWith('-');
		if (isNegative) {
			s = s.substr(1);
		}

		for (let i = 0; i < 3; i++) {
			let idx = s.lastIndexOf(':');
			if (idx > -1) {
				val = parseInt(s.substr(idx + 1), 10);
				seconds += val * Math.pow(60, i);
				s = s.substr(0, idx);
			} else {
				val = parseInt(s, 10);
				seconds += val * Math.pow(60, i);
				break;
			}
		}

		if (isNegative) {
			seconds = -seconds;
		}

		return seconds || 0;
	},

	/**
	 * Find first occurence of possible separator in given string
	 * and return separator's position and size in chars or null.
	 * @param  {String} str String contains separator
	 * @param  {Array} separators Array of separators
	 * @return {Object} Object contains position and width of separator
	 */
	findSeparator(str, separators = null) {
		if (str === null || str.length === 0) {
			return null;
		}

		if (!separators) {
			separators = this.separators;
		}

		for (let sep of separators) {
			let index = str.indexOf(sep);
			if (index > -1) {
				return { index, length: sep.length };
			}
		}

		return null;
	},

	/**
	 * Join array of artist name into a string. The array must contain objects
	 * that have 'textContent' property (DOM node).
	 * @param  {Array} artists Array of DOM nodes
	 * @return {String} String joined by separator
	 */
	joinArtists(artists) {
		return artists.map((artist) => {
			return artist.textContent;
		}).join(this.ARTIST_SEPARATOR);
	},

	/**
	 * Split string to artist and track.
	 * @param  {String} str String contains artist and track
	 * @param  {Array} separators Array of separators
	 * @param  {Boolean} swap Swap artist and track values
	 * @return {Object} Object contains artist and track fields
	 */
	splitArtistTrack(str, separators = null, { swap = false } = {}) {
		let [artist, track] = this.splitString(str, separators, { swap });
		return { artist, track };
	},

	/**
	 * Split string to current time and duration.
	 * @param  {String} str String contains current time and duration
	 * @param  {String} sep Separator
	 * @param  {Boolean} swap Swap currentTime and duration values
	 * @return {Object} Array ontains 'currentTime' and 'duration' fields
	 */
	splitTimeInfo(str, sep = '/', { swap = false } = {}) {
		let [currentTime, duration] = this.splitString(str, [sep], { swap });
		if (currentTime) {
			currentTime = this.stringToSeconds(currentTime);
		}
		if (duration) {
			duration = this.stringToSeconds(duration);
		}

		return { currentTime, duration };
	},

	/**
	 * Split string to two ones using array of separators.
	 * @param  {String} str Any string
	 * @param  {Array} separators Array of separators
	 * @param  {Boolean} swap Swap values
	 * @return {Array} Array of strings splitted by separator
	 */
	splitString(str, separators = null, { swap = false } = {}) {
		let first = null;
		let second = null;

		if (str) {
			let separator = this.findSeparator(str, separators);

			if (separator !== null) {
				first = str.substr(0, separator.index);
				second = str.substr(separator.index + separator.length);

				if (swap) {
					[second, first] = [first, second];
				}
			}
		}

		return [first, second];
	},

	/**
	 * Verify time value and return time as a Number object.
	 * Return null value if time value is not a number.
	 * @param  {Object} time Time value
	 * @return {Number} time value as a Number object
	 */
	escapeBadTimeValues(time) {
		if (typeof time !== 'number') {
			return null;
		}
		if (isNaN(time) || !isFinite(time)) {
			return null;
		}
		return Math.round(time);
	},

	/**
	 * Extract track art URL from CSS property.
	 * @param  {String} cssProperty CSS property
	 * @return {String} Track art URL
	 */
	extractUrlFromCssProperty(cssProperty) {
		let match = /url\((['"]?)(.*)\1\)/.exec(cssProperty);
		if (match) {
			return match[2].trim();
		}
		return null;
	},

	/**
	 * Inject script into document.
	 * @param {String} scriptUrl script URL
	 */
	injectScriptIntoDocument(scriptUrl) {
		let script = document.createElement('script');
		script.src = scriptUrl;
		script.onload = function() {
			this.parentNode.removeChild(this);
		};
		(document.head || document.documentElement).appendChild(script);
	},

	/**
	 * Returns a function, that, when invoked, will only be triggered
	 * at most once during a given window of time.
	 *
	 * Taken from Underscore library.
	 *
	 * @param  {Function} func Function to be throttled
	 * @param  {Number} wait Time before function calls
	 * @param  {Object} options Options
	 * @return {Function} Throttled function
	 */
	throttle(func, wait, options = {}) {
		let context;
		let args;
		let result;
		let timeout = null;
		let previous = 0;

		function later() {
			previous = options.leading === false ? 0 : Date.now();
			timeout = null;
			result = func.apply(context, args);
			if (!timeout) {
				context = args = null;
			}
		}
		return function() {
			let now = Date.now();
			if (!previous && options.leading === false) {
				previous = now;
			}
			let remaining = wait - (now - previous);
			context = this;
			args = arguments;
			if (remaining <= 0 || remaining > wait) {
				if (timeout) {
					clearTimeout(timeout);
					timeout = null;
				}
				previous = now;
				result = func.apply(context, args);
				if (!timeout) {
					context = args = null;
				}
			} else if (!timeout && options.trailing !== false) {
				timeout = setTimeout(later, remaining);
			}
			return result;
		};
	},

	/**
	 * Check if given 'artistTrack' object is empty. The object means empty
	 * if its 'artist' and 'track' properties are undefined, null or empty.
	 * @param  {Object}  artistTrack Object contains artist and track info
	 * @return {Boolean} True if object is empty; false otherwise
	 */
	isArtistTrackEmpty(artistTrack) {
		return !(artistTrack.artist && artistTrack.track);
	},

	/**
	 * Default array of separators used to split artist and track info.
	 * Push new separators in the implementation if required.
	 *
	 * @type {Array}
	 */
	separators: [
		' -- ', '--', ' ~ ', ' - ', ' – ', ' — ',
		' // ', '-', '–', '—', ':', '|', '///', '/'
	],

	/**
	 * Create an object that contains no artist and track info.
	 * @return {Object} Object contains no artist and track info
	 */
	makeEmptyArtistTrack() {
		return { artist: null, track: null };
	},

	/**
	 * Return text of first available element. If `selectors` is a string,
	 * return text of element with given selector. If `selectors` is
	 * an array, return text of first available element.
	 * @param  {Object} selectors Single selector or array of selectors
	 * @param  {Object} defaultValue Fallback value
	 * @return {Object} Text of element, if available, or default value
	 */
	getTextFromSelectors(selectors, defaultValue = null) {
		const elements = this.queryElements(selectors);

		if (elements) {
			if (elements.length === 1) {
				return elements.text();
			}

			for (const element of elements) {
				const text = $(element).text();
				if (text) {
					return text;
				}
			}
		}

		return defaultValue;
	},

	/**
	 * Return jQuery object of first available element. If `selectors`
	 * is a string, return jQuery object with the selector. If `selectors` is
	 * an array, return jQuery object matched by first valid selector.
	 * @param  {Object} selectors Single selector or array of selectors
	 * @return {Object} jQuery object
	 */
	queryElements(selectors) {
		if (!selectors) {
			return null;
		}

		if (typeof selectors === 'string') {
			return $(selectors);
		}

		if (!Array.isArray(selectors)) {
			throw new Error(`Unknown type of selector: ${typeof selectors}`);
		}

		for (const selector of selectors) {
			const element = $(selector);
			if (element.length > 0) {
				return element;
			}
		}

		return null;
	},

	/**
	 * Read connector option from storage.
	 * @param  {String} connector Connector name
	 * @param  {String} key Option key
	 * @return {Object} Option value
	 */
	async getOption(connector, key) {
		const data = await browser.storage.sync.get('Connectors');
		return data.Connectors[connector][key];
	},

	/**
	 * Print debug message with prefixed "Web Scrobbler" string.
	 * @param  {String} text Debug message
	 * @param  {String} logType Log type
	 */
	debugLog(text, logType = 'log') {
		const logFunc = console[logType];

		if (typeof(logFunc) !== 'function') {
			throw new Error(`Unknown log type: ${logType}`);
		}

		const message = `Web Scrobbler: ${text}`;
		logFunc(message);
	},

	/**
	 * Regular expression used to get Youtube video ID from URL. It covers
	 * default, shortened and embed URLs.
	 * @type {RegExp}
	 */
	videoIdRegExp: /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?.*v=))([^#&?]*).*/,

	/**
	 * Separator used to join array of artist names into a single string.
	 * @type {String}
	 */
	ARTIST_SEPARATOR: ', ',
};

/**
 * Export Util object if script is executed in Node.js context.
 */
if (typeof module !== 'undefined') {
	module.exports = Util;
}
