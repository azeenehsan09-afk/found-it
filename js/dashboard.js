import { supabase } from "./supabaseClient.js";

const welcomeMessage = document.querySelector("#welcomeMessage");
const logoutButton = document.querySelector("#logoutButton");

async function loadDashboard() {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        window.location.href = "login.html";
        return;
    }

    const name = user.user_metadata?.full_name || user.email;
    welcomeMessage.textContent = `Welcome, ${name}. You are logged in.`;
}

logoutButton.addEventListener("click", async () => {
    logoutButton.disabled = true;

    const { error } = await supabase.auth.signOut();

    if (error) {
        welcomeMessage.textContent = error.message;
        logoutButton.disabled = false;
        return;
    }

    window.location.href = "login.html";
});

loadDashboard();
