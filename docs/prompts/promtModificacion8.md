## Instrucciones sobre el back end

Hazme un Backend con con tecnologia .NET y con sqllite

- Quiero tres tablas principales.

    # Tabla avisos
    - Avisos: Registro de avisos de todos los usuarios.
    - Campos: idAvisos (PK autoincremental),  TitolAvis, Ubicacion (Cordenadas), Descripcion (Campo de "que ha ocurrido" del creador de avisos.), fechaCreacion (datetime cuando se crea el aviso), User (FK de idUser en la tabla users), Verificado (Boolean depende de si lo ha verificado un policia), Delincuent (FK idDelincuent).
    - La Foreing key de con usuario depende de que usuario ha crado el aviso. Cada aviso solo puede ser creado por un usuario pero un usuario puede crear muchos avisos.
    - La Foreing key de con delincuent depende de que delincuent ha delinquido. Cada aviso solo puede tener un delincuente pero un delincuente puede tener muchos avisos.
    - Quiero que se añadan datos cuando se cree un nuevo aviso. Se añadira directamente a la talba.
    - Quiero que se modifiquen datos si el usuario policia verifica el aviso.
    - Quiero que se elimine el registro del aviso si el admin elimina el aviso.

    # Tabla users
    - Users: Usuarios registrados en la web
    - Camps: idUser (PK autoincremental), name (varchar), contrasenya, rol ("enum". null, admin o policia).
    - Quiero que la parte de Usuarios más activos de la web vaya dependiendo de los usuarios de la base de datos.

    # Deluncuentes    
    - Delincuentes: Delincuentes que consta que han delinquido (aparecen en algun aviso).
    - Camps: idDelincuent (PK autoincremental), name (varchar).

## Instrucciones extra

Resume este promt en el archivo registre-ia.md exactamente en el mismo formato que estan los demas resumidos.