const express=require("express");
const session=require("express-session");
const helmet=require("helmet");
const csrf=require("csurf");
const path=require("path");

const authRoutes=require("./routes/auth");
const twofaRoutes=require("./routes/twofactor");

const app=express();

app.use(helmet());

app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.set("view engine","ejs");

app.use(express.static("public"));

app.use(session({

secret:"ReplaceWithVeryLongRandomSecret",

resave:false,

saveUninitialized:false,

cookie:{

httpOnly:true,

secure:false,

sameSite:"strict",

maxAge:1000*60*30

}

}));

const csrfProtection=csrf();

app.use(csrfProtection);

app.use((req,res,next)=>{

res.locals.csrfToken=req.csrfToken();

next();

});

app.use("/",authRoutes);

app.use("/",twofaRoutes);

app.listen(3000,()=>{

console.log("Server Running");

});
