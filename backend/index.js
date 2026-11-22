require("dotenv").config();

const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const { isPasswordHash, verifyPassword } = require("./adminPassword");
const { type } = require("os");
const { log } = require("console");

const mongoUri = process.env.MONGODB_URI;
const userJwtSecret = process.env.JWT_SECRET;
const adminCookieName = "shopnimar_admin";
const adminOrigin = process.env.ADMIN_ORIGIN || "http://localhost:5173";
const allowedOrigins = new Set([
    "http://localhost:3000",
    adminOrigin,
    ...(process.env.ALLOWED_ORIGINS || "").split(",").map((origin) => origin.trim()),
].filter(Boolean));

if (!mongoUri || !userJwtSecret || userJwtSecret.length < 32) {
    throw new Error("MONGODB_URI and JWT_SECRET must be set in backend/.env");
}

app.use(express.json());
app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
}));
app.use(cookieParser());

// Database Connection With MongoDB
mongoose.connect(mongoUri);

function isAdminAuthConfigured() {
    return Boolean(
        process.env.ADMIN_EMAIL &&
        process.env.ADMIN_EMAIL.trim() &&
        isPasswordHash(process.env.ADMIN_PASSWORD_HASH) &&
        process.env.ADMIN_JWT_SECRET &&
        process.env.ADMIN_JWT_SECRET.trim().length >= 32
    );
}

function requireAdminOrigin(req, res, next) {
    if (req.get("origin") !== adminOrigin) {
        return res.status(403).json({ success: false, error: "Request origin is not allowed." });
    }
    return next();
}

function requireAdmin(req, res, next) {
    if (!isAdminAuthConfigured()) {
        return res.status(503).json({ success: false, error: "Admin authentication is not configured." });
    }

    const token = req.cookies[adminCookieName];
    if (!token) {
        return res.status(401).json({ success: false, error: "Admin authentication is required." });
    }

    try {
        const payload = jwt.verify(token, process.env.ADMIN_JWT_SECRET, {
            audience: "shopnimar-admin",
            issuer: "shopnimar-api",
        });
        if (payload.sub !== "admin") {
            return res.status(401).json({ success: false, error: "Admin authentication is required." });
        }
        return next();
    } catch (error) {
        return res.status(401).json({ success: false, error: "Admin authentication is required." });
    }
}

const adminLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: "Too many login attempts. Please try again later." },
});

// API Creation

app.get("/",(req, res) => {
    res.send("Express App is Running")
})

app.post("/admin/login", requireAdminOrigin, adminLoginLimiter, async (req, res) => {
    if (!isAdminAuthConfigured()) {
        return res.status(503).json({ success: false, error: "Admin authentication is not configured." });
    }

    const { email, password } = req.body || {};
    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
        return res.status(400).json({ success: false, error: "Email and password are required." });
    }

    const emailMatches = email.trim().toLowerCase() === process.env.ADMIN_EMAIL.trim().toLowerCase();
    const passwordMatches = await verifyPassword(password, process.env.ADMIN_PASSWORD_HASH);
    if (!emailMatches || !passwordMatches) {
        return res.status(401).json({ success: false, error: "Invalid email or password." });
    }

    const token = jwt.sign({ sub: "admin" }, process.env.ADMIN_JWT_SECRET, {
        audience: "shopnimar-admin",
        expiresIn: "30m",
        issuer: "shopnimar-api",
    });

    res.cookie(adminCookieName, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 60 * 1000,
        path: "/",
    });
    return res.json({ success: true });
});

app.get("/admin/session", requireAdminOrigin, requireAdmin, (req, res) => {
    res.json({ success: true });
});

app.post("/admin/logout", requireAdminOrigin, (req, res) => {
    res.clearCookie(adminCookieName, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
    });
    return res.status(204).end();
});

// Image Storage Engine

const storage = multer.diskStorage({
    destination: './upload/images',
    filename:(req,file,cb)=>{
        return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({storage:storage})

// Creating Upload Endpoint for Images
app.use('/images',express.static('upload/images'))

app.post("/upload", requireAdminOrigin, requireAdmin, upload.single('product'),(req,res)=>{
    if (!req.file) {
        return res.status(400).json({ success: false, error: "An image file is required." });
    }
    res.json({
        success:1,
        image_url:`http://localhost:${port}/images/${req.file.filename}`
    })
})

// Schema for Creating Products

const Product = mongoose.model("Product",{
    id:{
        type: Number,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    new_price:{
        type:Number,
        required:true,
    },
    old_price:{
        type:Number,
        required:true,
    },
    date:{
        type:Date,
        default:Date.now,
    },
    available:{
        type:Boolean,
        default:true,
    },
})

app.post('/addproduct',requireAdminOrigin,requireAdmin,async (req,res)=>{
    let products = await Product.find({});
    let id;
    if(products.length>0)
    {
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id+1;
    }
    else{
        id=1;
    }
    const product = new Product({
        id:id,
        name:req.body.name,
        image:req.body.image,
        category:req.body.category,
        new_price:req.body.new_price,
        old_price:req.body.old_price,
    });
    console.log(product);
    await product.save();
    console.log("Saved");
    res.json({
        success:true,
        name:req.body.name,
    })
})

// Creating API for Deleting Products
app.post('/removeproduct',requireAdminOrigin,requireAdmin,async (req,res)=>{
    await Product.findOneAndDelete({id:req.body.id});
    console.log("Removed");
    res.json({
        success:true,
        name:req.body.name,
    })
})

// Creating API for getting all products
app.get('/allproducts',async (req,res)=>{
    let products = await Product.find({});
    console.log("All Products Fetched");
    res.send(products);
})

// Schema Creating For User Model

const Users = mongoose.model('Users',{
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
    },
    cartData:{
        type:Object,
    },
    date:{
        type:Date,
        default:Date.now,
    }
})

// Creating Endpoint For Registering the User
app.post('/signup',async (req,res)=>{


    let check = await Users.findOne({email:req.body.email});
    if (check) {
        return res.status(400).json({success:false,errors:"existing user found with same email address"})
    }
    let cart = {};
    for (let i = 0; i < 300; i++) {
        cart[i]=0;
    }
    const user = new Users({
        name:req.body.username,
        email:req.body.email,
        password:req.body.password,
        cartData:cart,
    })

    await user.save();

    const data = {
        user:{
            id:user.id
        }
    }

    const token = jwt.sign(data,userJwtSecret);
    res.json({success:true,token})
})

// Creating Endpoint for User Login
app.post('/login',async (req,res)=>{
    let user = await Users.findOne({email:req.body.email});
    if (user) {
        const passCompare = req.body.password === user.password;
        if (passCompare) {
            const data = {
                user:{
                    id:user.id
                }
            }
            const token = jwt.sign(data,userJwtSecret);
            res.json({success:true,token});
        }
        else{
            res.json({success:false,errors:"Wrong Password"})
        }
    }
    else{
        res.json({success:false,errors:"Wrong Email Id"})
    }
})

// Creating Endpoint For New Collection Data
app.get('/newcollections',async (req,res)=>{
    let product = await Product.find({});
    let newcollection = product.slice(1).slice(-8);
    console.log("New Collection Fetched");
    res.send(newcollection);
})

// Creating Endpoint For Popular in Women Section
app.get('/popularinwomen',async (req,res)=>{
    let products = await Product.find({category:"women"})
    let popular_in_women = products.slice(0,4);
    console.log("Popular in women fetched");
    res.send(popular_in_women);
})

// Creating Middleware to Fetch User
    const fetchUser = async (req,res,next)=>{
        const token = req.header('auth-token');
        if (!token) {
            res.status(401).send({errors:"Please authenticate using valid token."})
        }
        else{
            try {
                const data = jwt.verify(token,userJwtSecret);
                req.user = data.user;
                next();
            } catch (error) {
                res.status(401).send({errors:"please authenticate using a valid token"})
            }
        }
    }

// Creating Endpoint For Adding Products in CartData
app.post('/addtocart',fetchUser,async (req,res)=>{
    console.log("Added",req.body.itemId);
    let userData = await Users.findOne({_id:req.user.id});
    userData.cartData[req.body.itemId] += 1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Added")
})

// Creating Endpoint to Remove Product From CartData
app.post('/removefromcart',fetchUser,async (req,res)=>{
    console.log("Removed",req.body.itemId);
    let userData = await Users.findOne({_id:req.user.id});
    if(userData.cartData[req.body.itemId]>0)
    userData.cartData[req.body.itemId] -= 1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Removed")
})

// Creating Endpoint to get CartData
app.post('/getcart',fetchUser,async (req,res)=>{
    console.log("GetCart");
    let userData = await Users.findOne({_id:req.user.id});
    res.json(userData.cartData);
})

app.listen(port,(error) =>  {
    if(!error){
        console.log("Server Running on Port "+port);
    }
    else
    {
        console.log("Error : "+error);
    }
})
