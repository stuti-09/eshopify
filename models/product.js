const mongoose=require('mongoose')


const productSchema=new mongoose.Schema({
name:{
    type:String,
    required:true
},
description:{
    type:String,
    required:true
},
richDescription:{
    type:String,
    default:''
},
image:{
    type:String,
    
   
},
//[]is used becoz it's a array
images:[{
    type:String
}],
brand:{
    type:String,
    default:''
},
price:{
    type:Number,
    default:0
},
//connect the category schema
category:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'category',
    required:true
},
countinstock:{
    type:Number,
    required:true,
    min:0,
    max:255
},
rating:{
    type:Number,
    default:0
},
numReviews:{
    type:Number,
    default:0
},
isFeatured:{
    type:Boolean,
    default:false
},
dateCreated:{
    type:Date,
    default:Date.now
}

})
//for changing _id to id
/*productSchema.virtual('id').get(function(){
    return this._id.toHexString();
})
productSchema.set('toJSON',{
    virtuals:true,
});*/
module.exports=mongoose.model('product',productSchema)