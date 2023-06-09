const router=require('express').Router()
const { response } = require('express')
const Category = require('../models/category')
const product = require('../models/product')
const Product=require('../models/product')
const mongoose=require('mongoose')
const multer=require('multer')

const FILE_TYPE_MAP={
    'image/png':'png',
    'image/jpeg':'jpeg',
    'image/jpg':'jpg'
}
//specifying the destination folder and name of images
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        const isValid=FILE_TYPE_MAP[file.mimetype]
        let uploadError=new Error('invalid image type')
        if(isValid){
            uploadError=null
        }
        cb(uploadError,'public/uploads')
    },
    filename: function(req,file,cb){
        //all the spaces in filename will be replaced by -
        const fileName=file.originalname.split(' ').join('-')
        const extension=FILE_TYPE_MAP[file.mimetype]
        //and a date and time will be added at last of filename
        cb(null,`${fileName}-${Date.now()}.${extension}`)
    }
})
const uploadOptions=multer({storage:storage})
//5000/api/product
router.post('/',uploadOptions.single('image'),(req,res)=>{
    if(!mongoose.isValidObjectId(req.body.category)){
        return res.status(400).send('invalid category id')
    }
    Category.findById(req.body.category).then(category=>{
        if(!category){
            return res.status(400).send('invalid category')
        }
    })
    const file=req.file
    if(!file){
        return res.status(400).send('no image')
    }
    const fileName=req.file.filename
    //http://localhost:3000/public/uploads/image-2113.jpeg
    const basePath=`${req.protocol}://${req.get('host')}/public/uploads/`
    const product= new Product({
        
        name:req.body.name,
        description:req.body.description,
        richDescription:req.body.richDescription,
        image:`${basePath}${fileName}`,
        brand:req.body.brand,
        price:req.body.price,
        category:req.body.category,
        countinstock:req.body.countinstock,
        rating:req.body.rating,
        numReviews:req.body.numReviews,
        isFeatured:req.body.isFeatured
    })
    product.save().then((createdProduct=>{
        res.status(201).json(createdProduct)
    })).catch(err=>{
        res.status(500).json({
            error:err,
            success:false
        })
    })
})
//select is used when we want to send only specific details about the product
//this will send name image and will exclude id
router.get('/',(req,res)=>{
    //localhost:3000/api/v1/products?categories=21,22
    let filter={};
    if(req.query.categories){
        filter={category:req.query.categories.split(',')}
    }
    Product.find(filter).populate('category').select('name image -_id').then(products=>{
        res.status(200).json(products)
    }).catch(err=>{
        res.status(500).json({
            error:err
        })
    })
})
//populate is used for joining document
router.get('/:id',(req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('invalid product id')
    }
    Product.findById(req.params.id).populate('category').then(product=>{
        if(product){
            return res.status(200).send(product)
        } else{
            return res.status(404).json({
                success:false,
                message:"product not found"

            })
        }
    }).catch(err=>{
        res.status(500).json({
         error:err,
         success:false
        }) 
     })
})

router.put('/:id',async(req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('invalid product id')
    }
    if(!mongoose.isValidObjectId(req.body.category)){
        return res.status(400).send('invalid category id')
    }
    const category=await Category.findById(req.body.category)
    if(!category){
        return res.status(400).send('invalid category')
    }
    Product.findByIdAndUpdate(req.params.id,{
        name:req.body.name,
        description:req.body.description,
        richDescription:req.body.richDescription,
        image:req.body.image,
        brand:req.body.brand,
        price:req.body.price,
        category:req.body.category,
        countinstock:req.body.countinstock,
        rating:req.body.rating,
        numReviews:req.body.numReviews,
        isFeatured:req.body.isFeatured
    },{new:true}).then(product=>{
        if(product){
            res.status(201).json(product)
        }
        else{
            res.status(400).json({
                success:false,
                message:"product not updated"

            })
        }
    }).catch(err=>{
        res.status(500).json({
            error:err,
            success:false
        })
    })
})
router.delete('/:id',(req,res)=>{
    Product.findByIdAndRemove(req.params.id).then(product=>{
        if(product){
            return res.status(200).json({
                success:true,
                message:"product deleted"
            })
        } else{
            return res.status(404).json({
                success:false,
                message:"product not found"

            })
        }
    }).catch(err=>{
       res.status(400).json({
        error:err,
        success:false
       }) 
    })
})
router.get('/get/count',(req,res)=>{
    Product.countDocuments({}).then(productcount=>{
        if(!productcount){
            return res.status(400).json({
                success:false
            })
        }
        else{
            return  res.send({productcount:productcount})
        }
    }).catch(err=>{
        res.status(400).json({
         error:err,
         success:false
        }) 
     })
   
   
})
//get products which are featured
router.get('/get/featured',(req,res)=>{
    Product.find({isFeatured:true}).then(products=>{
        if(products){
            res.send(products)
        }
        else{
            return res.status(400).json({
                success:false
            })
        }
    }).catch(err=>{
        res.status(400).json({
         error:err,
         success:false
        }) 
     })
})
//get limited featured products
router.get('/get/featured/:count',(req,res)=>{
    const count= req.params.count?req.params.count:0
    //+to convert it into number
    Product.find({isFeatured:true}).limit(+count).then(products=>{
        if(products){
            res.send(products)
        }
        else{
            return res.status(400).json({
                success:false
            })
        }
    }).catch(err=>{
        res.status(400).json({
         error:err,
         success:false
        }) 
     })
})
router.put(
    '/gallery-images/:id', 
    uploadOptions.array('images', 10), 
    async (req, res)=> {
        if(!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid Product Id')
         }
         const files = req.files
         let imagesPaths = [];
         const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

         if(files) {
            files.map(file =>{
                imagesPaths.push(`${basePath}${file.filename}`);
            })
         }

         const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                images: imagesPaths
            },
            { new: true}
        )

        if(!product)
            return res.status(500).send('the gallery cannot be updated!')

        res.send(product);
    }
)

module.exports=router