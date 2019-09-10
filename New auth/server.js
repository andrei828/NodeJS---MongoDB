// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var configDB     = require('./config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url, { useMongoClient: true }); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('uploads'));

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
    secret: 'ilovescotchscotchyscotchscotch', // session secret
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
var server = app.listen(port);
console.log('The magic happens on port ' + port);

clients = []
var io = require('socket.io')(server);

var mongo = require('mongodb');
var User = require('./app/models/user');
var Feedback = require('./app/models/feedback');

var request = require('request');
var nodemailer = require('nodemailer');
var request_as_promised = require('request-promise');
var host = "https://teamproject3-qna.azurewebsites.net/qnamaker";
var endpoint_key = "a5bffce1-f01b-4810-9806-c0797ccab99c";
var route = "/knowledgebases/8cff98da-d9d6-48b1-9e21-7a70602214c6/generateAnswer";

var transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    requireTLS: true,
    debug: true,
    auth: {
      user: 'admin@anungu.onmicrosoft.com',
      pass: 'EKDFFD24EAL7D_'
    }
});

var getanswer = async (question, callback) => {

    try{
        // Add an utterance
        var options = {
            uri: host + route,
            method: 'POST',
            headers: {
                'Authorization': "EndpointKey " + endpoint_key
            },
            json: true,
            body: question
        };

        var response = await request_as_promised.post(options);
        callback(response.answers[0].answer)

    } catch (err){
        console.log(err.statusCode);
        console.log(err.message);
        console.log(err.error);
        return err
    }
};

io.on("connection", (socket) => {
    clients.push(socket.id);

    socket.on('chat message', (msg) => {
        var question = {'question': msg};

        getanswer(question, (response) => {
            io.sockets.connected[socket.id].emit('response', response);
        });
    });

    socket.on('feedback', (feedback_array) => {
        Feedback.create(feedback_array, (err, res) => {
            if (err) throw err;
        })
    })

    socket.on('interested', (add_by_id) => {
        function add_interested() {
            User.updateOne(
                { _id: mongo.ObjectID(add_by_id.user_id) },
                { $push: { interested: mongo.ObjectID(add_by_id.event_id) } },
                (err, res) => { if (err) throw err; }
            )
        }

        function remove_not_interested() {
            User.updateOne(
                { _id: mongo.ObjectID(add_by_id.user_id) },
                { $pull: { not_interested: mongo.ObjectID(add_by_id.event_id) } },
                (err, res) => { if (err) throw err; add_interested() }
            )
        }

        User.findOne({ _id : mongo.ObjectID(add_by_id.user_id), not_interested: add_by_id.event_id }, (err, res) => {
            if (err) throw err;

            if (res !== undefined || res !== null)
                remove_not_interested();
            else 
                add_interested()
        })
    })

    socket.on('not_interested', (add_by_id) => {
        function add_not_interested() {
            User.updateOne(
                { _id: mongo.ObjectID(add_by_id.user_id) },
                { $push: { not_interested: mongo.ObjectID(add_by_id.event_id) } },
                (err, res) => { if (err) throw err; }
            )
        }

        function remove_interested() {
            User.updateOne(
                { _id: mongo.ObjectID(add_by_id.user_id) },
                { $pull: { interested: mongo.ObjectID(add_by_id.event_id) } },
                (err, res) => { if (err) throw err; add_not_interested() }
            )
        }

        User.findOne({ _id : mongo.ObjectID(add_by_id.user_id), interested: add_by_id.event_id }, (err, res) => {
            if (err) throw err;

            if (res !== undefined || res !== null)
                remove_interested();
            else 
                add_not_interested()
        })
    })

    socket.on('email to', (email) => {
        console.log(email);
        var mailOptions = {
            from: 'admin@anungu.onmicrosoft.com',
            to: email,
            subject: 'Sending email from platform',
            text: 'That was easy!',
            html: '<div style="background-color: gray; color: white"> <p>Join us</p></div>'
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          }); 
        io.sockets.connected[socket.id].emit('email to', 'success');
    })

    socket.on('disconnect', () => {
        for (var i = 0; i < clients.length; i++)
            if (clients[i] === socket.id)
                clients.splice(i, 1);
    });
});