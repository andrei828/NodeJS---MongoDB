var mongo = require('mongodb')
var MongoClient = mongo.MongoClient;
var url = "mongodb://localhost:27017/";
 
MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
 
    if (err) throw err;
 
    var database = db.db('website_data');
   
    /*function callback2() {
        database.collection('users').find({}).toArray((err, res) => {
            if (err) throw err;
            console.log(res)
        })
        db.close();
    }
 
    function callback1(events) {
        var to_add_id = []
        events.slice(1, 5).forEach(item => {
            to_add_id.push(item._id);
        });
 
        database.collection('users').updateOne( 
            { name : 'Liviu' },
            { $push: { events: { $each: to_add_id} } },
            (err, res) => {
                if (err) throw err;
                console.log('Success')
        });
 
        callback2();
    }
 
    database.collection('events').find({}).toArray((err, res) => {
        if (err) throw err;
       
        callback1(res)
    });*/
 
   
    /*
    // ADD LIST TO EXISTING DOCUMENT - NOT WORKING YET
    var query = { address: "andrei.liviu10@gmail.com" };
    var new_val = { $set: { events: [{test: '1'}] } };
    database.collection('users').updateOne(query, new_val, (err, res) => {
        if (err) throw err;
        console.log(res);
    });*/
 
   
    
   /* database.collection('users').updateOne( { name: 'Liviu' }, { $push: { events: { $each: events.slice(0, 5) } } }, (err, res) => {
        if (err) throw err;
        console.log("Success");
    });*/
   
    // REMOVE FROM LIST FIELD
    /*database.collection('users').updateOne( { name: 'Andrei' }, { $set: { events : [] } }, (err, res) => {
        if (err) throw err;
 
        console.log("Success")
    });*/
 
   
    // ADD TO LIST FIELD
    /*database.collection('users').updateOne( { name : 'Liviu' }, { $set: { events: [] } }, (err, res) => {
        if (err) throw err;
        console.log("Done!");
        db.close();
    });*/
 
    function callback(events_id) {
        var events_object_id = []
        events_id.forEach(item => {
            events_object_id.push( { '_id': new mongo.ObjectID(item) } )
        });
 
        console.log(events_object_id)
        database.collection('events').find( { $or: events_object_id }, (err, res) => {
            if (err) throw err;
 
            console.log(res)
        });
    }
 
    database.collection('users').findOne({ name: 'Liviu' }, (err, res) => {
        if (err) throw err;
       
        callback(res.events);
    })
 
    db.close();
    //getEvents(database).then(getUsers(database))
    //placeEventsForUsers(database)
  
});
 
function placeEventsForUsers(database) {
    event_data = []
    database.collection('events').find({}).toArray((err, res) => {
        if (err) throw err;
        
        event_data = res
        console.log(event_data)
    });
   
    database.collection('users').updateOne( 
        { name : 'Liviu' },
        //{ $push: { events: { $each : events.slice(2, 5) } } },
        { $push: { events: event_data[0] } },
        (err, res) => {
            if (err) throw err;
            console.log('Success')
    });
 
    database.collection('users').find({}).toArray((err, res) => {
        if (err) throw err;
        console.log(res)
    })
   
}