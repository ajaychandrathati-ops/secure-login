const express=require("express");

const router=express.Router();

const speakeasy=require("speakeasy");

const QRCode=require("qrcode");

const db=require("../db");

router.get("/setup2fa",(req,res)=>{

const secret=speakeasy.generateSecret({

name:"SecureLogin"

});

db.query(

"UPDATE users SET secret=?,twofa=1 WHERE id=?",

[secret.base32,req.session.user]

);

QRCode.toDataURL(secret.otpauth_url,(err,data)=>{

res.render("setup2fa",{

qr:data

});

});

});

router.get("/verify2fa",(req,res)=>{

res.render("verify2fa");

});

router.post("/verify2fa",(req,res)=>{

const token=req.body.token;

db.query(

"SELECT secret FROM users WHERE id=?",

[req.session.temp],

(err,result)=>{

const verified=speakeasy.totp.verify({

secret:result[0].secret,

encoding:"base32",

token

});

if(verified){

req.session.user=req.session.temp;

return res.redirect("/dashboard");

}

res.send("Invalid Token");

});

});

module.exports=router;
