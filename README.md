# web-widgets-knockout

Use generic JavaScript widgets in Knockout, and create generic widgets using Knockout.

## Example

```javascript
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
// element.innerHTML == 'Hello <span data-bind="widget: \'shout\', widgetOptions: {name: name}">BOB</span>'
```
