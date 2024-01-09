var express = require('express');
var router = express.Router();
var path = require('path');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();
const data= require('../public/data/lecturer.json');

const db = new sqlite3.Database("data/db.sqlite");
// db.run("CREATE TABLE lecturers_tags ( lecturer_uuid UUID NOT NULL, tag TEXT NOT NULL, PRIMARY KEY (lecturer_uuid, tag));")
// db.run("DROP TABLE lecturers_tags;")
console.log(db)

class Lecturer {
  constructor(uuid, title_before, first_name, middle_name, last_name, title_after, picture_url, location, claim, bio, price_per_hour, telephone_numbers, emails, tags) {
    this.uuid = uuid;

    this.title_before = title_before;
    this.first_name = first_name;
    this.middle_name = middle_name;
    this.last_name = last_name;
    this.title_after = title_after;
    this.picture_url = picture_url;
    this.location = location;
    this.claim = claim;
    this.bio = bio;
    this.price_per_hour = price_per_hour;

    this.telephone_numbers = telephone_numbers;
    this.emails = emails;

    this.tags = tags;
  }
  safe_data(){
    const insertSqlContact = `INSERT INTO contact (phone_number, email, contact_uuid) VALUES (?, ?, ?)`;
    const insertValuesContact = [this.telephone_numbers, this.emails, this.uuid];
    console.log(insertValuesContact)

    db.run(insertSqlContact, insertValuesContact, (err) => {
      if (err) {
        // res.status(500).send('An error occurred while saving the tag: ' + err);
        return;
      }
  
      // res.status(200).send();
    });

    const insertSqlLecturers = `INSERT INTO lecturers (lecturer_uuid, title_before, first_name, middle_name, last_name, title_after, picture_url, location, claim, bio, price_per_hour, contact_uuid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const insertValuesLecturers = [ this.uuid, this.title_before, this.first_name, this.middle_name, this.last_name, this.title_after, this.picture_url, this.location, this.claim, this.bio, this.price_per_hour, this.uuid];
    console.log(insertValuesLecturers)

    db.run(insertSqlLecturers, insertValuesLecturers, (err) => {
      if (err) {
        // res.status(500).send('An error occurred while saving the tag: ' + err);
        return;
      }
  
      // res.status(200).send();
    });



    
    const getSql = `SELECT tag_uuid FROM tags WHERE tag = ?`;
    const insertSql = `INSERT INTO lecturer_tags (lecturer_uuid, tag_uuid) VALUES (?, ?)`;
    for(let i =0; i<this.tags.length; i++){

      let checkValues=[this.tags[i].name];
      console.log(checkValues)
      db.all(getSql, checkValues,(err, rows)=>{
        if(err){
          // res.status(500).send('An error occurred while getting the tag UUID: ' + err);
          return;
        }


        if(rows.length === 0){
          // nexistuje
          const insertSqlTag = `INSERT INTO tags (tag_uuid, tag) VALUES (?, ?)`;
          const tag_uuid2 = uuidv4()
          const insertValues = [ tag_uuid2, checkValues];

          db.run(insertSqlTag, insertValues, (err) => {
            if (err) {
              // res.status(500).send('An error occurred while saving the tag: ' + err);
              return;
            }
            // res.status(200).send();
          });


          const insertValues2 = [ this.uuid, tag_uuid2];
          db.run(insertSql, insertValues2, (err) => {
            if (err) {
              // res.status(500).send('An error occurred while saving the lecturer-tag association: ' + err);
              return;
            }
            // res.status(200).send();
          });
          
          return;
        }


        //existuje
        const tagUuid = rows[0].tag_uuid;

        const insertValues = [this.uuid, tagUuid];
        db.run(insertSql, insertValues, (err) => {
          if (err) {
            // res.status(500).send('An error occurred while saving the lecturer-tag association: ' + err);
            return;
          }
      
          // res.status(200).send();
        });
      })
    }

  }

  write_tags(){
      console.log(this.tags)
  }
}
  db.run('CREATE TABLE IF NOT EXISTS lecturers (lecturer_uuid UUID NOT NULL, title_before VARCHAR(255), first_name VARCHAR(255) NOT NULL, middle_name VARCHAR(255), last_name VARCHAR(255) NOT NULL, title_after VARCHAR(255), picture_url VARCHAR(255), location VARCHAR(255), claim VARCHAR(255), bio TEXT, price_per_hour NUMERIC(10,2), PRIMARY KEY (lecturer_uuid));');
  db.run('CREATE TABLE IF NOT EXISTS contact ( phone_number TEXT NOT NULL, email TEXT NOT NULL, uuid UUID NOT NULL, PRIMARY KEY (uuid));')
  db.run('CREATE TABLE IF NOT EXISTS tags (tag_uuid UUID NOT NULL, tag CHAR(255) NOT NULL, PRIMARY KEY (tag_uuid));')
  db.run('CREATE TABLE IF NOT EXISTS lecturer_tags ( lecturer_uuid UUID NOT NULL, tag_uuid UUID NOT NULL, FOREIGN KEY (lecturer_uuid) REFERENCES lecturers (lecturer_uuid), FOREIGN KEY (tag_uuid) REFERENCES tags (tag_uuid));')
  router.post("/api/lecturers", (req,res)=>{
  try {

    const uuid= uuidv4()
    const NewLecturer = new Lecturer(uuid, req.body.title_before, req.body.first_name, req.body.middle_name, req.body.last_name, req.body.title_after, req.body.picture_url, req.body.location, req.body.claim, req.body.bio, req.body.price_per_hour, req.body.contact.telephone_numbers, req.body.contact.emails, req.body.tags)
    NewLecturer.safe_data()
    console.log(NewLecturer.title_before +"\n"+NewLecturer.first_name+"\n"+NewLecturer.middle_name+"\n"+NewLecturer.last_name+"\n"+NewLecturer.title_after+"\n"+NewLecturer.picture_url+"\n"+NewLecturer.location+"\n"+NewLecturer.claim+"\n"+NewLecturer.bio+"\n"+NewLecturer.telephone_numbers+"\n"+NewLecturer.emails+"\n"+NewLecturer.price_per_hour)
    
    return res.status(200).json({
      "uuid": NewLecturer.uuid,
      "title_before": NewLecturer.title_before,
      "first_name": NewLecturer.first_name,
      "middle_name": NewLecturer.middle_name,
      "last_name": NewLecturer.last_name,
      "title_after": NewLecturer.title_after,
      "picture_url": NewLecturer.picture_url,
      "location": NewLecturer.location,
      "claim": NewLecturer.claim,
      "bio": NewLecturer.bio,
      "tags": NewLecturer.tags,
      "price_per_hour": NewLecturer.price_per_hour,
      "contact": {
        "telephone_numbers": [
          NewLecturer.telephone_numbers
        ],
        "emails": [
          NewLecturer.emails          
        ]
      }
    });
    
  } catch (error) {
    return res.json({
      status:400,
      success:false,
    });
  }
})
router.get("/api/lecturers", (req,res)=>{
  const getSql = `SELECT * FROM lecturers`;

  db.all(getSql, (err, rows) => {
    if (err) {
      res.status(500).send('An error occurred while getting all lecturer-tags: ' + err);
      return;
    }

    res.status(200).send([
      {
        "uuid": "67fda282-2bca-41ef-9caf-039cc5c8dd69",
        "title_before": "Mgr.",
        "first_name": "Petra",
        "middle_name": "Swil",
        "last_name": "Plachá",
        "title_after": "MBA",
        "picture_url": "https://picsum.photos/200",
        "location": "Brno",
        "claim": "Bez dobré prezentace je i nejlepší myšlenka k ničemu.",
        "bio": "<b>Formátovaný text</b> s <i>bezpečnými</i> tagy.",
        "tags": [
          {
            "uuid": "c20b98dd-f37e-4fa7-aac1-73300abf086e",
            "name": "Marketing"
          }
        ],
        "price_per_hour": 720,
        "contact": {
          "telephone_numbers": [
            "+123 777 338 111"
          ],
          "emails": [
            "user@example.com"
          ]
        }
      }
    ]);
  });
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
