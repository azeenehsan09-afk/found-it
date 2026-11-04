import { supabase } from "./supabaseClient.js";

const loginForm = document.querySelector("#loginForm");
const signupForm = document.querySelector("#signupForm");

function showMessage(message, type = "error") {
    const messageBox = document.querySelector("#formMessage");
    if (!messageBox) return;

    messageBox.textContent = message;
    messageBox.className = `form-message ${type}`;
}

function setLoading(isLoading) {
    const button = document.querySelector("#submitButton");
    if (!button) return;

    button.disabled = isLoading;
    button.textContent = isLoading
        ? "Please wait..."
        : (loginForm ? "Login" : "Create account");
}

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        showMessage("");

        const email = document.querySelector("#email").value.trim();
        const password = document.querySelector("#password").value;

        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        setLoading(false);

        if (error) {
            showMessage(error.message);
            return;
        }

        window.location.href = "dashboard.html";
    });
}

if (signupForm) {
    signupForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        showMessage("");

        const fullName = document.querySelector("#fullName").value.trim();
        const email = document.querySelector("#email").value.trim();
        const password = document.querySelector("#password").value;
        const confirmPassword = document.querySelector("#confirmPassword").value;

        if (password !== confirmPassword) {
            showMessage("Passwords do not match.");
            return;
        }

        if (password.length < 8) {
            showMessage("Password must be at least 8 characters.");
            return;
        }

        setLoading(true);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        });

        setLoading(false);

        if (error) {
            showMessage(error.message);
            return;
        }

        if (data.session) {
            window.location.href = "dashboard.html";
        } else {
            showMessage(
                "Account created. Check your email for the confirmation link, then log in.",
                "success"
            );
        }
    });
}
