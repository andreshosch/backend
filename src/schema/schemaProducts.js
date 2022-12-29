const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productsSchema = new Schema({
    nombre: {type: String, required: true, max:100},
    descripcion: {type: String, required: true, max:400},
    categoria: {type: String, required: true, max:400},
    precio: {type: Number, required: true},
    stock: {type: Number, required: true},
    imagen:{type:String,required:true}
});


const producto = mongoose.model('Products', productsSchema);

module.exports = producto;