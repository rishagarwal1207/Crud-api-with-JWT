var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken'); 
const bcrypt = require('bcrypt');
const {to}= require('await-to-js');
const fs=require('fs');


router.post('/api/signup',async(req,res)=> {
  const {username,email,password,role}=req.body;
  let user = JSON.parse(fs.readFileSync('routes/api/auth.json'));
  let encryptedpassword=await to(passwordHash(password));
  //console.log(encryptedpassword);
  user.data.push({username:username,
                email:email,
                encryptedpassword:encryptedpassword,
                role:role});
    fs.writeFile('routes/api/auth.json',JSON.stringify(user,null,2), () => {})
  return res.json(
    {
        isSignUp: "successful",
        user: user  
    }); 
});

router.post('/api/login',async(req,res)=>{
    const secretToken= 'TheSecretUserToken';
    const {username,password}=req.body;
    let user = JSON.parse(fs.readFileSync('routes/api/auth.json'));
    const userName = user.data.find((userName)=>{
        return userName.username== username;
    })
  //  console.log(userName);
if(userName){
   const [err,result]=await to( bcrypt.compare(password, userName.encryptedpassword[1]));
   console.log(result);
        if(result){
            const accessToken = jwt.sign({ username:username,password:password}, secretToken); 
            
        return res.json({
                data: {
                 "username":username,
                 "password":password,
                 "accessToken":accessToken
                },
             err: null});  
        }
        else{
            console.log('Invalid');
                res.json({
                    data: null,
                    message: err,
                    
                })
            }  
        } 
        else{
            res.json({
                data: null,
                message: "Invalid username",
                
            })
        }
});



const passwordHash= async(password)=>{
    const saltRounds = 10;
 const [err,passwordHash] =await to(bcrypt.hash(password, saltRounds));
 if(err){
     logger.error("Password cannot be encrypted",{err:error});
 }
 return passwordHash;
};
module.exports = router;
