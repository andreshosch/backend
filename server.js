const express=require("express");
const {routerProducto} = require("./src/routes/products.js")
const {routerCarrito} = require("./src/routes/carts.js")
const {routerMensajes} = require("./src/routes/messages.js")
const{Server:http}=require ("http");
const {Server:ioServer}=require ("socket.io");
const {saveMsjs, getMsjs, sendMail,deleteCartBuy}=require ("./public/js/send.js")
const session =require("express-session")
const MongoStore=require("connect-mongo");
const passport = require("passport");
const { db } = require("./src/schema/schemaCarts.js");
const {
  loggerDev,
  loggerProd
} = require("./src/loggers/logger_config.js");
const NODE_ENV = process.env.NODE_ENV || "development";
const logger = NODE_ENV === "production"
? loggerProd
: loggerDev

const cluster = require("cluster");
const {cpus} = require('os');
const cpuNum = cpus().length;

// VARIABLE QUE CONTROLA SI SE INICIA EN FORK O CLUSTER

const modoCluster = false;

if(modoCluster){
  console.log("Se iniciará en modo CLUSTER")
}
else{
  console.log("Se iniciará en modo FORK")
}

if (modoCluster && cluster.isPrimary) {
  console.log(`Cluster iniciado. CPUS: ${cpuNum}`);
  console.log(`PID: ${process.pid}`);
  for (let i = 0; i < cpuNum; i++) {
    cluster.fork();
  }

  cluster.on("exit", worker => {
    console.log(`${new Date().toLocaleString()}: Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {

  

const app = express();
const httpserver = http(app)
const io = new ioServer(httpserver)

var engines= require("consolidate")
app.engine("html", engines.swig)
app.set("view engine", "html")

app.use("/public", express.static('./public/'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/productos', routerProducto);
app.use('/carrito', routerCarrito);
app.use('/mensajes', routerMensajes);

//CONEXION A DB MONGO

app.use(session({
    secret: 'STRING_TO_SIGN_SESSION_ID',
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
      mongoUrl: process.env.DB,
      retries: 0,
      ttl: 10 * 60 ,
    }),
  })
);


app.use(passport.initialize());
app.use(passport.session());

  //RECUPERO EL NOMBRE YA EN SESION INICIADA

 app.get('/loginEnv', (req, res) => {
  process.env.USER=req.user.name;
  process.env.avatar=req.user.avatar;
  const user = process.env.USER;
  const avatar=process.env.avatar;
  res.send({
      user,avatar
  })
  
})


 // RECUPERO EL ID DEL CARRO EN SESION INICIADA

 app.get('/idCart', (req, res) => {
  process.env.USER=req.user.name;
  process.env.id=req.user.id;
  process.env.avatar=req.user.avatar
  const user = process.env.USER;
  const id=process.env.id
  const avatar=process.env.avatar
  res.send({
      user,id,avatar
  })
  
})


// RECUPERO EL NOMBRE YA EN SESION INICIADA

app.get('/getUserNameEnv', (req, res) => {
  const user = process.env.USER;
  logger.log("info",`Ingreso a la ruta${req.url}`)
    res.send({
      user
  })
})

app.get("/", (req,res)=>{

    try{
        if (req.session.user){
           res.sendFile(__dirname + ('/public/index.html'))
           logger.log("info",`Ingreso a la ruta${req.url}`)
        }
        else
        {
            res.sendFile(__dirname + ('/views/login.html'))
            logger.log("info",`Ingreso a la ruta${req.url}`)
        }
    }
    catch (error){
     console.log(error)
    }

})

io.on('connection', async (socket) => {
    console.log('Usuario conectado');

    socket.on('enviarMensaje', (msj) => {
      saveMsjs(msj);
    })

    socket.emit ('mensajes', await getMsjs());
})

// DESLOGUEO DE USUARIO

app.get('/logout', (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.log(err);
            } else {
                res.redirect('/logout');
                logger.log("info",`Ingreso a la ruta${req.url}`)
            }
        })
    } catch (err) {
        console.log(err);
    }
})
app.get('/logoutMsj', (req, res) => {
    try {
        res.sendFile(__dirname + '/views/logout.html');
        logger.log("info",`Ingreso a la ruta${req.url}`)
    }
    catch (err) {
        console.log(err);
    }
})

// COMPRA DE CARRITO POR USUARIO

app.get('/buyCart', async(req, res) => {
  try{
  process.env.USER=req.user.mail;
  process.env.id=req.user.id;
  process.env.name=req.user.name
  process.env.phone=req.user.phone
  process.env.address=req.user.address
   const id=parseInt( process.env.id)
  const productos=await db.collection("carts").findOne({id:id})
  const mail = process.env.USER;
  const direction=process.env.address
  const name= process.env.name
  sendMail(id,name,mail,JSON.stringify(productos),direction)
  deleteCartBuy(id)
  res.redirect("/buySuccesfull")
  logger.log("info",`Ingreso a la ruta${req.url}`)
  

   }
  catch(err){
    console.log(err)
  }
})
 
// VISTAS

  app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/views/login.html");
    logger.log("info",`Ingreso a la ruta${req.url}`)
  });

  app.get("/signup", (req, res) => {
    res.sendFile(__dirname + "/views/register.html");
    logger.log("info",`Ingreso a la ruta${req.url}`)
  });

  app.get("/error", (req, res) => {
    res.render("error.ejs",{error:"Error! Verifique los datos ingresados"})
    logger.log("info",`Ingreso a la ruta${req.url}`)
  });

  app.get("/products", (req, res) => {
    res.sendFile(__dirname + "/views/products.html");
    logger.log("info",`Ingreso a la ruta${req.url}`)
  });
  app.get("/buySuccesfull", (req, res) => {
    res.sendFile(__dirname + "/views/buyCart.html");
    logger.log("info",`Ingreso a la ruta${req.url}`)
  });

  app.get("/chat", (req, res) => {
    res.sendFile(__dirname + "/views/mesagges.html");
    logger.log("info",`Ingreso a la ruta${req.url}`)
  });

 

  app.get("/info", (req, res) => {
    res.render("info.pug",{PID:process.pid,VERSION:process.version,MEMORIA:process.memoryUsage().rss,SISTEMAOPERATIVO:process.platform,CARPETA:process.cwd(),PATH:process.argv[0]});
    logger.log("info",`Ingreso a la ruta${req.url}`)
  });

  //LOGS DE RUTA NO ENCONTRADA EN ARCHIVO WARN.LOG
  app.get("*", (req, res) => {
    logger.log("warn",`Ruta no encontrada ${req.url}`)
    res.status(400).send(`Ruta no encontrada ${req.url}`);
  });


// INICIO SESION

  app.post("/signup", passport.authenticate("signup", {
    failureRedirect: "/error",
  }) , (req, res) => {  
    req.session.user = req.user;
    res.redirect("/login");
  });
  
//LOGUEO

  app.post("/login", passport.authenticate("login", {
    failureRedirect: "/error",
  }) ,(req, res) => {
      req.session.user = req.user;
      res.redirect('/products');
  });


  
const PORT = process.env.PORT || 8080;


const server = httpserver.listen(PORT, () => {
    console.log(`Server is running on port: ${server.address().port}`);
});
server.on('error', error => console.log(`error running server: ${error}`));

}
 
