let debounceTimer;
let currentPage = 1; 
const resultsPerPage = 30;
let maxVisiblePages = 20; 
let visiblePageStart = 1;

document.getElementById("search-form").addEventListener("submit", function (e) {
    e.preventDefault();
    if (debounceTimer) {
        clearTimeout(debounceTimer);  // pulire il timer
    }  
    debounceTimer = setTimeout(() => {
        currentPage = 1;
        visiblePageStart = 1;
        const query = document.getElementById("search-input").value.trim();
        const type = document.getElementById("search-type").value;

        // Validazione minima
        if (query.length < 3) {
            alert("Non esiste una repo con il nome che è stato cercato");
            document.querySelector(".spinner-5").classList.add(`d-none`);
            document.querySelector("nav").style.display = "block";
            document.querySelector(".pagi").style.display = "none";
            
            document.getElementById("search-input").value = "";
            document.getElementById("search-type").value ="seleziona"; 
        
            document.getElementById("search-input").focus();
            return;
        }

        // fare la chiamata del API
        searchGitHub(query, type, currentPage);
    }, 700);

// il loader
document.querySelector(".spinner-5").classList.remove(`d-none`);
document.querySelector(".spinner-5").classList.add('d-flex', 'align-items-center', 'justify-content-center');

document.querySelector("nav").style.display = "none";
document.querySelector(".pagi").style.display = "none";  

const resultsContainer = document.getElementById("results-container");
resultsContainer.innerHTML = "";  
});

function searchGitHub(query, type, page) {
    const url = `https://api.github.com/search/${type}?q=${query}&per_page=${resultsPerPage}&page=${page}`;  // URL della API

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const resultsContainer = document.getElementById("results-container");

            // sparire il loader e torna il nav
            document.querySelector(".spinner-5").classList.add(`d-none`);
            document.querySelector("nav").style.display = "block";
            document.querySelector(".pagi").style.display = "block"

            // Limpiar resultados
            resultsContainer.innerHTML = '';

            if (data.items.length === 0) {
                resultsContainer.innerHTML = `<p>No results found.</p>`;
                return;
            }

            data.items.forEach(item => {
                if (type === "repositories") {
                    resultsContainer.appendChild(createRepoCard(item));
                } else if (type === "users") {
                    resultsContainer.appendChild(createUserCard(item));
                }
            });
            // calcolare il totale
            const totalResults = data.total_count;
            const totalPages = Math.ceil(totalResults / resultsPerPage);

           
            generatePagination(totalPages);
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById("loader").style.display = "none"; 
            alert('An error occurred. Please try again.');
        });
}

// funzione per generare paginazione
function generatePagination(totalPages) {
    const paginationContainer = document.getElementById("pagination-container");
    paginationContainer.innerHTML = '';  

    const prevItem = document.createElement("li");
    prevItem.classList.add("page-item");
    if (currentPage === 1) {
        prevItem.classList.add("disabled");  
    }
    prevItem.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`;
    prevItem.addEventListener("click", function (e) {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            if (currentPage < visiblePageStart) {
                visiblePageStart--; 
            }
            searchGitHub(document.getElementById("search-input").value.trim(), document.getElementById("search-type").value, currentPage);
        }
    });
    paginationContainer.appendChild(prevItem);

    for (let i = visiblePageStart; i < visiblePageStart + maxVisiblePages && i <= totalPages; i++) {
        const pageItem = document.createElement("li");
        pageItem.classList.add("page-item");
        if (i === currentPage) {
            pageItem.classList.add("active");
        }
        pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        pageItem.addEventListener("click", function (e) {
            e.preventDefault();
            currentPage = i;
            searchGitHub(document.getElementById("search-input").value.trim(), document.getElementById("search-type").value, currentPage);
        });
        paginationContainer.appendChild(pageItem);
    }

    const nextItem = document.createElement("li");
    nextItem.classList.add("page-item");
    if (currentPage === totalPages) {
        nextItem.classList.add("disabled");  
    }
    nextItem.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`;
    nextItem.addEventListener("click", function (e) {
        e.preventDefault();
        if (currentPage < totalPages) {
            currentPage++;
            if (currentPage >= visiblePageStart + maxVisiblePages) {
                visiblePageStart++; 
            }
            searchGitHub(document.getElementById("search-input").value.trim(), document.getElementById("search-type").value, currentPage);
        }
    });
    paginationContainer.appendChild(nextItem);
}

// Funzione per fare card repositories
function createRepoCard(repo) {
    const card = document.createElement("div");
    card.classList.add("card", "card-git");

    card.innerHTML = `
        <div class="card-h rounded-top"></div>
        <div class="lalo">
            <img class="circle" src="${repo.owner.avatar_url}" alt="Avatar">
        </div>
        <div class="card-b">
            <h5 class="card-title">${repo.name}</h5>
            <p class="card-text">${repo.description || "No description available."}</p>
            <div class="mt-3">
                <p class="card-text mb-0 mx-3"><i class="fa-solid fa-star"></i> ${repo.stargazers_count || "No issues available."}</p>
                <hr class="my-2">
                <p class="card-text mb-0 mx-3"><i class="fa-solid fa-circle-exclamation"></i> ${repo.open_issues_count || "No issues available."}</p>
            </div>
        </div>
        <div class="card-footer text-body-secondary d-flex justify-content-center mare">
            <a href="${repo.html_url}" target="_blank" class="card-link link-underline-light text-dark">Vai al repo <i class="fas fa-arrow-up-right-from-square"></i></a>
        </div>
    `;

    return card;
}

// Funzione per fare card user
function createUserCard(user) {
    const card = document.createElement("div");
    card.classList.add("card", "card-git");

    const polygonClass = user.type === 'User' ? 'verde' : 'rosa'; 

    card.innerHTML = `
        <div class="card-h rounded-top ${polygonClass}"></div>
        <div class="lalo">
            <img class="circle" src="${user.avatar_url}" alt="Avatar">
        </div>
        <div class="card-b">
            <h5 class="card-title">${user.login}</h5>
            <p><strong>Profilo:</strong> ${user.type}</p>
        </div>
        <div class="card-footer text-body-secondary d-flex justify-content-center mare">
            <a href="${user.html_url}" target="_blank" class="card-link link-underline-light text-dark">Vai al profilo <i class="fas fa-arrow-up-right-from-square"></i></a>
        </div>
    `;

    return card;
}