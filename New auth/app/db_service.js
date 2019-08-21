const url = ''
const db_name = 'admin'

var mongo = require('mongodb')
var MongoClient = mongo.MongoClient;
var db_service = {}

db_service.add_event_to_db = (event) => {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
        if (err) throw err;

        var database = db.db(db_name);
        database.collection('events').insertOne( event, (err, res) => {
            if (err) throw err;

            console.log('Added a new event to database => ' + event);
            db.close(); 
        });
    });
}

db_service.add_event_to_user = (event_id, user_id, callback) => {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
        if (err) throw err;

        var database = db.db(db_name);
        database.collection('users').updateOne(
            { _id: mongo.ObjectID(user_id) },
            { $push: { events: mongo.ObjectID(event_id) } },
            (err, res) => { if (err) throw err; db.close(); callback() }
        );
    });
}

db_service.remove_event_from_user = (event_id, user_id, callback) => {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
        if (err) throw err;

        var database = db.db(db_name);
        database.collection('users').updateOne(
            { _id: mongo.ObjectID(user_id) },
            { $pull: { events: mongo.ObjectID(event_id) } },
            (err, res) => { if (err) throw err; db.close(); callback() }
        );
    });
}

db_service.check_user_event_link = (user_id, event_id, callback) => {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
        if (err) throw err;

        var database = db.db(db_name);
        database.collection('users').findOne(
            { _id: mongo.ObjectID(user_id), events: mongo.ObjectID(event_id) },
            (err, res) => { 
                if (err) throw err; 
                db.close();
                if (res == null) callback(false);
                else callback(true);
            }    
        )
    });
}

db_service.get_event_by_id = (event_id, callback) => {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
        if (err) throw err;

        var database = db.db(db_name);
        database.collection('events').findOne( { _id : mongo.ObjectID(event_id) }, (err, res) => {
            if (err) throw err;
            db.close();
            callback(res) 
        });
    });
}

db_service.get_events_from_db = (callback) => {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
        if (err) throw err;

        var database = db.db(db_name);
        database.collection('events').find({}).toArray((err, res) => {
            if (err) throw err;
            db.close(); 
            callback(res);
        });
    });
}

module.exports = db_service