const config =require("../../src/config/dbConfig.js")
const mongoose =require("mongoose");
const {normalizeMsj}=require("../../src/controllers/normalizr.js")
const nodemailer= require('nodemailer');
const { db } = require("../../src/schema/schemaMessages.js");
const message =require ("../../src/schema/schemaMessages.js")
const {
  loggerDev,
  loggerProd
} = require("../../src/loggers/logger_config.js");
const NODE_ENV = process.env.NODE_ENV || "development";
const logger = NODE_ENV === "production"
? loggerProd
: loggerDev

try {
    mongoose.connect(config.mongoDb.url, config.mongoDb.options)
} catch (error) {
    console.log(error);
};

//CONFIGURACION CASILLA DE CORREO PARA RECIBIR LAS NOTIFICACIONES

const transporter = nodemailer.createTransport({
  service:"gmail",
  host: 'smtp.gmail.email',
  port: 587,
  auth: {
      user: 'andreshosch114@gmail.com',
      pass: "pripxpboynmzhqev"
  }
});

//GRABA LOS MENSAJES DEL CHAT

const saveMsjs = async (msj) => {
    const newMsj = new message(msj);
    try {
        newMsj.save()
    } catch (error) {
        throw new Error(error);
    }
}

//TRAE LOS MENSAJES DEL CHAT

const getMsjs = async () => {
    try {
        const mensajes = await message.find();
        return normalizeMsj(mensajes);
    }  catch(err) {
      logger.log("error",err)
    }
}

//FUNCION QUE ENVIA MAIL AL REALIZAR LA COMPRA DEL CARRO

async function sendMail(id,name,mail,listCart,direction) {
    try {
        await transporter.sendMail({
          to:"retete2854@sopulit.com",
          from:"iva12@ethereal.email",
          subject:`nuevo pedido de Nombre: ${name} Mail: ${mail}`,
          html:
          `<br><br>NUMERO DE ORDEN: ${id}
          <br><br>ESTADO DE ORDEN: GENERADA<br><br>LISTA DE PRODUCTOS: ${listCart}
          <br><br>DIRECCION DE ENTREGA: ${direction}`
      });
      }  catch(err) {
        logger.log("error",err)
      }
    }

  // FUNCION QUE ENVIA MAIL AL REALIZAR UN NUEVO REGISTRO DE USUARIO  

    async function newRegister(mail,user) {
      try {
          await transporter.sendMail({
            to:"dekaxo8790@miarr.com",
            from:"mabel.mcclure@ethereal.email",
            subject:`El usuario ${mail} se registro correctamente`,
            html:`${user}`
        });
        }  catch(err) {
          logger.log("error",err)
        }
      }

    // FUNCION QUE VACIA EL CARRO UNA VEZ QUE SE REALIZA LA COMPRA  

    async function deleteCartBuy(idCart){
      try{
         await db.collection("carts").updateOne({id:idCart},{$pull:{"productos":{}}});
      }
      catch(err) {
        logger.log("error",err)
      }
    }
    

      module.exports={saveMsjs,getMsjs,sendMail,deleteCartBuy,newRegister}
