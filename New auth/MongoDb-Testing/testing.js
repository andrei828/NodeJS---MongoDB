var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");
  var newvalues = { $set: { test: "testing" } };
  dbo.collection("customers").updateOne({ address: "Canyon 123" }, newvalues, function(err1, res) {
    if (err1) throw err1;
    console.log("1 document updated");
    db.close();
  });

  dbo.collection("customers").find({ address: "Canyon 123"}).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    db.close();
  });
});