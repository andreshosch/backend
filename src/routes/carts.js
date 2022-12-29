const {Router}=require("express");
const { cartDao }= require("../dao/index.js")
const { db } = require("../schema/schemaCarts.js")
const routerCarrito = Router();
const Singleton = require("../services/singletonC")
const carritos2=new cartDao;
let singletonCarrito = Singleton.getInstance();
singletonCarrito.crearCarritos(carritos2)
const carrito = singletonCarrito.getCarritos()


// CREACION DE CARRO

routerCarrito.
route('/')
.post(async (req, res) => {
    
    const id = await carrito.createCarrito();
    res.status(201).json(`carrito creado con el id: ${id} correctamente`);
})

// TRAER TODOS LOS CARROS

routerCarrito.
route('/')
.get(async (req, res) => {
    const products = await carrito.getAllCart();
    if (products.length > 0) {
        res.status(200).json(products);
    } else {
        res.status(404).send({ message: "Carrito no encontrado" });
    }
})

// TRAE CARRO POR ID

routerCarrito.
route('/:id')
.get(async (req, res) => {
     const counterCart = await db.collection("carts").countDocuments();
     if (counterCart > 0){
        const products = await carrito.getById(req.params.id);
        if (products) {
            res.status(200).json(products);
        } else {
            res.status(404).send({ message: "Carrito no encontrado" });
        }
     }
})

// AGREGA PRODUCTO A UN CARRO POR ID

.post((req, res) => {
        const producto = carrito.addProduct(req.params.id, req.body);
    if (producto) {
        res.status(201).json('producto agregado correctamente');
    } else {
        res.status(404).json({ error: 'No existe carrito con dicho ID' });
    }
})

// BORRAR PRODUCTO DE UN CARRO POR ID

routerCarrito.
    route('/:id/:id_prod')
    .delete((req, res) => {
        const deleteProd = carrito.deleteProduct(req.params.id, req.params.id_prod);
        if (deleteProd) {
            res.status(200).json(`el producto con el id:${req.params.id_prod} ha sido eliminado correctamente`);
        } else {
            res.status(404).json({ error: 'No existe producto con dicho ID' });
        }
    })


    module.exports= {routerCarrito}