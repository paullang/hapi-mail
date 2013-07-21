// Load modules

var AWS = require('aws-sdk');

// Declare internals

var internals = {};

exports.Email = internals.Email = function (options) {

    AWS.config.update(options);
    internals.ses = new AWS.SES();
};

internals.Email.prototype.sendEmail = function (email, callback) {

    console.log('entered email-ses.sendEmail')

    var err = null;

    var params = {
        Source: email.from,
        Destination: {
            ToAddresses: email.to,
            CcAddresses: email.cc,
            BccAddresses: email.bcc
        },
        Message: {
            Subject: { Data: email.subject, Charset: 'UTF-8' },
            Body: {
                Html: {
                    Data: email.body,
                    Charset: 'UTF-8'
                }
            }
        },
        ReplyToAddresses: email.replyTo,
        ReturnPath: email.returnPath
    };

    if (params.Destination.CcAddresses.length < 1) {
        delete params.Destination.CcAddresses;
    }
    if (params.Destination.BccAddresses.length < 1) {
        delete params.Destination.BccAddresses;
    }

    console.log('internals.ses')
    console.dir(internals.ses)

    internals.ses.sendEmail(params, function (err, data) {

        console.log('entered email-ses.sendEmail ses callback returned data');
        console.dir(data)

        callback(err, data);
    });
};
