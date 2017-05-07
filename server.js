

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');

const {PORT, DATABASE_URL} = require('./config');

const threadsRouter = require('./routes/threadsRouter');
const postsRouter = require('./routes/postsRouter');

mongoose.Promise = global.Promise;

const app = express();
app.use(cors());
app.use(morgan('common'));
app.use(bodyParser.json());
app.use(express.static('public'));

app.use('/threads', threadsRouter);
app.use('/posts', postsRouter);

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

