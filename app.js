/*
Passport-Live is a modern web app for schools that helps them manage passes.
    Copyright (C) 2017  Joseph Hassell

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

email: hi@josephhassell.com
*/

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mustacheExpress = require('mustache-express');
var passport = require('passport')
var config = require('config');
var flash = require('connect-flash');
var r = require('rethinkdb');
var bcrypt = require('bcrypt-nodejs');
var session = require('express-session')
var cookieSession = require('cookie-session')
var FileStore = require('session-file-store')(session);
var optional = require('optional');
var Raven = optional('raven');
var utils = require('./modules/passport-utils/index');

/*Routes*/
var rootLevel = require('./routes/index');
var auth = require('./routes/auth');
var studentView = require('./routes/student');
var api = require('./routes/api/apiRoute');
var teacher = require('./routes/teacher');
var administrator = require('./routes/administrator');
var apiMedia = require('./routes/api/media');
var apiAccounts = require('./routes/api/account');
var apiAuth = require('./routes/api/auth');
var apiPasses = require('./routes/api/passes');
var apiBlackouts = require('./routes/api/blackout');
var apiSecurity = require("./routes/api/security");
var app = express();

require('./modules/auth/index.js')(passport, r, bcrypt);// auth config

//setup db conn
require('./modules/db/index.js').setup();

//Config raven / sentry
if(Raven) {
  Raven.config(config.get('secrets.loggingDSN')).install();
  var RavenUber = new Raven.Client(config.get('secrets.loggingDSN'));
  app.use(Raven.requestHandler());
}

// view engine setup
app.engine('mustache', mustacheExpress());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'mustache');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public/images', 'favicon.png')));



//config 
console.log(process.env.NODE_ENV)
if(process.env.NODE_ENV == "production") {
  app.use(logger('dev'));
} else {
  app.use(logger('combined'));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(config.get('secrets.cookie-secret')));
if(config.get('misc.storeSessionToDisc')) {
  app.use(session({ 
    store: new FileStore(),
    secret: config.get('secrets.session-key'), 
    resave: false, 
    saveUninitialized: false 
  }));
} else {
  /*
  app.use(session({ 
    secret: config.get('secrets.session-key'), 
    resave: false, 
    saveUninitialized: false 
  }));*/
  app.use(cookieSession({
    name: 'session',
    secret: config.get('secrets.session-key'), 
    
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }))
}
//dscm protection
app.use(utils.dscm)

app.use(passport.initialize());
app.use(passport.session());// persistent login sessions

//

app.use(flash()); // use connect-flash for flash messages stored in session
app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: false,
  sourceMap: false
}));
app.use(express.static(path.join(__dirname, 'node_modules')));
app.use(express.static(path.join(__dirname, 'public')));
// TOP LEVEL ROUTE
app.use('/', rootLevel);
app.use('/student', studentView);
app.use('/teacher', teacher);
app.use('/api', api);
app.use('/auth', auth);
app.use('/administrator', administrator)
//api routes
app.use('/api/media', apiMedia)
app.use('/api/account', apiAccounts)
app.use('/api/auth', apiAuth)
app.use('/api/blackout', apiBlackouts)
app.use('/api/passes', apiPasses)
app.use("/api/security", apiSecurity)
//app.use('/users', users);

if(Raven) {
  //raven error catcher 
  app.use(Raven.errorHandler());
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development


  if(!err.status){
    err.status = 500;
  }
  if(Raven) {
    if(err.status != 404) {
      var extra = {};
      extra.level = err.level
      console.log(extra)
      RavenUber.captureException(err, extra);
    }
  }
  res.locals.message = err.message;
   if(config.has('secrets.loggingDSN') && Raven){
      res.locals.raven = true;
    }
  res.locals.error = req.app.get('env') === 'development' ? err : {status: err.status};

  //console.log(err)
  // render the error page
  res.append("errormessage", err.message);
  res.status(err.status);
  res.render('error');
  

});




module.exports = app;
