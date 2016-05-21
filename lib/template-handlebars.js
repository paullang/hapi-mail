// Load modules

const Handlebars = require('handlebars');

// Declare internals

const internals = {};

exports.Template = internals.Template = function (options) {

};

internals.Template.prototype.substitute = function (templateString, data, callback) {

    const convert = Handlebars.compile(templateString);
    const converted = convert(data);

    callback(converted.toString('utf8'));
};