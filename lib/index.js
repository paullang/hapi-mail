'use strict';

const Fs = require('fs');
const Utils = require('hoek');

// Declare internals

const internals = {};

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

exports.register = function (server, options, next) {

    const settings = Utils.clone(internals.defaults);
    Utils.merge(settings, options);

    // Set the templateEngine

    let templateFactory = null;
    if (settings.template.engine === 'handlebars') {
        templateFactory = require('./template-handlebars');
    }
    Utils.assert(templateFactory, 'The supplied options.template.engine is not valid');
    const templateEngine = new templateFactory.Template(settings.template);


    // Set the emailEngine

    let emailFactory = null;
    if (settings.email.engine === 'ses') {
        emailFactory = require('./email-ses')
    }
    Utils.assert(emailFactory, 'The supplied options.email.engine is not valid');

    const emailEngine = new emailFactory.Email(settings.email.options);


    const getTemplateAsString = function (template) {

        return Fs.readFileSync(settings.template.path + template, { encoding: 'utf8' });
    };


    const sendMail = function (email, callback) {

        const templateString = getTemplateAsString(email.bodyTemplate);

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

    server.expose('sendMail', sendMail);

    next();
};

exports.register.attributes = {
    pkg: require('../package.json')
};


