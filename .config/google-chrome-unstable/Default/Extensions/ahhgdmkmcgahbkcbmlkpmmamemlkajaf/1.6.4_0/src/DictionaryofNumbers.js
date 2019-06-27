// depends on jquery, jquery.safeReplace, underscore, underscore.string,
// async.js, and bootstrap-tooltip.js
var percentChance = function(integerPercent) {
    // spins a roulette wheel with % chance and tells you if you won
    return (Math.random() * 100) < integerPercent;
};
var DictionaryOfNumbers = {
    init: function() {
        this.shouldLog = false;
        this.$wrapper = $('<dfn class="dictionary-of-numbers">');
        // to test this regex: http://tinyurl.com/atm378c
        this.quantityRe = /[\-\$\(]?(negative)?(([\d,]*\.?\d+)|(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|one|two|three|four|five|six|seven|eight|nine|ten)\s)\s*([a-z]+[\s\/\-]*){1,3}\)?/gi;
        // have to do separate regexp for currency because there's no way to
        // do a conditional in a regexp, i.e. 'if it starts with a $ then
        // match 0 to 3 words after the digits part, else match 1-3 words'.
        // I tried just always matching 0-3 words after the digits, but it
        // slowed the browser down too much because of so many matches
        this.currencyRe = /\$(negative)?(([\d,]*\.?\d+)|(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|one|two|three|four|five|six|seven|eight|nine|ten)\s)\s*([a-z]+[\s\/\-]*){0,3}\)?/gi;
        this.slurpRegExps = [
            this.quantityRe,
            this.currencyRe
        ];
        // need a unit regex because you can't do multiple matches with the 'g'
        // flag in javascript and also get the capture groups :///
        this.singleDigitRe = /\d/;
        this.numberRe = /[\d]*\.?\d+/;
        this.unitSeparatorRe = /[\s\-]/;
        // only 4 concurrent connections/workers to background page db
        this.queryQueue = async.queue(this._querySI, 4);
    },
    regexpEscape: function(str) {
        return str.replace(/[\-\/\\\^$*+?.()|\[\]{}]/g, '\\$&');
    },
    lookupInElement: function($element) {
        // go through each match, parse the SI numeral/unit and query them,
        // while also replacing the original text with an element for later
        var replacerFunction = _.bind(function($textMatchNode, textMatch, regExpMatch) {
            var parsedSi = this.findSiNumeralAndUnit(textMatch, true);
            var $wrapper = this.$wrapper.clone();

            // special case of not matching anything in parens like '500km (300 mi)'
            if (parsedSi.success && !(_.str.startsWith(textMatch, '(') || _.str.endsWith(textMatch, ')'))) {
                var siNumeral = parsedSi.siNumeral;
                var siUnit = parsedSi.siUnit;
                $wrapper.addClass(this.cssClassForSI(siNumeral, siUnit));
                this.querySI(
                    siNumeral,
                    siUnit,
                    this.querySuccess(siNumeral, siUnit, textMatch)
                );

                var textToWrap = textMatch;
                // remove irrelevant text from the match
                if (!_.isEmpty(parsedSi.irrelevantTokens)) {
                    var irrelevantTokens = parsedSi.irrelevantTokens;
                    irrelevantTokens = _.map(irrelevantTokens, function(word) {
                        return this.regexpEscape(word);
                    }, this);
                    var reText = irrelevantTokens.join(this.unitSeparatorRe.source + '*') + '\\s*';
                    var textToRemoveRe = new RegExp(reText);
                    textToWrap = textToWrap.replace(textToRemoveRe, '');
                }
                textToWrap = _.str.trim(textToWrap);

                // wrap just the text we want in wrapper for later querying
                $textMatchNode.safeReplace(textToWrap, function($quantityNode) { $quantityNode.wrap($wrapper); });
            } else {
                this.log("can't find a unit conversion for '", textMatch, "'");
                $textMatchNode.wrap($wrapper);
            }

        }, this);

        // traverse the visible elements in the body looking for matches
        _.each(this.slurpRegExps, function(re) {
            $element.safeReplace(
                re,
                replacerFunction,
                'dfn.dictionary-of-numbers,textarea,code,pre,h1,option',
                true
            );
        });
    },
    log: function() {
        if (this.shouldLog) {
            var log = Function.prototype.bind.call(console.log, console);
            log.apply(console, Array.prototype.slice.call(arguments));
        }
    },
    cssClassForSI: function(siNumeral, siUnit) {
        // convert quantity to css class.
        // only get the digits/units, keep dashes for negative things, and
        // change all decimals to dashes
        var append = (siNumeral + siUnit).match(/\w|\.|\-/g).join('').replace('.', '-');
        return 'dictionary-of-numbers-quantity-' + append;
    },
    Quantity: function(obj) {
        // pass in the object and its parameters from queries
        var quantity = obj || {};
        return quantity;
    },
    querySI: function(siNumeral, siUnit, callback) {
        // public, rate-limited function to query db for quantities
        this.queryQueue.push({
            'siNumeral': siNumeral,
            'siUnit': siUnit
        }, callback);
    },
    _querySI: function(quantity, callback) {
        // query background page db for quantities like given one
        chrome.extension.sendMessage(
            {
                type: 'quantity',
                si_numeral: quantity.siNumeral,
                si_unit: quantity.siUnit
            },
            callback
        );
    },
    humanReadableElement: function(quantities) {
        // TODO: convert  all this to template that won't cause chrome to
        // complain about eval statements
        var now = new Date();
        var cssClass = 'dictionary-of-numbers-human-readable';
        if ((now.getDate() == 1) && ((now.getMonth() + 1) == 4) && percentChance(10)) {
            // april fools! say this number is ~ a random number of dogs
            cssClass += ' dictionary-of-numbers-human-readable-more';
            return ' <dfn class="'+ cssClass +'" title="April Fools!">[&#8776; '+  _.random(2,30) +' dogs]</dfn>';
        }

        // pick a quantity to show and remove it from the list of all quantities
        var randomQuantityIndex = _.random(quantities.length - 1);
        var quantity = quantities[randomQuantityIndex];
        quantities = _.filter(quantities, function(quantity, i) {
            return i !== randomQuantityIndex;
        });

        // the expanded view quantities on hover
        var popupHtml = '';
        if (!_.isEmpty(quantities)) {
            cssClass += ' dictionary-of-numbers-human-readable-more';
            _.each(quantities, function(quantity) {
                popupHtml += '<div>&#8776; '+ quantity.human_readable +'</div>';
            });
        }

        // generates the html to be injected after the author's quantity
        return ' <dfn title="'+ popupHtml +'" class="'+ cssClass +'">[&#8776; '+ quantity.human_readable +']</dfn>';
    },
    querySuccess: function(siNumeral, siUnit, originalText) {
        // create closure to pass original numeral and unit to callback,
        // append the human-readable description in the DOM
        return _.bind(function(response) {
            if (!response) { throw 'error when connecting to background page'; }
            var quantities = response.quantities;
            this.log('Queried "', originalText, '" (', siNumeral, siUnit, ') and got "', _.isEmpty(quantities) ? 'nothing': quantities);

            // DOM manipulations
            // look for things marked for lookup that haven't already had a
            // human-readable synonym of the number appended
            var $quantities = $('.dictionary-of-numbers.'+ this.cssClassForSI(siNumeral, siUnit) +':not(.dictionary-of-numbers-processed)');
            if (!_.isEmpty(quantities)) {
                // choose a random quantity and append its human-readable
                // description to the DOM
                $quantities.append(this.humanReadableElement(quantities));
                $quantities.find('.dictionary-of-numbers-human-readable-more').tooltip({
                    html: true,
                    template: '<div class="dictionary-of-numbers-tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
                });
            }
            $quantities.addClass('dictionary-of-numbers-processed');
        }, this);
    },
    findNumeralAndUnit: function(textMatch, ignoreAmbiguous) {
        // split a match found through the big ugly regex into
        // numeral and unit and return them, as well as irrelevant tokens.
        // also second parameter allows you to ignore ambiguous units

        var numeral, unit, tokens;
        textMatch = _.str.clean(textMatch); // remove extra spaces
        textMatch = textMatch.replace(/[\(\)]/g, ''); // remove parens
        // if it contains a dollar sign, then it is definitely currency.
        // this is a separate case because this unit comes at the beginning
        if (_.contains(textMatch, '$')) {
            unit = '$';
            // remove all dollar signs from the string so they don't interfere
            textMatch = textMatch.replace(/\$/g, '');
        }
        if (this.singleDigitRe.test(textMatch)) {
            // get the numeral if it's in numerical digits, not spelled out
            // remove all commas from the string, also spaces between numbers
            textMatch = textMatch.replace(/,/g, '');
            textMatch = textMatch.replace(/(\d)\s+(\d)/g, '$1$2');
            // get just the number from the string
            numeral = parseFloat(textMatch.match(this.numberRe)[0]);
            // remove the number from the string
            textMatch = textMatch.replace(this.numberRe, '');
            if (_.str.startsWith(textMatch, '-')) {
                numeral *= -1;
            }
        } else {
            // get the numeral if it's spelled out e.g. 'ninety'.
            // only match to the first english number
            var numeralAndMatch = this.parseEnglishNumbers(
                textMatch,
                this.spelledOutNumbers,
                0,
                function(memo, number) {
                    return memo !== 0 ? memo: number;
                }
            );
            numeral = numeralAndMatch[0];
            textMatch = numeralAndMatch[1];
        }

        // now parse out orders of magnitude like 'million'
        var magnitudeAndMatch = this.parseEnglishNumbers(
            textMatch,
            this.ordersOfMagnitude,
            1,
            function(memo, number) {
                return memo * number;
            }
        );
        numeral *= magnitudeAndMatch[0];
        textMatch = magnitudeAndMatch[1];

        // if the currency is known to be money, parse shortened orders of magnitude
        if (unit === '$') {
            var shortMagnitudeAndMatch = this.parseEnglishNumbers(
                textMatch,
                this.currencyOrdersOfMagnitude,
                1,
                function(memo, number) {
                    return memo * number;
                }
            );
            numeral *= shortMagnitudeAndMatch[0];
            textMatch = shortMagnitudeAndMatch[1];
        }

        // at this point, textMatch should only contain units we have to test
        tokens = _.str.words(textMatch, this.unitSeparatorRe);
        var i = tokens.length;
        var substring, irrelevantTokens, ignore;
        // test 'meters per second', then 'meters per', then 'meters'
        if (!unit) {
            for (i; i > 0; --i) {
                substring = tokens.slice(0,i).join(' ');
                ignore = ignoreAmbiguous && (substring in this.ambiguousUnits);
                if (!unit && substring in this.conversions && !ignore) {
                    // return the number, unit, and irrelevant tokens
                    unit = substring;
                    irrelevantTokens = tokens.slice(i, tokens.length);
                    break;
                }
            }
        } else if (unit === '$') {
            // don't mark shortened orders of magnitude as irrelevant
            irrelevantTokens = tokens; // if we don't find any magnitudes
            for (i = 0; i < tokens.length; ++i) {
                substring = tokens[i];
                if (substring in this.currencyOrdersOfMagnitude) {
                    // return the irrelevant tokens
                    irrelevantTokens = tokens.slice(i+1, tokens.length);
                    break;
                }
            }
        } else {
            irrelevantTokens = tokens;
        }

        return [numeral, unit, irrelevantTokens];
    },
    parseEnglishNumbers: function(textMatch, dictionary, startMemo, reducer) {
        // given some text and the dictionary to look in, returns the numeral
        var tokens = _.str.words(textMatch, this.unitSeparatorRe);
        return [_.reduce(tokens, function(memo, word) {
            word = word.toLowerCase();
            if (word in dictionary) {
                textMatch = textMatch.replace(word, '');
                return reducer(memo, dictionary[word]);
            } else {
                return memo;
            }
        }, startMemo, this), textMatch];
    },
    findSiNumeralAndUnit: function(textMatch, ignoreAmbiguous) {
        var numberAndUnit = this.findNumeralAndUnit(textMatch, ignoreAmbiguous),
            numeral = numberAndUnit[0],
            unit = numberAndUnit[1],
            irrelevant = numberAndUnit[2],
            siNumberAndUnit = this.convert(numeral, unit),
            result = {
                originalNumeral: numeral,
                originalUnit: unit,
                irrelevantTokens: irrelevant,
                success: false
            };

        if (unit) {
            if (unit === '$') {
                result.parsedQuery = unit + numeral;
            } else {
                // if it's an abbreviation, no space, else space
                if (unit.length > 3) {
                    result.parsedQuery = numeral+ ' ' +unit;
                } else {
                    result.parsedQuery = numeral + unit;
                }
            }
        }

        if (!_.isNull(siNumberAndUnit)) {
            result.success = true;
            result.siNumeral = siNumberAndUnit[0];
            result.siUnit = siNumberAndUnit[1];
        }
        return result;
    },
    convert: function(numeral, unit) {
        if (!(numeral && unit)) {
            return null;
        }
        var tempNumeral = numeral,
            tempUnit = unit;
        if (tempUnit in this.conversions) {
            // traverse the tree
            while (!_.isNull(this.conversions[tempUnit])) {
                // if it's a string, that's the SI abbreviation
                if (_.isString(this.conversions[tempUnit])) {
                    tempUnit = this.conversions[tempUnit];
                } else {
                // if it's a function, execute it and that's the SI conversion
                    var numeralAndUnit = this.conversions[tempUnit](numeral);
                    tempNumeral = numeralAndUnit[0];
                    tempUnit = numeralAndUnit[1];
                }
            }
            return [tempNumeral, tempUnit];
        }
        return null;
    },
    asYouType: function($elements, eventType, textFunction, callback, emptyCallback) {
        // binds eventType to $elements, looking for all quantities in
        // $elements using textFunction($target) to get text and then calling
        // callback([{query: '100m', quantities: [...]}], $target, textFunction)
        // calls emptyCallback($target) when $elements is cleared
        var lastText;
        emptyCallback = emptyCallback || function() {};
        var _callback =  _.debounce(_.bind(function(evt) {
            var $target = $(evt.target);
            var text = _.str.trim(textFunction($target));
            var potentialQuantities;

            // Turn off asyoutype if the user stopped it
            if ($target.hasClass('dictionary-of-numbers-suggestions-off')) {
                $target.off(eventType);
                return;
            }
            // If there's no actual text or we've already queried and the
            // results are being show then don't requery or change UI
            if (text == lastText) { return; }
            if (!text) {
                emptyCallback($target);
                return;
            }

            lastText = text;
            // go through all matching regexps and find potential quantities
            potentialQuantities = _.reduce(this.slurpRegExps, function(memo, re) {
                var results = text.match(re);
                return (results ? memo.concat(results) : memo);
            }, []);
            // cycle through each potential match, see if we can recognize, and
            // if we can then query for it
            if (_.isEmpty(potentialQuantities)) {
                callback([], $target, textFunction);
            } else {
                // group all async requests and only after all have returned
                // call the final user-supplied callback with quantities
                var allQuantities = [];
                    // this function waits until all requests have
                    // completed then calls the user-supplied callback with
                    // all of the quantities that were found in the bound
                    // element
                var finalCallback = _.after(
                    potentialQuantities.length,
                    function() {
                        callback(
                            _.uniq(allQuantities, function(quantity) {
                                return quantity.parsedQuery;
                            }),
                            $target,
                            textFunction
                        );
                    }
                );
                var groupCallback = function(originalText, parsedQuery, quantities) {
                    // this function groups all the quantities together
                    // and calls the very last callback after all requests
                    // have completed
                    allQuantities.push({
                        query: originalText,
                        'parsedQuery': parsedQuery,
                        'quantities': quantities
                    });
                    finalCallback();
                };
                _.each(potentialQuantities, _.bind(function(potentialQuantity) {
                    var parsedQuantity = this.findSiNumeralAndUnit(potentialQuantity, false);
                    if (parsedQuantity.success) {
                        // make query
                        this.querySI(
                            parsedQuantity.siNumeral,
                            parsedQuantity.siUnit,
                            function(response) {
                                if (!response) {
                                    throw 'connection error while attempting to query for quantity: '+ potentialQuantity;
                                } else {
                                    groupCallback(potentialQuantity, parsedQuantity.parsedQuery, response.quantities);
                                }
                            }
                        );
                    } else {
                        groupCallback(potentialQuantity, parsedQuantity.parsedQuery, []);
                    }
                }, this));
            }
        }, this), 75);

        $elements.on(eventType, _callback);
        $elements.addClass('dictionary-of-numbers-as-you-type');
        $elements.trigger(eventType);
    },
    spelledOutNumbers: {
        twenty: 20,
        thirty: 30,
        forty: 40,
        fifty: 50,
        sixty: 60,
        seventy: 70,
        eighty: 80,
        ninety: 90,
        one: 1,
        two: 2,
        three: 3,
        four: 4,
        five: 5,
        six: 6,
        seven: 7,
        eight: 8,
        nine: 9,
        ten: 10
    },
    currencyOrdersOfMagnitude: {
        'k': 1e3,
        'K': 1e3,
        'm': 1e6,
        'M': 1e6,
        'b': 1e9,
        'B': 1e9,
        'bn': 1e9,
        'BN': 1e9,
        'Bn': 1e9
    },
    ordersOfMagnitude: {
        'negative': -1,
        'hundred': 1e2,
        'thousand': 1e3,
        'million': 1e6,
        'billion': 1e9,
        'trillion': 1e12,
        'quadrillion': 1e15,
        'quintillion': 1e18,
        'sextillion': 1e21,
        'septillion': 1e24,
        'octillion': 1e27
    },
    conversions: {
        // current
        'A': null,
        'amps': 'A',

        // voltage
        'V': null,

        // mass
        'kg': null,
        'kilograms': 'kg',
        'g': function(numeral) { return [numeral / 1000, 'kg']; },
        'grams': 'g',
        'pounds': function(numeral) { return [numeral / 2.2, 'kg']; },
        'lbs': 'pounds',
        'tons': function(numeral) { return [numeral * 907.185, 'kg']; },
        'metric tons': function(numeral) { return [numeral * 1000, 'kg']; },

        // length / distance
        'm': null,
        'meters': 'm',
        'metres': 'm',
        'miles': function(numeral) { return [numeral * 1609.34, 'm']; },
        'mi': 'miles',
        'mi.': 'miles',
        'micrometers': function(numeral) { return [numeral * 1e-6, 'm']; },
        'micrometres': 'micrometers',
        'microns': 'micrometers',
        'mm': function(numeral) { return [numeral * 1e-3, 'm']; },
        'millimeters': 'mm',
        'millimetres': 'mm',
        'cm': function(numeral) { return [numeral * 1e-2, 'm']; },
        'centimeters': 'cm',
        'centimetres': 'cm',
        'km': function(numeral) { return [numeral * 1000, 'm']; },
        'kilometers': 'km',
        'kilometres': 'km',
        'inches': function(numeral) { return [this.feet(numeral / 12)[0], 'm']; },
        'feet': function(numeral) { return [numeral / 3.2808, 'm']; },
        'ft': 'feet',
        'ft.': 'feet',

        // area
        'm^2': null,
        'acre': function(numeral) { return [numeral * 4046.85642, 'm^2']; },
        'acres': 'acre',
        'square meters': 'm^2',
        'mm^2': function(numeral) { return [numeral * 1e-6, 'm^2']; },
        'square mm': 'mm^2',
        'sq mm': 'mm^2',
        'sq. mm': 'mm^2',
        'sq. mm.': 'mm^2',
        'square millimeters': 'mm^2',
        'sq millimeters': 'mm^2',
        'sq. millimeters': 'mm^2',
        'square millimetres': 'mm^2',
        'sq millimetres': 'mm^2',
        'sq. millimetres': 'mm^2',
        'km^2': function(numeral) { return [numeral * 1e6, 'm^2']; },
        'square km': 'km^2',
        'sq km': 'km^2',
        'sq. km': 'km^2',
        'sq. km.': 'km^2',
        'square kilometers': 'km^2',
        'sq kilometers': 'km^2',
        'sq. kilometers': 'km^2',
        'square kilometres': 'km^2',
        'sq kilometres': 'km^2',
        'sq. kilometres': 'km^2',
        'ft^2': function(numeral) { return [numeral / 10.764, 'm^2']; },
        'square feet': 'ft^2',
        'sq feet': 'ft^2',
        'sq ft': 'ft^2',
        'sq ft.': 'ft^2',
        'square miles': function(numeral) { return [numeral * 2.59e6, 'm^2']; },

        // volume
        'm^3': null,
        'liters': function(numeral) { return [numeral * 1e-3, 'm^3']; },
        'litres': 'liters',
        'gallons': function(numeral) { return [numeral * 0.00378541178, 'm^3']; },

        // velocity / speed
        'm/s': null,
        'm / sec': 'm/s',
        'meters per second': 'm/s',
        'metres per second': 'm/s',
        'mph': function(numeral) { return [numeral * 0.44704, 'm/s']; },
        'miles per hour': 'mph',
        'miles an hour': 'mph',
        'miles / hour': 'mph',
        'miles/ hour': 'mph',
        'miles /hour': 'mph',
        'miles/hour': 'mph',
        'kph': function(numeral) { return [numeral * (10/36) ,'m/s']; },
        'kilometers per hour': 'kph',
        'kilometres per hour': 'kph',
        'kilometers / hour': 'kph',
        'kilometres / hour': 'kph',
        'kilometers/hour': 'kph',
        'kilometres/hour': 'kph',
        'km/h': 'kph',
        'km/s': function(numeral) { return [numeral * 1000, 'm/s']; },
        'kilometer per second': 'km/s',
        'kilometers per second': 'km/s',
        'kilometres per second': 'km/s',
        'km/sec': 'km/s',
        'km / sec': 'km/s',
        'c': function(numeral) { return [numeral * 299792458, 'm/s']; },

        // acceleration
        'm/s^2': null,
        'gees': function(numeral) { return [numeral * 9.80665, 'm/s^2']; },

        // time
        's': null,
        'seconds': 's',
        'nanosecond': function(numeral) { return [numeral * 1e-9, 's']; },
        'nanoseconds': 'nanosecond',
        'millisecond': function(numeral) { return [numeral * 1e-3, 's']; },
        'milliseconds': 'millisecond',
        'ms': 'millisecond',
        'minutes': function(numeral) { return [numeral * 60, 's']; },
        'min': 'minutes',
        'hours': function(numeral) { return [this.minutes(numeral)[0] * 60, 's']; },
        'hrs': 'hours',
        'days': function(numeral) { return [this.hours(numeral)[0] * 24, 's']; },
        'months': function(numeral) { return [30.4375 * this.days(numeral)[0], 's']; },
        'years': function(numeral) { return [this.days(numeral)[0] * 365, 's']; },
        'yrs': 'years',

        // energy
        'J': null,
        'joules': 'J',
        'Joules': 'J',
        'megajoules': function(numeral) { return [numeral * 1e6, 'J']; },
        'gigajoules': function(numeral) { return [numeral * 1e9, 'J']; },
        'petawatthour': function(numeral) { return [numeral * 3.6e18, 'J']; },
        'petawatthours': 'petawatthour',
        'tons of TNT': function(numeral) { return [numeral * 4.184e9, 'J'];},
        'tons of tnt': 'tons of TNT',
        'kilotons of TNT': function(numeral) { return [1000 * this['tons of TNT'](numeral)[0], 'J']; },
        'kilotons of tnt': 'kilotons of TNT',
        'kiloton of TNT': 'kilotons of TNT',
        'kiloton of tnt': 'kilotons of TNT',
        'megatons of TNT': function(numeral) { return [1000 * this['kilotons of TNT'](numeral)[0], 'J']; },
        'megatons of tnt': 'megatons of TNT',
        'megaton of TNT': 'megatons of TNT',
        'megaton of tnt': 'megatons of TNT',
        'gigatons of TNT': function(numeral) { return [1000 * this['megatons of TNT'](numeral)[0], 'J']; },
        'gigatons of tnt': 'gigatons of TNT',
        'gigaton of TNT': 'gigatons of TNT',
        'gigaton of tnt': 'gigatons of TNT',

        // force
        'N': null,
        'newtons': 'N',

        // period
        'Hz': null,
        'hertz': 'Hz',

        // luminosity
        'lm': null,
        'lumens': 'lm',

        // entropy
        'J/K': null,

        // density
        'kg/m^3': null,
        'kg/liter': function(numeral) { return [numeral * 1000, 'kg/m^3']; },
        'kg / liter': 'kg/liter',
        'kg /liter': 'kg/liter',
        'kg/ liter': 'kg/liter',

        // money
        '$': null,
        'dollars': '$',
        'USD': '$',

        // magnetic field
        'T': null,
        'teslas': 'T',

        // charge
        'C': null,
        'coulombs': 'C',

        // resistance
        'ohm': null,
        'ohms': 'ohm',
        'Ω': 'ohm',

        // power
        'W': null,
        'watts': 'W',
        'Watts': 'W',
        'mW': function(numeral) { return [numeral * 1e-3, 'W']; },
        'milliwatts': 'mW',
        'kW': function(numeral) { return [numeral * 1000, 'W']; },
        'kilowatts': 'kW',
        'MW': function(numeral) { return [numeral * 1e6, 'W']; },
        'megawatt': 'MW',
        'megawatts': 'MW',
        'GW': function(numeral) { return [numeral * 1e9, 'W']; },
        'gigawatt': 'GW',
        'gigawatts': 'GW',
        'TW': function(numeral) { return [numeral * 1e12, 'W']; },
        'terawatt': 'TW',
        'terawatts': 'TW',
        'PW': function(numeral) { return [numeral * 1e15, 'W']; },
        'petawatt': 'PW',
        'petawatts': 'PW',
        'horsepower': function(numeral) { return [numeral * 745.7, 'W']; },
        'hp': 'horsepower',

        // pressure
        'Pa': null,
        'mm Hg': function(numeral) { return [numeral*133.322368, 'Pa']; },
        'mm hg': 'mm Hg',
        'mmhg': 'mm Hg',

        // people
        'people': null,

        // temperature
        'K': null,
        'kelvins': 'K',
        'kelvin': 'K',
        'Kelvin': 'K',
        'Kelvins': 'K',
        '°F': function(numeral) { return [((numeral - 32) * 5 / 9) + 273.15, 'K']; },
        '° F': '°F',
        '°C': function(numeral) { return [numeral+273.15, 'K']; },
        '° C': '°C',
        'degrees Fahrenheit': '°F',
        'degrees fahrenheit': '°F',
        'degrees Celsius': '°C',
        'degrees celsius': '°C'
    },
    ambiguousUnits: {
        'm': null, // meters, million, minutes
        's': null, // pluralize, seconds
        'W': null, // often abbreviated West in street names, lat/lon
        'K': null // thousand, kelvin, kilobytes
    }
};
