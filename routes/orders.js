const router=require('express').Router()
const OrderItem=require('../models/order-item')
const Order= require('../models/order')
const Product=require('../models/product')


router.get('/',(req,res)=>{
    //populate is used here so that we can get all the user details in order
    //sort the documnet on the basis of dateordered in descending order(-1), 1 is for ascending order
    //while populating orderitem we want to populate product also so we have done like this
    Order.find()
    .populate('user','name')
    .populate({path:'orderItems',populate:{path:'product',populate:'category'}})
    .sort({'dateOrdered':-1}).then(orders=>{
        res.status(200).send(orders)
    }).catch(err=>{
        res.status(500).json({
            error:err,
            success:false
        })
    })
})
router.get('/:id',async(req,res)=>{
    Order.findById(req.params.id)
    .populate('user', 'name')
    .populate({ 
        path: 'orderItems', populate: {
            path : 'product', populate: 'category'} 
        }).then(order=>{
            res.status(200).send(order)
        }).catch(err=>{
            res.status(500).json({
                error:err,
                success:false
            })
        })

})
router.post('/', async (req,res)=>{
    const orderItemsIds = Promise.all(req.body.orderItems.map(async (orderItem) =>{
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })

        newOrderItem = await newOrderItem.save();

        return newOrderItem._id;
    }))
    const orderItemsIdsResolved =  await orderItemsIds;

    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId)=>{
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice
    }))

    const totalPrice = totalPrices.reduce((a,b) => a +b , 0);

    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
    })
    order = await order.save();

    if(!order)
    return res.status(400).send('the order cannot be created!')

    res.send(order);
})
router.put('/:id',(req,res)=>{
    Order.findByIdAndUpdate(req.params.id,{
        status:req.body.status
    },{new:true}).then(order=>{
        if(order){
            res.status(201).json(order)
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
    Order.findByIdAndRemove(req.params.id).then(async order=>{
        if(order){
           await order.orderItems.map(async orderitem=>{
               await OrderItem.findByIdAndRemove(orderitem)
            })
            return res.status(200).json({
                success:true,
                message:"order deleted"
            })
        } else{
            return res.status(404).json({
                success:false,
                message:"order not found"

            })
        }
    }).catch(err=>{
       res.status(400).json({
        error:err,
        success:false
       }) 
    })
})

router.get('/get/totalsales',(req,res)=>{
    Order.aggregate([{
        $group:{
            _id:null,
                totalsales:{$sum:'$totalPrice'}
            
        }
    }]).then(totalsales=>{
        res.send({totalsales:totalsales.pop().totalsales})
    })
    .catch(err=>{
        res.status(400).json({
         error:err,
         success:false
        }) 
     })
   
   
})

router.get('/get/userorders/:userid',(req,res)=>{
    Order.find({user:req.params.userid}).populate({
        path:'orderItems',populate:{
            path:'product',populate:'category'
        }
    }).then(orders=>{
        res.status(200).send(orders)
    }).catch(err=>{
        res.status(400).json({
         error:err,
         success:false
        }) 
     })
})
module.exports=router