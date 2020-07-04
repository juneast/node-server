var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var user = require('./routes/user')
var post = require('./routes/post')
var comment = require('./routes/comment')
var room = require('./routes/room')

var db = require('./db.js')
var config = require('./config')
var app = express();

var port = process.env.port || 5000;

if(!process.env.NODE_ENV){
  db();
  //app.use(logger('dev'));
}
app.use(logger('dev'));

app.set('jwt-secret',config.secret);
app.set('view engine', 'jade');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/user',user);
app.use('/api/post',post);
app.use('/api/comment', comment);
app.use('/api/room', room);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(port, ()=>console.log(`listen port : ${port}`));