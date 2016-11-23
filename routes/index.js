var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var usersCtrl = require('../controllers/users');
var models = require('../models/stock');
var Stock = models.Stock;
var Prediction = models.Prediction;
var http = require('http');
var moment = require('moment');
var _ = require('lodash')

router.get('/users', usersCtrl.index)

router.get('/api/me', usersCtrl.me)



/* GET home page. */
// The root route renders our only view
router.get('/', function(req, res) {
  res.render('index', {user: req.user});
});

router.get('/auth/google', passport.authenticate(
  'google',
  { scope: ['profile', 'email'] }
));

// Google OAuth callback route
router.get('/oauth2callback', passport.authenticate(
  'google',
  {
    successRedirect : '/',
    failureRedirect : '/'
  }
));

// OAuth logout route
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

var watchListController = require('../controllers/watchlist')

var usersController = require('../controllers/users')



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
/*              */





router.get('/user', usersController.userShow)




//Watchlist
router.get('/watchlist', isLoggedIn, watchListController.index)
router.post('/api/watchlist', watchListController.create)
router.get('/api/watchlist/:stockid', function(req, res, next){
  res.send('Getting stock with id of: ' + req.params.stockid)
})
router.put('/api/watchlist/:symbol', watchListController.update)
router.delete('/api/watchlist/:symbol', watchListController.destroy)


//predictions
router.post('/api/predictions/:symbol', function(req, res){
  //user, date, prediction price
  User.findOne({'email': 'aaa@aaa.com'}, function(err, user){
    if (err) return console.log(err) //return statement ends the function if there's an error
    var predictionParams = {
      'predictedBy': user._id,
      'date': moment().startOf('day'), //moves timestamp to beginning of day
      'predictedClosingPrice': req.body.predictionPrice
    }

    Stock.findOneAndUpdate({symbol: req.params.symbol}, {symbol: req.params.symbol}, {upsert: true, new: true}, function(err, stock){
      if (err){
        //return res.send(500, { error: err }); 
        return console.log({err: error});
      }

      predictionParams.stockId = stock._id;
      var prediction = new Prediction(predictionParams);
      prediction.save({new: true}, function(err, prediction){
        res.send(arguments)
        if (err) return console.log(err);
      });
    });
  })
})

//stock.closingPrice = null? see if market has closed? -> checking date on prediction, if that date is after market close & stock.closingprice, return last closing price of stock from API
router.get('/api/predictions/:symbol', function(req, res){
  User.findOne({'email': 'aaa@aaa.com'}, function(err, user){
    if(err) return console.log(err);
    console.log(user);
    Stock.findOne({symbol: req.params.symbol}, function(err, stock){
      if (err) return console.log(err);

      // Stock has historicalQuotes on it.
      // get most recent one and check it's date
      // if the is less than today, add recent historical quote
      // by calling thier api for opening, closingPrice, and date
      // create new historcal quite and $push it onto the Stock

      Prediction.findOne({predictedBy: user._id, stockId: stock._id}, {}, {sort : '-date'}, function(err, prediction){
        if (err) return console.log(err);
        var responseData = {
          stock: stock,
          prediction: prediction
        }
        res.send(responseData);
      });
    });
  });
});



//Users
router.post('/api/users', function(req, res, next){
  var user = new User({'email': 'aaa@aaa.com', 'name': 'aaa'})
  user.save(function(err, user){
    if (err) console.log(err);
    console.log('user created!')
    res.end();
  })
})

router.get('/api/users', function(req, res, next){
  var users = User.find({}, function(err, users){
    if (err) console.log(err)
  res.send(JSON.stringify(users))
  })
})

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated() ) return next();
  res.redirect('/');
}

router.get('/stockinfo', function(req, res, next) {
  res.render('../views/pages/stockinfo.ejs')
})


module.exports = router;
