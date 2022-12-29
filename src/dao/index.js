const dotenv =require ('dotenv')
dotenv.config()

let productoDao
let cartDao
let userDao
let messagesDao

switch (process.env.DATABASE){
    case 'mongo':{
        const  ProductosDaoMongo =  require('./mongo/ProductsDaoMongo.js')
        const cartDaoMongo =  require('./mongo/cartDaoMongo.js')
        const userDaoMongo =  require('./userDao.js')
        const messageDaoMongo=require('./mongo/messagesDaoMongo.js')



       productoDao=ProductosDaoMongo
       cartDao=cartDaoMongo
       userDao=userDaoMongo;
       messagesDao=messageDaoMongo;
       break;
    }
}
module.exports= {
    productoDao, cartDao,userDao,messagesDao
    }
