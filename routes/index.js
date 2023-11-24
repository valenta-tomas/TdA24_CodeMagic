var express = require('express');
var router = express.Router();


const data= require('../public/data/lecturer.json');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/api',(req, res)=>{
  res.json({secret:"The cake is a lie"});
})

router.get('/lecturer',(req, res)=>{
  res.render('lecturer', { title_before: data.title_before
    ,first_name:data.first_name
    ,middle_name:data.middle_name
    ,last_name:data.last_name
    ,title_after:data.title_after
    ,picture_url:data.picture_url
    ,location:data.location
    ,claim:data.claim
    ,bio:data.bio
   });
})
module.exports = router;
