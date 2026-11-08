import { supabase } from "./supabaseClient.js";

const list = document.querySelector("#allItemsList");
const count = document.querySelector("#itemsCount");
const filterButtons = document.querySelectorAll(".filter-button");

let allItems = [];
let currentFilter = "all";

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

    const badge = document.createElement("span");
    badge.className = `item-status ${type}`;
    badge.textContent = type.toUpperCase();

    const name = document.createElement("h3");
    name.textContent = item.item_name;

    const category = document.createElement("p");
    category.textContent = `Category: ${item.category}`;

    const location = document.createElement("p");
    location.textContent =
        `${type === "found" ? "Found at" : "Last seen"}: ${item.location}`;

    const description = document.createElement("p");
    description.textContent = item.description || "No description provided.";

    card.append(badge, name, category, location, description);

    if (item.item_date) {
        const date = document.createElement("p");
        date.textContent =
            `${type === "found" ? "Date found" : "Date lost"}: ${item.item_date}`;
        card.appendChild(date);
    }

    return card;
}

function render() {
    const items = currentFilter === "all"
        ? allItems
        : allItems.filter((item) => item.type === currentFilter);

    list.replaceChildren();

    if (items.length === 0) {
        count.textContent = "";
        list.textContent = currentFilter === "all"
            ? "No items reported yet."
            : `No ${currentFilter} items reported yet.`;
        return;
    }

    count.textContent = `${items.length} item${items.length === 1 ? "" : "s"}`;
    items.forEach((item) => list.appendChild(buildCard(item)));
}

async function loadItems() {
    const { data, error } = await supabase
        .from("items")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        list.textContent = "Unable to load items.";
        return;
    }

    allItems = data || [];
    render();
}

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;
        filterButtons.forEach((b) => b.classList.toggle("active", b === button));
        render();
    });
});

loadItems();