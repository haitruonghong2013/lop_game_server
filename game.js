var express = require('express');
var app = express();

app.all('/*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// New call to compress content
app.use(express.compress());

var oneDay = 86400000;
app.use('/games/spaceblaster', express.static(__dirname + '/views/SpaceBlaster', { maxAge: oneDay }));
app.use('/games', express.directory(__dirname + '/views/Games'), {icons: true});

app.get('/', function(req, res) {
	res.redirect('/games');
});

var port = process.env.PORT || 3450;
app.listen(port);
console.log('server start at port ' + port);