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

db_service.get_event_by_id = (event_id, callback) => {
    Event.findOne( { _id : mongo.ObjectID(event_id) }, (err, res) => {
        if (err) throw err;
        callback(res) 
    });
}


db_service.get_events_from_db = (callback) => {
    Event.find({}, (err, res) => {
        if (err) throw err;
        callback(res);
    });

}

db_service.get_by_category_from_db = (category, callback) => {
    Event.find({"categories" : category}).limit(5).exec((err, res) => {
        if (err) throw err;
        callback(res);
    });
}

db_service.get_events_by_search = (search, callback) => {
    Event.find({"name": { $regex : ".*" + search + ".*", $options: 'i' }}, (err, res) => {
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

module.exports = db_service







 










