$(document).ready(function() {
    // wrapper is intended to provide the $toggle variable to the chrome
    // response callback
    var changeVisibleStateWrapper = function() {
        var $toggle = $('#toggle');
        // function to show what the current state of the app is
        return function(response) {
            if (response.isOn) {
                $toggle.removeClass('off');
                $toggle.addClass('on');
            } else {
                $toggle.removeClass('on');
                $toggle.addClass('off');
            }
        };
    };

    // when the browser icon is clicked, get state of app
    chrome.extension.sendMessage({type: 'state'}, changeVisibleStateWrapper());

    // on click of this button, toggle state of app
    $('#toggle').on('click', function(evt) {
        var $toggle = $(evt.target);
        chrome.extension.sendMessage({type: 'change_state'}, changeVisibleStateWrapper());
    });

    // returns a jquery object with the quantities filled in that we can append
    // to the DOM
    var compileJqueryResults = function(allQuantities) {
        var $quantities = $('<ul id="quantities">');
        if (_.isEmpty(allQuantities)) {
            // no results for the query
            $quantities.append($('<li class="no-results">No results found :(</li>'));
        } else {
            if (_.isEmpty(allQuantities[0].quantities)) {
                // no results for the query
                $quantities.append($('<li class="no-results">No results found :(</li>'));
            } else {
                // add list item for each quantity for query
                _.each(allQuantities[0].quantities, function(quantity) {
                    $quantities.append($('<li id="quantity'+ quantity.id +'"><span>&#8776;</span> '+ quantity.human_readable +'</li>'));
                });
            }
        }
        return $quantities;
    };

    // set up querying for quantities
    DictionaryOfNumbers.init();
    var $queryInput = $('#search #query input');
    $queryInput.val(localStorage.lastQuery);

    DictionaryOfNumbers.asYouType(
        $queryInput,
        'keyup',
        function($target) { return $target.val(); },
        function(allQuantities) {
            var $quantities = compileJqueryResults(allQuantities),
                $results = $('#results');
            $results.html($quantities);
        },
        function ($target) {
            $('#results #quantities').remove();
        }
    );
    // clear out results when the search box is blank.
    // also, store last query so that when they reopen the popup, it shows the
    // last thing they queried with the results so they don't lose information
    $queryInput.on('keyup', function(evt) {
        var $input = $(evt.target),
            query = $input.val();
        localStorage.lastQuery = query;
    });
    // when they hit the clear search button, trigger input change
    $queryInput.on('search', function(evt) {
        $(evt.target).trigger('keyup');
    });
});
