const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');

const {Threads} = require('./models');


router.get('/', (req, res) => {
  Threads
  .find()
  .exec()
  .then(threads => {
  	  console.log('responding')
      res.json({movieThreads: threads})
  })  
  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal Server Error'})
  })
})

module.exports = router;