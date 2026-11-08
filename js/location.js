import { supabase } from "./supabaseClient.js";

const tiles = document.querySelectorAll(".location-container article");
const results = document.querySelector("#locationResults");

// Tile key -> words that may appear in the saved "location" text.
const LOCATION_WORDS = {
    library: ["library"],
    lecture: ["lecture", "classroom", "hall"],
    lab: ["lab"],
    cafeteria: ["cafeteria", "cafe", "canteen"],
    parking: ["parking"],
    common: ["common", "courtyard", "garden", "lounge", "plaza"]
};

function showMessage(title, text, withLinks = false) {
    results.replaceChildren();

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
        found.href = "found-items.html";
        found.textContent = "Report it as found";

        links.append(lost, found);
        box.appendChild(links);
    }

    results.appendChild(box);
}

function buildCard(item) {
    const type = item.type === "found" ? "found" : "lost";

    const card = document.createElement("article");
    card.className = "item-card";

    if (item.image_url) {
        const image = document.createElement("img");
        image.src = item.image_url;
        image.alt = item.item_name;
        image.addEventListener("error", () => image.remove());
        card.appendChild(image);
    }

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

async function showLocation(tile) {
    const key = tile.dataset.location;
    const title = tile.dataset.title;
    const words = LOCATION_WORDS[key] || [key];

    tiles.forEach((t) => t.classList.toggle("active", t === tile));
    showMessage("Searching...", `Looking for items reported at ${title}.`);

    const { data, error } = await supabase
        .from("items")
        .select("*")
        .or(words.map((word) => `location.ilike.%${word}%`).join(","))
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        showMessage("Search failed", "We could not load items right now. Please try again.");
        return;
    }

    if (!data || data.length === 0) {
        showMessage(
            "Not reported",
            `No lost or found items have been reported at ${title} yet.`,
            true
        );
    } else {
        results.replaceChildren();

        const heading = document.createElement("h3");
        heading.className = "search-count";
        heading.textContent =
            `${data.length} reported item${data.length === 1 ? "" : "s"} at ${title}`;

        const grid = document.createElement("div");
        grid.className = "search-grid";
        data.forEach((item) => grid.appendChild(buildCard(item)));

        results.append(heading, grid);
    }

    results.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

tiles.forEach((tile) => {
    tile.addEventListener("click", () => showLocation(tile));
    tile.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            showLocation(tile);
        }
    });
});