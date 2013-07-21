// Load modules

var Handlebars = require('handlebars');

// Declare internals

var internals = {};

exports.Template = internals.Template = function (options) {

};

internals.Template.prototype.substitute = function (templateString, data, callback) {

    var convert = Handlebars.compile(templateString);
    var converted = convert(data);

    callback(converted.toString('utf8'));
};