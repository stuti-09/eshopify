const express=require("express");
const app=express();
const mongoose=require('mongoose');
const userroute=require('./routes/user')
const categoriesroutes=require('./routes/categories')
const ordersroute=require('./routes/orders')
const productroute=require('./routes/product')
const bodyParser=require('body-parser')
const authJwt = require('./helpers/jwt');

//alows frontend to request api from backend
const cors=require('cors')
app.use(cors())
app.options('*',cors())

//log http requests like get,post,put,delete
const morgan=require('morgan')

//including env
const dotenv=require("dotenv");
dotenv.config()
//middleware
//for accepting json data
app.use(express.json())
app.use(bodyParser.json())
app.use(morgan('tiny'))
app.use(authJwt())
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods","GET, POST, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    
    
    next();
  });
app.use('/public/uploads',express.static(__dirname+'/public/uploads'))


//routes
app.use('/api/user',userroute)
app.use('/api/product',productroute)
app.use('/api/order',ordersroute)
app.use('/api/categories',categoriesroutes)


mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser:true,
    useUnifiedTopology:true
    
})
.then(()=>console.log("db connected")).catch((err)=>{
    console.log(err)
})

app.listen(process.env.PORT||5000,()=>{
    console.log("backend server is running")
});