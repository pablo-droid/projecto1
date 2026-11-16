const FETCH_CACHE_STORAGE_NAME = "fetch_cache";
const FAVORITES_STORAGE_NAME = "favorites";

const AUTHORIZATION_KEY = "4Mu0qDn_RNZefQkqtQUokdytdwdA6VsKMdpbG9_5zJU";

const galleryPrevButton = "galleryPrevButton"
const galleryNextButton = "galleryNextButton"

const PER_PAGE_NUM = 10;

const ORIENTATION = Object.freeze({
    ALL: "",
    LANDSCAPE: "landscape",
    PORTRAIT: "portrait",
    SQUARISH: "squarish",
});

const fragment = document.createDocumentFragment();
const gallery = document.querySelector("#gallery");
const galleryFav = document.querySelector("#gallery-fav");

const buscador = document.querySelector("#Buscador");
const boton = document.querySelector("#boton-buscar");

let currentGalleryPage = 1;
let currentFavoritePage = 1;

//boton de buscar
boton.addEventListener("click", async (ev) => {
    try {
        userSearchInput = buscador.value
        const imageData = await getDataQuery(buscador.value, ORIENTATION.ALL, 1);
        printGallery(imageData.images, gallery);
    } catch (error) {
        console.log(error);
    }
});

document.addEventListener("click", (event) => {
    // click en boton favoritos
    if (event.target.dataset.buttonId === "favButton") {
        const {id, src, alt} = event.target.dataset;
        const newFavoritesData = new Map(loadFavorites());

        if (!newFavoritesData.has(id)) { 
            event.target.innerText = "❤️";
            newFavoritesData.set(id, {id, src, alt});
        }
        else {
            event.target.innerText = "🩶"
            newFavoritesData.delete(id);
        }

        saveFavorites(newFavoritesData);

        printGallery(newFavoritesData.values(), galleryFav, false);
    }
});

// click en pagina sigiente/anterior
gallery.addEventListener("click", async(event) => {
    if (event.target.dataset.buttonId === galleryPrevButton) {
        let prevPageIndex = currentGalleryPage - 1;
        if (prevPageIndex < 1) {
            return;
        }
        const imageData = await getDataQuery(buscador.value, ORIENTATION.ALL, prevPageIndex);
        if(imageData.images.length > 0) {
            currentGalleryPage = prevPageIndex;
            printGallery(imageData.images, gallery);
        }
    } else if (event.target.dataset.buttonId === galleryNextButton) {
        let nextPageIndex = currentGalleryPage + 1
        const imageData = await getDataQuery(buscador.value, ORIENTATION.ALL, nextPageIndex);
        if(imageData.images.length > 0) {
            currentGalleryPage = nextPageIndex;
            printGallery(imageData.images, gallery);
        }
    }
});

// funcion de llamada a la API que devuelve promesa con la info de la API
const obtenerDatosDeLaAPI = async (path) => {
    try {
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
    } catch (error) {
        throw new Error("Failed to connect.");
    }
};

// a getDataQuery le pasas una string the tags (lo que escribe el usuario en el buscador)
// tambien le pasas la orientacion de las imagenes, y la pagina de la galeria
// te devuelve un objecto con dos parametros
// images: un array de objetos con {id, src, alt}. src y alt se usa para las imagenes (<img src=... alt=...>)
// page_num: el numero maximo de imagenes que hay en toda la api con la query que has escrito
const getDataQuery = async (query, orientation, page, perPage = PER_PAGE_NUM) => {
    let queryString = query.trim();
    const regex = /^[a-zA-Z0-9À-ÿ\-\s]+$/;
    if (!regex.test(queryString)) {
        return {
            images: [],
            page_num: 0
        };
    }
    queryString = queryString.split(" ").map(word => word.trim()).filter(word => word !== "").join("+");
    const orientationCommand = orientation === "" ? "" : `&orientation=${orientation}`;
    const data = await obtenerDatosDeLaAPI(`https://api.unsplash.com/search/photos?page=${page}&per_page=${perPage}&query=${queryString}${orientationCommand}`);
    return {
        images: data.results.map(({ id, urls: { small }, alt_description }) => {
            return {
                id: id,
                src: small,
                alt: alt_description,
            }
        }),
        page_num: data.total_pages
    };
};

// devuelve un mapa con las imagenes favoritas del local storage
const loadFavorites = () => {
    return new Map(JSON.parse(localStorage.getItem(FAVORITES_STORAGE_NAME)));
};

// guarda un mapa con las imagenes favoritas en el local storage
const saveFavorites = (favoritesData) => {
    localStorage.setItem(FAVORITES_STORAGE_NAME, JSON.stringify(Array.from(favoritesData)));
};

// printea imagenes en la section del html con el id="gallery"
const printGallery = (imageArray, gallerySection, hasPagination = true) => {
    gallerySection.innerHTML = "";

    if (imageArray.length <= 0) return;

    const favoritesData = loadFavorites();

    imageArray.forEach(({ id, src, alt }) => {
        const divElement = document.createElement("div");
        const imgElement = document.createElement("img");
        imgElement.src = src;
        imgElement.alt = alt;
        const favElement = document.createElement("button")
        favElement.innerText = favoritesData.has(id) ? "❤️" : "🩶"
        favElement.dataset.buttonId = "favButton";
        favElement.dataset.id = id;
        favElement.dataset.src = src;
        favElement.dataset.alt = alt;

        divElement.appendChild(imgElement);
        divElement.appendChild(favElement);
        fragment.appendChild(divElement);
    });

    gallerySection.appendChild(fragment);

    if (hasPagination) {
        const arrowL = document.createElement("button")
        arrowL.innerText = "Anterior";
        arrowL.dataset.buttonId = galleryPrevButton
        gallerySection.appendChild(arrowL);

        const pageNumElement = document.createElement("p");
        pageNumElement.innerText = currentGalleryPage;
        gallerySection.appendChild(pageNumElement);

        const arrowR = document.createElement("button")
        arrowR.innerText = "Siguiente";
        arrowR.dataset.buttonId = galleryNextButton
        gallerySection.appendChild(arrowR);
    }
};

const init = () => {
    const favoritesData = loadFavorites();
    printGallery(favoritesData.values(), galleryFav, false);
};

init();