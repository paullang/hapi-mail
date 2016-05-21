# hapi-mail

Email plugin for [Hapi.js](https://github.com/hapijs/hapi)

## Background

Currently this plugin supports handlebars as the HTML template engine for the email body and Amazon Simple Email Service (SES) as the email engine, but it was designed in a way that more providers can be easily added if necessary.

## Getting Started
Install **hapi-mail** by either running `npm install hapi-mail --save` in your application's root directory or add 'hapi-mail' to the dependencies section of the 'package.json' file and run npm install.

## How to use

This module assumes you are already familiar with [Hapi.js](https://github.com/hapijs/hapi) and it's plugin conventions.

```javascript 
const options = { 
    template: {
        engine: 'handlebars',
        path: './emails/' 
    },
    email: {
        engine: 'ses',
        options: { accessKeyId: process.env.AWS_BACKEND_ID, secretAccessKey: process.env.AWS_BACKEND_SECRET, region: 'us-east-1' },
        defaultFrom: 'you@domain.com'
    }
};

const email = {
    from: 'somebody@yourdomain.com',
    to: ['user@userland.com'],
    cc: ['boss@yourdomain.com'],
    bcc: ['somebody@yourdomain.com'],
    replyTo: ['reply@yourdomain.com'],
    returnPath: 'bounce@yourdomain.com',
    subject: 'Example registration confirmation',
    bodyTemplate: 'registration.html',
    bodyData: { name: 'Paul Lang', username: 'paullang' }
};

server.register({register: require('hapi-mail'), options: options}, function (err) {

   ....
});


// If you have a reference to the server, you can use this
server.plugins['hapi-mail'].sendMail(email, function(err, response) {

   ....
});

// If you have a reference to a request, you can use this
request.server.plugins['hapi-mail'].sendMail(email, function(err, data) {

   ....
});


```

**hapi-mail PROTIPS:** 
See [test/plugin.js](https://github.com/paullang/hapi-mail/tree/master/test) for working example, but you will need to set three environment variables for it to run: AWS_BACKEND_ID, AWS_BACKEND_SECRET, EMAIL

Since this module name has a - in the name, you cannot use dot notation to register and access it.
e.g. server.plugins['hapi-mail'].sendMail(...) and cannot use server.plugins.hapi-mail.sendMail(...)

**AWS PROTIP:** Don't store your actual AWS key and secret in your source code and don't use your root AWS key and secret for your applications.
Setup a limited access key using [AWS IAM](http://aws.amazon.com/iam/) and either put them in environment variables or into a separate configuration file that won't get uploaded somewhere public like Github or NPM.
