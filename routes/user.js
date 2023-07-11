const router=require('express').Router()
const User = require('../models/user')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
//5000/api/user
//get-give
router.get('/',(req,res)=>{
    User.find().select('-passwordHash').then(users=>{
        res.status(200).json(users)
    }).catch(err=>{
        res.status(500).json({
            error:err,
            success:false
        })
    })
})
router.get('/:id',(req,res)=>{
    User.findById(req.params.id).populate('favourites').select('-passwordHash').then(user=>{
        res.status(200).json(user)
    }).catch(err=>{
        res.status(500).json({
            error:err,
            success:false
        })
    })
})
//post-take
//signup
router.post('/',(req,res)=>{
    const user=new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password,10),
    street: req.body.street,
    apartment: req.body.apartment,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    isAdmin: req.body.isAdmin
    })
    user.save().then(createduser=>{
        res.status(201).json(createduser)
    }).catch(err=>{
        res.status(500).json({
            error:err,
            success:false
        })
    })
})
//login
router.post('/login',(req,res)=>{
    const secret=process.env.secret
    User.findOne({email:req.body.email}).then(user=>{
        if(!user){
            return res.status(400).send('User not found')
        }
        if(user&&bcrypt.compareSync(req.body.password,user.passwordHash)){
            const token=jwt.sign({
                userId:user.id,
                isAdmin:user.isAdmin
            },
            secret,
            {expiresIn:'1d'}
            )
            return res.status(200).json({
                user:user.email,
                token:token,
                message:'user authenticated'
            })
        }
        else{
            res.status(400).send('password is wrong')
        }
    }).catch(err=>{
        res.status(500).json({
            error:err
        })
    })
})
router.post('/showfav',(req,res)=>{
    //console.log(req.headers)
    const bearerheader=req.headers['authorization']
    if(typeof bearerheader!=='undefined'){
        const bearer=bearerheader.split(" ")
        const token=bearer[1]
        req.token=token
    }
    let decodedtoken;
    try{
        decodedtoken=jwt.verify(req.token, process.env.secret);
    }catch (err) {
        err.statusCode = 500;
        throw err;
      }
      if (!decodedtoken) {
        const error = new Error('Not authenticated.');
        error.statusCode = 401;
        throw error;
      }
      req.userId=decodedtoken.userId;
    const userId=req.userId
    
    User.findById(userId)
          .populate('favourites')
          .exec()
          .then(user => {
            if(!user)
            {
              return res.status(400).json({Error:'User not found'}); 
            }
            //const prod = user.favourites;
            res.status(200).json(user.favourites);
          })
        .catch(err=>{
          // console.log("error in displaying favourites", err);
          res.status(400).json({Error: 'Error in displaying favourites'});
        })
})

module.exports=router
