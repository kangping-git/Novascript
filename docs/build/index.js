function loadHash() {
    document.querySelectorAll(".focus").forEach((elm) => {
        elm.classList.remove("focus");
    });
    if (location.hash && document.querySelector(location.hash)) {
        document.querySelector(location.hash).classList.add("focus");
    }
}

window.addEventListener("hashchange", loadHash);
window.addEventListener("DOMContentLoaded", loadHash);
