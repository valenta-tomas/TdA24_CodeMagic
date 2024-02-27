var express = require('express');
var router = express.Router();
var path = require('path');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();
const data= require('../public/data/lecturer.json');

const bcrypt = require('bcrypt')
const passport = require('passport')
const { createICalFile } = require('../icalGenerator');
const db = new sqlite3.Database("data/db.sqlite");
db.run('CREATE TABLE IF NOT EXISTS lecturers (lecturer_uuid UUID NOT NULL, title_before VARCHAR(255), first_name VARCHAR(255) NOT NULL, middle_name VARCHAR(255), last_name VARCHAR(255) NOT NULL, title_after VARCHAR(255), picture_url VARCHAR(255), location VARCHAR(255), claim VARCHAR(255), bio TEXT, price_per_hour NUMERIC(10,2), contact_uuid UUID NOT NULL, PRIMARY KEY (lecturer_uuid), FOREIGN KEY (contact_uuid) REFERENCES contact (contact_uuid));');
db.run('CREATE TABLE IF NOT EXISTS tags (tag_uuid UUID NOT NULL, tag CHAR(255) NOT NULL, PRIMARY KEY (tag_uuid));')
db.run('CREATE TABLE IF NOT EXISTS contact ( phone_number TEXT NOT NULL, email TEXT NOT NULL, contact_uuid UUID NOT NULL, PRIMARY KEY (contact_uuid));')
db.run('CREATE TABLE IF NOT EXISTS lecturer_tags ( lecturer_uuid UUID NOT NULL, tag_uuid UUID NOT NULL, FOREIGN KEY (lecturer_uuid) REFERENCES lecturers (lecturer_uuid), FOREIGN KEY (tag_uuid) REFERENCES tags (tag_uuid));')
db.run('CREATE TABLE IF NOT EXISTS users (id_user INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, password TEXT NOT NULL, lecturer_uuid TEXT NOT NULL, FOREIGN KEY (lecturer_uuid) REFERENCES lecturers(lecturer_uuid), CHECK (id_user > 0));')


db.run('CREATE TABLE IF NOT EXISTS reservation (reservation_uuid UUID PRIMARY KEY NOT NULL, lecturer_uuid UUID NOT NULL, first_name VARCHAR(255) NOT NULL, last_name VARCHAR(255) NOT NULL, date DATE NOT NULL, email VARCHAR(255) NOT NULL, phone VARCHAR(20) NOT NULL, tag VARCHAR(255), description TEXT, hours VARCHAR(50), meeting VARCHAR(50) NOT NULL);')


function GetUser(){
  const users=[]

  db.all("SELECT * FROM users", (err, rows) => {
    if (err) {
        console.error(err.message);
        return;
    }
    // Vypsání získaných dat do konzole
    else{
      users.push(...rows)
      //console.log(users)
      const initializePassport = require('../passport-config')
      initializePassport(passport,
      name => users.find(user => user.name === name),
      id => users.find(user => user.lecturer_uuid === id)
      )
    }
  });
}



// db.run("CREATE TABLE lecturers_tags ( lecturer_uuid UUID NOT NULL, tag TEXT NOT NULL, PRIMARY KEY (lecturer_uuid, tag));")
// db.run("DROP TABLE lecturers_tags;")

class Lecturer {
  constructor(uuid, title_before, first_name, middle_name, last_name, title_after, picture_url, location, claim, bio, price_per_hour, telephone_numbers, emails, tags, username, password) {
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

    this.username = username;
    this.password = password;
  }
  AccountRegister = async()=>{
          
    try{
      const salt = await bcrypt.genSalt()
      const hasedPassword = await bcrypt.hash(this.password, salt)


      const insertSqlUSers = `INSERT INTO users (name, password, lecturer_uuid) VALUES (?, ?, ?)`;
      const Account = [this.username,hasedPassword, this.uuid]
      db.run(insertSqlUSers,Account,(err)=>{
        if(err)
          return;
      }) 
  }
  catch{
    return;
  }
  }
  save_data(){
    const insertSqlContact = `INSERT INTO contact (phone_number, email, contact_uuid) VALUES (?, ?, ?)`;
    const insertValuesContact = [this.telephone_numbers, this.emails, this.uuid];
    // console.log(insertValuesContact)

    db.run(insertSqlContact, insertValuesContact, (err) => {
      if (err) {
        // res.status(500).send('An error occurred while saving the tag: ' + err);
        return;
      }
  
      // res.status(200).send();
    });

    const insertSqlLecturers = `INSERT INTO lecturers (lecturer_uuid, title_before, first_name, middle_name, last_name, title_after, picture_url, location, claim, bio, price_per_hour, contact_uuid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const insertValuesLecturers = [ this.uuid, this.title_before, this.first_name, this.middle_name, this.last_name, this.title_after, this.picture_url, this.location, this.claim, this.bio, this.price_per_hour, this.uuid];
    // console.log(insertValuesLecturers)

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
      // console.log(checkValues)
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


  router.post("/api/lecturers", (req,res)=>{

  try {

    const uuid= uuidv4()
    let tags = req.body.tags
    for(let i=0; i<tags.length; i++){
      tags[i]["uuid"] = uuidv4()
    }
    if(req.body.first_name ==null || req.body.last_name ==null){
      console.log(req.body.first_name)
      console.log(req.body.last_name )
      res.status(400).send({
        "code": 400,
        "message": "User not found"
      });
      return;
    }
    else{
    const NewLecturer = new Lecturer(uuid, req.body.title_before, req.body.first_name, req.body.middle_name, req.body.last_name, req.body.title_after, req.body.picture_url, req.body.location, req.body.claim, req.body.bio, req.body.price_per_hour, req.body.contact.telephone_numbers, req.body.contact.emails, tags, req.body.username, req.body.password)
    NewLecturer.save_data()
    NewLecturer.AccountRegister()
    // console.log(NewLecturer.title_before +"\n"+NewLecturer.first_name+"\n"+NewLecturer.middle_name+"\n"+NewLecturer.last_name+"\n"+NewLecturer.title_after+"\n"+NewLecturer.picture_url+"\n"+NewLecturer.location+"\n"+NewLecturer.claim+"\n"+NewLecturer.bio+"\n"+NewLecturer.telephone_numbers+"\n"+NewLecturer.emails+"\n"+NewLecturer.price_per_hour)
    return res.status(200).json({
      "uuid": NewLecturer.uuid,
      "username":NewLecturer.username,
      "password":NewLecturer.password,
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
  }
  } catch (error) {
    return res.json({
      status:400,
      success:false,
    });
  }
  
})
router.get('/', (req, res) => {
  const minP = req.query.inputMin
  const maxP = req.query.inputMax
  const tags = req.query.tag
  const city = req.query.city
  console.log(minP)
  console.log(maxP)
  console.log(tags)
  console.log(city);


  const getLecturers = `SELECT * FROM lecturers JOIN contact ON lecturers.lecturer_uuid = contact.contact_uuid`;
  const getTags = `SELECT * FROM tags`;
  const getLecturerTag =  `SELECT * FROM lecturer_tags`;
  const Tags=[]
  const filterRows = []
  const filterTag= []
    db.all(getLecturerTag, (err, LtagRows)=>{


    db.all(getTags,(err,Tagrows)=>{
      if(err)
        return
    db.all(getLecturers,(err, rows)=>{
      if(err){
        return
      }
      Tagrows.forEach(tag => {
        if (Array.isArray(tags))
        {
          tags.map(t=>{
            if(t=== tag.tag){
              filterTag.push(tag)
            }
          })
        }
        else{
          if(tag.tag === tags){
            filterTag.push(tag)
          }
        }
      })

      if(minP== undefined && maxP == undefined && tags==undefined && city == undefined){
        filterRows.push(...rows)
      }
      rows.map(m=>{
        LtagRows.map(n=>{
          if(m.lecturer_uuid === n.lecturer_uuid){
            if (!m.tags) {
              m.tags = []; 
            }
            m.tags.push(n)
          }
        })
      })
      console.log(filterTag)
      rows.forEach(lector => {
        if(lector.price_per_hour>= minP && lector.price_per_hour<= maxP){

          if(tags== undefined || tags.length==0){
                      if(city === ''){
                        filterRows.push(lector)
                    }
                    else{
                      if(lector.location.toLowerCase() === city.toLowerCase()){
                        filterRows.push(lector)
                    }
                  }
          }
          
          else{
            let includeTag = lector.tags.some(objekt1 =>
              filterTag.some(objekt2 => objekt1.tag_uuid === objekt2.tag_uuid)
              );
          if(includeTag){
                  if(city === ''){
                      filterRows.push(lector)
                  }
                  else{
                    if(lector.location.toLowerCase() === city.toLowerCase()){
                      filterRows.push(lector)
                  }
                }
              }
            }
      }});

      filterRows.forEach(element => {
        element.tags.forEach(tag => {
          Tagrows.map(t =>{
            if(tag.tag_uuid === t.tag_uuid){
              tag.name = t.tag
            }
          })

        });
        
      });
      console.log(filterRows[0])
      // console.log(filterRows)
      Tagrows.forEach(value => Tags.push(value.tag))
      res.render('lecturers', { lectors: filterRows, tagArray:Tags});
      // res.status(200).send(LecturerFull)
    })
  })
  })

});

router.delete('/lecturers/:uuid', (req, res, next) => {
  const uuid = req.params.uuid;
  let successCount = 0; // Proměnná pro sledování úspěšných operací smazání

  // Funkce pro odeslání odpovědi, pokud všechny operace smazání proběhnou úspěšně
  function sendSuccessResponse() {
    if (successCount === 4) { // Počet operací smazání
      res.status(204).json({ message: "Záznam byl úspěšně smazán" });
    }
  }

  // Smazání záznamu z tabulky users
  db.run(`DELETE FROM users WHERE lecturer_uuid = ?`, [uuid], function(err) {
    if (err) {
      res.status(400);
      return next(err);
    }
    successCount++;
    sendSuccessResponse();
  });

  // Smazání záznamu z tabulky lecturers
  db.run(`DELETE FROM lecturers WHERE lecturer_uuid = ?`, [uuid], function(err) {
    if (err) {
      res.status(400);
      return next(err);
    }
    successCount++;
    sendSuccessResponse();
  });

  // Smazání záznamu z tabulky lecturer_tags
  db.run(`DELETE FROM lecturer_tags WHERE lecturer_uuid = ?`, [uuid], function(err) {
    if (err) {
      res.status(400);
      return next(err);
    }
    successCount++;
    sendSuccessResponse();
  });

  // Smazání záznamu z tabulky contact
  db.run(`DELETE FROM contact WHERE contact_uuid = ?`, [uuid], function(err) {
    if (err) {
      res.status(400);
      return next(err);
    }
    successCount++;
    sendSuccessResponse();
  });
});

router.post('/lecturers/:uuid', (req, res)=>{
  const uuidParam = req.params;
  console.log(req.body.first_name)
  console.log(req.body.first_name)
  console.log(req.body.last_name)
  console.log(req.body.date)
  console.log(req.body.meeting)
  console.log(req.body.email)
  console.log(req.body.phone)
  console.log(req.body.tag)
  console.log(req.body.description)
  console.log(req.body.hours)
  console.log(uuidParam.uuid)
  function reservation(){
    const uuid= uuidv4()
    const inserReservation = `INSERT INTO reservation (reservation_uuid , lecturer_uuid, first_name, last_name, date, email, phone, tag, description, hours, meeting) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const first_name =  req.body.first_name
    const last_name =  req.body.last_name
    const date=  req.body.date
    const meeting=  req.body.meeting
    const email=  req.body.email
    const phone=  req.body.phone
    const tag=  req.body.tag
    const description=  req.body.description
    const hours=  req.body.hours.toString()

    db.run(inserReservation,[uuid, uuidParam.uuid, first_name, last_name, date, email, phone, tag, description, hours, meeting],(err)=>{
      if(err){
        return console.error(err.message);
      }
    })
  }
  reservation()
  res.redirect('/');
})
router.get('/lecturers/:uuid', (req, res)=>{
  const uuidParam = req.params;
  let sql = "SELECT * FROM reservation WHERE lecturer_uuid = ?";
  db.all(sql,[uuidParam.uuid],(err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    // Zpracování získaných záznamů
    rows.forEach((row) => {
      console.log(row)
      row.hours = row.hours.split(",")
    });






  let LecturerFull=[];
  let time =[]

  let hours = [8,9,10,11,12,13,14,15,16,17,18,19]
  for(let i= 0; i<=21; i++){
    const date = new Date();
    date.setDate(date.getDate() + i);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Přidání nuly pro jednociferný měsíc
    const day = date.getDate().toString().padStart(2, '0'); // Přidání nuly pro jednociferný den
  
    const formattedDate = `${year}-${month}-${day}`;
    time.push({
      date:formattedDate,
      hours:hours
    })
  }
  time.map(d=>{
    // console.log(d.date)
    // console.log("-----------")
    rows.map(time =>{
      if(time.date === d.date){
        // console.log(true)
        // console.log(time.hours)

        d.hours =d.hours.filter(item => !time.hours.includes(item.toString()));
        console.log(d.hours)
      }
    })

  })
  console.log(time)


  const getLecturer = "SELECT * FROM lecturers JOIN contact ON lecturers.lecturer_uuid =contact.contact_uuid WHERE lecturer_uuid = ?";
  const getLecturer_tags = "SELECT * FROM lecturer_tags WHERE lecturer_tags.lecturer_uuid= ?";
  const getTags =  "SELECT * FROM tags";
  db.all(getLecturer,uuidParam.uuid, (err, rows) => {
    if(err){
      console.log("neni")
      res.status(404).send('User not found');
      return;
    }

    if(rows.length>0){
     
      db.all(getLecturer_tags,rows[0].lecturer_uuid,(err, rows2) =>{
        db.all(getTags,(err,rows3)=>{
          filterTags=[]
          for(let i =0; i<rows2.length; i++){
            filtrovanaPole = rows3.filter(function(value) {
              if (value.tag_uuid === rows2[i].tag_uuid) {
                return true;
              } else {
                return false;
              }
            }).map(function(value) {
              filterTags.push({uuid: value.tag_uuid, name: value.tag });
              // return { lecturer_uuid:value.lecturer_uuid, uuid: value.tag_uuid, name: value.tag };
            });
          }
          let telNumbers = rows[0].phone_number.split(",")
          let Emils = rows[0].email.split(",")
          LecturerFull.push(
            {
              uuid:rows[0].lecturer_uuid,
              title_before:rows[0].title_before,
              first_name:rows[0].first_name,
              middle_name:rows[0].middle_name,
              last_name:rows[0].last_name,
              title_after:rows[0].title_after,
              picture_url:rows[0].picture_url,
              location:rows[0].location,
              claim:rows[0].claim,
              bio:rows[0].bio,
              tags:filterTags,
              price_per_hour:rows[0].price_per_hour,
              contact:{
                telephone_numbers:telNumbers,
                emails:Emils
              }
            }
          )
          console.log(filterTags)
          function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
          }
            const l = LecturerFull[0].tags.length-1
          res.render('lecturer', { 
            title_before: LecturerFull[0].title_before,
            title:"lecturer"
            ,title_before: LecturerFull[0].title_before
            ,first_name: LecturerFull[0].first_name
            ,middle_name: LecturerFull[0].middle_name
            ,last_name: LecturerFull[0].last_name
            ,title_after: LecturerFull[0].title_after
            ,picture_url:LecturerFull[0].picture_url
            ,location:LecturerFull[0].location
            ,price_per_hour:LecturerFull[0].price_per_hour
            ,claim:LecturerFull[0].claim
            ,bio:LecturerFull[0].bio
            ,telephone_numbers:telNumbers
            ,emails:Emils
            ,tag1 : LecturerFull[0].tags[getRandomInt(0, l)].name
            ,tag2 : LecturerFull[0].tags[getRandomInt(0, l)].name
            ,tag3 : LecturerFull[0].tags[getRandomInt(0, l)].name
            ,tag4 : LecturerFull[0].tags[getRandomInt(0, l)].name
            ,tag5 : LecturerFull[0].tags[getRandomInt(0, l)].name
            ,tag6 : LecturerFull[0].tags[getRandomInt(0, l)].name
            ,tag7 : LecturerFull[0].tags[getRandomInt(0, l)].name
            ,tag8 : LecturerFull[0].tags[getRandomInt(0, l)].name
            ,time: time
            ,tags:filterTags
           });
          // res.status(200).send(LecturerFull[0])
        })
      })
    
    }
    else{
      res.render('error')
      // res.status(404).send(
      // {
      //   "code": 454,
      //   "message": "User not found"
      // }
      // );
      return;
    }
  })
});
})
router.put('/lecturers/:uuid', (req, res) => {

  const LecturerDataUpdate = 'UPDATE lecturers SET first_name = ?, last_name = ?, middle_name = ?, title_after = ?, picture_url = ?, location = ?, claim = ?, bio = ?, price_per_hour = ?,title_before=? WHERE lecturer_uuid = ?';
  
  const getSql = `SELECT * FROM tags WHERE tag = ?`;

  const ContactDataUpdate= 'UPDATE contact SET phone_number = ?, email = ? WHERE contact_uuid = ?';
  const TagsDataUpdate ='SELECT tags.*, lecturer_tags.* FROM tags, lecturer_tags WHERE tags.tag_uuid = lecturer_tags.tag_uuid;';
  const uuidParam = req.params.uuid;
  const updateData = req.body;

  const UpdateUser = 'UPDATE users SET name = ?, password = ? WHERE lecturer_uuid = ?';
  const UpdateUserData= async()=>{
    const Salt = await bcrypt.genSalt()
    const Password = await bcrypt.hash(updateData.password, Salt)
    db.all(UpdateUser, [updateData.username, Password, uuidParam],(err)=>{
      if(err){
        res.status(404).send('User not found');
        return
      }
      else
      return
    })
  }
  UpdateUserData()


  const deleteQuery = 'DELETE FROM lecturer_tags WHERE lecturer_uuid = ?';
  const insertSql = `INSERT INTO lecturer_tags (lecturer_uuid, tag_uuid) VALUES (?, ?)`;
  const insertSqlTag = `INSERT INTO tags (tag_uuid, tag) VALUES (?, ?)`;
  console.log(uuidParam)

  db.all('SELECT * FROM lecturers WHERE lecturer_uuid = ?;',uuidParam,(err,rows)=>{
    if(err){
      return
    }
    console.log(rows)

    if(rows.length>0){
        if(rows[0].bio !==updateData.bio){
          console.log(rows[0].bio)
          updateData.bio= rows[0].bio
        }

  db.all(deleteQuery,[uuidParam],(err)=>{
  })
  
  for(let i =0; i <updateData.tags.length; i++){

    db.all(getSql,updateData.tags[i].name,(err,rows)=>{
      console.log(updateData.tags)
      if(err){
        console.error(err)
      }

      if(rows.length>0){
        console.log("zaznam existuje")
        db.all(insertSql,uuidParam, rows[0].tag_uuid,()=>{
        })
      }
      else{
        tag_uuid =uuidv4()
        db.all(insertSqlTag,tag_uuid, updateData.tags[i].name,()=>{
        })
        db.all(insertSql,uuidParam, tag_uuid,()=>{
        })
        console.log("zaznam neexistuje")
      }


      db.run(LecturerDataUpdate, [
        updateData.first_name,
        updateData.last_name,
        updateData.middle_name,
        updateData.title_after,
        updateData.picture_url,
        updateData.location,
        updateData.claim,
        updateData.bio,
        updateData.price_per_hour,
        updateData.title_before,
        uuidParam
      ], (err) => {
        if (err) {
          res.status(404).send('User not found');
          console.error(err);
          return;
        }
        db.all(ContactDataUpdate, [
          updateData.contact.telephone_numbers,
          updateData.contact.emails,
          uuidParam
        ], (err) => {
          if (err) {
            res.status(404).send('User not found');
            console.error(err);
            return;
          }
          if(i==updateData.tags.length-1){
          db.all(TagsDataUpdate,(err,rows)=>{
            if (err) {
              res.status(404).send('User not found');
              console.error(err);
              return;
            }
            let tagsArray =[]
            if(rows.length>0){
            for(let i =0; i< rows.length; i++){

              if(rows[i].lecturer_uuid === uuidParam){
                tagsArray.push(
                  {
                    uuid:rows[i].tag_uuid,
                    name:rows[i].tag
                  }
                )
              }
            }
            console.log(tagsArray)
            let Lecturer = {
              uuid:uuidParam,
              username:updateData.username,
              password:updateData.password,
              title_before:updateData.title_before,
              first_name:updateData.first_name,
              middle_name:updateData.middle_name,
              last_name:updateData.last_name,
              title_after:updateData.title_after,
              picture_url:updateData.picture_url,
              location:updateData.location,
              claim:updateData.claim,
              bio:updateData.bio,
              tags:tagsArray,
              price_per_hour:updateData.price_per_hour,
              contact:{
                telephone_numbers:updateData.contact.telephone_numbers,
                emails:updateData.contact.emails
              }
            }          
            console.log(Lecturer.uuid)
            console.log(uuidParam)

              res.status(200).send(Lecturer);
            }

          })
}

        });

      });


    })
    
  }




}
else{
  res.status(404).send({
    "code": 404,
    "message": "User not found"
  });
  return;
}
})
});
/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'ExpressTEST2' });
// });


// {
//   id_user: 9,
//   name: 'tom',
//   password: '$2b$10$jmve4FsskCEiOH2Nd.5twe/mhL0is37j5KvU3TcuVZ/U.KhSfsEWK',
//   lecturer_uuid: '0319be7b-6a7e-41ca-b8a1-c2b47bd3bd37'
// }
router.get('/user',checkAuthenticated, (req, res)=>{
  function getDaysInMonth(month, year) {
    const days = new Date(year, month, 0).getDate();
    const result = [];
    for (let day = 1; day <= days; day++) {
        result.push(day);
    }
    return result;
}
  const sql = `DELETE FROM reservation WHERE reservation_uuid = ?`;
  db.all(sql,[req.query.reservation_uuid],(err)=>{
    if(err)
    {
      return console.error(err.message)
    }

  })


  const reservation = `SELECT * FROM reservation WHERE lecturer_uuid = ?`;
  db.all(reservation,[req.user.lecturer_uuid],(err, rows)=>{
    if(err){
      return console.error(err)
    }
    const nazvyMesicu = [
      "leden", "únor", "březen", "duben", "květen", "červen", 
      "červenec", "srpen", "září", "říjen", "listopad", "prosinec"
  ];
  date=[]
  for (let i = 1; i < 3; i++) {
    
    const today = new Date();
    const month = today.getMonth() + i; // Měsíce jsou indexované od 0, takže přidáme 1
    const year = today.getFullYear();
    const days = getDaysInMonth(month, year);
    const response = {
        mouth: month,
        mouth_name:nazvyMesicu[month],
        year: year,
        days:days
    };
    date.push(response)
  }
  date.map(m => {
    // Inicializace m.days[index] mimo vnitřní map()
    const updatedDays = m.days.map(d => ({
        number: d,
        date_format: `${m.year}-${m.mouth.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`,
        hours: [
            { hour: 8, event: "" }, { hour: 9, event: "" }, { hour: 10, event: "" },
            { hour: 11, event: "" }, { hour: 12, event: "" }, { hour: 13, event: "" },
            { hour: 14, event: "" }, { hour: 15, event: "" }, { hour: 16, event: "" },
            { hour: 17, event: "" }, { hour: 18, event: "" }, { hour: 19, event: "" }
        ]
    }));

    updatedDays.forEach((day, index) => {
        rows.forEach(r => {
            if (r.hours.includes(",")) {
                r.hours = r.hours.split(",");
            }
            r.hours.forEach(hour => {
                day.hours.forEach((h, indexH) => {
                    if (day.date_format === r.date && hour.toString() === h.hour.toString()) {
                        day.hours[indexH].event = `Máš schůzku s: ${r.first_name} ${r.last_name}, ${r.meeting}`;
                        console.log(day.hours[indexH].event);
                        h.event = `Máš schůzku s: ${r.first_name} ${r.last_name}, ${r.meeting}`;
                    }
                });
            });
        });
    });

    // Přepsání původních hodnot v m.days
    m.days = updatedDays;
});

    

    console.log(date[0].days[0])
    res.render('user.pug',{reservation: rows,calander: date})
})
})
router.get('/user/download/calendar',checkAuthenticated, (req, res)=>{
  const reservation = `SELECT * FROM reservation WHERE lecturer_uuid = ?`;
  db.all(reservation,[req.user.lecturer_uuid],(err, rows)=>{
    if(err){
      return console.error(err)
    }
    const formatData =[]

    rows.map(student => {

    try {
      
    } catch (error) {
      
    }
      student.hours = student.hours.split(",");
      student.hours.map(hour => {
        const studentData = {
          description: student.description,
          summary: "Rezervace s " + student.first_name + " " + student.last_name,
          location: "Místo konání: " + student.meeting
        };
        if (hour.length < 2) {
          studentData.start = `${student.date}T0${hour}:00:00`;
          if (parseInt(hour) + 1 < 10) {
            studentData.end = `${student.date}T0${parseInt(hour) + 1}:00:00`;
          } else {
            studentData.end = `${student.date}T${parseInt(hour) + 1}:00:00`;
          }
        } else {
          studentData.start = `${student.date}T${hour}:00:00`;
          studentData.end = `${student.date}T${parseInt(hour) + 1}:00:00`;
        }
        
        formatData.push(studentData); // Přidat studentData do pole formatData
      });
    });
    console.log(formatData)
    const iCalData = createICalFile(formatData);
    const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;
    const fileName = formattedDate+'-plan_vyuky'+'.ics';
    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(iCalData);
})
})
router.get('/login',checkNotAuthenticated, (req, res)=>{
  GetUser()
  res.render('login.pug')
})
router.post('/login',checkNotAuthenticated, passport.authenticate('local',{
  successRedirect: '/user',
  failureRedirect:'/login',
  failureFlash:true
}))
router.delete('/logout', (req, res, next) => {
  req.logOut(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
})

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

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/user')
  }
  next()
}
module.exports = router;
