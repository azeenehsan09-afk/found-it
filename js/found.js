
import { supabase } from "./supabaseClient.js";

const foundItemForm = document.querySelector("#foundItemForm");
const foundItemsList = document.querySelector("#foundItemsList");
const formMessage = document.querySelector("#formMessage");
const submitButton = document.querySelector("#submitFoundButton");

// Display messages
function showMessage(message, type = "error") {
    formMessage.textContent = message;
    formMessage.style.color =
        type === "success" ? "#5EEAD4" : "#ff7777";
}

// Load all found items
async function loadFoundItems() {
    foundItemsList.textContent = "Loading found items...";

    const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("type", "found")
        .order("created_at", { ascending: false });

    if (error) {
        foundItemsList.textContent = "Unable to load found items.";
        console.error(error);
        return;
    }

    foundItemsList.replaceChildren();

    if (data.length === 0) {
        foundItemsList.textContent = "No found items reported yet.";
        return;
    }

    data.forEach((item) => {
        const card = document.createElement("article");
        card.className = "item-card";

        if (item.image_url) {
            const image = document.createElement("img");
            image.src = item.image_url;
            image.alt = item.item_name;
            image.addEventListener("error", () => image.remove());
            card.appendChild(image);
        }

        const name = document.createElement("h3");
        name.textContent = item.item_name;

        const category = document.createElement("p");
        category.textContent = `Category: ${item.category}`;

        const location = document.createElement("p");
        location.textContent = `Found at: ${item.location}`;

        const description = document.createElement("p");
        description.textContent =
            item.description || "No description provided.";

        const status = document.createElement("span");
        status.className = "item-status";
        status.textContent = item.status;

        card.append(name, category, location, description, status);
        foundItemsList.appendChild(card);
    });
}

// Submit a found item report
foundItemForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    showMessage("");
    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    try {
        // Check logged-in user
        const { data: { user }, error: authError } =
            await supabase.auth.getUser();

        if (authError || !user) {
            showMessage("Please log in before submitting a report.");
            return;
        }

        // Collect form values
        const item = {
            user_id: user.id,
            type: "found",
            item_name: document.querySelector("#itemName").value.trim(),
            category: document.querySelector("#category").value,
            description: document.querySelector("#description").value.trim(),
            item_date: document.querySelector("#itemDate").value || null,
            location: document.querySelector("#location").value.trim(),
            image_url: document.querySelector("#imageUrl").value.trim() || null
        };

        // Insert into Supabase
        const { error } = await supabase
            .from("items")
            .insert(item);

        if (error) {
            throw error;
        }

        showMessage("Found item reported successfully!", "success");

        foundItemForm.reset();

        // Refresh the item list
        await loadFoundItems();

    } catch (error) {
        console.error(error);
        showMessage(error.message || "Something went wrong.");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Submit Found Report";
    }
});

// Load reports when page opens
loadFoundItems();
