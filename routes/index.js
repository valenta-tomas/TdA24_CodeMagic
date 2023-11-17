var express = require('express');
var router = express.Router();
const api= {
  "secret":"The cake is a lie"
}
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/api',(req, res)=>{
  console.log(api)
})

module.exports = router;
