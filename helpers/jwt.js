const  expressjwt=require('express-jwt')
const jwt=require('jsonwebtoken')
function authJwt(req,res){
    const secret=process.env.secret; 
    return expressjwt({
        secret,
        algorithms:['HS256'],
        isRevoked:isRevoked
    }).unless({
        path:[
            {url:/\/api\/product(.*)/,methods:['GET','OPTIONS']},
            {url:/\/api\/categories(.*)/,methods:['GET','OPTIONS']},
            {url:/\/public\/uploads(.*)/,methods:['GET','OPTIONS']},
            
            '/api/user',
            '/api/user/login'
        ]
    })
}
//isrevoked tell us that user is admin or not. payload contains the data of token
//isrevoked will revoke the token if it is not admin
async function isRevoked(req,payload,done){
    if(!payload.isAdmin){
        done(null,true)
    }
    done()
}
module.exports=authJwt;