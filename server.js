

var express = require('express');
var app = express();

app.use(express.static('public'));
app.listen(process.env.PORT || 8080, () => console.log('listening on PORT: 8080'));

module.exports = {app}

