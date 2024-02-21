if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// setting the sqlite to verbose debugging mode (https://github.com/TryGhost/node-sqlite3/wiki/Debugging)
const sqlite3 = require('sqlite3').verbose();
// creates database with fileneme db.sqlite in directory './data/'
const fs = require("node:fs");
if(!fs.existsSync(path.join(__dirname, 'data'))){
  // create data directory if it does not exist
  fs.mkdirSync(path.join(__dirname, 'data'));
}
const methodOverride = require('method-override')
const session = require('express-session')

const db = new sqlite3.Database(path.join(__dirname, 'data','db.sqlite'));

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const flash = require('express-flash');
const passport = require('passport');
var bodyParser = require('body-parser')

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(methodOverride('_method'))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware pro zpracování základní autentizace
app.use((req, res, next) => {
  // Vynechání autentizace pro GET metodu
  if (req.method === 'GET') {
      next();
      return;
  }

  // Vynechání autentizace pro cestu /login
  if (req.path === '/login') {
      next();
      return;
  }
  if (req.query._method === 'DELETE') {
    return next(); // Povolit DELETE s query parametrem _method=DELETE
  }
  if (req.method === 'POST' && req.path.match(/^\/lecturers\/[^/]+$/)) {
    return next(); // Přeskočení autentizace
}

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
      res.status(401).send('Chybějící nebo neplatné autentizační údaje.');
      return;
  }

  // Dekódování a ověření autentizačních údajů
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  // Zde byste prováděli ověření uživatelských údajů, například dotazem do databáze
  if (username === 'TdA' && password === 'd8Ef6!dGG_pv') {
      next();
  } else {
      res.status(401).send('Neplatné uživatelské jméno nebo heslo.');
  }
});


app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave:false,
  saveUninitialized:false
}))

app.use(passport.initialize())
app.use(passport.session())

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = process.env.ENV === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// creates the tourdeapp table in the databace
db.run('CREATE TABLE IF NOT EXISTS tourdeapp (record TEXT)');
db.close();

global.db = db;
module.exports = app;