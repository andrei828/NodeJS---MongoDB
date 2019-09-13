var Event = require('./models/event');
var User = require('./models/user');
var mongo = require('mongodb');
var db_service = {}

db_service.add_event_to_db = (event) => {
    Event.insertOne( event, (err, res) => {
        if (err) throw err;
        console.log('Added a new event to database => ' + event);
    });
}

db_service.add_event_to_user = (event_id, user_id, callback) => {
    User.updateOne(
        { _id: mongo.ObjectID(user_id) },
        { $push: { events: mongo.ObjectID(event_id) } },
        (err, res) => { if (err) throw err; callback() }
    );
}

db_service.add_config_to_user = (user_id, user_city, profile_pic, user_categories, callback) => {
    User.updateOne(
        { _id: mongo.ObjectID(user_id) },
        { $push: { categories: { $each: user_categories } }, image: profile_pic, city: user_city },
        (err, res) => { if (err) throw err; callback() }
    );
}

db_service.remove_event_from_user = (event_id, user_id, callback) => {
    User.updateOne(
        { _id: mongo.ObjectID(user_id) },
        { $pull: { events: mongo.ObjectID(event_id) } },
        (err, res) => { if (err) throw err; callback() }
    );
}

db_service.check_user_event_link = (user_id, event_id, callback) => {
    User.findOne(
        { _id: mongo.ObjectID(user_id), events: mongo.ObjectID(event_id) },
        (err, res) => { 
            if (err) throw err; 
            if (res == null) callback(false);
            else callback(true);
        }    
    )
}

db_service.add_remaining = (event_id, event_remainng, callback) => {
    Event.updateOne(
        { _id: mongo.ObjectID(event_id)},
        {$set: { "remaining_seats": event_remainng }},
        false,
        true,
        (err, res) => {
            if (err) throw err;
            callback();
        })
}

db_service.get_users = (callback) => {
    User.find({}, (err, res) => {
        if (err) throw err;
        callback(res);
    })
}

db_service.get_user_going_events = (event_ids, callback) => {
    Event.find({ _id: { $in: event_ids } }, (err, res) => {
        if (err) throw err;
        callback(res);
    })
}

db_service.get_user_by_id = (user_id, callback) => {
    User.findOne({ _id: mongo.ObjectID(user_id) }, (err, res) => {
        if (err) throw err;
        callback(res)
    })
}

// user update
db_service.update_user_firstname = (user_id, new_firstname, callback) => {
    User.updateOne(
        { _id: mongo.ObjectID(user_id)},
        { "firstname": new_firstname },
        (err, res) => {
            if (err) throw err;
            callback();
        }
    )
}

db_service.update_user_secondname = (user_id, new_secondname, callback) => {
    User.updateOne(
        { _id: mongo.ObjectID(user_id)},
        { "secondname": new_secondname },
        (err, res) => {
            if (err) throw err;
            callback();
        }
    )
}

db_service.update_user_email = (user_id, new_email, callback) => {
    User.updateOne(
        { _id: mongo.ObjectID(user_id)},
        { "email": new_email },
        (err, res) => {
            if (err) throw err;
            callback();
        }
    )
}

// event update
db_service.update_event_name = (event_id, new_name, callback) => {
    Event.updateOne(
        { _id: mongo.ObjectID(event_id)},
        { "name": new_name },
        (err, res) => {
            if (err) throw err;
            callback()
        }
    )
}

db_service.update_event_city = (event_id, new_city, callback) => {
    Event.updateOne(
        { _id: mongo.ObjectID(event_id)},
        { "city": new_city },
        (err, res) => {
            if (err) throw err;
            callback()
        }
    )
}

db_service.update_event_date = (event_id, new_date, callback) => {
    Event.updateOne(
        { _id: mongo.ObjectID(event_id)},
        { "name": new_date },
        (err, res) => {
            if (err) throw err;
            callback()
        }
    )
}

db_service.update_event_hour = (event_id, new_hour, callback) => {
    Event.updateOne(
        { _id: mongo.ObjectID(event_id)},
        { "hour": new_hour },
        (err, res) => {
            if (err) throw err;
            callback()
        }
    )
}

db_service.update_event_owner = (event_id, new_owner, callback) => {
    Event.updateOne(
        { _id: mongo.ObjectID(event_id)},
        { "owner": new_owner },
        (err, res) => {
            if (err) throw err;
            callback()
        }
    )
}

db_service.update_event_description = (event_id, new_description, callback) => {
    Event.updateOne(
        { _id: mongo.ObjectID(event_id)},
        { "description": new_description },
        (err, res) => {
            if (err) throw err;
            callback()
        }
    )
}

db_service.update_event_location = (event_id, new_location, callback) => {
    Event.updateOne(
        { _id: mongo.ObjectID(event_id)},
        { "location": new_location },
        (err, res) => {
            if (err) throw err;
            callback()
        }
    )
}

db_service.remove_rel_event = (event_id, rel_event_id, callback) => {
    Event.updateOne(
        { _id: mongo.ObjectID(event_id)},
        { $pull: { "rel_events": mongo.ObjectID(rel_event_id)}},
        (err, res) => {
            if (err) throw err;
            callback()
        }
    )
}

db_service.change_num_people_going = (event_id, value, callback) => {
    Event.updateOne({ _id: mongo.ObjectID(event_id)}, { $inc: { "people_going": value } },
    (err, res) => {
        if (err) throw err;
        callback()
    })
}

db_service.get_events_from_db = (callback) => {
    Event.find({}, (err, res) => {
        if (err) throw err;
        callback(res);
    });
}

// main page suggestions
db_service.get_recommended_events = (context, callback) => {
    Event.find({}).limit(8).exec((err, res) => {
        if (err) throw err;
        callback(res)
    })
}

db_service.get_nearby_events = (city, callback) => {
    Event.find({ "city" : city }).limit(8).exec((err, res) => {
        if (err) throw err;
        callback(res)
    })
}

db_service.get_upcoming_events = (date, callback) => {
    Event.find({"date": { $gt: date }}).sort({"date": 1}).limit(8).exec((err, res) => {
        if (err) throw err;
        callback(res)
    })
}

db_service.get_by_category_from_db = (category, callback) => {
    Event.find({"categories" : category}).limit(5).exec((err, res) => {
        if (err) throw err;
        callback(res);
    });
}

db_service.get_events_by_search = (search, callback) => {
    Event.find({ $or: [{"name": { $regex : ".*" + search + ".*", $options: 'i' } }, {"categories": { $regex : ".*" + search + ".*", $options: 'i' }} ]}, (err, res) => {
        if (err) throw err;
        callback(res);
    })
}

db_service.get_event_by_id = (event_id, callback) => {
    Event.findOne({ _id: mongo.ObjectID(event_id) }, (err, res) => {
        if (err) throw err;
        callback(res);
    })
}

db_service.set_similar_events = (callback) => {
    Event.find({}, (err, res) => {
        if (err) throw err;
        res.forEach((item1) => {
            item1.categories.forEach((categ) => {
                Event.find( { "categories": categ, _id: { $ne: mongo.ObjectID(item1._id) } })
                     .limit(5)
                     .exec((err2, res2) => { 
                        if (err2) throw err2; 
                        
                         res2.forEach((item2) => {
                            Event.findOne( { _id: mongo.ObjectID(item1._id)}, (err3, res3) => {
                                if (res3.rel_events.length < 5) {
                                    Event.updateOne(
                                        { _id: mongo.ObjectID(res3._id) },
                                        { $push: { "rel_events": item2._id } },
                                        (err4, res4) => { if (err4) throw err4;}
                                    )
                                }
                            })
                        })
                    });
            })
        })
    })
    callback('success');
}

db_service.limit_rel_events = (callback) => {
    Event.find({}, (err, res) => {
        res.forEach((event) => {
            if (event.rel_events.length > 5) {
                
            }
        })
    })
}

db_service.get_rel_event_data = (event_id, callback) => {
    Event.findOne({ _id: mongo.ObjectID(event_id)}, (err, res) => {
        if (err) throw err;
        callback(res);    
    })
}

db_service.empty_rel_events = (callback) => {
    Event.find({}, (err, res) => {
        if (err) throw err;

        res.forEach((event) => {
            Event.updateOne(
                { _id: mongo.ObjectID(event._id) },
                { "rel_events": [] },
                (err2, res2) => { if (err2) throw err2; }
            )
        })
    })
    callback('Done');
}

db_service.set_currency_random = (callback) => {
    Event.find({}, (err1, res1) => {
        if (err1) throw err1;

        var i;
        for (i = 0; i < res1.length; i++) {
            if (res1[i].prices[0] === "") {
                Event.updateOne(
                    { _id: mongo.ObjectID(res1[i]._id) },
                    { "currency": "FREE" },
                    (err2, res2) => { if (err2) throw err2; }
                )
            } else if (i % 3 === 0) {
                Event.updateOne(
                    { _id: mongo.ObjectID(res1[i]._id) },
                    { "currency": "$"},
                    (err2, res2) => { if (err2) throw err2; }
                )
            } else if (i % 3 === 1) {
                Event.updateOne(
                    { _id: mongo.ObjectID(res1[i]._id) },
                    { "currency": "$"},
                    (err2, res2) => { if (err2) throw err2; }
                )
            } else if (i % 3 === 2) {
                Event.updateOne(
                    { _id: mongo.ObjectID(res1[i]._id) },
                    { "currency": "RON"} ,
                    (err2, res2) => { if (err2) throw err2; }
                )
            }
        }

        if (i === res1.length) callback('success');
    })
}

module.exports = db_service







 










