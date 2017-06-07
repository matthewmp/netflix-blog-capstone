const passport = require('passport');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const BasicStrategy = require('passport-http').BasicStrategy;
const {PORT, DATABASE_URL} = require('./config');
const { User } = require('./models/userModel');
const {router: usersRouter} = require('./users');

const threadsRouter = require('./routes/threadsRouter');
const postsRouter = require('./routes/postsRouter');
const commentsRouter = require('./routes/commentsRouter');
const likesRouter = require('./routes/likesRouter');

mongoose.Promise = global.Promise;

const app = express();

var user_cache = {};

// const { basicStrategy } = require('./routes/userRouter');

const basicStrategy = new BasicStrategy((username, password, callback) => {
  let user;
  User
    .findOne({ username: username })
    .exec()
    .then(_user => {
      user = _user;
      if (!user) {
        return callback(null, false, { message: 'Incorrect username' });
      }
      return user.validatePassword(password);
    })
    .then(isValid => {
      if (!isValid) {
        return isValid.callback(null, false, { message: 'Incorrect password' });
      }
      else {
        return callback(null, user)
      }
    })
});


passport.use(basicStrategy);
// passport.use(new BasicStrategy(
//   function(userid, password, done) {
//     User.findOne({ username: userid }, function (err, user) {
//       if (err) { return done(err); }
//       if (!user) { return done(null, false); }
//       if (!user.verifyPassword(password)) { return done(null, false); }
//       return done(null, user);
//     });
//   }
// ));

passport.serializeUser(function (user, next) {
  let id = user._id;
  user_cache[id] = user;

  console.log(`USER: ${user}`)
  next(null, id);
});

passport.deserializeUser(function (user, next) {
  next(null, user_cache[id]);
});

app.use(passport.initialize());
app.use(passport.session());

app.use(morgan('common'));
app.use(bodyParser.json());
app.use(express.static('public'));


app.use('/users/', usersRouter);
app.use('/threads', threadsRouter);
app.use('/posts', postsRouter);
app.use('/comments', commentsRouter);
app.use('/likes', likesRouter);


app.use('*', function(req, res) {
  return res.status(404).json({message: 'Not Found'});
});


let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}

if(require.main === module){
	runServer().catch(err => {
		console.log(err);
		console.log('Error: in require.main ==== module');
	});
};


module.exports = {runServer, closeServer, app, passport};

