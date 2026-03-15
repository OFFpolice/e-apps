const EPORNER_API = "https://www.eporner.com/api/v2/video/search/";

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const videoContainer = document.getElementById("video-container");

const loadingEl = document.getElementById("loading");
const noResultsEl = document.getElementById("no-results");
const endMessageEl = document.getElementById("end-message");
const errorMessageEl = document.getElementById("error-message");

// === Telegram WebApp ===
let tg = null;

if (window.Telegram && window.Telegram.WebApp) {
    tg = window.Telegram.WebApp;

    tg.ready();
    tg.expand();
    tg.disableVerticalSwipes();
    tg.enableClosingConfirmation();
    tg.lockOrientation();
}

const tabs = document.querySelectorAll(".tab");
const links = document.querySelectorAll(".bottom-nav .nav-button");
const loadedVideos = new WeakSet();

function handleTabVideos(activeTabId) {
    tabs.forEach(tab => {
        const video = tab.querySelector(".bg-video");
        if (!video) return;

        if (tab.id === activeTabId) {
            if (!loadedVideos.has(video)) {
                video.src = video.dataset.src;
                loadedVideos.add(video);
            }
            video.play().catch(() => {});
        } else {
            video.pause();
        }
    });
}

if (tg) {
    tg.BackButton.onClick(() => {
        setActiveTab("home");
        tg.BackButton.hide();
    });
}

function setActiveTab(target) {
    const activeTabId = "tab-" + target;

    tabs.forEach(t => t.classList.remove("active"));
    document.getElementById(activeTabId).classList.add("active");

    links.forEach(l => l.classList.remove("active"));
    document.querySelector(`[data-tab="${target}"]`).classList.add("active");

    handleTabVideos(activeTabId);

    if (tg) {
        target !== "home" ? tg.BackButton.show() : tg.BackButton.hide();
    }
}
links.forEach(link => {
    link.addEventListener("click", () => {
        setActiveTab(link.dataset.tab);
    });
});

setActiveTab("home");

// === SEARCH STATE ===
let currentQuery = "";
let currentPage = 1;
let totalPages = 0;
let isLoading = false;
let reachedEnd = false;

// Build Eporner API URL
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

// Load videos
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

// Render video cards
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

// === Infinite scroll ===
window.addEventListener("scroll", () => {
    if (reachedEnd || isLoading) return;

    const scrollPos = window.innerHeight + window.scrollY;
    const threshold = document.body.offsetHeight - 400;

    if (scrollPos >= threshold) {
        loadVideos(false);
    }
});

// === Form ===
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
