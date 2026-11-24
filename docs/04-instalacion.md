# Instal·lació de NGMo en una altra màquina

Aquest document explica com preparar i executar NGMo en un ordinador Windows nou. Cal copiar o clonar tot el repositori, ja que la pàgina utilitza els fitxers HTML, CSS i TypeScript del projecte.

## 1. Requisits previs

Instal·leu els programes següents:

- **Git**, si voleu clonar el repositori.
- **Node.js LTS**, que inclou `npm`. Es recomana la versió LTS.
- **.NET SDK 11**, necessari per executar l’API i connectar-la amb la interfície.
- Un navegador actual, com ara Edge, Chrome o Firefox.

Per comprovar que s’han instal·lat correctament, obriu PowerShell i executeu:

```powershell
git --version
node --version
npm --version
```

Les ordres han de mostrar la versió de cada programa. Si no s’utilitza Git, es pot descarregar el projecte com a fitxer ZIP i extreure’l, per exemple, a:

```text
C:\Aplicacions\NGMo
```

## 2. Obtenir el projecte

### Opció A: clonar-lo amb Git

```powershell
cd C:\Aplicacions
git clone https://github.com/DLeal-B/NGMo---Proyecto-IA.git NGMo
cd C:\Aplicacions\NGMo
```

### Opció B: copiar-lo manualment

Copieu la carpeta completa del projecte a l’ordinador nou. No n’elimineu les carpetes `src`, `docs` ni els fitxers `index.html`, `styles.css`, `package.json` i `tsconfig.json`.

## 3. Compilar la interfície web

Des de la carpeta arrel del projecte, executeu:

```powershell
cd C:\Aplicacions\NGMo
npm run build
```

Aquesta ordre compila `src\app.ts` i genera `dist\app.js`. Si la compilació acaba sense errors, la interfície ja està preparada per executar-se.

## 4. Iniciar l’aplicació

Encara des de la carpeta arrel, inicieu el servidor web local:

```powershell
npm run dev
```

La primera vegada, `npx` pot descarregar temporalment el paquet `serve`. Quan aparegui l’adreça indicada a la consola, obriu-la al navegador (normalment és similar a `http://localhost:3000`).

Per aturar l’aplicació, torneu a la finestra de PowerShell i premeu `Ctrl+C`.

> No es recomana obrir `index.html` directament amb doble clic. Servir els fitxers mitjançant `npm run dev` evita problemes de càrrega de recursos i reprodueix l’execució prevista.

La interfície també necessita l’API del pas 6. Inicieu-la abans de fer les comprovacions següents; si ja havíeu obert la pàgina, recarregueu-la quan l’API estigui en marxa.

## 5. Verificar la instal·lació

Comproveu els punts següents:

1. Es mostra la pàgina principal i el mapa.
2. Els avisos de demostració apareixen a la llista.
3. El botó d’inici de sessió obre el formulari.
4. Es pot crear un usuari de prova i iniciar sessió.
5. Després d’iniciar sessió, es pot crear un avís seleccionant-ne el punt al mapa.

Els usuaris, les sessions i els avisos es desen a la base de dades SQLite del backend, no a `localStorage`. La sessió activa s’identifica amb una galeta del navegador. Per compartir les dades entre màquines, cal desplegar l’API en un servidor accessible i configurar-ne l’adreça al frontend.

## 6. Iniciar l’API .NET

La interfície web utilitza l’API del backend per carregar avisos i gestionar els comptes i les sessions. Comproveu la instal·lació de .NET amb:

```powershell
dotnet --version
```

Obriu una segona finestra de PowerShell i executeu:

```powershell
cd C:\Aplicacions\NGMo\backend
dotnet restore
dotnet run --urls http://localhost:5180
```

El frontend està configurat per connectar-se a `http://localhost:5180/api`. El perfil del backend fa servir el port `5238` per defecte; l’opció `--urls` fa que coincideixi amb l’adreça que espera el frontend. Deixeu aquesta finestra oberta mentre utilitzeu l’aplicació.

En iniciar-se, crea la base de dades SQLite `backend\ngmo.db` si encara no existeix i carrega les dades inicials. No esborreu aquest fitxer si voleu conservar les dades de l’API.

El backend accepta peticions web des de `http://localhost:3000` i `http://127.0.0.1:3000`. Si `npm run dev` mostra un altre port, inicieu el frontend en un dels ports permesos o actualitzeu la política CORS del backend.

## 7. Problemes habituals

- **`npm` o `node` no es reconeix:** tanqueu i torneu a obrir PowerShell després d’instal·lar Node.js; si persisteix, reviseu el `PATH`.
- **No es genera `dist\app.js`:** executeu `npm run build` des de la carpeta arrel, no des de `src`.
- **El navegador no carrega el mapa:** comproveu la connexió a Internet, perquè Leaflet, les fonts i les capes del mapa es carreguen des de serveis externs.
- **La interfície no carrega avisos o mostra un error de connexió:** confirmeu que el backend està en execució a `http://localhost:5180` i que el frontend s’obre des d’un origen permès per CORS.
- **No es pot iniciar el backend:** confirmeu que teniu instal·lat el .NET SDK 11 i que executeu les ordres des de `backend`.
- **No apareixen dades creades anteriorment:** confirmeu que el backend utilitza el mateix fitxer `backend\ngmo.db`; la sessió del navegador es manté en una galeta.
