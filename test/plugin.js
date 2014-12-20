// Load modules

var Lab = require('lab');
var Hapi = require('hapi');
var Hoek = require('hoek');

// Test shortcuts

var lab = exports.lab = Lab.script();
var before = lab.before;
var describe = lab.experiment;
var it = lab.test;
var expect = require('code').expect;


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

        var options = Hoek.clone(baseOptions);
        var email = Hoek.clone(baseEmail);

        var server = new Hapi.Server();
        server.register({register: require('../'), options: options}, function (err) {

            expect(err).to.not.exist;
        });

        server.plugins['hapi-mail'].sendMail(email, function(err, response) {

            expect(err).to.not.exist;
            expect(response.MessageId).to.not.equal('');
            done();
        });
    });

    it('can send an email from defaultFrom', function (done) {
        var options = Hoek.clone(baseOptions);
        options.email.defaultFrom = testEmail;

        var email = Hoek.clone(baseEmail);
        delete email.from;
        email.subject += ' from defaultFrom';

        var server = new Hapi.Server();
        server.register({register: require('../'), options: options}, function (err) {

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
        var options = Hoek.clone(baseOptions);

        var email = Hoek.clone(baseEmail);
        delete email.replyTo;
        delete email.returnPath;
        email.subject += ' with no replyTo or returnPath';

        var server = new Hapi.Server();
        server.register({register: require('../'), options: options}, function (err) {

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

    it('can allow cc and bcc to not be specicied in the email object', function (done) {
        var options = Hoek.clone(baseOptions);

        var email = Hoek.clone(baseEmail);
        delete email.cc;
        delete email.bcc;
        email.subject += ' with no cc or bcc';

        var server = new Hapi.Server();
        server.register({register: require('../'), options: options}, function (err) {

            expect(err).to.not.exist;
        });

        server.plugins['hapi-mail'].sendMail(email, function(err, response) {

            expect(email.cc.length).to.equal(0);
            expect(email.bcc.length).to.equal(0);

            expect(err).to.not.exist;
            expect(response.MessageId).to.not.equal('');
            done();
        });
    });

});