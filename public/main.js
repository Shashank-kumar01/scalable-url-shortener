const urlInput = document.getElementById("urlInput");

const shortenBtn = document.getElementById("shortenBtn");

const buttonText = document.getElementById("buttonText");

const buttonLoader = document.getElementById("buttonLoader");

const buttonArrow = document.getElementById("buttonArrow");

const clearBtn = document.getElementById("clearBtn");

const counter = document.getElementById("counter");

const errorMessage = document.getElementById("errorMessage");

const resultBox = document.getElementById("resultBox");

const shortUrl = document.getElementById("shortUrl");

const copyBtn = document.getElementById("copyBtn");

const openBtn = document.getElementById("openBtn");

const toast = document.getElementById("toast");

const toastText = document.getElementById("toastText");



/* =========================
   INPUT HANDLING
========================= */

urlInput.addEventListener("input", () => {

    const length = urlInput.value.length;

    counter.textContent = `${length} / 2048`;

    if (length > 0) {
        clearBtn.classList.remove("hidden");
    } else {
        clearBtn.classList.add("hidden");
    }

    hideError();
});



/* =========================
   CLEAR BUTTON
========================= */

clearBtn.addEventListener("click", () => {

    urlInput.value = "";

    counter.textContent = "0 / 2048";

    clearBtn.classList.add("hidden");

    resultBox.classList.add("hidden");

    hideError();

    urlInput.focus();
});



/* =========================
   URL VALIDATION
========================= */

function isValidUrl(value) {

    try {

        const url = new URL(value);

        return (
            url.protocol === "http:" ||
            url.protocol === "https:"
        );

    } catch {

        return false;
    }
}



/* =========================
   ERROR
========================= */

function showError(message) {

    errorMessage.textContent = message;

    errorMessage.classList.remove("hidden");
}


function hideError() {

    errorMessage.classList.add("hidden");
}



/* =========================
   LOADING STATE
========================= */

function setLoading(loading) {

    shortenBtn.disabled = loading;

    if (loading) {

        buttonText.textContent = "Creating...";

        buttonLoader.classList.remove("hidden");

        buttonArrow.classList.add("hidden");

    } else {

        buttonText.textContent = "Shorten URL";

        buttonLoader.classList.add("hidden");

        buttonArrow.classList.remove("hidden");
    }
}



/* =========================
   SHORTEN URL
========================= */

shortenBtn.addEventListener("click", async () => {

    const url = urlInput.value.trim();


    if (!url) {

        showError("Please enter a URL.");

        urlInput.focus();

        return;
    }


    if (!isValidUrl(url)) {

        showError(
            "Please enter a valid HTTP or HTTPS URL."
        );

        urlInput.focus();

        return;
    }


    hideError();

    resultBox.classList.add("hidden");

    setLoading(true);


    try {

        const response = await fetch("/short", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                original: url
            })
        });


        const data = await response.json();


        if (!response.ok) {
  throw new Error(data.msg || "Unable to shorten the URL.");
}


        /*
         * Supports common response formats:
         *
         * { shortUrl: "..." }
         * { url: "..." }
         * { short: "..." }
         * { shortCode: "..." }
         */

        let generatedUrl =
            data.shortUrl ||
            data.url ||
            data.short;


        if (!generatedUrl && data.shortCode) {

            generatedUrl =
                `${window.location.origin}/${data.shortCode}`;
        }


        if (!generatedUrl) {

            throw new Error(
                "Server did not return a short URL."
            );
        }


        /*
         * If backend returns only a relative path,
         * convert it into a complete URL.
         */

        if (
    !generatedUrl.startsWith("http://") &&
    !generatedUrl.startsWith("https://")
) {
    generatedUrl = `${window.location.origin}/${generatedUrl}`;
}


        shortUrl.value = generatedUrl;

        openBtn.href = generatedUrl;

        resultBox.classList.remove("hidden");


        showToast("Short URL created successfully!");

    } catch (error) {

        console.error(error);

        showError(
            error.message ||
            "Something went wrong. Please try again."
        );

    } finally {

        setLoading(false);
    }

});



/* =========================
   COPY
========================= */

copyBtn.addEventListener("click", async () => {

    const value = shortUrl.value;


    if (!value) {
        return;
    }


    try {

        await navigator.clipboard.writeText(value);

        copyBtn.textContent = "Copied!";

        showToast("Short URL copied!");

        setTimeout(() => {

            copyBtn.textContent = "Copy";

        }, 1800);

    } catch {

        /*
         * Fallback for browsers where
         * clipboard API is unavailable.
         */

        shortUrl.select();

        document.execCommand("copy");

        copyBtn.textContent = "Copied!";

        showToast("Short URL copied!");

        setTimeout(() => {

            copyBtn.textContent = "Copy";

        }, 1800);
    }

});



/* =========================
   TOAST
========================= */

let toastTimer;


function showToast(message) {

    toastText.textContent = message;

    toast.classList.add("show");


    clearTimeout(toastTimer);


    toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);
}



/* =========================
   ENTER KEY
========================= */

urlInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {

        shortenBtn.click();

    }

});