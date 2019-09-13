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

            // query relative events by categories
            Event.findOne({},function(err,data) {
                var event = new Event({
                    name: req.body.name,
                    city: req.body.city,
                    date: req.body.date,
                    hour: req.body.hour,
                    owner: req.body.owner,
                    currency: req.body.currency,
                    location: req.body.location,
                    image1: req.files[0].filename,
                    description: req.body.description,
                    prices: req.body.prices.split(' '),
                    num_of_seats: req.body.num_of_seats,
                    categories: req.body.categories.split('#').splice(1)
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

    // database setup rel_events
    app.get('/set_rel', (req, res) => {
        db_service.set_similar_events((status) => {
            res.send(status);
        })
    })

    app.get('/empty_rel', (req, res) => {
        db_service.empty_rel_events((status) => {
            res.send(status);
        })
    })

    app.get('/set_currency_random', (req, res) => {
        db_service.set_currency_random((status) => {
            res.send(status);
        })
    })

    app.get('/get_events', (req, res) => {
        db_service.get_events_from_db((events_data) => {
            console.log(events_data)
        })
    })

    app.get('/num_events', (req, res) => {
        db_service.get_events_from_db((events) => {
            events.forEach((ev) => {
                console.log('0' + ev.added_date.getMonth() + '-0' + ev.added_date.getDate());
            })
        })
    })

    app.get('/set_remaining_seats', (req, res) => {
        db_service.get_events_from_db((events) => {
            events.forEach((event) => {
                db_service.add_remaining(event._id, event.nr_seats, () => {});
            })
        })
    })

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    function get_date_today() {
        var date_bad_format = new Date();
        var date_good_format = date_bad_format.getFullYear() + '-'

        if (date_bad_format.getMonth() < 9) date_good_format += '0'
        date_good_format += (date_bad_format.getMonth() + 1) + '-'

        if (date_bad_format.getDate() < 10) date_good_format += '0'
        date_good_format += date_bad_format.getDate()

        return date_good_format;
    }

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        db_service.get_recommended_events("", (reco_ev) => {
            db_service.get_nearby_events("Bucharest", (near_ev) => {
                db_service.get_upcoming_events(get_date_today(), (upco_ev) => {
                    db_service.get_by_category_from_db("concert", (conc_ev) => {
                        res.render('profile.ejs', {
                            user: req.user,
                            recommended_events: reco_ev,
                            nearby_events: near_ev,
                            upcoming_events: upco_ev,
                            category_events: conc_ev
                        })
                    })
                })
            })
        })
    });

    app.get('/about', (req, res) => {
        res.render('about', {
            user: req.user
        })
    })

    app.get('/user', isLoggedIn, (req, res) => {
        db_service.get_user_going_events(req.user.events, (go_events) => {
            db_service.get_user_going_events(req.user.history, (hi_events) => {
                db_service.get_upcoming_events(get_date_today(), (up_events) => {
                    res.render('user', {
                        user: req.user,
                        going_events: go_events,
                        history_events: hi_events,
                        upcoming_events: up_events
                    })
                })
            })
        })
    })

    app.get('/admin_users', isLoggedIn, (req, res) => {
        db_service.get_users((users_data) => {
            res.render('admin_users', {
                users: users_data
            })
        })
    })

    app.get('/admin/user/:user_id', isLoggedIn, (req, res) => {
        db_service.get_user_by_id( req.params.user_id, (user_data) => {
            db_service.get_user_going_events(user_data.events, (go_events) => {
                res.render('admin_user', {
                    user: user_data,
                    events: go_events
                })
            })
        })
    })

    app.post('/admin/user/:user_id/set-firstname', isLoggedIn, (req, res) => {
        db_service.update_user_firstname(req.params.user_id, req.body.firstname, () => {
            res.redirect('/admin/user/' + req.params.user_id);
        })
    })

    app.post('/admin/user/:user_id/set-secondname', isLoggedIn, (req, res) => {
        db_service.update_user_secondname(req.params.user_id, req.body.secondname, () => {
            res.redirect('/admin/user/' + req.params.user_id);
        })
    })

    app.post('/admin/user/:user_id/set-email', isLoggedIn, (req, res) => {
        db_service.update_user_email(req.params.user_id, req.body.email, () => {
            res.redirect('/admin/user/' + req.params.user_id);
        })
    })

    app.post('/admin/user/:user_id/:event_id', isLoggedIn, (req, res) => {
        db_service.remove_event_from_user(req.params.event_id, req.params.user_id, () => {
            res.redirect('/admin/user/' + req.params.user_id);
        })
    })

    app.get('/admin/event/:event_id', isLoggedIn, (req, res) => {
        db_service.get_event_by_id( req.params.event_id, (event_data) => {
            db_service.get_user_going_events(event_data.rel_events, (rel_ev) => {
                res.render('admin_event', {
                    event: event_data,
                    rel_events: rel_ev
                })
            })
        })
    })

    app.post('/admin/event/:event_id/set-name', isLoggedIn, (req, res) => {
        db_service.update_event_name(req.params.event_id, req.body.name, () => {
            res.redirect('/admin/event/' + req.params.event_id);
        });
    })

    app.post('/admin/event/:event_id/set-city', isLoggedIn, (req, res) => {
        db_service.update_event_city(req.params.event_id, req.body.city , () => {
            res.redirect('/admin/event/' + req.params.event_id);
        });
    })

    app.post('/admin/event/:event_id/set-date', isLoggedIn, (req, res) => {
        db_service.update_event_date(req.params.event_id, req.body.date, () => {
            res.redirect('/admin/event/' + req.params.event_id);
        });
    })

    app.post('/admin/event/:event_id/set-hour', isLoggedIn, (req, res) => {
        db_service.update_event_hour(req.params.event_id, req.body.hour, () => {
            res.redirect('/admin/event/' + req.params.event_id);
        });
    })

    app.post('/admin/event/:event_id/set-owner', isLoggedIn, (req, res) => {
        db_service.update_event_owner(req.params.event_id, req.body.owner, () => {
            res.redirect('/admin/event/' + req.params.event_id);
        });
    })

    app.post('/admin/event/:event_id/set-location', isLoggedIn, (req, res) => {
        db_service.update_event_location(req.params.event_id, req.body.location, () => {
            res.redirect('/admin/event/' + req.params.event_id);
        });
    })

    app.post('/admin/event/:event_id/set-description', isLoggedIn, (req, res) => {
        db_service.update_event_description(req.params.event_id, req.body.description , () => {
            res.redirect('/admin/event/' + req.params.event_id);
        });
    })

    app.post('/admin/event/:event_id/:rel_event_id', isLoggedIn, (req, res) => {
        db_service.remove_rel_event(req.params.event_id, req.params.rel_event_id, () => {
            res.redirect('/admin/event/' + req.params.event_id);
        })
    })

    app.get('/admin_events', isLoggedIn, (req, res) => {
        db_service.get_events_from_db((events_data) => {
            res.render('admin_events', {
                events: events_data
            })
        })
    })

    app.get('/search', isLoggedIn, (req, res) => {
        db_service.get_by_category_from_db("social", (social_ev) => {
            db_service.get_by_category_from_db("concert", (concert_ev) => {
                db_service.get_by_category_from_db("sports", (sports_ev) => {
                    db_service.get_by_category_from_db("art", (art_ev) => {
                        res.render('search_main_page.ejs', {
                            user: req.user,
                            social_events: social_ev,
                            concert_events: concert_ev,
                            sports_events: sports_ev,
                            art_events: art_ev
                        });
                    });
                });
            });
        });
    });

    app.get('/search-events', isLoggedIn, (req, res) => {
        db_service.get_events_by_search(req.query.search, (result_ev) => {   
            res.render("search_page", {
                user: req.user,
                event_list: result_ev
            });
        });
    });

    app.get('/support', isLoggedIn, (req, res) => {
        res.render('support_page', {
            user: req.user
        })
    });

    app.get('/event/:event_id', isLoggedIn, (req, res) => {
        db_service.get_event_by_id(req.params.event_id, (event) => {
            db_service.check_user_event_link(req.user._id, event._id, (isLink) => {
                rel_event_list = []
                function clbck() {
                    res.render('event_page', {
                        user: req.user,
                        event_data: event,
                        userAlreadyGoing: isLink,
                        rel_events: rel_event_list,
                    });
                };

                event.rel_events.forEach((rel_event, index) => {
                    db_service.get_rel_event_data(rel_event, (data) => {
                        rel_event_list.push(data)
                        if (index == event.rel_events.length - 1) {
                            clbck()
                        }
                    })

                })
            });
        });
    });

    app.post('/add-event/:event_id', isLoggedIn, (req, res) => {
        db_service.change_num_people_going(req.params.event_id, 1, () => {
            db_service.add_event_to_user(req.params.event_id, req.user._id, () => {
                res.redirect('/event/' + req.params.event_id);
            });
        });
    });

    app.post('/remove-event/:event_id', isLoggedIn, (req, res) => {
        db_service.change_num_people_going(req.params.event_id, -1, () => {
            db_service.remove_event_from_user(req.params.event_id, req.user._id, () => {
                res.redirect('/event/' + req.params.event_id);
            });
        });
    });

    // data for power bi
    app.get('/get_num_users', (req, res) => {
        db_service.get_users((users) => {
            res.send(users.length.toString())
        })
    })

    app.get('/get_num_events', (req, res) => {
        db_service.get_events_from_db((events) => {
            res.send(events.length.toString());
        })
    })

    app.get('/get_num_categories', (req, res) => {
        db_service.get_events_from_db((events) => {
            let data = events.map((item) => item.categories)
            res.send(data);
        })
    })

    app.get('/get_people_going', (req, res) => {
        db_service.get_events_from_db((events) => {
            let data = events.map((item) => item.people_going)
            res.send(data);
        })
    })

    app.get('/get_money_site', (req, res) => {
        db_service.get_events_from_db((events) => {
            let data = events.map((item) => item.prices)
            res.send(data);
        })
    })

    app.get('/get_locations', (req, res) => {
        db_service.get_events_from_db((events) => {
            let data = events.map((item) => item.location)
            res.send(data);
        })
    })

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
            successRedirect : '/config-profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        app.get('/config-profile', isLoggedIn, (req, res) => {
            res.render("config-profile", { user: req.user })
        })

        app.post('/config-profile', upload.any(), isLoggedIn, (req, res) => {
            if (!req.body && !req.files) {
                res.json({success: false});
            } else {   
                console.log(req.body);
                console.log('OBJECTID:');
                console.log(req.user._id);
                db_service.add_config_to_user(
                    req.user._id, req.body.city, req.files[0].filename, 
                    req.body.categories.split('#').splice(1), 
                    () => {
                        res.redirect('/profile');
                });
            }
        })

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
