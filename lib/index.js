var Fs = require('fs');
// Declare internals

var internals = {};

// Defaults

internals.defaults = {
    template: {
        engine: 'handlebars',
        path: './templates/'
    },
    email: {
        engine: 'ses',
        options: { region: 'us-west-2' }
    }
};

exports.register = function (plugin, options, next) {

    var Utils = plugin.hapi.utils;
    var settings = Utils.applyToDefaults(internals.defaults, options);

    // Set the templateEngine

    var templateFactory = null;
    if (settings.template.engine === 'handlebars') {
        templateFactory = require('./template-handlebars');
    }
    Utils.assert(templateFactory, 'The supplied options.template.engine is not valid');
    var templateEngine = new templateFactory.Template(settings.template);


    // Set the emailEngine

    var emailFactory = null;
    if (settings.email.engine === 'ses') {
        emailFactory = require('./email-ses')
    }
    Utils.assert(emailFactory, 'The supplied options.email.engine is not valid');
    var emailEngine = new emailFactory.Email(settings.email.options);


    var getTemplateAsString = function (template) {

        return Fs.readFileSync(settings.template.path + template, { encoding: 'utf8' });
    };


    var sendMail = function (email, callback) {

        var templateString = getTemplateAsString(email.bodyTemplate);

        templateEngine.substitute(templateString, email.bodyData, function (converted) {

            if ( (!email.from || email.from === '') && (settings.email.defaultFrom && settings.email.defaultFrom != '') ) {
                email.from = settings.email.defaultFrom;
            }

            if (!email.cc) {
                email.cc = [];
            }

            if (!email.bcc) {
                email.bcc = [];
            }

            if ( !email.replyTo || email.replyTo.length === 0 ) {
                email.replyTo = [email.from];
            }

            if ( !email.returnPath || email.returnPath === '' ) {
                email.returnPath = email.from;
            }

            email.body = converted;
            emailEngine.sendEmail(email, function(err, response) {

                callback(err, response);
            });
        });
    };

    plugin.api('sendMail', sendMail);

    next();
};

