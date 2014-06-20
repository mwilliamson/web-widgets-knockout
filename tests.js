var strictEqual = require("assert").strictEqual;

var jsdom = require("jsdom");

var widgetsKnockout;

function test(func) {
    return function(test) {
        createDocument(function(document) {
            var element = createEmptyDiv(document);
            try {
                func(element);
            } catch (error) {
                test.ifError(error);
            } finally {
                delete document.createElement;
            }
            test.done();
        });
    };
}

exports["knockout widget renders template with view model"] = test(function(element) {
    var widget = widgetsKnockout.create({
        template: 'Hello <span data-bind="text: name"></span>',
        init: function(options) {
            return {name: options.name};
        }
    });

    widget(element, {name: "Bob"});
    strictEqual(stripComments(element.innerHTML), 'Hello <span data-bind="text: name">Bob</span>');
});

exports["dependencies of widget are renderable using widget binding"] = test(function(element) {
    var shoutingWidget = function(element, options) {
        element.innerHTML = options.name.toUpperCase();
    };

    var widget = widgetsKnockout.create({
        template: 'Hello <span data-bind="widget: \'shout\', widgetOptions: {name: name}"></span>',
        init: function(options) {
            return {name: options.name};
        },
        dependencies: {
            shout: shoutingWidget
        }
    });

    widget(element, {name: "Bob"});
    strictEqual(stripComments(element.innerHTML), 'Hello <span data-bind="widget: \'shout\', widgetOptions: {name: name}">BOB</span>');
});

exports["dependencies of widget are renderable using widget binding within child binding context"] = test(function(element) {
    var shoutingWidget = function(element, options) {
        element.innerHTML = options.name.toUpperCase();
    };

    var widget = widgetsKnockout.create({
        template: '<span data-bind="with: {name: firstName}">Hello <span data-bind="widget: \'shout\', widgetOptions: {name: name}"></span></span>',
        init: function(options) {
            return {firstName: options.name};
        },
        dependencies: {
            shout: shoutingWidget
        }
    });

    widget(element, {name: "Bob"});
    strictEqual(element.textContent, 'Hello BOB');
});

var document = null;

function createDocument(callback) {
    // TODO: remove this huge hack
    // We do everything inside one document since Knockout grabs the document on load
    if (document === null) {
        jsdom.env("<body></body>", function (errors, window) {
            global.document = document = window.document;
            widgetsKnockout = require("./");
            createDocument(callback);
        });
    } else {
        var body = document.getElementsByTagName("body")[0];
        body.innerHTML = "";
        callback(document);
    }
}

function createEmptyDiv(document) {
    var div = document.createElement("div");
    document.getElementsByTagName("body")[0].appendChild(div);
    return div;
}

function stripComments(html) {
    return html.replace(/<!--.+?-->/g, "");
}
