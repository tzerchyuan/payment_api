// server.js

//BASE SETUP

// ===============================

// call the packages that we need
var express = require('express');

var app = express();

var bodyParser = require('body-parser');

var uuid = require('uuid');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/myproject');

var Account = require('./models/account');
var Transaction = require('./models/transaction');

// configure app to use bodyParser()
// this will let us get the data from a POST

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

var port = process.env.PORT || 8080    // set our port

app.listen(port);

// ROUTES FOR OUR API

// ================================

var router = express.Router();  // get an intstance of the Express router

router.use(function(req, res, next) {
  // do logging
  console.log('Something is happening,');

  next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080)

router.get('/', function(req, res) {
  res.json({ message: 'hooray! welcome to our api!'});
});

// more routes for our API will happen here

// REGISTER OUR ROUTES ------------

// all of our routes will be prefixed with /api

// ########################### ROUTES FOR ACCOUNT ###################################

router.route('/account')
  .post(function(req, res){
    var account = new Account();
    console.log(req.body);
    account.name = req.body.name;
    console.log(req.body.name);
    console.log(account.name);
    account.balance = 0;

    account.save(function(err){
      if (err) {
        res.send(err);
      }
      res.json({ message: 'Account created!'});
    });
  })

  .get(function(req, res){
    Account.find(function(err, accounts) {
      if (err) {
        res.send(err);
      }
      res.json(accounts);
    });
  });

router.route('/account/:account_id')
  .get(function(req, res) {
    Account.findById(req.params.account_id, function(err, account) {
      if (err) {
        res.send(err);
      }
      else {
        res.json(account);
      }
    });
  })

  .put(function(req, res){
    Account.findById(req.params.account_id, function(err, account) {
      if (err) {
        res.send(err);
      }
      account.name = req.body.name;
      account.email = req.body.email;
      account.balance = req.body.balance;

      account.save(function(err) {
      if (err) {
        res.send(err);
      }
      res.json({message: 'Account updated'});
      });
    });
  });

// ##################################################################################


// ########################### ROUTES FOR TRANSACTIONS ##############################

router.route('/transaction')
  .post(function(req, res) {
    var transaction = new Transaction();
    // TODO: create unique id
    transaction.from_acc = req.body.from_acc;
    transaction.to_acc = req.body.to_acc;
    transaction.amount = req.body.amount;

    // perform logic of checking if debitting account has enough balance
    Account.findById(transaction.from_acc, function(err, from_acc){
      if (err) {
        console.log('From account: ' + transaction.from_acc + 'is not found');
        res.send(err);
      } else {
        Account.findById(transaction.to_acc, function(err, to_acc){
          if (err) {
            console.log('To account: ' + transaction.to_acc + 'is not found');
            res.send(err);
          } else {
            if (from_acc.balance >= transaction.amount) {
              from_acc.balance -= transaction.amount;
              to_acc.balance += transaction.amount;
              transaction.validity = true;
              console.log("-----New transaction-----");
              console.log("From account: " + from_acc );
              console.log("To account: " + to_acc );
              console.log("Amount: " + transaction.amount);
              console.log("From Balance: " + from_acc.balance);
              console.log("To Balance: " + to_acc.balance);

              // save changes to account
              from_acc.save(function(err) {
                if (err) {
                  console.log("Unable to save changes to from_acc");
                  res.send(err);
                } else {
                  console.log('from_acc saved');
                  to_acc.save(function(err){
                    if (err) {
                      console.log("Unable to save changes to to_acc");
                    }
                    // save transaction
                    transaction.save(function(err) {
                      if (err) {
                        console.log('Transaction: ' + transaction.id  + ' is not saved.')
                        res.send(err);
                      }
                      console.log("Transaction is successful!");
                      res.send(200);
                    });
                  });
                }
              });
            } else {
              // not enough balance in from_acc
              console.log("There is not enough balance from : " + transaction.from_acc);
              res.send(418);
            }
          }
        });
      }
    });
  });

app.use('/payment_api', router);

// START THE SERVER

// ===============================



console.log('Magic happens on port ' + port);
