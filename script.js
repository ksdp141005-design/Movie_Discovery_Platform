const API_URL = "https://www.omdbapi.com/?apikey=7fa0ee5a";

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const homeBtn = document.getElementById("homeBtn");

const movieResults = document.getElementById("movieResults");
const favourites = document.getElementById("favourites");
const favouritesHeading = document.getElementById("favouritesHeading");
const pagination = document.getElementById("pagination");

let favouriteMovies =
JSON.parse(localStorage.getItem("favourite")) || [];

let currentPage = 1;
let currentQuery = "";
let totalResults = 0;

document.addEventListener(
    "DOMContentLoaded",
    displayFavourites
);

/* =========================
   SEARCH MOVIES
========================= */

async function fetchMovies(query, page = 1){

    try{

        movieResults.innerHTML =
        `
        <p class="loading">
            🔍 Searching movies...
        </p>
        `;

        const response =
        await fetch(
            `${API_URL}&s=${encodeURIComponent(query)}&page=${page}`
        );

        const data =
        await response.json();

        if(data.Response !== "True"){

            movieResults.innerHTML =
            `
            <p class="empty-message">
                No movies found for "${query}"
            </p>
            `;

            pagination.innerHTML = "";
            return;
        }

        currentQuery = query;
        currentPage = page;
        totalResults = Number(data.totalResults);

        displayMovies(data.Search);

        renderPagination();

    }
    catch(error){

        console.error(error);

        movieResults.innerHTML =
        `
        <p class="empty-message">
            Something went wrong.
        </p>
        `;
    }
}

/* =========================
   DISPLAY MOVIES
========================= */

function displayMovies(movies){

    movieResults.innerHTML = "";

    movies.forEach(movie => {

        const isFavourite =
        favouriteMovies.some(
            fav => fav.id === movie.imdbID
        );

        const poster =
        movie.Poster !== "N/A"
        ? movie.Poster
        : "https://placehold.co/230x330?text=No+Poster";

        const movieCard =
        document.createElement("div");

        movieCard.classList.add("movie-card");

        movieCard.innerHTML = `
            <img src="${poster}" alt="${movie.Title}">

            <div class="movie-content">

                <span class="movie-type">
                    ${movie.Type}
                </span>

                <h3>${movie.Title}</h3>

                <p>${movie.Year}</p>

            </div>
        `;

        const content =
        movieCard.querySelector(".movie-content");

        const button =
        document.createElement("button");

        if(isFavourite){

            button.textContent =
            "✓ Added to Favourites";

            button.classList.add(
                "added-btn"
            );

            button.disabled = true;

        }else{

            button.textContent =
            "+ Add to Favourites";

            button.classList.add(
                "add-btn"
            );

            button.addEventListener(
                "click",
                () => {

                    addToFavourite(
                        movie.imdbID,
                        movie.Title,
                        poster,
                        movie.Year,
                        movie.Type
                    );
                }
            );
        }

        content.appendChild(button);

        movieResults.appendChild(
            movieCard
        );
    });
}

/* =========================
   ADD TO FAVOURITES
========================= */

function addToFavourite(
    id,
    title,
    poster,
    year,
    type
){

    const exists =
    favouriteMovies.some(
        movie => movie.id === id
    );

    if(exists){
        return;
    }

    favouriteMovies.push({
        id,
        title,
        poster,
        year,
        type
    });

    localStorage.setItem(
        "favourite",
        JSON.stringify(favouriteMovies)
    );

    displayFavourites();

    if(currentQuery){
        fetchMovies(
            currentQuery,
            currentPage
        );
    }
}

/* =========================
   DISPLAY FAVOURITES
========================= */

function displayFavourites(){

    favourites.innerHTML = "";

    favouritesHeading.innerText =
    `❤️ My Favourites (${favouriteMovies.length})`;

    if(favouriteMovies.length === 0){

        favourites.innerHTML =
        `
        <p class="empty-message">
            No favourite movies yet.
        </p>
        `;

        return;
    }

    favouriteMovies.forEach(movie => {

        const movieCard =
        document.createElement("div");

        movieCard.classList.add("movie-card");

        movieCard.innerHTML =

        `
        <img src="${movie.poster}" alt="${movie.title}">

        <div class="movie-content">

            <span class="movie-type">
                ${movie.type}
            </span>

            <h3>
                ${movie.title}
            </h3>

            <p>
                ${movie.year}
            </p>

            <button
                class="remove-btn"
                onclick="removeFavourites('${movie.id}')">

                Remove

            </button>

        </div>
        `;

        favourites.appendChild(movieCard);
    });
}

/* =========================
   REMOVE FAVOURITES
========================= */

function removeFavourites(id){

    favouriteMovies =
    favouriteMovies.filter(
        movie => movie.id !== id
    );

    localStorage.setItem(
        "favourite",
        JSON.stringify(favouriteMovies)
    );

    displayFavourites();

    if(currentQuery){
        fetchMovies(
            currentQuery,
            currentPage
        );
    }
}

/* =========================
   PAGINATION
========================= */

function renderPagination(){

    const totalPages =
    Math.ceil(totalResults / 10);

    pagination.innerHTML =

    `
    <button
        id="prevBtn"
        ${currentPage === 1 ? "disabled" : ""}>

        ◀ Previous

    </button>

    <span>

        Page ${currentPage}
        of ${totalPages}

    </span>

    <button
        id="nextBtn"
        ${currentPage === totalPages ? "disabled" : ""}>

        Next ▶

    </button>
    `;

    const prevBtn =
    document.getElementById("prevBtn");

    const nextBtn =
    document.getElementById("nextBtn");

    if(prevBtn){

        prevBtn.addEventListener(
            "click",
            () => {

                fetchMovies(
                    currentQuery,
                    currentPage - 1
                );
            }
        );
    }

    if(nextBtn){

        nextBtn.addEventListener(
            "click",
            () => {

                fetchMovies(
                    currentQuery,
                    currentPage + 1
                );
            }
        );
    }
}

/* =========================
   SEARCH BUTTON
========================= */

searchBtn.addEventListener(
    "click",
    () => {

        const query =
        searchInput.value.trim();

        if(query){

            fetchMovies(query, 1);
        }
    }
);

/* =========================
   ENTER KEY SEARCH
========================= */

searchInput.addEventListener(
    "keypress",
    (e) => {

        if(e.key === "Enter"){

            searchBtn.click();
        }
    }
);

/* =========================
   HOME BUTTON
========================= */

homeBtn.addEventListener(
    "click",
    () => {

        searchInput.value = "";

        currentQuery = "";
        currentPage = 1;
        totalResults = 0;

        movieResults.innerHTML = "";
        pagination.innerHTML = "";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
);