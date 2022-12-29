const ProdMongoController=require('../../controllers/mongo/productsMongo.js')

class ProductosDaoMongo extends ProdMongoController{
    constructor(){
        super ('products',{
            nombre: {type: String, required: true, max:100},
            descripcion: {type: String, required: true, max:400},
            categoria: {type: String, required: true, max:400},
            precio: {type: Number, required: true},
            stock: {type: Number, required: true},
            imagen:{type:String,required:true}
            
        })
    }
}

module.exports= ProductosDaoMongo