var ccg = ccg || {},
    ccs = ccs || {},
    customBase64 = "eyJtdXNpYyI6eyJzdHJlYW1pbmciOnsibGFzdGZtIjoibGFzdC5mbSIsInBhbmRvcmEiOiJwYW5kb3JhLmNvbSIsInNwb3RpZnkiOiJwbGF5LnNwb3RpZnkuY29tL2Rpc2NvdmVyIiwieW91dHViZSI6eyJzb25nMSI6InlvdXR1YmUuY29tL3dhdGNoP3Y9MTIzNDU2Iiwic29uZzIiOiJ5b3V0dWJlLmNvbS93YXRjaD92PTEyMzQ1NiJ9fX0sImJvb2ttYXJrcyI6eyJ3aWtpIjoid2lraXBlZGlhLm9yZyIsIm90aGVyIjp7IndoYXRldmVyIjoieW91bGlrZS5jb20ifX19";

$(function() {
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

    var customLoadAnswer = groupManager.load(),
        settingsLoadAnswer = settingsManager.load();

    if (customLoadAnswer) {
        $('#input').addClass('awake');
        $('#clip-input')
            .attr('placeholder', 'Enter a Command')
            .on('input', function () {
                core.updateSuggestions();
            })
            .focus();
    } else {
        $('#clip-input').attr('placeholder', 'No Data Found');
        $('#message').addClass('active');

    }

    if (customLoadAnswer === "success-custom-nochange") {
        $('#message')
            .html('Hi! Change the content of <a href="custom.js">custom.js</a> to get started.')
            .addClass('active');
    }

    if (settingsLoadAnswer) {
        settingsManager.evaluateSettings();
    }

    // Drag and Drop Initialization
    if (window.File && window.FileList && window.FileReader) {
        var xhr = new XMLHttpRequest();
        if (xhr.upload) {
            var wrapperElem = $('#wrapper');
            wrapperElem
                .on("dragover", utility.dragCancel)
                .on("dragenter", utility.dragCancel)
                .on("drop", utility.fileDragHandler);
        }
    }
});

var core = {

    suggestions: [],

    parseInput: function(overrideInput) {
        if (!overrideInput) this.useFirstSuggestion();

        var inputElem = $('#clip-input'),
            receivedCommand = overrideInput || inputElem.val().trim(),
            argumentArray = receivedCommand.split(' '),
            receivedUrl = groupManager.getUrl(argumentArray);

        if (!receivedUrl) return false;

        utility.openTab('http://' + receivedUrl);
        inputElem.val('').focus();
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
    }
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

            $.each(this.groups, function(i) {
                if (i.substr(0,inputLength) === inputString) matches.push(i + ' ');
            });

        } else if (args.length > 1)  {
            // Infinite Folder searching

            var objectRoot = this.groups,
                stringRoot = "",
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
                $.each(objectRoot, function(i) {
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

        if (Object.keys(ccg).length) {
            this.groups = ccg;

            if (btoa(JSON.stringify(ccg)) === customBase64) return "success-custom-nochange";
            else return "success-custom";
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

var settingsManager = {

    settings: {},

    load: function() {
        if (Object.keys(ccs).length) {
            this.settings = ccs;
            return "success-file";
        } else return false;
    },

    evaluateSettings: function() {

        var backgroundSettings = {
            category: this.settings.background.category || "nature",
            append: (this.settings.background.onlyChangeDaily) ? "/daily" : ""
        },
            backgroundURL = (this.settings.background.overrideURL) ? this.settings.background.overrideURL : 'https://source.unsplash.com/category/' + backgroundSettings.category + '/1920x1080' + backgroundSettings.append;

        $('body').css('background-image','url(' + backgroundURL + ')');
        if (this.settings.showDate) utility.populateStatus();

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
    },

    dragCancel: function(e) {
        if (e.preventDefault) e.preventDefault();
        return false;
    },

    fileDragHandler: function(e) {
        e = e || window.event;
        if (e.preventDefault) e.preventDefault();
        var files = e.originalEvent.dataTransfer.files,
            src = utility.createObjectURL(files[0]);

        if (files[0].type.substr(0, 5) === "image") $('body').css('background-image','url(' + src + ')');
        return false;
    },

    createObjectURL: function(object) {
        return (window.URL) ? window.URL.createObjectURL(object) : window.webkitURL.createObjectURL(object);
    },

    getWeekNumber: function() {
        var d = new Date;
        d.setHours(0,0,0);
        d.setDate(d.getDate() + 4 - (d.getDay()||7));
        var yearStart = new Date(d.getFullYear(),0,1);
        return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    },

    getWeekDay: function() {
        var d = new Date(),
            weekdays = ["SUN","MON","TUE","WED","THU","FRI","SAT"];

        return weekdays[d.getDay()];
    },

    getProperDate: function() {
        var d = new Date();

        return d.getDate() + "." + (d.getMonth() + 1) + "." + d.getFullYear();
    },

    populateStatus: function() {
        var statusElem = $('#status'),
            statusString = "";

        statusString += this.getWeekDay();
        statusString += " | CW " + this.getWeekNumber();
        statusString += " | " + this.getProperDate();


        $('#status').text(statusString).addClass('active');
    }
};