

$(function() {
    $('#clip-input').attr('placeholder', 'Enter a Command');
});


function parseInput(overrideInput) {
    var receivedCommand = overrideInput || $('#clip-input').val(),
        argumentArray = receivedCommand.split(' '),
        receivedUrl = groupManager.getUrl(argumentArray);

    utility.openTab('http://' + receivedUrl);

    $('#clip-input').val('').focus();
}

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
                nrc: 'nrc'
            },
            var2: {
                local: '.de.local',
                live: '.de',
                beta: '-beta.de',
                test: '-test.de'
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

            outputUrl = outputUrl.replace(varTarget, varValue);
        }.bind(this));

        return outputUrl;
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