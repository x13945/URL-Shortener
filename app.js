var mongo = require("mongodb").MongoClient

var url = "mongodb://localhost:27017/URLShortenerMicroservice"

mongo.connect(url, function function_name(err, db) {
    if (err) {
        console.error(err);
        return
    }
    var express = require('express')
    var app = express();
    const PORT = 1337;

    app.get("/new/:newUrl*", function (req, res) {
        var query = req.query;
        console.log(req + "");
        console.log(req.params.newUrl + "");
    })

    app.listen(PORT)
})
