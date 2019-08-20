var url = ''
var mongo = require('mongodb')
var MongoClient = mongo.MongoClient;
var db_service = {}

db_service.add_event_to_db = (event) => {
    console.log(event);

    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
        if (err) throw err;

        var database = db.db('admin');
        database.collection('events').insertOne( event, (err, res) => {
            if (err) throw err;

            console.log('Added a new event to database => ' + event);
            //db.close(); DO NOT FORGET TO REMOVE COMMENT
        });

        database.collection('user')
    });
}

db_service.get_event_by_id = (event_id_array) => {

}

db.db_service.add_event_to_user =

module.exports = db_service