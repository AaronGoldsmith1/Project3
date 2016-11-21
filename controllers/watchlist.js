var WatchList = require('../models/watchlist')
var User = require('../models/user')
var stockHelper = require('../helpers/stockHelper')
var mongoose = require('mongoose')
var _ = require('lodash')


module.exports = {
  index:   index,
  show:    show,
  create:  create,
  update:  update,
  destroy: destroy
};


function index(req, res, next){
  res.setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify({data:'content'}));

}

function show(){

}

function create(req, res, next){
  console.log(req.body.symbol);
  var stock = req.body;
  stockHelper.validateStockSymbol(stock.symbol, function(err){
    if (err) {
      console.log(err)
      res.send(JSON.stringify({err: 'stock symbol is not valid'}));
      return;
    }
    //stock symbol is valid
    User.find({'email': 'aaa@aaa.com'}, function(err, users){
      if (err) return console.log(err);

      var user = users[0];
      console.log(user);

      user.stocks.push(stock);
      user.save(function(err, user) {
        if (err) return console.log(err);
        res.send(JSON.stringify(user.stocks));
      });

    });


  });
};

function update(req, res, next){
  var symbol = req.params.symbol;
  var body = req.body;
  var lastGuess = new Date();

  var updateBody = {
    $set : {
      "stocks.$.closingGuess" : body.closingGuess,
      "stocks.$.lastGuess" : lastGuess
    }
  };

  console.log(updateBody);
  User.findOneAndUpdate({email:'aaa@aaa.com', 'stocks.symbol': symbol}, updateBody, {new: true}, function(err, user){
    console.log(arguments);
    if (err) {
      res.send(JSON.stringify(err));
      return;
    }

    var updatedStock = _.find(user.stocks, {symbol : symbol});
    //updatedStock.closingGuess = body.closingGuess;
    //updatedStock.lastGuess = lastGuess;
    res.send(JSON.stringify(updatedStock));
  })

}

function destroy(req, res, next){
  var symbol = req.params.symbol;
  User.update({email: 'aaa@aaa.com'}, {$pull: {'stocks' : {symbol: symbol}}}, function(err, user){
    console.log(arguments);
    res.send(JSON.stringify(arguments));
  });

  //

  /*
  User.find({'email': 'aaa@aaa.com'}, function(err, users){

    var user = users[0];

    _.remove(user.stocks, {'symbol': symbol})
    console.log(user.stocks);
    console.log({'symbol': symbol});
    user.save(function(err, save){
      console.log(arguments);
      if (!err) {
        res.send(JSON.stringify(user))
      } else {
        res.send(JSON.stringify({error: 'error removing stock'}));
      }
    })
  })
  */
};
