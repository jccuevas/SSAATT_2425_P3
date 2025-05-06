var current_user = "";

window.current_user = "";

const SERVER = "";

function showSection(n) {
  const sections = document.querySelectorAll("[id|=section]");
  for (let section of sections) {
    section.classList.add("hidden");
  }

  const menus = document.querySelectorAll("[id|=menu]");
  for (let menu of menus) {
    menu.classList.remove("activeMenu");
  }

  let s = document.getElementById("section-" + n);
  s.classList.remove("hidden");
  let menu = document.getElementById("menu-" + n);
  menu.classList.add("activeMenu");
}

function switchMenus() {
  document.getElementById("menu-1").classList.add("hidden");
  document.getElementById("menu-2").classList.add("hidden");
  document.getElementById("menu-3").classList.remove("hidden");
  document.getElementById("menu-4").classList.remove("hidden");
}
/**
 * Esta función es la versión con XMLHttpRequest correspondiente a la práctica 2
 * @param {*} event
 */
function doLogin(event) {
  event.preventDefault();

  //let user = document.getElementById("inicio_user");//Objeto HTML
  let user = document.getElementById("inicio_user").value; //Valor del campo
  let password = document.forms.inicio.password.value;

  console.log("Leídos: " + user + " y " + password);
  let datos = {
    user: user,
    password: password,
  };

  console.log("Leídos: " + JSON.stringify(datos));

  const login = new XMLHttpRequest();

  login.open("POST", "/login");
  login.onreadystatechange = function () {
    if (login.readyState == 4) {
      switch (login.status) {
        case 200:
          console.log("Autenticación correcta...");
          //Hay que hacer más cosas
          //1- Ocultar la sección Inicio
          //2- Ocultar los botones del menú de navegación "Inicio" y "Registro"
          //3- Mostrar los botones del menú de navegación "Listar entrada" y "Nueva entrada"
          //4- Mostrar la sección "Entradas del blog"
          current_user = user;
          showSection(3);
          switchMenus();
          break;
        case 401:
          current_user = "";
          alert("Error en la autenticación.");
          break;
        case 500:
          alert("Error en el servidor");
          break;
      }
    }
  };

  login.setRequestHeader("Content-Type", "application/json");
  login.send(JSON.stringify(datos));

  login.addEventListener("error", () => alert("Error en la conexión."));
  /*
    let form = new FormData(document.forms.inicio);
    for(let item of form.keys()){
        console.log("Campo "+item+" valor="+form.get(item))
    }
    
*/
}
/**
 * Función login con fetch() y promesas.
 * @param {*} event
 */
function doLoginFetch(event) {
  event.preventDefault();

  console.log("doLoginFetch()");

  let user = document.getElementById("inicio_user").value; //Valor del campo
  let password = document.forms.inicio.password.value;

  console.log("Leídos: " + user + " y " + password);
  let datos = {
    user: user,
    password: password,
  };

  const init = {
    method: "POST", //Se indica el método HTTP a usar
    headers: {
      "Content-Type": "application/json",
    }, // Se indica el tipo de contenido que se envía al servidor
    body: JSON.stringify(datos), // Se envían los datos en formato JSON
  };

  fetch("/login", init)
    .then((response) => {
      switch (response.status) {
        case 200:
          console.log("Autenticación correcta...");
          //Hay que hacer más cosas
          //1- Ocultar la sección Inicio
          //2- Ocultar los botones del menú de navegación "Inicio" y "Registro"
          //3- Mostrar los botones del menú de navegación "Listar entrada" y "Nueva entrada"
          //4- Mostrar la sección "Entradas del blog"
          current_user = user;
          showSection(3);
          switchMenus();
          break;
        case 401:
          current_user = "";
          alert("Error en la autenticación.");
          break;
        case 500:
          alert("Error en el servidor");
          break;
      }
    })
    .catch((ex) => alert("Error en la conexión: " + ex));
}

/**
 * Función con XMLHttpRequest para una nueva entrada en el blog
 * @param {*} event
 */
function newBlogPost(event) {
  event.preventDefault();

  let datos = {
    user: current_user,
    title: document.forms.post.title.value,
    date: document.forms.post.date.value,
    comment: document.forms.post.comment.value,
  };

  const blog = new XMLHttpRequest();

  blog.open("PUT", "/blog");
  blog.onreadystatechange = function () {
    if (blog.readyState == 4) {
      switch (blog.status) {
        case 201:
          console.log("Entrada creada...");
          break;
        case 400:
          alert("Error en el formato.");
          break;
        case 500:
          alert("Error en el servidor");
          break;
      }
    }
  };

  blog.setRequestHeader("Content-Type", "application/json");
  blog.send(JSON.stringify(datos));
}

/**
 * Esta función es la versión con fetch() correspondiente a la práctica 2 para
 * enviar una nueva entrada al blog. También se emplea await para esperar la promesa.
 * @param {*} event
 */
async function newBlogPostFetch(event) {
  event.preventDefault();

  let datos = {
    user: current_user,
    title: document.forms.post.title.value,
    date: document.forms.post.date.value,
    comment: document.forms.post.comment.value,
  };

  const init = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  };

  const response = await fetch("/blog", init);

  switch (response.status) {
    case 201:
      console.log("Entrada creada...");
      break;
    case 400:
      alert("Error en el formato.");
      break;
    case 500:
      alert("Error en el servidor");
      break;
  }
}

function getPosts() {
  const get = new XMLHttpRequest();
  get.open("GET", "/blog/" + current_user);
  get.onreadystatechange = function () {
    if (get.readyState == 4) {
      switch (get.status) {
        case 200:
          console.log(get.responseText);
          let ul = document.getElementById("entries");
          ul.innerHTML = "";
          try {
            let entries = JSON.parse(get.responseText);
            for (let post of entries) {
              //ul.innerHTML+="<li><h4>"+post.title+"["+post.user+"]</h4></li>"
              //ul.innerHTML+=`<li class='post'><h4>${post.title}[${post.date}]</h4><p><b>${post.user}</b></p><p>${post.comment}</p></li>`
              ul.appendChild(drawPost(post));
            }
          } catch (ex) {
            alert(ex + "Datos con formato incorrecto: " + get.responseText);
          }
          break;
        case 500:
          alert("Error en el servidor al descargar la lista de entradas");
          break;
      }
    }
  };

  get.send();
}

function drawPost(post) {
  let li = document.createElement("li");
  li.classList.add("post");
  // Tarea 6: añadimos el id de la base de datos
  // al elemento li para poder identificarlo más adelante
  // para poder borrarlo.
  li.setAttribute("id", post._id);
  let div = document.createElement("div");

  let h4 = document.createElement("h4");
  h4.innerText = `${post.title} [${post.date}]`;
  let puser = document.createElement("p");
  puser.innerText = post.user;
  let pcomment = document.createElement("p");
  pcomment.innerText = post.comment;

  div.append(h4, pcomment, puser);

  //Se crea el botón de borrado
  let button = document.createElement("button");
  button.innerHTML = "🗑";
  // Recordad usar una función flecha para llamar a la función
  // que se debe lanzar en e evento, porque si no, la función
  // se ejecutará al procesar el código la primera vez y nunca
  // más al pulsar el botón.
  button.addEventListener("click", () => {
    deleteEntry(post._id).catch((ex) => alert("Error en la petición: " + ex));
    // Le hemos añadido el catch() para detectar los errores de red
    // que se puedan dar al hacer la petición con fecth.
  });

  // Se añaden los datos de la entrada y el botón al elemento li.
  li.append(div, button);

  return li;
}

async function deleteEntry(id) {
  console.log("Borrando ..." + id);

  const init = {
    method: "DELETE",
  };

  //Ejemplo con await (la función se ha declarado asíncrona con async)
  const response = await fetch("/blog/" + id, init);

  // Antes de procesar los datos o hacer nada, debemos
  // comprobar que la petición devuelve un código de estado
  // válido para nuestra aplicación, por ejemplo un 200.
  switch (response.status) {
    case 200:
      console.log("Entrada borrada correctamente.");
      // En este caso no se devuelven datos y solo borrarmos
      // el elemento li correspondiente seleccionándolo por su id
      document.getElementById(id).remove(); // Borra el elemento del DOM
      break;
    case 404:
      alert("Entrada no encontrada...");
      break;
    case 500:
      alert("Error en el servidor...");
      break;
  }

  /*
// Opción fetch() sin await, la función no tiene que ser
// declarada asíncrona con async 

  fetch("/blog/" + id, init).then((response) => {
    switch (response.status) {
      case 200:
        console.log("Entrada borrada correctamente.")
        // En este caso no se devuelven datos y solo borrarmos
        // el elemento li correspondiente seleccionándolo por su id
        document.getElementById(id).remove();
        break;
      case 404:
        alert("Entrada no encontrada...")
        break;
      case 500:
        alert("Error en el servidor...")
        break;
    }
  })
  .catch((ex)=>{
    alert("Error en la petición: "+ex);
  });
  */
}
