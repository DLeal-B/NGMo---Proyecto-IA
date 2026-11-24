# Instal·lació de NGMo en una altra màquina

Aquest document explica com preparar i executar NGMo en un ordinador Windows nou. Cal copiar o clonar tot el repositori, ja que la pàgina utilitza els fitxers HTML, CSS i TypeScript del projecte.

## 1. Requisits previs

Instal·leu els programes següents:

- **Git**, si voleu clonar el repositori.
- **Node.js LTS**, que inclou `npm`. Es recomana la versió LTS.
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

## 5. Verificar la instal·lació

Comproveu els punts següents:

1. Es mostra la pàgina principal i el mapa.
2. Els avisos de demostració apareixen a la llista.
3. El botó d’inici de sessió obre el formulari.
4. Es pot crear un usuari de prova i iniciar sessió.
5. Després d’iniciar sessió, es pot crear un avís seleccionant-ne el punt al mapa.

Els usuaris, les sessions i els avisos creats es desen a `localStorage` del navegador. Per tant, les dades no es comparteixen automàticament amb altres ordinadors ni amb altres navegadors. Esborrar les dades del lloc pot eliminar aquesta informació.

## 6. Backend .NET (opcional)

El repositori també conté un backend a `backend\`. Actualment la interfície web funciona amb dades locals del navegador i no fa peticions a l’API; per a l’ús habitual del prototip no cal iniciar aquest component.

Si cal executar-lo per desenvolupar o provar l’API, instal·leu el **.NET SDK 11** i comproveu-lo amb:

```powershell
dotnet --version
```

Després executeu:

```powershell
cd C:\Aplicacions\NGMo\backend
dotnet restore
dotnet run
```

El backend mostrarà a la consola les adreces disponibles, habitualment:

- `http://localhost:5238`
- `https://localhost:7088`

En iniciar-se, crea la base de dades SQLite `backend\ngmo.db` si encara no existeix i carrega les dades inicials. No esborreu aquest fitxer si voleu conservar les dades de l’API.

## 7. Problemes habituals

- **`npm` o `node` no es reconeix:** tanqueu i torneu a obrir PowerShell després d’instal·lar Node.js; si persisteix, reviseu el `PATH`.
- **No es genera `dist\app.js`:** executeu `npm run build` des de la carpeta arrel, no des de `src`.
- **El navegador no carrega el mapa:** comproveu la connexió a Internet, perquè Leaflet, les fonts i les capes del mapa es carreguen des de serveis externs.
- **No es pot iniciar el backend:** confirmeu que teniu instal·lat el .NET SDK 11 i que executeu les ordres des de `backend`.
- **No apareixen dades creades anteriorment:** confirmeu que utilitzeu el mateix navegador i el mateix perfil; les dades de la interfície són locals.
