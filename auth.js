const express=require("express");

const router=express.Router();

const db=require("../db");

const argon2=require("argon2");

const {body,validationResult}=require("express-validator");

router.get("/register",(req,res)=>{

res.render("register");

});

router.post("/register",

body("username").isLength({min:4}),

body("email").isEmail(),

body("password").isLength({min:8}),

async(req,res)=>{

const errors=validationResult(req);

if(!errors.isEmpty())

return res.send(errors.array());

const {username,email,password}=req.body;

const hash=await argon2.hash(password);

db.query(

"INSERT INTO users(username,email,password) VALUES(?,?,?)",

[username,email,hash],

(err)=>{

if(err) return res.send(err);

res.redirect("/login");

}

);

});

router.get("/login",(req,res)=>{

res.render("login");

});

router.post("/login",async(req,res)=>{

const {email,password}=req.body;

db.query(

"SELECT * FROM users WHERE email=?",

[email],

async(err,result)=>{

if(err) return res.send(err);

if(result.length==0)

return res.send("Invalid Credentials");

const user=result[0];

const verify=await argon2.verify(user.password,password);

if(!verify)

return res.send("Wrong Password");

req.session.user=user.id;

if(user.twofa){

req.session.temp=user.id;

return res.redirect("/verify2fa");

}

res.redirect("/dashboard");

}

);

});

router.get("/dashboard",(req,res)=>{

if(!req.session.user)

return res.redirect("/login");

res.render("dashboard");

});

router.get("/logout",(req,res)=>{

req.session.destroy(()=>{

res.redirect("/login");

});

});

module.exports=router;
