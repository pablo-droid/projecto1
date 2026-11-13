const FETCH_CACHE_STORAGE_NAME = "fetch_cache";

const AUTHORIZATION_KEY = "4Mu0qDn_RNZefQkqtQUokdytdwdA6VsKMdpbG9_5zJU";

// funcion de llamada a la API que devuelve promesa con la info de la API
const obtenerDatosDeLaAPI = async (path) => {
    const cache = new Map(JSON.parse(localStorage.getItem(FETCH_CACHE_STORAGE_NAME))) || new Map();
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

    cache.set(path, datos);
    localStorage.setItem(FETCH_CACHE_STORAGE_NAME, JSON.stringify(Array.from(cache)));
    
    return datos;
};

const init = async () => {
    try {
        const datos = await obtenerDatosDeLaAPI("https://api.unsplash.com/search/photos?page=1&query=office");
        console.log(datos["results"][0].links.html);
        //console.log(datos);
    } catch (error) {
        console.log(error);
    }
}

init()
