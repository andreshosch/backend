const express=require("express");
const mongoose=require("mongoose")
const{Server:http}=require ("http");
const {Server:ioServer}=require ("socket.io");
const User=require("..//../src/schema/schemaUser.js")
const LocalStrategy = require('passport-local').Strategy;
const passport = require("passport");
const {newRegister}=require("../../public/js/send.js")
const { comparePassword, hashPassword } = require("../services/utils.js")
// const {connect} = require('./src/config/dbConfig.js');
const { Types } = require("mongoose");
const nodemailer= require('nodemailer');
const { db } = require("..//..//src/schema/schemaProducts.js");

const app = express();
const httpserver = http(app)
const io = new ioServer(httpserver)

module.exports=class userMongoController {
    constructor(collection, schema) {
        this.collection = mongoose.model(collection, schema);
    }
}



//LOGUEO DE USUARIO

passport.use("login", new LocalStrategy(async (mail, password, done) => {
    const user = await User.findOne({ mail });
    if (user){
  const  passHash = user.password;
    if (!user || !comparePassword(password, passHash)) {
      return done(null, null, { message: "Invalid username or password" });
    }
  }
   return done(null, user);
 }));

 //REGISTRO DE USUARIO
passport.use("signup", new LocalStrategy({
    passReqToCallback: true
  }, async (req, mail, password, done) => {
    const user = await User.findOne({ mail });  
    countUser=await db.collection("users").countDocuments()
    if (user) {
     return done(new Error("El usuario ya existe!"),
     null);
    }
    if(req.body.password===req.body.newpassword)
    {
      if(countUser===0)
     {  
       const id=1;  
       const address = req.body.address;
       const name = req.body.names;
       const direction = req.body.direction;
       const age = req.body.age;
       const phone = req.body.phone;
       const avatar =req.body.avatar ;
       const hashedPassword = hashPassword(password);
       const newUser = new User({ id, mail, password: hashedPassword , address,name,direction,age,phone,avatar });
       await newUser.save();
       newRegister(mail,newUser);
       return done(null, newUser);
     }
  else{
        const id=countUser+1;  
        const address = req.body.address;
        const name = req.body.names;
        const direction = req.body.direction;
        const age = req.body.age;
        const phone = req.body.phone;
        const avatar =req.body.avatar;
        const hashedPassword = hashPassword(password);
        const newUser = new User({ id,mail, password: hashedPassword , address,name,direction,age,phone,avatar });
        await newUser.save();
        newRegister(mail,newUser);
        return done(null, newUser);
      }
    }
      else{
        return done(new Error("no coinciden las contraseñas"),
)}
  }));

    passport.serializeUser((user, done) => {
      done(null, user._id);
    });
    
    passport.deserializeUser(async (id, done) => {
      id = Types.ObjectId(id);
      const user = await User.findById(id);
      done(null, user);
    });
  
  
  