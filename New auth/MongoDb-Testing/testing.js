var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
  
    if (err) throw err;

    var database = db.db('website_data');

    var user = {
        name: 'Liviu',
        address: 'yahoo.com',
        events: []
    };

    /*
    // ADD LIST TO EXISTING DOCUMENT - NOT WORKING YET
    var query = { address: "andrei.liviu10@gmail.com" };
    var new_val = { $set: { events: [{test: '1'}] } };
    database.collection('users').updateOne(query, new_val, (err, res) => {
        if (err) throw err;
        console.log(res);
    });*/
    async function test() {
    var events = await getEvents(database);
    console.log(events)
   /* database.collection('users').updateOne( { name: 'Liviu' }, { $push: { events: { $each: events.slice(0, 5) } } }, (err, res) => {
        if (err) throw err;
        console.log("Success");
    });*/
    /*
    // REMOVE FROM LIST FIELD
    database.collection('users').updateOne( { name: 'Liviu' }, { $pull: { events : 'test' } }, (err, res) => {
        if (err) throw err;

        console.log("Success")
    });*/

    /*
    // ADD TO LIST FIELD
    database.collection('users').updateOne( { name : 'Liviu' }, { $push: { events: 'test' } }, (err, res) => {
        if (err) throw err;
        console.log("Done!");
    });*/
}
    database.collection('users').find({}).toArray((err, res) => {
        if (err) throw err;

        console.log(res);
        db.close();
    });
    
    test()
    //db.close();
});


function getEvents(database) {
    return new Promise(rezolve => {
    database.collection('events').find({}).toArray((err, res) => {
        if (err) throw err;
        console.log(res.slice(1, 3));
        console.log('********************');
        return res;
    });
});
}
