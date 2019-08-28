var multer = require('multer'),
bodyParser = require('body-parser'),
path = require('path');

var Event = require('./models/event');
var db_service = require('./db_service');

var upload = multer({
    storage: multer.diskStorage({
            destination: function (req, file, callback) 
            { callback(null, './uploads');},
            filename: function (req, file, callback) 
            { callback(null, file.fieldname +'-' + Date.now()+path.extname(file.originalname));}
        }),

    fileFilter: function(req, file, callback) {
            var ext = path.extname(file.originalname)
            if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') 
                return callback(null, false);
            callback(null, true) 
        }
});

module.exports = function(app, passport) {

// normal routes ===============================================================
    
    app.get('/create-event', isLoggedIn, (req, res) => {
        res.render('create_event.ejs', { 
            user: req.user 
        });
    })

    app.post('/create-event', upload.any(), isLoggedIn, function(req, res){
        if (!req.body && !req.files) {
            res.json({success: false});
        } else {    
            console.log(req.body);
            console.log(req.files[0]);
            Event.findOne({},function(err,data){
                var event = new Event({
                    name: req.body.name,
                    date: req.body.date,
                    hour: req.body.hour,
                    owner: req.body.owner,
                    location: req.body.location,
                    image1: req.files[0].filename,
                    description: req.body.description,
                    categories: req.body.categories.split('#')
                });

                event.save(function(err, Person){
                if(err)
                    console.log(err);
                else
                    res.redirect('/profile');

                });
            }).sort({_id: -1}).limit(1);
        }
    });

    // END OF FILE UPLOAD TESTING

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        db_service.get_events_from_db((events) => {
            res.render('profile.ejs', {
                user: req.user,
                event_list: events
            });
        });
    });

    app.get('/event/:event_id', isLoggedIn, (req, res) => {
        db_service.get_event_by_id(req.params.event_id, (event) => {
            db_service.check_user_event_link(req.user._id, event._id, (isLink) => {
                res.render('event_page', {
                    event_data: event,
                    userAlreadyGoing: isLink
                });
            });
        });
    });

    app.post('/add-event/:event_id', isLoggedIn, (req, res) => {
        db_service.add_event_to_user(req.params.event_id, req.user._id, () => {
            res.redirect('/event/' + req.params.event_id);
        });
    });

    app.post('/remove-event/:event_id', isLoggedIn, (req, res) => {
        db_service.remove_event_from_user(req.params.event_id, req.user._id, () => {
            res.redirect('/event/' + req.params.event_id);
        });
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

    // locally --------------------------------
        app.get('/connect/local', function(req, res) {
            res.render('connect-local.ejs', { message: req.flash('loginMessage') });
        });
        app.post('/connect/local', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user      = req.user;
        user.email    = undefined;
        user.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
