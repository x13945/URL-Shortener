"use strict";

var express = require("express");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var autoIncrement = require("mongoose-auto-increment");
var bodyParser = require("body-parser");
const dns = require("dns");
const url = require("url");

var cors = require("cors");

var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;

/** this project needs a db !! **/
// mongoose.connect(process.env.MONGOLAB_URI);
var dbUri =
  process.env.MONGO_URI ||
  "mongodb://shaw's url";
var connection = mongoose.connect(dbUri);
autoIncrement.initialize(connection);

var urlShorterSchema = new Schema({
  original_url: { type: String, required: true, default: undefined },
  short_url: { type: Number, default: 1 }
});
urlShorterSchema.plugin(autoIncrement.plugin, {
  model: "UrlShorter",
  field: "short_url"
});
var UrlShorter = mongoose.model("UrlShorter", urlShorterSchema);

app.use(cors());
/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// your first API endpoint...
app.get("/api/hello", function(req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl/new", (req, res) => {
  const errorRes = { error: "invalid URL" };
  var originalUrl = req.body.url;
  if (originalUrl) {
    dns.lookup(url.parse(originalUrl).host, (err, address) => {
      if (err) {
        console.error(err);
        res.json(errorRes);
      } else {
        // find url in db
        UrlShorter.findOne({ original_url: originalUrl }, (err, data) => {
          if (err) {
            console.error(err, data);
            res.json(errorRes);
          } else {
            if (data) {
              res.json({
                original_url: data.original_url,
                short_url: data.short_url
              });
            } else {
              // insert new url model
              var shorter = new UrlShorter({
                original_url: originalUrl
              });
              shorter.save((err, data) => {
                if (err) {
                  console.error(err);

                  res.json(errorRes);
                } else {
                  res.json({
                    original_url: data.original_url,
                    short_url: data.short_url
                  });
                }
              });
            }
          }
        });
      }
    });
  } else {
    res.json(errorRes);
  }
});

app.use("/api/shorturl/:shorturl", (req, res) => {
  UrlShorter.findOne({ short_url: req.params.shorturl }, (err, data) => {
    if (data) {
      res.redirect(data.original_url);
    } else {
      res.json({
        data: "Url not found"
      });
    }
  });
});

app.listen(port, function() {
  console.log("Node.js listening ...");
});
