require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set('view engine', 'ejs');
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB");

userSchema = new mongoose.Schema({
  email: String,
  password: String,
  secret: String
});

var secret = process.env.SOME_LONG_UNGUESSABLE_STRING;
userSchema.plugin(encrypt, {
  secret: secret,
  encryptedFields: ['password']
});

const User = mongoose.model("User", userSchema);

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.get("/logout", function(req, res) {
  res.redirect("/");
});

app.post("/register", function(req, res) {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });
  newUser.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      res.render("secrets");
      app.get("/submit", function(req, res) {
        res.render("submit");
      });
      app.post("/submit", function(req, res) {
        const secret = req.body.secret;
        User.updateOne({
          email: username
        }, {
          $set: {
            secret: secret
          }
        }, function(err) {
          if (!err) {
            console.log("Updated Sucessfully");
            res.render("secrets");
          }
        });
      });
    }
  });
});

app.post("/login", function(req, res) {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({
    email: username
  }, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser.password === password) {
        res.render("secrets");
        app.get("/submit", function(req, res) {
          res.render("submit");
        });
        app.post("/submit", function(req, res) {
          const secret = req.body.secret;
          User.updateOne({
            email: username
          }, {
            $set: {
              secret: secret
            }
          }, function(err) {
            if (!err) {
              console.log("Updated Sucessfully");
              res.render("secrets");
            }
          });
        });
      }
    }
  });
});

app.listen(8080, function() {
  console.log("Server running in port 8080");
});
