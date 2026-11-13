const FETCH_CACHE_STORAGE_NAME = "fetch_cache";

const AUTHORIZATION_KEY = "4Mu0qDn_RNZefQkqtQUokdytdwdA6VsKMdpbG9_5zJU";

const PER_PAGE_NUM = 10;

const ORIENTATION = Object.freeze({
    ALL: "",
    LANDSCAPE: "landscape",
    PORTRAIT: "portrait",
    SQUARISH: "squarish",
});

const fragment = document.createDocumentFragment();
const gallery = document.querySelector("#gallery");

// funcion de llamada a la API que devuelve promesa con la info de la API
const obtenerDatosDeLaAPI = async (path) => {
    // esto es para hacer un cache
    // se guarda en el local storage los paths que entran a esta funcion y los datos en un array
    // [{"https://api.unsplash.com...", datos}, {"https://api.unsplash.com...", datos}...]
    // si ya hay una busqueda en el cache, se devuelve directamente (asi no hace falta llamar a fetch para la misma busqueda una y otra vez)
    const cache = new Map(JSON.parse(localStorage.getItem(FETCH_CACHE_STORAGE_NAME)));
    if (cache.has(path)) {
        return cache.get(path);
    }

    const peticion = await fetch(path, {
        method: 'GET',
        headers: {
            'Authorization': `Client-ID ${AUTHORIZATION_KEY}`
        }
    });
    if (peticion.ok === false) {
        throw new Error(peticion.status);
    }
    const datos = await peticion.json();

    // aqui se meten las busquedas nuevas en el cache
    // la proxima vez que se pida la misma busqueda la returneara en el return de arriba
    cache.set(path, datos);
    localStorage.setItem(FETCH_CACHE_STORAGE_NAME, JSON.stringify(Array.from(cache)));
    
    return datos;
};

const getDataQuery = async (query, orientation, page) => {
    const queryString = query.split(" ").map(word=>word.trim()).filter(word=>word!=="").join("+");
    const orientationCommand = orientation === "" ? "" : `&orientation=${orientation}`;
    const data = await obtenerDatosDeLaAPI(`https://api.unsplash.com/search/photos?page=${page}&per_page=${PER_PAGE_NUM}&query=${queryString}${orientationCommand}`);
    return { images: data.results.map(result=>result.urls.small), image_num: data.total_pages };
};

// esto solo es para testear
const printImages = (imageArray) => {
    gallery.innerHTML = "";
    imageArray.forEach((image) => {
        const divElement = document.createElement("div");
        const imgElement = document.createElement("img");
        imgElement.src = image;

        divElement.appendChild(imgElement);

        fragment.appendChild(divElement);
    });
    gallery.appendChild(fragment);
};

const init = async () => {
    try {
        // a getDataQuery le pasas una string the tags (lo que escribe el usuario en el buscador)
        // tambien le pasas la orientacion de las imagenes, y la pagina de la galeria
        // te devuelve un objecto con dos parametros
        // images: un array de strings que puedes poner en src (<img src=...>)
        // image_num: el numero maximo de imagenes que hay en toda la api con la query que has escrito
        const imageData = await getDataQuery("cyberpunk mecha", ORIENTATION.ALL, 2);
        console.log("ay " + imageData.image_num + " imagenes con tu busqueda");
        printImages(imageData.images);

        //const datos = await obtenerDatosDeLaAPI("https://api.unsplash.com/search/photos?page=1&query=office");
        //console.log(datos["results"][0].links.html);
        //console.log(datos);
    } catch (error) {
        console.log(error);
    }
}

init()
