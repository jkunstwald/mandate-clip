

$(function() {
    $('#clip-input')
        .attr('placeholder', 'Enter a Command')
        .on('input', function() {
            core.updateSuggestions();
        });

    $(document).keydown(function(e) {
        switch (e.which) {
            case 9:
                e.preventDefault();
                core.useFirstSuggestion();
                break;
        }
    });
});


function parseInput(overrideInput) {
    var receivedCommand = overrideInput || $('#clip-input').val(),
        argumentArray = receivedCommand.split(' '),
        receivedUrl = groupManager.getUrl(argumentArray);

    utility.openTab('http://' + receivedUrl);

    $('#clip-input').val('').focus();
    this.updateSuggestions();
}

var core = {

    suggestions: [],

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
    }

};

var groupManager = {

    groups: {

        default: {
            base: '{$var1}.anzeigen-aufgabe{$var2}',
            vars: ['var1', 'var2'],
            var1: {
                schwaebische: 'schwaebische-post',
                gmuender: 'gmuender-tagespost',
                main: 'main-netz',
                merkur: 'merkur-online',
                vrs: 'vrsmedia',
                gea: 'gea',
                bonn: 'sonderfall',
                haller: 'haller-kreisblatt',
                dagblad: 'dagblad',
                stimme: 'stimme',
                echo: 'echonews',
                hna: 'hna',
                rhz: 'rhz',
                brettener: 'brettener-woche',
                moz: 'moztrauer',
                nrc: 'nrc',
                _default: 'vrsmedia'
            },
            var2: {
                local: '.de.local',
                live: '.de',
                beta: '-beta.de',
                test: '-test.de',
                _default: '.de.local'
            }
        }

    },

    getUrl: function(args) {
        var groupName = 'default',
            variables = [],
            outputUrl;

        if (this.groups[args[1]]) {
            groupName = args[1];
            args.shift();
            variables = args;
        } else variables = args;

        outputUrl = this.groups[groupName].base;

        $.each(this.groups[groupName].vars, function(i, obj) {
            var varTarget = '{$' + obj + '}',
                varValue = this.groups[groupName][obj][variables[i]];

            if (!varValue) varValue = this.groups[groupName][obj]['_default'];
            outputUrl = outputUrl.replace(varTarget, varValue);
        }.bind(this));

        return outputUrl;
    },

    getSuggestion: function(args) {
        var matches = [],
            inputLength,
            inputString;

        if (args.length === 1 && args[0].length) {
            inputLength = args[0].length;
            inputString = args[0];

            $.each(this.groups.default.var1, function(i, obj) {
                if (i === '_default') return true;
                if (i.substr(0,inputLength) === inputString) matches.push(i + ' ');
            });
        } else if (args.length === 2) {
            if (!this.groups.default.var1[args[0]]) return [];

            inputLength = args[1].length;
            inputString = args[1];

            $.each(this.groups.default.var2, function(i, obj) {
                if (i === '_default') return true;
                if (i.substr(0,inputLength) === inputString) matches.push(args[0] + ' ' + i);
            });
        }

        return matches;
    }




};

var uiEvents = {
    onFocus: function() {
        $('#clip-input').select();
        // Clicked on the input
    }

};

var utility = {
    openTab: function(url) {
        var win = window.open(url, '_blank');
        window.focus();
        //if (win) win.focus();
    }
};