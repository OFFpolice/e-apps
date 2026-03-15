const EPORNER_API = "https://www.eporner.com/api/v2/video/search/";

let currentQuery = "";
let currentPage = 1;
let totalPages = 0;
let isLoading = false;
let reachedEnd = false;

function buildApiUrl(query, page) {
    return (
        EPORNER_API +
        "?" +
        new URLSearchParams({
            query,
            per_page: "10",
            page: String(page),
            thumbsize: "big",
            order: "top-weekly",
            gay: "1",
            lq: "1",
            format: "json"
        })
    );
}

async function loadVideos(isNewSearch = false) {
    if (isLoading || reachedEnd) return;
    if (!currentQuery) return;

    isLoading = true;
    loadingEl.style.display = "block";
    errorMessageEl.style.display = "none";

    if (isNewSearch) {
        videoContainer.innerHTML = "";
        reachedEnd = false;
        noResultsEl.style.display = "none";
        endMessageEl.style.display = "none";
    }

    const url = buildApiUrl(currentQuery, currentPage);

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("API returned error");

        const data = await response.json();

        totalPages = data.total_pages ?? 0;
        const videos = data.videos || [];

        if (videos.length === 0 && isNewSearch) {
            noResultsEl.style.display = "block";
            loadingEl.style.display = "none";
            reachedEnd = true;
            return;
        }

        renderVideos(videos);

        currentPage++;

        if (currentPage > totalPages) {
            reachedEnd = true;
            endMessageEl.style.display = "block";
        }
    } catch (err) {
        console.error(err);
        errorMessageEl.style.display = "block";
    }

    loadingEl.style.display = "none";
    isLoading = false;
}

function renderVideos(videos) {
    videos.forEach(video => {
        const thumb =
            video.thumbs?.[0]?.src ||
            "https://static-ca-cdn.eporner.com/thumbs/static4/1/12/120/12098433/1_360.jpg";

        const card = document.createElement("div");
        card.className = "col-12 col-sm-6 col-md-4 col-lg-3 mb-4";

        card.innerHTML = `
            <div class="card h-100 glass-card">
                <img src="${thumb}" class="card-img-top" alt="Preview">
                <div class="card-body">
                    <h5 class="card-title">${video.title || "No title"}</h5>
                    <a href="${video.embed || "#"}" target="_blank" class="btn btn-success w-100">▶ PLAY</a>
                </div>
            </div>
        `;

        videoContainer.appendChild(card);
    });
}

window.addEventListener("scroll", () => {
    if (reachedEnd || isLoading) return;

    const scrollPos = window.innerHeight + window.scrollY;
    const threshold = document.body.offsetHeight - 400;

    if (scrollPos >= threshold) {
        loadVideos(false);
    }
});

const customForm = document.getElementById("custom-form");

searchBtn.addEventListener("click", () => {
    const query = searchInput.value.trim();

    if (!query) {
        customForm.textContent = "Enter a word: Yua Mikami.";
        customForm.style.display = "block";
        return;
    }  

    customForm.textContent = "";  
    customForm.style.display = "none";

    currentQuery = query;  
    currentPage = 1;  
    reachedEnd = false;  
    isLoading = false;  
    totalPages = 0;  

    loadVideos(true);
});

searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
    }
});

searchInput.addEventListener("input", () => {
    customForm.textContent = "";  
    customForm.style.display = "none";
});
