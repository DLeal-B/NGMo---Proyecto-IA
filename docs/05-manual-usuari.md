# Manual d'usuari de NGMo

**NGMo** és una aplicació de seguretat ciutadana que permet consultar avisos a prop i compartir informació sobre incidents que s’han produït a una ubicació concreta.

---

### Rols disponibles

| Rol | Accés |
|---|---|
| **Usuari normal** | Consultar el mapa, publicar avisos i veure els seus avisos |
| **Policia** | Fer tot el que pot fer un usuari normal i **certificar** avisos |
| **Administrador** | Consultar, modificar i eliminar qualsevol avís |

### Com iniciar o tancar una sessió

1. Prem el botó circular situat a la dreta de la barra superior.
2. Introduïu el nom d’usuari i la contrasenya.
3. Seleccioneu **Iniciar sessió**.
4. Per sortir, premeu **Tancar sessió**.

Els usuaris normals també poden crear un compte des de l’opció **Crear un compte** del formulari d’inici de sessió.

---

## 2. Pantalla principal

La pantalla principal resumeix els avisos disponibles i ofereix dues eines bàsiques: el mapa i la llista d’incidents.

![Portada i accés a la creació d’avisos](image-1.png)

### Elements que apareixen a la imatge

- **La marca “Red ciutadana activa”** indica que la pàgina està en funcionament.
- El missatge principal destaca la finalitat de l’aplicació: informar i protegir la comunitat.
- El botó **Crear un avís** obre el formulari per publicar un incident.
- La barra superior permet obrir la sessió, utilitzar la ubicació i accedir als panells segons el rol.
- Els avisos verificats es destaquen perquè han passat per una comprovació policial.

> Cal iniciar sessió o registrar-se abans de crear un avís.

---

## 3. Publicar un avís

Premeu **Crear un avís** i completeu les tres parts del formulari.

![Formulari per crear un nou avís](image-2.png)

### 3.1. Tipus d’incident

El primer camp permet triar una categoria:

- **Robatori**
- **Agressió**
- **Vandalisme**
- **Hurto**

En el prototip, les opcions i els rètols es mostren en espanyol. Trieu el tipus que s’ajusti millor a la situació.

### 3.2. Ubicació

A continuació, seleccioneu al mapa el punt exacte on ha passat l’incident:

1. Utilitzeu els controls **+** i **–** per ampliar o reduir el mapa.
2. Desplaceu el mapa fins a la zona desitjada.
3. Feu clic sobre el lloc exacte.

L’aplicació desarà les coordenades de la ubicació seleccionada.

### 3.3. Descripció i enviament

Escriviu una explicació breu i objectiva al camp **Expliqueu què ha passat**. No inclogueu noms, telèfons, adreces personals ni altres dades sensibles.

Finalment, premeu **Enviar avís**. El missatge es guardarà i apareixerà al mapa i a la llista de l’usuari.

![Mapa de localització i descripció de l’incident](image-3.png)

> Aquesta aplicació és un prototip. No substitueix les trucades al 112 ni les notificacions oficials a les forces de seguretat.

---

## 4. Consultar els avisos

A la secció **Cerca de tu**, els avisos s’ordenen per proximitat i es poden filtrar per categoria.

![Avisos recents i filtres per tipus](image-4.png)

### Informació de cada avís

Cada targeta mostra:

- Tipus d’incident i títol.
- Ubicació o referència aproximada.
- Temps transcorregut des de la publicació.
- Estat de gravetat: pendent, lleu, mitjà o molt greu.
- Etiqueta **✓ Certificat** quan la policia n’ha verificat l’autenticació.

Els filtres disponibles són **Tots**, **Robatori**, **Agressió**, **Vandalisme** i **Hurto**. El nombre que apareix al costat de cada filtre indica quants avisos corresponen a aquesta categoria.

Podeu seleccionar **Veure tots els avisos** per obrir la llista completa.

### Mapa de ubicacions

El mapa mostra els incidents amb símbols i colors segons la gravetat:

| Indicador | Significat |
|---|---|
| Verd | Gravetat lleu |
| Taronja | Gravetat mitjana |
| Vermell | Gravetat molt greu |
| Marca amb vinyeta | Avís certificat |

Els controls permeten ampliar el mapa i tornar a la ubicació actual.

![Mapa d’ubicacions i avisos](image.png)

---

## 5. La seva activitat

Quan un usuari normal inicia sessió, pot consultar els avisos que ha publicat dins la secció **Mis avisos**.

![Llista dels avisos publicats per l’usuari](image-5.png)

Aquesta informació permet identificar:

- El tipus d’avís.
- La ubicació indicada.
- El moment de publicació.
- Si l’avís està pendent o ja ha estat certificat.

Cada avís també pot mostrar un menú d’opcions, segons els permisos de la sessió activa.

---

## 6. Persones de risc i usuaris actius

La columna dreta mostra dues classificacions de la comunitat.

![Persones de risc i comunitat activa](image-6.png)

### Persones de risc

Aquest panell mostra una llista basada en avisos certificats per les autoritats. Cada registre pot indicar:

- Posició al rànquing.
- Nom o identitat reservada.
- Ciutat.
- Nombre d’avisos certificats.
- Nivell de risc: alt o mitjà.

Prem la fletxa o **Consultar llistat complet** per obrir tota la classificació.

### Usuaris més actius

Aquesta llista comptabilitza els avisos publicats per cada usuari. Els comptes de policia no s’inclouen en aquest rànquing.

Els valors es calculen a partir dels avisos disponibles al navegador i poden variar quan s’afegeixen, modifiquen o eliminen incidents.

---

## 7. Panell de policia

Inicieu sessió amb el compte policial autoritzat per accedir a la gestió policial.

![Panell policial amb els avisos pendents](image-8.png)

### Abans de fer una verificació

La policia ha de comprovar que la informació de l’avís és coherent i real. Després pot actuar sobre el registre des del botó **Certificar**.

### Certificar un avís

1. Seleccioneu el panell **Gestió policial**.
2. Reviseu els avisos pendents.
3. Comproveu el tipus d’incident, la ubicació i la distància indicades.
4. Premeu **Certificar**.

Un cop certificat, l’avís mostrarà l’etiqueta **✓ Certificat** i es tindrà en compte als apartats basats en dades verificades.

![Detall de la funció Certificar](image-7.png)

Podeu prémer **Tornar a la pàgina principal** per sortir del panell policial.

---

## 8. Panell d’administració

Inicieu sessió amb el compte d’administració autoritzat per accedir a totes les opcions d’administració.

![Llista d’avisos accessible per a l’administrador](image-9.png)

### Opcions disponibles

Cada avís inclou el menú amb tres punts. En prémer-lo, apareixen les accions:

- **Modificar**: obre el formulari d’edició.
- **Eliminar**: elimina definitivament l’avís després de confirmar l’acció.

### Camps que es poden modificar

L’administrador pot editar:

- El títol de l’avís.
- El tipus d’incident.
- La ubicació o descripció.
- El nivell de gravetat.
- La latitud i la longitud.

Després de modificar les dades, seleccioneu **Desar els canvis**. Els canvis s’apliquen immediatament a l’aplicació i al mapa.

---

## 9. Filtres i classificació de gravetat

### Gravetat

Els avisos poden tenir aquestes categories:

| Estat | Ús |
|---|---|
| **Pendent** | Avís que encara no ha estat verificat |
| **Lleu** | Incident amb impacte menor |
| **Mitjà** | Incident que requereix una atenció moderada |
| **Molt greu** | Incident d’alt impacte |

Les categories permeten entendre ràpidament la importància de la situació. La certificació és independent de la gravetat: un avís pot estar classificat i, alhora, pendent de verificació.

### Filtres

Els filtres ajuden a reduir la llista:

- **Tots**: mostra tots els tipus.
- **Robatori**: mostra només els robatoris.
- **Agressió**: mostra les agressions.
- **Vandalisme**: mostra els actes vandàlics.
- **Hurto**: mostra els hurto.

---

## 10. Recomanacions d’ús

- Utilitzeu una ubicació aproximada si no voleu mostrar un lloc exacte.
- No publiquéu dades personals, fotos o informació que permeti identificar terceres persones.
- Redacteu l’avís amb un to neutral i sense suposicions.
- Consulteu el mapa abans de publicar si ja existeix una alerta similar.
- Per a una situació real i urgent, truqueu als serveis d’emergència en lloc de limitar-vos a publicar un avís.

---

## 11. Resolució de problemes

| Problema | Solució |
|---|---|
| No es pot obrir el formulari d’avís | Inicieu una sessió o creeu un compte d’usuari |
| No apareix el mapa | Comproveu la connexió i torneu a carregar la pàgina |
| No apareixen les opcions policials | Inicieu sessió amb l’usuari `policia` |
| No apareix el menú d’administració | Inicieu sessió amb l’usuari `admin` |
| Les dades no s’han desat | Comproveu que el navegador permet l’emmagatzematge local |
| No es pot iniciar sessió | Reviseu les dades d’accés proporcionades per l’administrador |

---

*Manual elaborat a partir de les pantalles i els fluxos disponibles al prototip NGMo.*
