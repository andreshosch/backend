let socket = io();

// FUNCION PARA MOSTRAR LA LISTA DE PRODUCTOS

function renderTable(data) {
    const table = document.getElementById("table");
    const html = data.map(element => {
        return (`<tr>
        <td>${element.nombre}</td>
        <td>$${element.precio}</td>
        <td>${element.descripcion }</td>
        <td>${element.categoria}</td>
        <td>${element.stock}</td>
        <td><img src="${element.imagen}" style="height:50px"></td>
        </tr>`);
    }
    ).join("");
    table.innerHTML += html;
}

//RENDER DE PRODUCTOS

fetch("/productos")
    .then(response => response.json())
    .then(data => {
        renderTable(data);
    })
    .catch(error => console.log(error));


// FUNCION PARA MOSTRAR LOS CARRITOS

function renderCart(data) {
    const table = document.getElementById("carrito");
    const html = data.map(element => {
        precioTotal=element.precio*element.cantidad
        return (`<tr>
        <td>${element.nombre}</td>
        <td>$${element.precio}</td>
        <td>${element.descripcion}</td>
        <td>${element.categoria}</td>
        <td>${element.cantidad}</td>
        <td><img src="${element.imagen}" style="height:50px"></td>
        <td>$ ${precioTotal.toFixed(2)}</td>
        </tr><br><br><br>
         `);  
    },
    ).join("");
    table.innerHTML += html;
}

//FUNCION PARA MOSTRAR LOS MENSAJES

function renderMsj(msj) {
    const mensajes = document.getElementById("mensajes");
    msj.map(element => {
        const html = ` <article class=text-center>
        <span class="id mail">${element._doc.mail}</span><span class="date">[${element._doc.timestamp}]:</span><img src="${element._doc.avatar}" alt="avatar" class="avatar"><br>Pregunta: <span class="mensaje">${element._doc.pregunta}</span>
        <br>Respuesta: <span class="mensaje">${element._doc.respuesta}</span>
                        </article>`;
      
        mensajes.innerHTML += html;
    })
}

const ingresoMensaje = document.getElementById("ingresoMensaje");
const botonEnviar = document.getElementById("botonEnviar");

botonEnviar.addEventListener('click', (e) => {
    e.preventDefault()
    const mensaje = {   
            mail: ingresoMensaje.children.mail.value,
            nombre: ingresoMensaje.children.nombre.value,
            apellido: ingresoMensaje.children.apellido.value,
            edad: ingresoMensaje.children.edad.value,
            alias: ingresoMensaje.children.alias.value,
            avatar: ingresoMensaje.children.avatar.value,
            pregunta: ingresoMensaje.children.pregunta.value,
            respuesta: "-"    
}
    socket.emit('enviarMensaje', mensaje);
})



//NORMALIZAR ESQUEMAS
const authorsSchema = new normalizr.schema.Entity('authors');
const msjSchema = new normalizr.schema.Entity('mensajes', { idAttribute: 'id' });
const fileSchema = [msjSchema]


//DESNORMALIZAR ESQUEMAS

socket.on('mensajes', (msj) => {
    const denormMsjs = normalizr.denormalize(msj.result, fileSchema, msj.entities);
    renderMsj(denormMsjs);
    renderComp(msj, denormMsjs);
})

//RENDERIZAR MENSAJES

const renderComp = (msj, denormMsjs) => {
    const comp = document.getElementById("compresion");
    const denormMsjsLength = (JSON.stringify(denormMsjs)).length;
    const msjLength = (JSON.stringify(msj)).length;
    const compresion = ((msjLength - denormMsjsLength) / msjLength * 100).toFixed(2);
    comp.innerHTML = `(Compresion: ${compresion}%)`;
}


//RENDER MENSAJE DE BIENVENIDA

fetch ("/loginEnv")
.then(response => response.json())
 .then (data=>{
    userName=data.user;
    avatar=data.avatar;
    document.getElementById("userName").innerHTML=`<div class="titleLogin">Bienvenid@ ${userName} </div>
    <div class="avatar"><img src=${avatar} class="avatar"></img></div>`
 })
 .catch(error=>console.log(error))

//RENDER CARRITO POR USUARIO

fetch ("/idCart")
.then(response => response.json())
 .then (data=>{
    userName=data.user;
    avatar=data.avatar;
    id=data.id;
    document.getElementById("userName").innerHTML=`<div class="titleLogin">Bienvenid@ ${userName} </div>
    <div class="avatar"><img src=${avatar} class="avatar"></img></div>`
    .then(fetch(`/carrito/${id}`)
    .then(response => response.json())
    .then(data => {
        renderCart(data);
    }))
    .catch(error => console.log(error));

 })




// LOGOUT CON SPINNER

document.getElementById("logout").addEventListener
    ('click', (e) => {
        e.preventDefault()
        fetch("/logout")
            .then(spinner.style.display = "flex")
            .then(response => response.json())
            .finally(() => {
                window.location.href = "/logoutMsj";
            })
    })
    const spinner = document.getElementById("spinner");
    spinner.style.display = "none";


