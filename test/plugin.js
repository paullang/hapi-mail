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

    it('can be added as a plugin to hapi', function (done) {

    	var options = { 
            template: {
                engine: 'handlebars',
                path: './test/emails/' 
            },
            email: {
                engine: 'ses',
                options: { accessKeyId: process.env.AWS_BACKEND_ID, secretAccessKey: process.env.AWS_BACKEND_SECRET, region: 'us-east-1' }
            }
        };

        var server = new Hapi.Server();
        server.pack.allow({ }).require('../', options, function (err) {

            expect(err).to.not.exist;
        });

        var testEmail = 'paul.andrew.lang@gmail.com';
        var email = {
            from: testEmail,
            to: [testEmail],
            cc: [],
            bcc: [],
            replyTo: [testEmail],
            returnPath: testEmail,
            subject: 'Example registration confirmation',
            bodyTemplate: 'registration.html',
            bodyData: { name: 'Paul Lang', username: 'paullang' }
        }

        server.plugins['hapi-mail'].sendMail(email, function(err, response) {

            expect(err).to.not.exist;

            expect(response.MessageId).to.not.equal('');

            done();
        });
    });
});