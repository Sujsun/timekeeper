var express = require('express');
var app = express();

app.use(express.static('public'));

app.get('/', function (req, res) {
  res.sendFile('public/index.html');
});

app.get('/utcMillis', function (req, res) {
  setTimeout(function () {
    res.send((new Date().getTime() - (3 * 60 * 1000)) + '');
  }, 1 * 1000);
});

app.get('/date', function (req, res) {
  setTimeout(function () {
    res.json({
      date: new Date().getTime() - (3 * 60 * 1000),
    });
  }, 1 * 1000);
});

app.listen(8989, function () {
  console.log('Example app listening on port 8989!');
});