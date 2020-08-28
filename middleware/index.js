var jwt = require('jsonwebtoken');

const checkToken=(req,res,next)=>{
    let token= req.headers.authorization;
    token = token.split('Bearer ')[1];
    let data= verifytoken(token);
    if(data.username){
        next()
    }
    else{
        return res.json({
            data:null,
            error: "Invalid token"
        })
    }
}
const secretToken= 'TheSecretUserToken';
const verifytoken = (token)=>{
    let data= jwt.verify(token,secretToken);
    return data.username ? data: new Error('invalid token');
}

module.exports = checkToken;
