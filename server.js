

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const {PORT, DATABASE_URL} = require('./config');

const {router: usersRouter} = require('./users');

const threadsRouter = require('./routes/threadsRouter');
const postsRouter = require('./routes/postsRouter');
const commentsRouter = require('./routes/commentsRouter');
const likesRouter = require('./routes/likesRouter');

mongoose.Promise = global.Promise;

const app = express();

app.use('/users/', usersRouter);


app.use(morgan('common'));
app.use(bodyParser.json());
app.use(express.static('public'));

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


module.exports = {runServer, closeServer, app};

