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
      let checkTags_uuid=[this.tags[i].uuid];
      console.log(checkValues)
      db.all(getSql, checkValues,(err, rows)=>{
        if(err){
          // res.status(500).send('An error occurred while getting the tag UUID: ' + err);
          return;
        }


        if(rows.length === 0){
          // nexistuje
          const insertSqlTag = `INSERT INTO tags (tag_uuid, tag) VALUES (?, ?)`;
          const insertValues = [ checkTags_uuid, checkValues];

          db.run(insertSqlTag, insertValues, (err) => {
            if (err) {
              // res.status(500).send('An error occurred while saving the tag: ' + err);
              return;
            }
            // res.status(200).send();
          });


          const insertValues2 = [ this.uuid, checkTags_uuid];
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
  db.run('CREATE TABLE IF NOT EXISTS contact ( phone_number TEXT NOT NULL, email TEXT NOT NULL, contact_uuid UUID NOT NULL, PRIMARY KEY (contact_uuid));')
  db.run('CREATE TABLE IF NOT EXISTS tags (tag_uuid UUID NOT NULL, tag CHAR(255) NOT NULL, PRIMARY KEY (tag_uuid));')
  db.run('CREATE TABLE IF NOT EXISTS lecturer_tags ( lecturer_uuid UUID NOT NULL, tag_uuid UUID NOT NULL, FOREIGN KEY (lecturer_uuid) REFERENCES lecturers (lecturer_uuid), FOREIGN KEY (tag_uuid) REFERENCES tags (tag_uuid));')
  router.post("/api/lecturers", (req,res)=>{
  try {

    const uuid= uuidv4()
    let tags = req.body.tags
    for(let i=0; i<tags.length; i++){
      tags[i]["uuid"] = uuidv4()
    }

    console.log(tags)
    const NewLecturer = new Lecturer(uuid, req.body.title_before, req.body.first_name, req.body.middle_name, req.body.last_name, req.body.title_after, req.body.picture_url, req.body.location, req.body.claim, req.body.bio, req.body.price_per_hour, req.body.contact.telephone_numbers, req.body.contact.emails, tags)
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
        "telephone_numbers": 
          NewLecturer.telephone_numbers
        ,
        "emails": 
          NewLecturer.emails             
      }
    });
    
  } catch (error) {
    return res.json({
      status:400,
      success:false,
    });
  }
})
router.get('/api/lecturers', (req, res) => {
  const getLecturers = `SELECT * FROM lecturers JOIN contact ON lecturers.lecturer_uuid = contact.contact_uuid JOIN lecturer_tags ON lecturers.lecturer_uuid = lecturer_tags.lecturer_uuid JOIN tags ON lecturer_tags.tag_uuid = tags.tag_uuid`;
  let LecturerFull=[];
  db.all(getLecturers, (err, rows) => {
    if (err) {
      res.status(500).send('An error occurred while getting all lecturer-tags: ' + err);
      return;
    }
    let unikatniData = rows.reduce((acc, objekt) => {
      // Zjistíme, zda už máme objekt s daným uuid v akumulátoru
      let existujiciObjekt = acc.find(item => item.lecturer_uuid === objekt.lecturer_uuid);
    
      // Pokud nemáme, přidáme objekt do akumulátoru
      if (!existujiciObjekt) {
        acc.push(objekt);
      }
    
      return acc;
    }, []);
    let filtrovanaPole;
    for(let i=0;i<unikatniData.length; i++){
      let lecturerUUID = unikatniData[i].lecturer_uuid
      console.log(lecturerUUID)

        filtrovanaPole = rows.filter(function(value) {
          if (value.lecturer_uuid === lecturerUUID) {
            return true;
          } else {
            return false;
          }
        }).map(function(value) {
          return {uuid: value.tag_uuid, name: value.tag };
          // return { lecturer_uuid:value.lecturer_uuid, uuid: value.tag_uuid, name: value.tag };
        });
        console.log(filtrovanaPole)
      LecturerFull.push(
        {
          uuid:unikatniData[i].lecturer_uuid,
          title_before:unikatniData[i].title_before,
          first_name:unikatniData[i].first_name,
          middle_name:unikatniData[i].middle_name,
          last_name:unikatniData[i].last_name,
          title_after:unikatniData[i].title_after,
          picture_url:unikatniData[i].picture_url,
          location:unikatniData[i].location,
          claim:unikatniData[i].claim,
          bio:unikatniData[i].bio,
          tags:filtrovanaPole,
          price_per_hour:unikatniData[i].price_per_hour,
          contact:{
            telephone_numbers:unikatniData[i].phone_number,
            emails:unikatniData[i].email
          }
        }
      )
    }

    res.status(200).send(LecturerFull)
  });
});

router.delete('/api/lecturers/:uuid', (req, res)=>{
  const getLecturers = "SELECT * FROM lecturers";
  db.all(getLecturers, (err, rows) => {

  const uuidParam = req.params;
  console.log(rows)
  const item = rows.find(item => item.lecturer_uuid === uuidParam.uuid);
  if (item) {
    const query1 = "DELETE FROM lecturers WHERE lecturer_uuid = ?";
    const query2 = "DELETE FROM contact WHERE contact_uuid = ?";
    const query3 = "DELETE FROM lecturer_tags WHERE lecturer_uuid = ?";
    db.run(query1, uuidParam.uuid, (err) => {
      if (err) {
        console.error(err);
        return;
      }
  
      db.run(query2, uuidParam.uuid, (err) => {
        if (err) {
          console.error(err);
          return;
        }
  
        db.run(query3, uuidParam.uuid, (err) => {
          if (err) {
            console.error(err);
            return;
          }
          res.status(204)
          console.log("Záznamy byly úspěšně odstraněny.");

        });
      });
    });
  } else {
    res.status(404).send('User not found');
  }})
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
