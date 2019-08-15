var url = '';
options = {
	useNewUrlParser: true,
	useUnifiedTopology: true
};

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

var insertDocument = function(db, callback) {
db.collection('families').insertOne( {
        "id": "AndersenFamily",
        "lastName": "Andersen",
        "parents": [
            { "firstName": "Thomas" },
            { "firstName": "Mary Kay" }
        ],
        "children": [
            { "firstName": "John", "gender": "male", "grade": 7 }
        ],
        "pets": [
            { "givenName": "Fluffy" }
        ],
        "address": { "country": "USA", "state": "WA", "city": "Seattle" }
    }, function(err, result) {
//    assert.equal(err, null);
    console.log("Inserted a document into the families collection.");
    callback();
});
};

var findFamilies = function(db, callback) {
var cursor = db.collection('families').find( );
cursor.each(function(err, doc) {
 //   assert.equal(err, null);
    if (doc != null) {
        console.dir(doc);
    } else {
        callback();
    }
});
};

var updateFamilies = function(db, callback) {
db.collection('families').updateOne(
    { "lastName" : "Andersen" },
    {
        $set: { "pets": [
            { "givenName": "Fluffy" },
            { "givenName": "Rocky"}
        ] },
        $currentDate: { "lastModified": true }
    }, function(err, results) {
    console.log(results);
    callback();
});
};

var removeFamilies = function(db, callback) {
db.collection('families').deleteMany(
    { "lastName": "Andersen" },
    function(err, results) {
        console.log(results);
        callback();
    }
);
};

MongoClient.connect(url, options, function(err, client) {
//assert.equal(null, err);
var db = client.db('familiesdb');
insertDocument(db, function() {
    findFamilies(db, function() {
   // updateFamilies(db, function() {
    	client.close();
    //});
    });
});
});