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

var request = require('request');
var request_as_promised = require('request-promise');
var host = "https://teamproject3-qna.azurewebsites.net/qnamaker";
var endpoint_key = "a5bffce1-f01b-4810-9806-c0797ccab99c";
var route = "/knowledgebases/8cff98da-d9d6-48b1-9e21-7a70602214c6/generateAnswer";

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

    socket.on('disconnect', () => {
        for (var i = 0; i < clients.length; i++)
            if (clients[i] === socket.id)
                clients.splice(i, 1);
    });
});