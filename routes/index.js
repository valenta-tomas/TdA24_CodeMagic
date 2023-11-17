var express = require('express');
var router = express.Router();
const api= {
  "secret":"The cake is a lie"
}
/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(api.secret)
  res.render('index', { title: 'Express' });
});

module.exports = router;
