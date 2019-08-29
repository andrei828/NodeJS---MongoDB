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

module.exports = db_service