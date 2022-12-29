const mongoose=require("mongoose");
const { db } = require("../../schema/schemaUser");
const {
    loggerDev,
    loggerProd
  } = require("../../loggers/logger_config.js");
  const NODE_ENV = process.env.NODE_ENV || "development";
  const logger = NODE_ENV === "production"
  ? loggerProd
  : loggerDev
module.exports=class CartMongoController {
    constructor(collection,schema) {
        this.collection = mongoose.model(collection, schema);
    }
    
//TRAE TODOS LOS CARRITOS
    getAllCart = async () => {
        try {
            return await this.collection.find();
        }  catch(err) {
            logger.log("error",err)
        }
    }

 // CREA CARRITOS   
    createCarrito = async () => {
       
        try {
            const carritos = await this.getAllCart();
            if (carritos.length === 0) {
                const carrito = { id: 1, timestamp: Date.now(),productos: [] };
                const newElement = new this.collection(carrito);
                const result = await newElement.save();
                return result;
            } else {
                const LastId=(carritos.length)-1
                const carro=(carritos[LastId].id)+1
                const carrito = { id: carro, timestamp: Date.now(),productos: [] };
                const newElement = new this.collection(carrito);
                const result = await newElement.save();
                return result;
            }
        }  catch(err) {
            logger.log("error",err)
            
            
        }
    }

    // AGREGA PRODUCTOS AL CARRO

    addProduct = async (id, newElement) => {
        try {

            const cart = await this.getAllCart();
            const cartIndex = cart.findIndex((e) => e.id === Number(id));
            const productsInCart = cart[cartIndex].productos;
            if (cart[cartIndex].productos.length === 0) {
                newElement.id = 1;
            } else 
            {
                   const LastId=(productsInCart.length)-1
                   const carro=(productsInCart[LastId].id)+1
                   newElement.id = carro;
            }
            newElement.timestamp = Date.now();
            productsInCart.push(newElement);
            await this.collection.updateOne(
                { id: id },
                {
                    $set: { productos: productsInCart },
                }
            )
        }  catch(err) {
            logger.log("error",err)
        }
    }

    //TRAE PRODUCTOS DEL CARRO POR ID

    getById = async (id) => {
        try {
            const countCart= await db.collection("carts").countDocuments();
            const cart = await this.collection.findOne({ id: id });
            if (countCart!=0){
                const products = cart?.productos;
                if (products) {
                   return products;
                }    else {
                     throw new Error('No existe el carrito');
                }
            }
        
        }     catch(err) {
             logger.log("error",err)
            
        }
    }
    
//BORRAR PRODUCTOS DE UN CARRO POR ID

    deleteProduct = async (id, prodId) => {
        try {
            const carts = await this.getAllCart()
            const cartIndex = carts.findIndex((e) => e.id == id)

            if (cartIndex >= 0) {
                const productsOnCart = carts[cartIndex].productos
                const prodToDeleteIndex = productsOnCart.findIndex((e) => e.id == prodId)
                if (prodToDeleteIndex >= 0) {
                    productsOnCart.splice(prodToDeleteIndex, 1)
                    await this.collection.updateOne(
                        { id: id },
                        {
                            $set: { productos: productsOnCart },
                        }
                    )
                    return true
                } else {
                    return false
                }
            } else {
                return false
            }
        }  catch(err) {
            logger.log("error",err)
        }
        
    }
    
} 


   


