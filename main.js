const apiKey = localStorage.getItem("apiKey")

// const apiKey = "643139e0-bf1b-4a93-b062-6391abe593ec"

const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");

document.getElementById("searchButton").addEventListener("click", function() {
    localStorage.setItem("searchQuery", searchInput.value.trim());
    performSearch();
});

searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        localStorage.setItem("searchQuery", searchInput.value.trim());
        performSearch();
    }
});

document.getElementById("accountButton").addEventListener("click", function() {
    window.location.href = 'account.html'
});

async function performSearch() {
    const query = searchInput.value.trim();

    searchResults.innerHTML = "";

    if (query.length === 0) {
        searchResults.innerHTML = "";
        return;
    }

    const response = await fetch(`https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=${encodeURIComponent(query)}`, {
        headers: {
            "accept": "application/json",
            "X-API-KEY": apiKey
        }
    });

    if (!response.ok) {
        if (apiKey === "") {
            alert('Введите ключ аккаунта на странице аккаунт. \n Если у вас нет ключа: инструкции для получения также есть на той странице.');
            return;
        }
        if (response.status === 401 || response.status === 403) {
            alert('Ключ аккаунта не найден.');
        } else {
            alert('Произошла ошибка при выполнении запроса');
        }
        return;
    }

    const data = await response.json();

    if (data.films.length === 0) {
        searchResults.innerHTML = "<p>Ничего не найдено</p>";
        return;
    }

    displaySearchResults(data.films);
}

function displaySearchResults(films, isFavorites = false) {
    films.forEach(async film => {
        const genres = Array.isArray(film.genres) ? film.genres.map(genre => genre.genre).join(", ") : film.genres;
        const filmData = JSON.stringify(film).replace(/"/g, '&quot;');
        const filmCard = document.createElement('div');
        filmCard.classList.add('film-card');
        filmCard.setAttribute('data-film', filmData);
        filmCard.innerHTML = `
                    <img src="${film.posterUrl ? film.posterUrl : 'https://via.placeholder.com/150'}" alt="${film.nameRu || film.nameEn}">
                    <div class="film-info">
                        <h2>${film.nameRu || film.nameEn}</h2>
                        <p>Длительность: ${film.filmLength}</p>
                        <p>Год выпуска: ${film.year}</p>
                        <p>Рейтинг: ${film.rating}</p>
                        <p>Жанры: ${genres}</p>
                        <p>ID for bot: ${film.filmId}</p>
                        <button class="show-description-button red-button">Показать описание</button>
                        <p><a class="red-button" href="https://www.kinopoisk.ru/film/${film.filmId}">Страница на кинопоиске</a></p>
                        <p><a class="red-button" href="https://www.kinopoisk.vip/film/${film.filmId}">Смотреть бесплатно</a></p>
                    </div>
                    <p class="film-description">Краткое описание: ${film.description}</p>
                `;
        searchResults.appendChild(filmCard);
    });

    document.querySelectorAll('.show-description-button').forEach(button => {
        button.addEventListener('click', function() {
            const filmInfo = this.closest('.film-card');
            const descriptionElement = filmInfo.querySelector('.film-description');
            if (descriptionElement) {
                const description = descriptionElement.textContent;
                alert(description);
            } else {
                alert('Описание не найдено');
            }
        });
    });
}

function init() {
    const savedQuery = localStorage.getItem("searchQuery");

    if (savedQuery) {
        searchInput.value = savedQuery;
        performSearch();
    }
}

window.addEventListener("DOMContentLoaded", init);