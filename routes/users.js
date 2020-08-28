var express = require('express');
var router = express.Router();
const fs = require("fs"); 
const checkToken= require('./../middleware/index');
/* GET courses*/

router.get('/api/courses',checkToken,(req, res)=> {
 var infoData=[]
  let coursesData = JSON.parse(fs.readFileSync("routes/api/courses.json"));
    for(let i=0; i<coursesData.data.length;i++){
      infoData.push({
        "id":coursesData.data[i].id, 
        "name":coursesData.data[i].name
      }
      )
    }
  res.json({ data: infoData, error: null });
});
//-----------------------------------------get course by id
router.get('/api/courses/:id',checkToken,(req, res)=> {
  let cid= req.params.id;
  let coursesData = JSON.parse(fs.readFileSync("routes/api/courses.json"));
  let coursedis= coursesData.data.find((coursedis)=>{
    return coursedis.id == parseInt(cid);
  })
  if(!coursedis){
    return res.json({
      "msg": "ID not found"
    })
  }

  return res.json({
    "data": coursedis,
    "msg": "success" 
  })
})


//-add a course--
router.post('/api/courses',checkToken,(req,res)=> {
 

fs.readFile("routes/api/courses.json", (err,data)=>{
  
const users = JSON.parse(data);
console.log(users);


  let name=req.body.name;
  let description=req.body.description;
  let enrolledStudents=req.body.enrolledStudents;
  let availaibleSlots=req.body.availaibleSlots;
  if(parseInt(availaibleSlots)<0)
      {
        return res.json({
          "Error":"Assign valid slots"
        })
      }
      let Addedname= users.data.find((Addedname)=>{
        return Addedname.name===name
      })
    if(Addedname)
    {
      return res.json({
        "Error":"Course already added"
      })
    }
 
      users.data.push({
      id:(users.data.length>=0)?users.data.length+1:1,
      name:name,
      description,description,
      enrolledStudents:enrolledStudents,
      availaibleSlots:availaibleSlots
      });
 console.log(users);
    fs.writeFile("routes/api/courses.json", JSON.stringify(users,null,2) ,() => { 
      return res.json({
        msg: "Done writing"
      });
   // Success 
  }); 
  
  });

});

/*------------get STUDENTS-----*/

router.get('/api/students',checkToken,(req, res)=> {
 
  let StudentData = JSON.parse(fs.readFileSync("routes/api/students.json"));
  res.json({ data: StudentData.data, error: null });
});
/*-----add a student---*/
router.post('/api/students',checkToken,(req,res)=>{
  fs.readFile('routes/api/students.json',(error,info)=>{
     
      const stuset= JSON.parse(info);
      let name= req.body.name;
      let Addedname= stuset.data.find((Addedname)=>{
        return Addedname.name===name
      })
    if(Addedname)
    {
      return res.json({
        "error":"Student already added"
      })
    }
      stuset.data.push({
        Studentid: (stuset.data.length>=0)?stuset.data.length+1:1,
        name:name 
      });
      fs.writeFile('routes/api/students.json',JSON.stringify(stuset,null,2),(error)=>{
        if(error) throw err;
        return res.json({
          "success":"true"
        })
      })

  })
})
/*----enroll student---*/
router.post('/api/courses/:id/enroll',checkToken,(req,res)=>{
  
  let courseInfo = JSON.parse(fs.readFileSync("routes/api/courses.json"));
    let students = JSON.parse(fs.readFileSync("routes/api/students.json"));
   // console.log(students);
    let courseid= req.params.id;
    let studentid= req.body;
   // console.log(studentid);
   const idFound= courseInfo.data.find( (idFound) =>{
     return idFound.id === parseInt(courseid)
   })
  // console.log(idFound);
   const studFound= students.data.find( (studFound) =>{
    return studFound.Studentid === parseInt(studentid.Studentid)
  })
  //console.log(studFound);
  if(!idFound){
    return res.json({
      "msg":"course not found",
    });
  }
    if(!studFound){
      console.log("nope");
    return res.json({
      "msg":"Student id not found"
    })};

   //check slots
   if(idFound.availaibleSlots<1){
     return res.json({
       "msg": "No slots",
     })
   }
   //---duplicacy check
   let Duplicateid= idFound.enrolledStudents.find((Duplicateid)=>{
    return Duplicateid.id===studFound.Studentid
  })
if(Duplicateid)
{ return res.json({
      "msg": "Duplicate id",
    })
  }
  /*----Enroll Student and Decrease slots----*/
  courseInfo.data[courseid-1].enrolledStudents.push({
    Studentid: studFound.Studentid,
    name: studFound.name
  });
  courseInfo.data[courseid-1].availaibleSlots -=1;
 // console.log(c/*----DUPLICATE ID CHECK----ourseInfo.data[courseid-1].availaibleSlots)
  //console.log(courseInfo.data[courseid-1].enrolledStudents);
  fs.writeFile("routes/api/courses.json", JSON.stringify(courseInfo,null,2), "utf8", () => {
    res.json({ success: true });
  });
});

// Deregister a student
router.put('/api/courses/:id/deregister',checkToken,(req,res)=>{
  let courseInfo = JSON.parse(fs.readFileSync("routes/api/courses.json"));
  let students = JSON.parse(fs.readFileSync("routes/api/students.json"));
  let courseid= req.params.id;
  let studentid= req.body;
  const idFound= courseInfo.data.find( (idFound) =>{
    return idFound.id === parseInt(courseid)
  })
  console.log(idFound);
  const studFound= students.data.find( (studFound) =>{
   return studFound.Studentid === parseInt(studentid.Studentid)
  })
   console.log(studFound);
   if(!idFound){
     return res.json({
       "msg":"course not found",
     });
   }
     if(!studFound){
       console.log("nope");
     return res.json({
       "msg":"Student id not found"
     })};
     if(idFound.enrolledStudents.length<1){
      return res.json({
        "msg": "No students enrolled in the course",
      })
    }
    delete courseInfo.data[courseid-1].enrolledStudents.splice(studFound.Studentid-1,1); 
    courseInfo.data[courseid-1].availaibleSlots +=1;
    console.log(courseInfo.data[courseid-1].availaibleSlots)
    fs.writeFile("routes/api/courses.json", JSON.stringify(courseInfo,null,2), "utf8", () => {
      res.json({ success: true });
    });
 })



module.exports = router;