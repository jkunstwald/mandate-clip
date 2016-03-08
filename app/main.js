var ccg = ccg || {};

$(function() {
    $('#clip-input')
        .attr('placeholder', 'Enter a Command')
        .on('input', function() {
            core.updateSuggestions();
        })
        .focus();

    $(document).keydown(function(e) {
        switch (e.which) {
            case 9:
                e.preventDefault();
                core.useFirstSuggestion();
                break;
        }
    });

    $(window).on('focus', function() {
        $('#clip-input').focus();
    });

    var loadAnswer = groupManager.load();
    console.log(loadAnswer);
});

var core = {

    suggestions: [],

    parseInput: function(overrideInput) {
        if (!overrideInput) this.useFirstSuggestion();

        var receivedCommand = overrideInput || $('#clip-input').val().trim(),
            argumentArray = receivedCommand.split(' '),
            receivedUrl = groupManager.getUrl(argumentArray);

        if (!receivedUrl) return false;

        utility.openTab('http://' + receivedUrl);
        $('#clip-input').val('').focus();
        this.updateSuggestions();
    },

    updateSuggestions: function() {
        var inputString = $('#clip-input').val(),
            argumentArray = inputString.split(' ');

        this.suggestions = groupManager.getSuggestion(argumentArray);

        $('#clip-suggestions').html('');
        $.each(this.suggestions, function(i, obj) {
            $('<div/>', { class: 'clip-suggestion' })
                .html(obj.split(inputString).join('<span class="clip-highlight">' + inputString + '</span>'))
                .appendTo('#clip-suggestions');
        });
    },

    useFirstSuggestion: function() {
        if (this.suggestions[0]) {
            $('#clip-input').val(this.suggestions[0]);
            this.updateSuggestions();
        }
    },
};

var groupManager = {

    groups: {},

    getUrl: function(args) {
        
        var objectRoot = this.groups;

        $.each(args, function(i, obj) {
            if (objectRoot[obj]) {
                objectRoot = objectRoot[obj];
            } else return false;
        });

        if (typeof objectRoot === "string") return objectRoot;
        else return false;
    },

    getSuggestion: function(args) {
        var matches = [],
            inputLength,
            inputString;

        if (args.length === 1 && args[0].length) {
            inputLength = args[0].length;
            inputString = args[0];

            $.each(this.groups, function(i, obj) {
                if (i.substr(0,inputLength) === inputString) matches.push(i + ' ');
            });

        } else if (args.length > 1)  {
            // Infinite Folder searching

            var objectRoot = this.groups,
                stringRoot = "";
                depthCounter = 0;

            $.each(args, function(i, obj) {
                if (objectRoot[obj]) {
                    objectRoot = objectRoot[obj];
                    depthCounter++;
                    stringRoot += obj + " ";
                } else return false;
            });

            if (args[depthCounter]) {
                inputLength = args[depthCounter].length;
                inputString = args[depthCounter];
            } else {
                inputLength = 0;
                inputString = "";
            }

            args.pop();

            if (typeof objectRoot === 'object') {
                $.each(objectRoot, function(i, obj) {
                    if (i.substr(0,inputLength) === inputString) matches.push(stringRoot + i + ' ');
                    else if (!inputString) matches.push(stringRoot + i + ' ');
                });
            } else {
                matches.push(stringRoot);
            }
            

        }

        return matches;
    },

    // -- Localstorage --

    backup: function() {
        localStorage.setItem('clip_groups', JSON.stringify(this.groups));
    },

    load: function() {

        // Load order:
        // 1. Custom.js
        // 2. Localstorage

        if (ccg) {
            this.groups = ccg;
            return "success-custom";
        }

        var retrievedData = localStorage.getItem('clip_groups');

        if (retrievedData) {
            try {
                var retrievedObject = JSON.parse(retrievedData);
            } catch (err) {
                return false;
            }

            this.groups = retrievedObject;
            return "success-localstorage";

        } else return false;
    }

};

var uiEvents = {
    onFocus: function() {
        $('#clip-input').select();
    }

};

var utility = {
    openTab: function(url) {
        var win = window.open(url, '_blank');
        window.focus();
        if (win) win.focus();
    }
};