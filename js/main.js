//funcion de llamada a la API que devuelve promesa con la info de la API

const obtenerDatosDeLaAPI = async (path) => {
    const peticion = await fetch(path, {
        method: 'GET',
        headers: {
            'Authorization': 'Client-ID 4Mu0qDn_RNZefQkqtQUokdytdwdA6VsKMdpbG9_5zJU'
        }
    })
    if (peticion.ok === false) {
        throw new Error(peticion.status);


    }
    const datos = await peticion.json();
    return datos;
};



const init = async () => {

    try {
        const datos = await obtenerDatosDeLaAPI("https://api.unsplash.com/search/photos?page=1&query=office");
        console.log(datos["results"][0].links.html)
        //console.log(datos);
    } catch (error) {

        console.log(error);
    }
}

init()
