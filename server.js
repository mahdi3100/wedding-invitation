var http = require('http');
var path = require('path');





//console.log(process)
var createError = require('http-errors');
var express = require('express');
//var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var app = express();
var server = http.createServer(app)

//const redis = require("redis");
//const clientRedis = redis.createClient();
//clientRedis.auth("M@hdi31$");//it has a callback but i know it will work


var MongoConnect = require('./db/config.db');

//Create instance of mongodb that connect to Database  -  POOL  connection
var dbPOOL = new MongoConnect()

const port = process.env.NODE_DOCKER_PORT || 8383;// 8787;
app.set('port', port);
//Instances of Routes API

var apiInvitation = require('./routes/comments-server');
//Prevent cors
app.use(cors());
/**
 default cors conf:
  {
  "origin": "*",
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "preflightContinue": false,
  "optionsSuccessStatus": 204
}
Enable  preflight by app.options('*', cors()) // include before other routes 
OR use CSRF module 
 */
server.listen(port);
//In case generate views by Express

// view engine setup
//app.set('views', path.join(__dirname, 'public'));
//app.set('views', "/home/mehdi/Documents/Red/red/client/public");
//app.set('view engine', 'ejs');
//app.engine('html', require('ejs').renderFile);


app.use(express.static(path.join(__dirname, 'public')));


 


app.use(function (req, res, next) {
  req.dbPOOL = dbPOOL; 
  next();//next is mondatory to pass to next middleware
});
app.use(express.json());
/** spare options */
app.use(logger('dev'));

app.use(express.urlencoded({ extended: false }));


//API Redirect to Routes


app.get('/', (req, res) => {

  res.sendFile(path.join(__dirname, 'public','index.html'));
});


app.use('/api', apiInvitation);


/**
 * / = case using express as main server to redirect to /index.html build file reacts 
 * no need of indexrouter when using static serve of react 
 */
// Define the catch-all route for React Router
app.get('*', (req, res) => {

  res.sendFile(path.join(__dirname, 'public','index.html'));
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  //console.log(process.env.NODE_ENV) => undefined whilte we did not defined it in .env
 // console.log(req.app.get('env')) => development , by default if express find NODE_ENV undefined it returns development for  req.app.get('env')
 next(createError(404));
});







// error handler middleware the only middle ware that has err as first paramater ;
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  //Express app.get('env') returns 'development' if NODE_ENV is not defined. NODE_ENV is undidinfed while i did not defined in .env , So you don't need the line to test its existence and set default.
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  console.log("**************")
  console.log(err.message)

  //res.render('error',{"err":err.message});
});



/*
exports.app = app;
exports.server = server;
*/