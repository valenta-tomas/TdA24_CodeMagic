var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  fetch("http://server-url.cz/api")
  .then((res) => res.json())
  .then(data=> console.log(data))

  .catch(function (err) {
    console.log("Unable to fetch -", err);
  });

  res.render('index', { title: 'Express' });
});

module.exports = router;
