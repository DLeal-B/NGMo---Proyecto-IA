"use strict";
const $ = (selector) => document.querySelector(selector);
const showToast = (message) => {
    const toast = $("#toast");
    if (!toast)
        return;
    toast.textContent = message;
    toast.classList.add("visible");
    window.setTimeout(() => toast.classList.remove("visible"), 2800);
};
const setModal = (id, open) => {
    const modal = document.getElementById(id);
    if (!modal)
        return;
    modal.hidden = !open;
    if (open)
        modal.querySelector("input, select, textarea")?.focus();
};
const incidents = [
    { title: "Robo con fuerza", type: "Robo", coordinates: [40.4168, -3.7038], age: "18 minutos", certified: true, severity: "Muy grave", place: "Calle de Alcalá, Madrid" },
    { title: "Hurto de pertenencias", type: "Hurto", coordinates: [40.4185, -3.6994], age: "1 hora", certified: false, severity: "Leve", place: "Metro Sol, Madrid" },
    { title: "Agresión en vía pública", type: "Agresión", coordinates: [40.385, -3.719], age: "42 minutos", certified: true, severity: "Medio", place: "Plaza Elíptica, Madrid" },
    { title: "Vandalismo", type: "Vandalismo", coordinates: [40.469, -3.379], age: "2 horas", certified: false, severity: "Medio", place: "Guadalajara" },
];
const storedIncidentsKey = "ngmo-incidents";
const storedUsersKey = "ngmo-users";
let map = null;
let incidentMarkers = [];
let currentFilter = "Todos";
const getStoredIncidents = () => {
    const saved = localStorage.getItem(storedIncidentsKey);
    if (!saved)
        return incidents;
    try {
        return [...incidents, ...JSON.parse(saved)];
    }
    catch {
        return incidents;
    }
};
const isSignedIn = () => Boolean(sessionStorage.getItem("ngmo-session"));
const initializeMap = () => {
    const leaflet = window.L;
    if (!leaflet || !$("#realMap")) {
        showToast("No se pudo cargar el mapa. Comprueba tu conexión.");
        return;
    }
    map = leaflet.map("realMap").setView([40.4168, -3.7038], 11);
    leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 19,
    }).addTo(map);
    getStoredIncidents().forEach((incident) => {
        const marker = leaflet.marker(incident.coordinates).addTo(map);
        marker.bindPopup(`<div class="map-popup"><h3>${incident.title}</h3><p><strong>Tipo:</strong> ${incident.type}</p><p><strong>Publicado:</strong> hace ${incident.age}</p><p><strong>Ubicación:</strong> ${incident.place}</p><p><strong>Estado:</strong> ${incident.certified ? "✓ Certificado por la policía" : "Pendiente de certificación"}</p><p><strong>Gravedad:</strong> ${incident.severity}</p></div>`);
        incidentMarkers.push({ incident, marker });
    });
    if (!navigator.geolocation) {
        showToast("Geolocalización no disponible; mostrando Madrid.");
        return;
    }
    navigator.geolocation.getCurrentPosition((position) => {
        const current = [position.coords.latitude, position.coords.longitude];
        map?.setView(current, 13);
        leaflet.circleMarker(current, { radius: 8, color: "#0b8d7f", fillColor: "#50c4a4", fillOpacity: 0.9 }).addTo(map).bindPopup("<strong>Estás aquí</strong><br>Mostrando avisos próximos a tu ubicación.").openPopup();
        const location = $("#currentLocation");
        if (location)
            location.textContent = "Tu ubicación actual";
        showToast("Ubicación detectada: avisos cercanos actualizados");
    }, () => showToast("No se pudo detectar tu ubicación; mostrando avisos de Madrid."), { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 });
};
window.setTimeout(initializeMap, 0);
const refreshFilter = () => {
    alerts.forEach((alert) => {
        alert.hidden = currentFilter !== "Todos" && alert.dataset.type !== currentFilter;
    });
    incidentMarkers.forEach(({ incident, marker }) => {
        if (currentFilter !== "Todos" && incident.type !== currentFilter)
            map?.removeLayer(marker);
        else if (map)
            marker.addTo(map);
    });
};
document.querySelectorAll(".report-button").forEach((button) => {
    button.addEventListener("click", () => {
        if (!isSignedIn()) {
            showToast("Inicia sesión o regístrate para publicar avisos");
            setModal("loginModal", true);
            return;
        }
        setModal("reportModal", true);
    });
});
$("#loginButton")?.addEventListener("click", () => setModal("loginModal", true));
document.querySelectorAll("[data-close]").forEach((button) => {
    button.addEventListener("click", () => {
        const modalId = button.dataset.close;
        if (modalId)
            setModal(modalId, false);
    });
});
document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
    backdrop.addEventListener("click", (event) => {
        if (event.target === backdrop)
            setModal(backdrop.id, false);
    });
});
document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape")
        return;
    document.querySelectorAll(".modal-backdrop:not([hidden])").forEach((modal) => {
        setModal(modal.id, false);
    });
});
const filters = document.querySelectorAll(".filter");
const alerts = document.querySelectorAll(".alert-card");
filters.forEach((filter) => {
    filter.addEventListener("click", () => {
        filters.forEach((item) => item.classList.remove("active"));
        filter.classList.add("active");
        currentFilter = filter.dataset.filter ?? "Todos";
        refreshFilter();
    });
});
$("#locationButton")?.addEventListener("click", () => {
    const location = $("#currentLocation");
    if (location)
        location.textContent = "Tu ubicación aproximada";
    showToast("Ubicación actualizada para esta demostración");
});
$("#showMore")?.addEventListener("click", () => {
    showToast("Mostrando los avisos disponibles en tu zona");
});
$("#registerButton")?.addEventListener("click", () => {
    setModal("loginModal", false);
    setModal("registerModal", true);
});
$("#reportForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!isSignedIn()) {
        setModal("reportModal", false);
        showToast("Tu sesión ha caducado; vuelve a iniciar sesión");
        return;
    }
    const type = $("#reportType").value;
    const place = $("#reportLocation").value;
    const description = $("#reportDescription").value;
    const newIncident = {
        title: `${type} reportado por la comunidad`,
        type,
        coordinates: [40.4168, -3.7038],
        age: "ahora mismo",
        certified: false,
        severity: "Pendiente",
        place: `${place} · ${description}`,
    };
    const saved = JSON.parse(localStorage.getItem(storedIncidentsKey) ?? "[]");
    localStorage.setItem(storedIncidentsKey, JSON.stringify([...saved, newIncident]));
    if (map && window.L) {
        const marker = window.L.marker(newIncident.coordinates).addTo(map);
        marker.bindPopup(`<div class="map-popup"><h3>${newIncident.title}</h3><p><strong>Tipo:</strong> ${newIncident.type}</p><p><strong>Publicado:</strong> ahora mismo</p><p><strong>Ubicación:</strong> ${newIncident.place}</p><p><strong>Estado:</strong> Pendiente de certificación</p></div>`).openPopup();
        incidentMarkers.push({ incident: newIncident, marker });
    }
    setModal("reportModal", false);
    event.target.reset();
    showToast("Aviso publicado y añadido al mapa");
});
$("#registerForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = $("#registerUser").value.trim().toLowerCase();
    const password = $("#registerPassword").value;
    const users = JSON.parse(localStorage.getItem(storedUsersKey) ?? "[]");
    if (["admin", "policia"].includes(username) || users.some((user) => user.username === username)) {
        showToast("Ese usuario ya existe");
        return;
    }
    users.push({ username, password });
    localStorage.setItem(storedUsersKey, JSON.stringify(users));
    sessionStorage.setItem("ngmo-session", username);
    setModal("registerModal", false);
    event.target.reset();
    showToast("Cuenta creada; ya puedes publicar avisos");
});
const openRanking = () => setModal("rankingModal", true);
$("#openRankingButton")?.addEventListener("click", openRanking);
$("#openRankingLink")?.addEventListener("click", openRanking);
$("#loginForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = $("#loginUser")?.value.trim().toLowerCase();
    const password = $("#loginPassword")?.value;
    const validRole = (username === "admin" || username === "policia") && password === "1234";
    const users = JSON.parse(localStorage.getItem(storedUsersKey) ?? "[]");
    const validRegisteredUser = users.some((user) => user.username === username && user.password === password);
    if (!validRole && !validRegisteredUser) {
        showToast("Usuario o contraseña incorrectos");
        return;
    }
    setModal("loginModal", false);
    event.target.reset();
    sessionStorage.setItem("ngmo-session", username ?? "");
    const avatar = $("#loginButton");
    if (avatar)
        avatar.textContent = username === "admin" ? "AD" : "PL";
    showToast(username === "admin" ? "Sesión iniciada como administrador" : "Sesión iniciada como policía");
});
