// Load modules

var Lab = require('lab');
var Hapi = require('hapi');


// Test shortcuts

var expect = Lab.expect;
var before = Lab.before;
var after = Lab.after;
var describe = Lab.experiment;
var it = Lab.test;


describe('hapi-mail', function () {

    var baseOptions = { 
        template: {
            engine: 'handlebars',
            path: './test/emails/' 
        },
        email: {
            engine: 'ses',
            options: { accessKeyId: process.env.AWS_BACKEND_ID, secretAccessKey: process.env.AWS_BACKEND_SECRET, region: 'us-east-1' }
        }
    };

    var testEmail = process.env.EMAIL;

    var baseEmail = {
        from: testEmail,
        to: [testEmail],
        cc: [],
        bcc: [],
        replyTo: [testEmail],
        returnPath: testEmail,
        subject: 'Example registration confirmation',
        bodyTemplate: 'registration.html',
        bodyData: { name: 'Paul Lang', username: 'paullang' }
    };

    it('can be added as a plugin to hapi and send email', function (done) {

        var options = Hapi.utils.clone(baseOptions);
        var email = Hapi.utils.clone(baseEmail);

        var server = new Hapi.Server();
        server.pack.allow({ }).require('../', options, function (err) {

            expect(err).to.not.exist;
        });

        server.plugins['hapi-mail'].sendMail(email, function(err, response) {

            expect(err).to.not.exist;
            expect(response.MessageId).to.not.equal('');
            done();
        });
    });

    it('can send an email from defaultFrom', function (done) {
        var options = Hapi.utils.clone(baseOptions);
        options.email.defaultFrom = testEmail;

        var email = Hapi.utils.clone(baseEmail);
        delete email.from;
        email.subject += ' from defaultFrom';

        var server = new Hapi.Server();
        server.pack.allow({ }).require('../', options, function (err) {

            expect(err).to.not.exist;
        });

        server.plugins['hapi-mail'].sendMail(email, function(err, response) {

            expect(email.from).to.equal(options.email.defaultFrom);

            expect(err).to.not.exist;
            expect(response.MessageId).to.not.equal('');
            done();
        });
    });

    it('can assign from to replyTo and returnPath', function (done) {
        var options = Hapi.utils.clone(baseOptions);

        var email = Hapi.utils.clone(baseEmail);
        delete email.replyTo;
        delete email.returnPath;
        email.subject += ' with no replyTo or returnPath';

        var server = new Hapi.Server();
        server.pack.allow({ }).require('../', options, function (err) {

            expect(err).to.not.exist;
        });

        server.plugins['hapi-mail'].sendMail(email, function(err, response) {

            expect(email.replyTo[0]).to.equal(email.from);
            expect(email.returnPath).to.equal(email.from);

            expect(err).to.not.exist;
            expect(response.MessageId).to.not.equal('');
            done();
        });
    });

});