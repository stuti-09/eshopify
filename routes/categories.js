const router=require('express').Router()

const Category = require('../models/category')

//get all categories
router.get('/',(req,res)=>{
    Category.find().then(categories=>{
        res.status(200).json(categories)
    }).catch(err=>{
        res.status(500).json({
            error:err
        })
    })
})
//get category by id
router.get('/:id',(req,res)=>{
    Category.findById(req.params.id).then(category=>{
        if(category){
            return res.status(200).send(category)
        } else{
            return res.status(404).json({
                success:false,
                message:"category not found"

            })
        }
    }).catch((err=>{
        res.status(400).json({
         error:err,
         success:false
        }) 
     }))
})
//post-take
router.post('/',(req,res)=>{
    let category=new Category({
        name:req.body.name,
        icon:req.body.icon,
        color:req.body.color
    })
    category.save().then((createdCategory=>{
        res.status(201).json(createdCategory)
    })).catch((err=>{
        res.status(500).json({
            error:err,
            success:false
        })
    }))
})
router.put('/:id',(req,res)=>{
    Category.findByIdAndUpdate(req.params.id,{
        name:req.body.name,
        icon:req.body.icon,
        color:req.body.color
    },{new:true}).then(category=>{
        if(category){
            res.send(category)
        }
        else{
            res.status(400).json({
                success:false,
                message:"category not updated"

            })
        }
    }).catch((err=>{
        res.status(500).json({
            error:err,
            success:false
        })
    }))
})
router.delete('/:id',(req,res)=>{
    Category.findByIdAndRemove(req.params.id).then(category=>{
        if(category){
            return res.status(200).json({
                success:true,
                message:"category deleted"
            })
        } else{
            return res.status(404).json({
                success:false,
                message:"category not found"

            })
        }
    }).catch(err=>{
       res.status(400).json({
        error:err,
        success:false
       }) 
    })
})
module.exports=router