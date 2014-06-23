var knockout = require("knockout");

exports.create = create;


knockout.bindingHandlers.widget = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        knockout.computed(function() {
            var widget = knockout.unwrap(valueAccessor());
            if (isString(widget)) {
                var widgets = findWidgets(bindingContext);
                widget = widgets[widget];
            }
            
            var options = knockout.unwrap(allBindingsAccessor().widgetOptions);

            widget(element, options);
        });
        return {
            controlsDescendantBindings: true
        };
    }
};

knockout.bindingHandlers.__widgetBind = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var widgets = knockout.utils.domData.get(element, "__widgets");
        var innerBindingContext = bindingContext.extend({__widgets: widgets});
        knockout.applyBindingsToDescendants(innerBindingContext, element);
        return { controlsDescendantBindings: true };
    }
}

function findWidgets(bindingContext) {
    while (bindingContext) {
        if ("__widgets" in bindingContext) {
            return bindingContext.__widgets;
        }
        bindingContext = bindingContext.$parentContext;
    }
    throw new Error("Could not find widgets");
}

knockout.virtualElements.allowedBindings.widget = true;
knockout.virtualElements.allowedBindings.__widgetBind = true;

function create(widgetOptions) {
    var template = widgetOptions.template;
    var init = widgetOptions.init;
    var dependencies = widgetOptions.dependencies || {};
    
    return function(element) {
        var args = Array.prototype.slice.call(arguments, 1);
        var viewModelValue = init.apply(widgetOptions, args);
        knockout.computed(function() {
            var viewModel = knockout.unwrap(viewModelValue);
            var content = "<!-- ko __widgetBind: $data -->" + template + "<!-- /ko -->";
            
            // TODO: do we need to tidy up old bindings?
            knockout.utils.setHtml(element, content);
            knockout.utils.domData.set(knockout.virtualElements.firstChild(element), "__widgets", dependencies);

            knockout.applyBindingsToDescendants(viewModel, element);
        });
    };
}


function isString(value) {
    return Object.prototype.toString.call(value) === "[object String]";
}
