import { supabase } from "./supabaseClient.js";

const searchForm = document.querySelector("#searchForm");
const searchResults = document.querySelector("#searchResults");
const searchSection = document.querySelector("#search");
const findItemButton = document.querySelector("#findItemButton");

// Category / location dropdown values -> words used in saved reports.
const CATEGORY_WORDS = {
    electronics: ["Electronics"],
    documents: ["Documents"],
    accessories: ["Accessories"],
    books: ["Books", "Stationery"],
    personal: ["Personal", "Bags"],
    other: ["Other"]
};

const LOCATION_WORDS = {
    library: ["library"],
    classroom: ["lecture", "classroom", "hall"],
    lab: ["lab"],
    cafeteria: ["cafeteria", "cafe", "canteen"],
    parking: ["parking"]
};

// Remove characters that would break a PostgREST filter string.
function clean(text) {
    return text.replace(/[,()%*\\"]/g, " ").replace(/\s+/g, " ").trim();
}

function showResultsArea() {
    searchResults.replaceChildren();
}

function showMessage(title, text, withLinks = false) {
    showResultsArea();

    const box = document.createElement("div");
    box.className = "search-message";

    const heading = document.createElement("h3");
    heading.textContent = title;

    const body = document.createElement("p");
    body.textContent = text;

    box.append(heading, body);

    if (withLinks) {
        const links = document.createElement("div");
        links.className = "search-message-links";

        const lost = document.createElement("a");
        lost.href = "lost-items.html";
        lost.textContent = "Report it as lost";

        const found = document.createElement("a");
        found.href = "report-item.html";
        found.textContent = "Report it as found";

        links.append(lost, found);
        box.appendChild(links);
    }

    searchResults.appendChild(box);
}

function buildCard(item) {
    const card = document.createElement("article");
    card.className = "item-card";

    if (item.image_url) {
        const image = document.createElement("img");
        image.src = item.image_url;
        image.alt = item.item_name;
        image.addEventListener("error", () => image.remove());
        card.appendChild(image);
    }

    const type = item.type === "found" ? "found" : "lost";

    const badge = document.createElement("p");
    badge.className = `item-status ${type}`;
    badge.textContent = type.toUpperCase();

    const name = document.createElement("h3");
    name.textContent = item.item_name;

    const category = document.createElement("p");
    category.textContent = `Category: ${item.category}`;

    const location = document.createElement("p");
    location.textContent =
        `${type === "found" ? "Found at" : "Last seen"}: ${item.location}`;

    card.append(badge, name, category, location);

    if (item.description) {
        const description = document.createElement("p");
        description.textContent = item.description;
        card.appendChild(description);
    }

    return card;
}

async function runSearch() {
    const formData = new FormData(searchForm);
    const term = clean(formData.get("item") || "");
    const category = formData.get("category");
    const location = formData.get("location");

    if (!term && !category && !location) {
        showMessage(
            "Type something to search",
            "Enter an item name or pick a category or location."
        );
        return;
    }

    showMessage("Searching...", "Looking through reported items.");

    let query = supabase
        .from("items")
        .select("*")
        .order("created_at", { ascending: false });

    if (term) {
        const pattern = `%${term}%`;
        query = query.or(
            `item_name.ilike.${pattern},description.ilike.${pattern},` +
            `category.ilike.${pattern},location.ilike.${pattern}`
        );
    }

    if (category && CATEGORY_WORDS[category]) {
        const filters = CATEGORY_WORDS[category]
            .map((word) => `category.ilike.%${word}%`)
            .join(",");
        query = query.or(filters);
    }

    if (location && LOCATION_WORDS[location]) {
        const filters = LOCATION_WORDS[location]
            .map((word) => `location.ilike.%${word}%`)
            .join(",");
        query = query.or(filters);
    }

    const { data, error } = await query;

    if (error) {
        console.error(error);
        showMessage(
            "Search failed",
            "We could not search right now. Please try again."
        );
        return;
    }

    if (!data || data.length === 0) {
        const what = term ? `"${term}"` : "that search";
        showMessage(
            "Not reported",
            `No one has reported ${what} yet. If it is yours or you found it, you can report it now.`,
            true
        );
        return;
    }

    showResultsArea();

    const heading = document.createElement("h3");
    heading.className = "search-count";
    heading.textContent =
        `${data.length} reported item${data.length === 1 ? "" : "s"} found`;

    const grid = document.createElement("div");
    grid.className = "search-grid";
    data.forEach((item) => grid.appendChild(buildCard(item)));

    searchResults.append(heading, grid);
}

searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await runSearch();
    searchResults.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

// "Find My Item": scroll down to the search box and focus it.
findItemButton?.addEventListener("click", (event) => {
    event.preventDefault();
    searchSection.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
        searchForm.querySelector("input[name='item']").focus({ preventScroll: true });
    }, 600);
});