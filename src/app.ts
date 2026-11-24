type ModalId = "reportModal" | "loginModal" | "registerModal" | "rankingModal" | "allIncidentsModal" | "editIncidentModal";
type PageId = "home" | "police" | "admin";
type Incident = {
  id?: string;
  title: string;
  type: string;
  coordinates: [number, number];
  age: string;
  certified: boolean;
  severity: string;
  place: string;
  author?: string;
  databaseUserId?: number;
  databaseDelincuentId?: number;
};
type LeafletApi = {
  map: (element: string) => LeafletMap;
  tileLayer: (url: string, options: Record<string, string | number>) => { addTo: (map: LeafletMap) => void };
  marker: (coordinates: [number, number]) => LeafletMarker;
  circleMarker: (coordinates: [number, number], options: Record<string, string | number>) => LeafletMarker;
};
type LeafletMap = {
  setView: (coordinates: [number, number], zoom: number) => LeafletMap;
  removeLayer: (layer: LeafletMarker) => LeafletMap;
  invalidateSize: () => LeafletMap;
  on: (event: "click", handler: (event: { latlng: { lat: number; lng: number } }) => void) => LeafletMap;
};
type LeafletMarker = {
  addTo: (map: LeafletMap) => LeafletMarker;
  bindPopup: (content: string | HTMLElement) => LeafletMarker;
  openPopup: () => LeafletMarker;
};

interface Window {
  L?: LeafletApi;
}

const $ = <T extends HTMLElement>(selector: string): T | null =>
  document.querySelector<T>(selector);

const showToast = (message: string): void => {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("visible");
  window.setTimeout(() => toast.classList.remove("visible"), 2800);
};

const setModal = (id: ModalId, open: boolean): void => {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.hidden = !open;
  if (open) modal.querySelector<HTMLElement>("input, select, textarea")?.focus();
};

const apiBaseUrl = "http://localhost:5180/api";
const incidents: Incident[] = [];
let backendIncidents: Incident[] = [];
let currentUser: { id: number; name: string; rol: string | null } | null = null;
const defaultCoordinates: [number, number] = [40.4168, -3.7038];
let map: LeafletMap | null = null;
let pickerMap: LeafletMap | null = null;
let pickerMarker: LeafletMarker | null = null;
let pickerUserMarker: LeafletMarker | null = null;
let userMarker: LeafletMarker | null = null;
let userCoordinates: [number, number] = defaultCoordinates;
let hasUserLocation = false;
let selectedCoordinates: [number, number] | null = null;
let incidentMarkers: Array<{ incident: Incident; marker: LeafletMarker }> = [];
let currentFilter = "Todos";
let currentPage: PageId = "home";
let editingIncidentId: string | null = null;

const getStoredIncidents = (): Incident[] => backendIncidents;

const getUserIncidents = (): Incident[] =>
  backendIncidents.filter((incident) => incident.author === currentUser?.name);

const apiRequest = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...options,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? `Error de API (${response.status})`);
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
};

const mapBackendIncident = (item: {
  idAvisos: number; titolAvis: string; type: string; latitude: number; longitude: number;
  fechaCreacion: string; verificado: boolean; severity: string; ubicacion: string;
  descripcion: string; userName: string; idUser: number; idDelincuent: number;
}): Incident => {
  const elapsedMinutes = Math.max(0, Math.round((Date.now() - Date.parse(item.fechaCreacion)) / 60000));
  const age = elapsedMinutes < 60 ? `${elapsedMinutes} minutos` : `${Math.round(elapsedMinutes / 60)} horas`;
  return {
    id: String(item.idAvisos),
    title: item.titolAvis,
    type: item.type,
    coordinates: [item.latitude, item.longitude],
    age,
    certified: item.verificado,
    severity: item.severity,
    place: item.ubicacion + (item.descripcion ? ` · ${item.descripcion}` : ""),
    author: item.userName,
    databaseUserId: item.idUser,
    databaseDelincuentId: item.idDelincuent,
  };
};

const loadBackendData = async (): Promise<void> => {
  try {
    const data = await apiRequest<Array<Parameters<typeof mapBackendIncident>[0]>>("/avisos");
    backendIncidents = data.map(mapBackendIncident);
    refreshStoredViews();
    if (!map) initializeMap();
  } catch (error) {
    showToast(error instanceof Error ? error.message : "No se pudo cargar la base de datos");
  }
};

const restoreSession = async (): Promise<void> => {
  try {
    currentUser = await apiRequest<{ id: number; name: string; rol: string | null }>("/session");
    updateSessionButton();
  } catch {
    currentUser = null;
  }
};

const distanceInKilometers = (first: [number, number], second: [number, number]): number => {
  const radians = (degrees: number): number => degrees * Math.PI / 180;
  const latitudeDifference = radians(second[0] - first[0]);
  const longitudeDifference = radians(second[1] - first[1]);
  const arc = Math.sin(latitudeDifference / 2) ** 2
    + Math.cos(radians(first[0])) * Math.cos(radians(second[0])) * Math.sin(longitudeDifference / 2) ** 2;
  const boundedArc = Math.min(1, Math.max(0, arc));
  return 6371 * 2 * Math.atan2(Math.sqrt(boundedArc), Math.sqrt(1 - boundedArc));
};

const sortByProximity = (items: Incident[]): Incident[] =>
  items.slice().sort((first, second) =>
    distanceInKilometers(userCoordinates, first.coordinates) - distanceInKilometers(userCoordinates, second.coordinates),
  );

const updateIncidentCounts = (): void => {
  filters.forEach((filter) => {
    const count = filter.querySelector("span");
    const type = filter.dataset.filter;
    if (!count || !type) return;
    const matchingIncidents = Array.from(document.querySelectorAll<HTMLElement>("#alertList .alert-card"))
      .filter((card) => type === "Todos" || card.dataset.type === type);
    count.textContent = String(matchingIncidents.length);
  });
};

const createIncidentCard = (
  incident: Incident,
  applyFilter = true,
  enablePoliceCertification = true,
): HTMLElement => {
  const iconClasses: Record<string, string> = { Robo: "robbery", Hurto: "theft", Agresión: "assault", Vandalismo: "assault" };
  const iconSymbols: Record<string, string> = { Robo: "↗", Hurto: "◌", Agresión: "!", Vandalismo: "!" };
  const icon = document.createElement("div");
  icon.className = `alert-icon ${iconClasses[incident.type] ?? "assault"}`;
  const symbol = document.createElement("span");
  symbol.textContent = iconSymbols[incident.type] ?? "!";
  icon.append(symbol);

  const details = document.createElement("div");
  details.className = "alert-details";
  const titleRow = document.createElement("div");
  titleRow.className = "alert-title-row";
  const title = document.createElement("h3");
  title.textContent = incident.title;
  titleRow.append(title);
  if (incident.certified) {
    const certifiedBadge = document.createElement("span");
    certifiedBadge.className = "verified-badge";
    certifiedBadge.textContent = "✓ Certificado";
    titleRow.append(certifiedBadge);
  }
  const place = document.createElement("p");
  place.textContent = incident.place;
  const meta = document.createElement("div");
  meta.className = "alert-meta";
  const age = document.createElement("span");
  age.textContent = incident.age === "ahora mismo" ? "Ahora mismo" : `Hace ${incident.age}`;
  const severity = document.createElement("span");
  const severityClass = incident.severity === "Pendiente"
    ? "pending-text"
    : incident.severity === "Muy grave"
      ? "high-text"
      : incident.severity === "Leve"
        ? "light-text"
        : "medium-text";
  severity.className = `severity ${severityClass}`;
  severity.textContent = incident.severity;
  meta.append(age, severity);
  details.append(titleRow, place, meta);

  const more = document.createElement("button");
  more.className = "more-button";
  more.type = "button";
  more.setAttribute("aria-label", "Más opciones");
  more.textContent = "•••";

  const card = document.createElement("article");
  card.className = "alert-card";
  card.dataset.type = incident.type;
  if (incident.id) card.dataset.incidentId = incident.id;
  card.hidden = applyFilter && currentFilter !== "Todos" && incident.type !== currentFilter;
  card.append(icon, details, more);
  card.addEventListener("click", (event) => {
    if (!enablePoliceCertification || getSignedInRole() !== "policia" || incident.certified) return;
    if (event.target instanceof HTMLElement && event.target.closest(".more-button, .certification-control")) return;
    if (card.querySelector(".certification-control")) return;
    const certificationControl = document.createElement("label");
    certificationControl.className = "certification-control";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.setAttribute("aria-label", "Certificar este aviso");
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) certifyIncident(incident);
    });
    certificationControl.append(checkbox, document.createTextNode("Certificar aviso"));
    details.append(certificationControl);
  });
  return card;
};

const renderIncidentInList = (): void => {
  if (!$("#alertList")) return;
  renderMainIncidentList();
};

const renderMainIncidentList = (): void => {
  const list = $("#alertList");
  if (!list) return;
  list.textContent = "";
  const sortedIncidents = sortByProximity(getStoredIncidents());
  sortedIncidents.forEach((incident) => list.append(createIncidentCard(incident)));
  updateIncidentCounts();
};

const getSignedInUser = (): string | null => {
  return currentUser?.name ?? null;
};

const getSignedInRole = (): string | null => {
  return currentUser?.rol?.toLowerCase() ?? null;
};

const isSignedIn = (): boolean => Boolean(getSignedInUser());

const updateSessionButton = (): void => {
  const button = $("#loginButton");
  const logoutButton = $("#logoutButton");
  const policePageButton = $("#policePageButton");
  const adminPageButton = $("#adminPageButton");
  const username = getSignedInUser();
  const role = getSignedInRole();
  if (logoutButton) logoutButton.hidden = !username;
  if (policePageButton) policePageButton.hidden = role !== "policia";
  if (adminPageButton) adminPageButton.hidden = role !== "admin";
  if (!button) return;
  if (!username) {
    button.textContent = "LM";
    button.setAttribute("aria-label", "Abrir sesión");
    button.title = "Iniciar sesión";
    return;
  }
  button.textContent = role === "admin"
    ? "AD"
    : role === "policia"
      ? "PL"
      : username.slice(0, 2).toUpperCase();
  button.setAttribute("aria-label", `Cerrar sesión de ${username}`);
  button.title = "Cerrar sesión";
};

const closeSession = async (): Promise<void> => {
  await apiRequest("/session", { method: "DELETE" }).catch(() => undefined);
  currentUser = null;
  setPage("home");
  updateSessionButton();
  renderMyIncidents();
  showToast("Sesión cerrada correctamente");
};

const renderMyIncidents = (): void => {
  const panel = $("#myAlertsPanel");
  const list = $("#myAlertList");
  if (!panel || !list) return;
  const username = getSignedInUser();
  panel.hidden = !username;
  list.textContent = "";
  if (!username) return;
  const userIncidents = sortByProximity(
    getUserIncidents().filter((incident) => incident.author === username),
  );
  if (userIncidents.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-alerts";
    emptyMessage.textContent = "Todavía no has publicado avisos.";
    list.append(emptyMessage);
    return;
  }
  userIncidents.forEach((incident) => list.append(createIncidentCard(incident)));
};

const renderReportRanking = (): void => {
  const list = $("#reportRankingList");
  if (!list) return;
  list.textContent = "";
  const reportCounts = new Map<string, number>();
  getStoredIncidents().forEach((incident) => {
    const author = incident.author?.trim();
    if (!author || author.toLowerCase() === "policia") return;
    reportCounts.set(author, (reportCounts.get(author) ?? 0) + 1);
  });
  const rankedUsers = Array.from(reportCounts.entries())
    .sort(([userA, countA], [userB, countB]) => countB - countA || userA.localeCompare(userB))
    .slice(0, 5);
  if (rankedUsers.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-alerts";
    emptyMessage.textContent = "Todavía no hay avisos publicados por usuarios.";
    list.append(emptyMessage);
    return;
  }
  rankedUsers.forEach(([username, count], index) => {
    const row = document.createElement("div");
    row.className = "person-row";
    const rank = document.createElement("span");
    rank.className = `rank${index === 0 ? " rank-first" : ""}`;
    rank.textContent = String(index + 1).padStart(2, "0");
    const avatar = document.createElement("div");
    avatar.className = `person-avatar avatar-${["one", "two", "three"][index % 3]}`;
    avatar.textContent = username.charAt(0).toUpperCase();
    const info = document.createElement("div");
    info.className = "person-info";
    const name = document.createElement("strong");
    name.textContent = username;
    const total = document.createElement("span");
    total.textContent = `${count} ${count === 1 ? "aviso publicado" : "avisos publicados"}`;
    info.append(name, total);
    row.append(rank, avatar, info);
    list.append(row);
  });
};

const renderPoliceIncidents = (): void => {
  const list = $("#policeIncidentList");
  if (!list) return;
  list.textContent = "";
  const locationStatus = $("#policeLocationStatus");
  if (locationStatus) {
    locationStatus.textContent = hasUserLocation
      ? "Avisos ordenados desde tu ubicación, del más cercano al más lejano."
      : "No se pudo obtener tu ubicación; los avisos se ordenan desde Madrid.";
  }
  const pendingIncidents = sortByProximity(getStoredIncidents().filter((incident) => !incident.certified));
  if (pendingIncidents.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-alerts";
    emptyMessage.textContent = "No hay avisos pendientes de certificación.";
    list.append(emptyMessage);
    return;
  }
  pendingIncidents.forEach((incident) => {
    const card = createIncidentCard(incident, false, false);
    const distance = document.createElement("span");
    distance.className = "proximity-label";
    distance.textContent = `${distanceInKilometers(userCoordinates, incident.coordinates).toFixed(1)} km`;
    const certifyButton = document.createElement("button");
    certifyButton.className = "primary-button police-certify-button";
    certifyButton.type = "button";
    certifyButton.textContent = "Certificar";
    certifyButton.addEventListener("click", () => {
      certifyIncident(incident);
      renderPoliceIncidents();
    });
    card.append(distance, certifyButton);
    list.append(card);
  });
};

const renderAdminIncidents = (): void => {
  const list = $("#adminIncidentList");
  if (!list) return;
  list.textContent = "";
  const allIncidents = getStoredIncidents();
  if (allIncidents.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-alerts";
    emptyMessage.textContent = "No hay avisos en la aplicación.";
    list.append(emptyMessage);
    return;
  }
  allIncidents.forEach((incident) => {
    const card = createIncidentCard(incident, false, false);
    card.querySelector(".more-button")?.remove();
    const actions = document.createElement("details");
    actions.className = "admin-actions";
    const summary = document.createElement("summary");
    summary.setAttribute("aria-label", "Opciones del aviso");
    summary.textContent = "•••";
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Modificar";
    editButton.addEventListener("click", () => openEditIncident(incident));
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-incident-button";
    deleteButton.textContent = "Eliminar";
    deleteButton.addEventListener("click", () => deleteIncident(incident));
    actions.append(summary, editButton, deleteButton);
    card.append(actions);
    list.append(card);
  });
};

const setPage = (page: PageId): void => {
  const role = getSignedInRole();
  if (page === "police" && role !== "policia") {
    showToast("El panel policial requiere una sesión de policía");
    return;
  }
  if (page === "admin" && role !== "admin") {
    showToast("El panel de administración requiere una sesión de administrador");
    return;
  }
  currentPage = page;
  const homePage = $("main");
  const policePage = $("#policePage");
  const adminPage = $("#adminPage");
  const footer = $("footer");
  if (homePage) homePage.hidden = page !== "home";
  if (policePage) policePage.hidden = page !== "police";
  if (adminPage) adminPage.hidden = page !== "admin";
  if (footer) footer.hidden = page !== "home";
  if (page === "police") renderPoliceIncidents();
  if (page === "admin") renderAdminIncidents();
};

const refreshMapMarkers = (): void => {
  if (!map || !window.L) return;
  incidentMarkers.forEach(({ marker }) => map?.removeLayer(marker));
  incidentMarkers = [];
  getStoredIncidents().forEach((incident) => {
    const marker = addIncidentMarker(incident, map as LeafletMap);
    if (currentFilter !== "Todos" && incident.type !== currentFilter) map?.removeLayer(marker);
    incidentMarkers.push({ incident, marker });
  });
};

const renderAllIncidents = (): void => {
  const list = $("#allIncidentsList");
  if (!list) return;
  list.textContent = "";
  getStoredIncidents().slice().reverse().forEach((incident) => {
    list.append(createIncidentCard(incident, false));
  });
};

const refreshStoredViews = (): void => {
  renderMainIncidentList();
  renderMyIncidents();
  renderReportRanking();
  refreshMapMarkers();
  if (currentPage === "police") renderPoliceIncidents();
  if (currentPage === "admin") renderAdminIncidents();
  if (!$("#allIncidentsModal")?.hidden) renderAllIncidents();
};

const addMapTiles = (targetMap: LeafletMap): void => {
  window.L?.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap",
    maxZoom: 19,
  }).addTo(targetMap);
};

const addIncidentMarker = (incident: Incident, targetMap: LeafletMap): LeafletMarker => {
  const leaflet = window.L;
  if (!leaflet) throw new Error("Leaflet no está disponible para mostrar el aviso");
  const marker = incident.certified
    ? leaflet.circleMarker(incident.coordinates, {
      radius: 9,
      color: "#b93838",
      fillColor: "#e25b55",
      fillOpacity: 0.95,
      weight: 2,
    }).addTo(targetMap)
    : leaflet.marker(incident.coordinates).addTo(targetMap);
  const popup = document.createElement("div");
  popup.className = "map-popup";
  const heading = document.createElement("h3");
  heading.textContent = incident.title;
  popup.append(heading);
  const popupFields: Array<[string, string]> = [
    ["Tipo:", incident.type],
    ["Publicado:", incident.age === "ahora mismo" ? "ahora mismo" : `hace ${incident.age}`],
    ["Ubicación:", incident.place],
    ["Estado:", incident.certified ? "✓ Certificado por la policía" : "Pendiente de certificación"],
    ["Gravedad:", incident.severity],
  ];
  popupFields.forEach(([label, value]) => {
    const field = document.createElement("p");
    const fieldLabel = document.createElement("strong");
    fieldLabel.textContent = label;
    field.append(fieldLabel, document.createTextNode(` ${value}`));
    popup.append(field);
  });
  marker.bindPopup(popup);
  return marker;
};

const certifyIncident = async (incident: Incident): Promise<void> => {
  if (getSignedInRole() !== "policia" || incident.certified) return;
  if (!incident.id) {
    showToast("No se pudo identificar el aviso para certificarlo");
    return;
  }
  try {
    await apiRequest(`/avisos/${incident.id}/verify`, { method: "PATCH" });
    incident.certified = true;
  } catch (error) {
    showToast(error instanceof Error ? error.message : "No se pudo certificar el aviso");
    return;
  }

  const trackedMarker = incidentMarkers.find((item) => item.incident.id === incident.id);
  if (trackedMarker && map && window.L) {
    trackedMarker.incident.certified = true;
    map.removeLayer(trackedMarker.marker);
    trackedMarker.marker = addIncidentMarker(trackedMarker.incident, map);
    if (currentFilter !== "Todos" && trackedMarker.incident.type !== currentFilter) {
      map.removeLayer(trackedMarker.marker);
    }
  }

  document.querySelectorAll<HTMLElement>(".alert-card").forEach((card) => {
    if (card.dataset.incidentId === incident.id) {
      card.replaceWith(createIncidentCard({ ...incident, certified: true }));
    }
  });
  showToast("Aviso certificado; ahora aparece en rojo en el mapa");
};

const centerOnUser = (targetMap: LeafletMap | null, announce = true): void => {
  if (!navigator.geolocation) {
    targetMap?.setView(userCoordinates, 13);
    if (announce) showToast("Geolocalización no disponible; mostrando la última ubicación conocida.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (position) => {
      userCoordinates = [position.coords.latitude, position.coords.longitude];
      hasUserLocation = true;
      map?.setView(userCoordinates, 13);
      if (pickerMap && !selectedCoordinates) pickerMap.setView(userCoordinates, 15);
      if (map && window.L) {
        if (userMarker) map.removeLayer(userMarker);
        userMarker = window.L.circleMarker(userCoordinates, { radius: 8, color: "#0b8d7f", fillColor: "#50c4a4", fillOpacity: 0.9 })
          .addTo(map)
          .bindPopup("<strong>Estás aquí</strong>");
      }
      if (pickerMap && window.L) {
        if (pickerUserMarker) pickerMap.removeLayer(pickerUserMarker);
        pickerUserMarker = window.L.circleMarker(userCoordinates, { radius: 8, color: "#0b8d7f", fillColor: "#50c4a4", fillOpacity: 0.9 })
          .addTo(pickerMap)
          .bindPopup("<strong>Tu ubicación actual</strong>");
      }
      const location = $("#currentLocation");
      if (location) location.textContent = "Tu ubicación actual";
      renderMainIncidentList();
      renderMyIncidents();
      if (currentPage === "police") renderPoliceIncidents();
      if (announce) showToast("Mapa centrado en tu ubicación");
    },
    () => {
      targetMap?.setView(userCoordinates, 13);
      if (announce) showToast("No se pudo detectar tu ubicación; mostrando la última ubicación conocida.");
    },
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 },
  );
};

const initializeMap = (): void => {
  const leaflet = window.L;
  if (!leaflet || !$("#realMap")) {
    showToast("No se pudo cargar el mapa. Comprueba tu conexión.");
    return;
  }
  map = leaflet.map("realMap").setView(defaultCoordinates, 11);
  addMapTiles(map);
  getStoredIncidents().forEach((incident) => {
    const marker = addIncidentMarker(incident, map as LeafletMap);
    incidentMarkers.push({ incident, marker });
  });
  centerOnUser(map, false);
};

window.setTimeout(initializeMap, 0);
void restoreSession().finally(() => loadBackendData());

const refreshFilter = (): void => {
  document.querySelectorAll<HTMLElement>(".alert-card").forEach((alert) => {
    alert.hidden = currentFilter !== "Todos" && alert.dataset.type !== currentFilter;
  });
  renderMainIncidentList();
  renderMyIncidents();
  incidentMarkers.forEach(({ incident, marker }) => {
    if (currentFilter !== "Todos" && incident.type !== currentFilter) map?.removeLayer(marker);
    else if (map) marker.addTo(map);
  });
};

const openEditIncident = (incident: Incident): void => {
  if (getSignedInRole() !== "admin" || !incident.id) {
    showToast("Solo administración puede modificar avisos");
    return;
  }
  editingIncidentId = incident.id;
  ($("#editIncidentName") as HTMLInputElement).value = incident.title;
  ($("#editIncidentType") as HTMLSelectElement).value = incident.type;
  ($("#editIncidentPlace") as HTMLInputElement).value = incident.place;
  ($("#editIncidentSeverity") as HTMLSelectElement).value = incident.severity;
  ($("#editIncidentLatitude") as HTMLInputElement).value = String(incident.coordinates[0]);
  ($("#editIncidentLongitude") as HTMLInputElement).value = String(incident.coordinates[1]);
  setModal("editIncidentModal", true);
};

const deleteIncident = async (incident: Incident): Promise<void> => {
  if (getSignedInRole() !== "admin" || !incident.id) {
    showToast("Solo administración puede eliminar avisos");
    return;
  }
  if (!window.confirm(`¿Eliminar el aviso "${incident.title}"?`)) return;
  try {
    await apiRequest(`/avisos/${incident.id}`, { method: "DELETE" });
    backendIncidents = backendIncidents.filter((item) => item.id !== incident.id);
  } catch (error) {
    showToast(error instanceof Error ? error.message : "No se pudo eliminar el aviso");
    return;
  }
  refreshStoredViews();
  showToast("Aviso eliminado");
};

document.querySelectorAll<HTMLButtonElement>(".report-button").forEach((button) => {
  button.addEventListener("click", () => {
    if (!isSignedIn()) {
      showToast("Inicia sesión o regístrate para publicar avisos");
      setModal("loginModal", true);
      return;
    }
    selectedCoordinates = null;
    const selectionStatus = $("#locationSelectionStatus");
    if (selectionStatus) selectionStatus.textContent = "Selecciona en el mapa el lugar donde ocurrió.";
    if (pickerMarker && pickerMap) pickerMap.removeLayer(pickerMarker);
    pickerMarker = null;
    setModal("reportModal", true);
    const leaflet = window.L;
    if (leaflet && !pickerMap) {
      pickerMap = leaflet.map("reportMap").setView(userCoordinates, 15);
      addMapTiles(pickerMap);
      if (hasUserLocation) {
        pickerUserMarker = leaflet.circleMarker(userCoordinates, { radius: 8, color: "#0b8d7f", fillColor: "#50c4a4", fillOpacity: 0.9 })
          .addTo(pickerMap)
          .bindPopup("<strong>Tu ubicación actual</strong>");
      }
      pickerMap.on("click", (event) => {
        const activePickerMap = pickerMap;
        if (!activePickerMap) return;
        selectedCoordinates = [event.latlng.lat, event.latlng.lng];
        if (pickerMarker) activePickerMap.removeLayer(pickerMarker);
        pickerMarker = leaflet.marker(selectedCoordinates).addTo(activePickerMap).bindPopup("Ubicación del aviso").openPopup();
        const status = $("#locationSelectionStatus");
        if (status) status.textContent = `Ubicación seleccionada: ${selectedCoordinates[0].toFixed(5)}, ${selectedCoordinates[1].toFixed(5)}`;
      });
    }
    window.setTimeout(() => pickerMap?.invalidateSize(), 100);
  });
});

$("#loginButton")?.addEventListener("click", () => {
  const username = getSignedInUser();
  if (username) {
    showToast(`Sesión iniciada como ${username}; cierra sesión para cambiar de usuario`);
    return;
  }
  setModal("loginModal", true);
});
$("#logoutButton")?.addEventListener("click", closeSession);

document.querySelectorAll<HTMLButtonElement>("[data-close]").forEach((button) => {
  button.addEventListener("click", () => {
    const modalId = button.dataset.close as ModalId | undefined;
    if (modalId) setModal(modalId, false);
  });
});

document.querySelectorAll<HTMLElement>(".modal-backdrop").forEach((backdrop) => {
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) setModal(backdrop.id as ModalId, false);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  document.querySelectorAll<HTMLElement>(".modal-backdrop:not([hidden])").forEach((modal) => {
    setModal(modal.id as ModalId, false);
  });
});

const filters = document.querySelectorAll<HTMLButtonElement>(".filter");
filters.forEach((filter) => {
  filter.addEventListener("click", () => {
    filters.forEach((item) => item.classList.remove("active"));
    filter.classList.add("active");
    currentFilter = filter.dataset.filter ?? "Todos";
    refreshFilter();
  });
});

$("#policePageButton")?.addEventListener("click", () => setPage("police"));
$("#adminPageButton")?.addEventListener("click", () => setPage("admin"));
$("#backFromPolice")?.addEventListener("click", () => setPage("home"));
$("#backFromAdmin")?.addEventListener("click", () => setPage("home"));

renderMainIncidentList();
updateSessionButton();
renderMyIncidents();
renderReportRanking();
const initialRole = getSignedInRole();
if (initialRole === "policia") setPage("police");
else if (initialRole === "admin") setPage("admin");

$("#locationButton")?.addEventListener("click", () => centerOnUser(map));
$("#mapLocateButton")?.addEventListener("click", () => centerOnUser(map));

const mapCard = $(".map-card");
$("#mapExpandButton")?.addEventListener("click", () => {
  if (!mapCard) return;
  const expanded = mapCard.classList.toggle("is-expanded");
  document.body.classList.toggle("map-expanded", expanded);
  const expandButton = $("#mapExpandButton");
  if (expandButton) {
    expandButton.setAttribute("aria-label", expanded ? "Reducir mapa" : "Ampliar mapa");
    expandButton.textContent = expanded ? "×" : "↗";
  }
  window.setTimeout(() => map?.invalidateSize(), 100);
});

$("#showMore")?.addEventListener("click", () => {
  if (!$("#allIncidentsList")) {
    showToast("No se pudo cargar el listado de avisos");
    return;
  }
  renderAllIncidents();
  setModal("allIncidentsModal", true);
});

$("#registerButton")?.addEventListener("click", () => {
  setModal("loginModal", false);
  setModal("registerModal", true);
});

$("#reportForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = getSignedInUser();
  if (!username) {
    setModal("reportModal", false);
    showToast("Tu sesión ha caducado; vuelve a iniciar sesión");
    return;
  }
  const type = ($("#reportType") as HTMLSelectElement).value;
  const description = ($("#reportDescription") as HTMLTextAreaElement).value;
  if (!selectedCoordinates) {
    showToast("Selecciona en el mapa dónde ocurrió el aviso");
    return;
  }
  const coordinates = [...selectedCoordinates] as [number, number];
  if (!currentUser) return;
  try {
    const saved = await apiRequest<Parameters<typeof mapBackendIncident>[0]>("/avisos", {
      method: "POST",
      body: JSON.stringify({
        titolAvis: `${type} reportado por la comunidad`,
        type,
        ubicacion: `${coordinates[0].toFixed(5)}, ${coordinates[1].toFixed(5)}`,
        descripcion: description || "Sin descripción",
        latitude: coordinates[0],
        longitude: coordinates[1],
        severity: "Pendiente",
        idUser: currentUser.id,
        idDelincuent: 1,
      }),
    });
    const newIncident = mapBackendIncident(saved);
    backendIncidents.push(newIncident);
    backendIncidents.sort((first, second) => second.id!.localeCompare(first.id!, undefined, { numeric: true }));
    renderIncidentInList();
    renderMyIncidents();
    renderReportRanking();
    refreshMapMarkers();
    if (map) addIncidentMarker(newIncident, map).openPopup();
  } catch (error) {
    showToast(error instanceof Error ? error.message : "No se pudo publicar el aviso");
    return;
  }
  if (currentPage === "police") renderPoliceIncidents();
  if (currentPage === "admin") renderAdminIncidents();
  setModal("reportModal", false);
  (event.target as HTMLFormElement).reset();
  showToast("Aviso publicado y añadido al mapa");
});

$("#editIncidentForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (getSignedInRole() !== "admin" || !editingIncidentId) {
    showToast("Solo administración puede modificar avisos");
    return;
  }
  if (!getStoredIncidents().some((incident) => incident.id === editingIncidentId)) {
    setModal("editIncidentModal", false);
    showToast("El aviso ya no está disponible");
    return;
  }
  const title = ($("#editIncidentName") as HTMLInputElement).value.trim();
  const type = ($("#editIncidentType") as HTMLSelectElement).value;
  const place = ($("#editIncidentPlace") as HTMLInputElement).value.trim();
  const severity = ($("#editIncidentSeverity") as HTMLSelectElement).value;
  const latitude = Number(($("#editIncidentLatitude") as HTMLInputElement).value);
  const longitude = Number(($("#editIncidentLongitude") as HTMLInputElement).value);
  if (!title || !place || !Number.isFinite(latitude) || !Number.isFinite(longitude)
    || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    showToast("Comprueba el título, la ubicación y las coordenadas");
    return;
  }
  const existing = backendIncidents.find((item) => item.id === editingIncidentId);
  if (!existing) return;
  try {
    await apiRequest(`/avisos/${editingIncidentId}`, {
      method: "PUT",
      body: JSON.stringify({
        titolAvis: title,
        type,
        ubicacion: place,
        descripcion: existing.place.split(" · ").slice(1).join(" · ") || "Aviso actualizado",
        latitude,
        longitude,
        severity,
        idUser: existing.databaseUserId,
        idDelincuent: existing.databaseDelincuentId,
      }),
    });
    Object.assign(existing, { title, type, place, severity, coordinates: [latitude, longitude] });
  } catch (error) {
    showToast(error instanceof Error ? error.message : "No se pudo actualizar el aviso");
    return;
  }
  editingIncidentId = null;
  setModal("editIncidentModal", false);
  (event.target as HTMLFormElement).reset();
  refreshStoredViews();
  showToast("Aviso actualizado");
});

$("#registerForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (getSignedInUser()) {
    showToast("Cierra la sesión actual antes de registrar otro usuario");
    return;
  }
  const username = ($("#registerUser") as HTMLInputElement).value.trim().toLowerCase();
  const password = ($("#registerPassword") as HTMLInputElement).value;
  try {
    currentUser = await apiRequest<{ id: number; name: string; rol: string | null }>("/register", {
      method: "POST",
      body: JSON.stringify({ name: username, contrasenya: password }),
    });
  } catch (error) {
    showToast(error instanceof Error ? error.message : "No se pudo registrar el usuario");
    return;
  }
  updateSessionButton();
  renderMyIncidents();
  setModal("registerModal", false);
  (event.target as HTMLFormElement).reset();
  showToast("Cuenta creada; ya puedes publicar avisos");
});

const openRanking = (): void => setModal("rankingModal", true);
$("#openRankingButton")?.addEventListener("click", openRanking);
$("#openRankingLink")?.addEventListener("click", openRanking);

$("#loginForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (getSignedInUser()) {
    setModal("loginModal", false);
    showToast("Cierra la sesión actual antes de cambiar de usuario");
    return;
  }
  const username = ($("#loginUser") as HTMLInputElement | null)?.value.trim().toLowerCase();
  const password = ($("#loginPassword") as HTMLInputElement | null)?.value;
  if (!username || !password) {
    showToast("Introduce usuario y contraseña");
    return;
  }
  try {
    currentUser = await apiRequest<{ id: number; name: string; rol: string | null }>("/login", {
      method: "POST",
      body: JSON.stringify({ name: username, contrasenya: password }),
    });
  } catch (error) {
    showToast(error instanceof Error ? error.message : "Usuario o contraseña incorrectos");
    return;
  }
  setModal("loginModal", false);
  (event.target as HTMLFormElement).reset();
  updateSessionButton();
  renderMyIncidents();
  const role = getSignedInRole();
  if (role === "policia") setPage("police");
  else if (role === "admin") setPage("admin");
  const message = role === "admin"
    ? "Sesión iniciada como administrador"
    : role === "policia"
      ? "Sesión iniciada como policía"
      : "Sesión iniciada correctamente";
  showToast(message);
});
