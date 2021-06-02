var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const env = require('dotenv').config();
require('./helpers/passportConfig');

var app = express();

require('./globals');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const passport = require('passport');
app.use(passport.initialize());

const allowCors = function (req, res, next) {
  console.log("Came to cros");

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
};

app.use(allowCors);

const routerIndex = require('./routes/index');
app.use('/api', routerIndex);
app.get('*', (req, res) => res.status(200).send({
    message: 'Oh You want to access this URL? We are busy building it. Check back soon.',
}));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log("ERROR ===>>> :" +err)
  // // render the error page
  // res.status(err.status || 500);
  // res.render('error');
  return jsonResponse(res, 500, errorRes(err.message));
});

module.exports = app;
