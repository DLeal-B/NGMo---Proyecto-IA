# 📋 Registre de prompts i documents d'IA

> Índex documental dels requisits i modificacions del projecte **NGMo**.

---

## 📑 Índex

| Nº | Document | Contingut principal |
|---:|---|---|
| 1 | [`promt.md`](../promt.md) | Requisits generals i arquitectura |
| 2 | [`promtModifiacion2.md`](../promtModifiacion2.md) | Modificacions generals i filtres |
| 3 | [`promtModificacion3.md`](../promtModificacion3.md) | Ubicació i mapa |
| 4 | [`promtModificacion4`](../promtModificacion4) | Llistat i sessions |
| 5 | [`promtModificacion5.md`](../promtModificacion5.md) | Persistència i avisos personals |
| 6 | [`promtModificacion6.md`](../promtModificacion6.md) | Certificació i rànquing |
| 7 | [`promtModificacion7.md`](../promtModificacion7.md) | Pàgines de policia i administrador |
| 8 | [`promtModificaciones.md`](../promtModificaciones.md) | Requisits finals d'interacció |
| 9 | [`promtModificacion8.md`](prompts/promtModificacion8.md) | Backend .NET i SQLite |

---

## 1. `promt.md`

**👤 Creador:** Equip del projecte NGMo  
**🏷️ Categoria:** Requisits generals

Descriu els requisits inicials de la web:

- Tecnologia: TypeScript, HTML, CSS, Laravel i MySQL.
- Disseny responsive i modern.
- Registre d'usuaris i rol únic de policia.
- Filtres per tipus de delicte i ubicació.
- Caducitat dels avisos segons la seva gravetat.
- Certificació policial i major visibilitat dels avisos certificats.
- Llistat de les persones més perilloses d'Espanya.

---

## 2. `promtModifiacion2.md`

**👤 Creador:** Equip del projecte NGMo  
**🏷️ Categoria:** Modificacions generals

Recull modificacions sobre la pàgina principal:

- Finestre emergent amb les persones perilloses.
- Filtres reals i funcionals.
- Actualització instantània del mapa i dels avisos.
- Restriccions d'accés i registre mitjançant Laravel.
- Permís per crear avisos només per a usuaris registrats.

---

## 3. `promtModificacion3.md`

**👤 Creador:** Equip del projecte NGMo  
**🏷️ Categoria:** Mapa i ubicació

Defineix millores per a la creació i selecció d'avisos:

- Focalització automàtica a la ubicació de l'usuari.
- Selecció manual del lloc de l'avís.
- Botó ràpid per tornar a la ubicació actual.
- Ampliació del mapa.
- Actualització de la llista i del mapa.
- Representació de la ubicació de l'usuari.

---

## 4. `promtModificacion4`

**👤 Creador:** Equip del projecte NGMo  
**🏷️ Categoria:** Llistats i filtres

Especifica aquestes modificacions:

- Actualització dinàmica del llistat d'avisos.
- Filtratge per categories.
- Visualització completa dels avisos en una finestra emergent.
- Missatges diferenciats segons el rol que inicia sessió.

---

## 5. `promtModificacion5.md`

**👤 Creador:** Equip del projecte NGMo  
**🏷️ Categoria:** Sessió i preferències

Descriu les següents funcionalitats:

- Filtres compartits entre el mapa i el llistat.
- Persistència de la sessió per a tots els rols.
- Secció pròpia amb els avisos creats per cada usuari.

---

## 6. `promtModificacion6.md`

**👤 Creador:** Equip del projecte NGMo  
**🏷️ Categoria:** Certificació i rànquing

Documenta:

- Certificació dels avisos pel rol de policia.
- Filtratge per categories dins dels avisos personals.
- Rànquing dels usuaris amb més avisos.
- Exclusió completa del rol de policia del rànquing.

---

## 7. `promtModificacion7.md`

**👤 Creador:** Equip del projecte NGMo  
**🏷️ Categoria:** Panells per rol

Detalla les pàgines separades:

- **Policia:** llistat d'avisos no certificats ordenats per proximitat i botó de certificació.
- **Administrador:** llistat complet d'avisos amb opcions per modificar i eliminar.
- Filtratge de categories segons la ubicació de l'usuari.

---

## 8. `promtModificaciones.md`

**👤 Creador:** Equip del projecte NGMo  
**🏷️ Categoria:** Requisits finals

Recull els requisits finals d'interacció i configuració:

- Mapa real navegable.
- Usuari administrador: `admin / 1234`.
- Usuari policia: `policia / 1234`.
- Tres persones de risc, inclosa `HustleHard`.
- Pop-ups amb tipus, antiguitat i certificació dels avisos.
- Detecció instantània de la ubicació i avisos pròxims.In

---

## 9. `promtModificacion8.md`

**👤 Creador:** Equip del projecte NGMo  
**🏷️ Categoria:** Backend i persistència

Desenvolupa el backend amb **.NET** i **SQLite**, estructurat en tres taules principals:

- **Avisos:** identificador autoincremental, títol, ubicació, descripció, data de creació, usuari creador, estat de verificació i delicte.
- **Users:** identificador autoincremental, nom, contrasenya i rol opcional (`admin` o `policia`).
- **Delincuentes:** identificador autoincremental i nom del delincuent.

Defineix les relacions entre els avisos, els usuaris i els delincuentes, i permet crear, modificar, verificar i eliminar registres. El rànquing d'usuaris actius ha de consultar les dades registrades a la base de dades.In

També hem demanat que totes les dades que es guardaben en localstorage es guardin en la base de dades