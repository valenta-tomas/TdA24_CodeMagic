var express = require('express');
var router = express.Router();
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require("sqlite3");
const data= require('../public/data/lecturer.json');

router.post("/lecturers", (req,res)=>{
  try {

    const lecturer_uuid= uuidv4()

    const title_before = req.body.title_before
    const first_name = req.body.first_name
    const middle_name = req.body.middle_name
    const last_name = req.body.last_name
    const title_after = req.body.title_after
    const picture_url = req.body.picture_url
    const location = req.body.location
    const claim = req.body.claim
    const bio = req.body.bio
    const price_per_hour = req.body.price_per_hour
    const telephone_numbers = req.body.contact.telephone_numbers
    const emails = req.body.contact.emails
    
 //db.run('CREATE TABLE lecturers ( lecturer_uuid UUID NOT NULL, title_before VARCHAR(255), first_name VARCHAR(255) NOT NULL, middle_name VARCHAR(255), last_name VARCHAR(255) NOT NULL, title_after VARCHAR(255), picture_url VARCHAR(255), location VARCHAR(255), claim VARCHAR(255), bio TEXT, price_per_hour NUMERIC(10,2), PRIMARY KEY (lecturer_uuid));');
    if (result.code !== SQLITE_OK) {
      console.log("tabulka neni")
    }

    console.log(lecturer_uuid)
    console.log(title_before +"\n"+first_name+"\n"+middle_name+"\n"+last_name+"\n"+title_after+"\n"+picture_url+"\n"+location+"\n"+claim+"\n"+bio+"\n"+telephone_numbers+"\n"+emails+"\n"+price_per_hour)
    return res.json({
      status:200,
      success:true,
    });
    
  } catch (error) {
    return res.json({
      status:400,
      success:false,
    });
  }
})
router.get("/lecturers", (req,res)=>{
 const data = "";
})

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/api',(req, res)=>{
  res.json({secret:"The cake is a lie"});
})

router.get('/lecturer',(req, res)=>{

  res.render('lecturer', { title_before: data.title_before,
    title:"lecturer"
    ,full_name: data.title_before+" "+data.first_name +" " + data.middle_name+" "+data.last_name+" "+data.title_after
    ,picture_url:data.picture_url
    ,location:data.location
    ,price_per_hour:data.price_per_hour
    ,claim:data.claim
    ,bio:data.bio
    ,telephone_numbers:data.contact.telephone_numbers
    ,emails:data.contact.emails
    ,tag1 : data.tags[0].name
    ,tag2 : data.tags[1].name
    ,tag3 : data.tags[2].name
    ,tag4 : data.tags[3].name
    ,tag5 : data.tags[4].name
    ,tag6 : data.tags[5].name
    ,tag7 : data.tags[6].name
    ,tag8 : data.tags[7].name
   });
})
module.exports = router;
