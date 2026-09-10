# Backend calendario con IA

## Lo que corregí (sin cambiar tu lógica ni tu estructura)

1. **`asistente.js`**: la API key de OpenRouter estaba escrita directo en el código
   (`apiKey: "sk-or-v1-..."`). La cambié a `apiKey: process.env.OPENROUTER_API_KEY`, para
   que la lea del `.env` y no quede visible en el código que subís a GitHub.

   ⚠️ **Esa clave ya se compartió en un chat antes**, así que igual te recomiendo entrar a
   OpenRouter y regenerarla, para tener una nueva que nadie más vio.

2. **`base_datos.js`**: tenía los datos de MySQL (`host`, `user`, `password`, `database`)
   escritos directo. Ahora los lee de `process.env`. También agregué un `console.error` en
   el `catch` que estaba vacío (antes, si la conexión fallaba, no te enterabas de nada) y evité
   que rompa si `conexion` nunca llegó a crearse.

3. **`schema.sql`**: tenía un desfasaje real — la tabla `tareas` definía las columnas
   `fecha_fin` y `todo_el_dia`, pero tu código (`base_de_datos/calendario.js`) usa
   `fecha_final` y `completada`. Con el schema viejo, cualquier consulta de crear/editar/leer
   tareas iba a tirar error de SQL ("columna no existe"). Ya lo corregí para que coincida.

4. **`config/db.js`**: usaba `require`/`module.exports` (formato viejo de Node), pero tu
   `package.json` tiene `"type": "module"`, así que ese `require` iba a romper apenas se
   importara. Lo pasé a `import`/`export default` como el resto del proyecto. Además sacé el
   pool duplicado que no se usaba y el objeto de configuración con datos fijos.

5. **`.gitignore`**: subiste el archivo como `_gitignore` (con guion bajo), que Git no
   reconoce como ignorado. Lo renombré a `.gitignore` (con el punto) y agregué `.env`,
   `node_modules` y los archivos de Visual Studio (`.suo`, `.sqlite`, etc.) que tampoco hace
   falta subir.

6. **`package.json`**: saqué `@google/genai`, que no se usa en ningún archivo (tu asistente
   usa el paquete `openai` apuntando a OpenRouter, no a Gemini directo).

## Lo que NO toqué

- Las consultas SQL arman los `INSERT`/`UPDATE` concatenando texto directo (sin placeholders
  `?`), lo cual es vulnerable a inyección SQL si algún día esto lo usa gente que no sos vos.
  No lo cambié porque tocaba la lógica, pero quería que lo supieras.
- Las contraseñas de usuario se guardan tal cual las manda el formulario, sin hashear. Mismo
  caso: lo dejo como está porque cambiarlo implica tocar lógica, pero es algo a mejorar antes
  de que esto lo use alguien más que vos.

## Variables de entorno — dónde van y qué significan

Archivo: **`.env`** (raíz del proyecto, al lado de `index.js`). Ya te lo dejé armado con tus
datos reales, listo para correr local. **Este archivo no se sube a GitHub** (está en
`.gitignore`).

| Variable | Para qué es |
|---|---|
| `PORT` | Puerto donde arranca el backend (`4000` por defecto) |
| `DB_HOST` | Dirección de tu MySQL (`localhost` si es tu compu) |
| `DB_USER` | Usuario de MySQL (`root` por defecto en XAMPP) |
| `DB_PASSWORD` | Contraseña de ese usuario (vacía por defecto en XAMPP) |
| `DB_NAME` | Nombre de la base (`bd_node`) |
| `DB_PORT` | Puerto de MySQL (`3306` por defecto) |
| `JWT_SECRET` | Reservada por si en algún momento usás `jsonwebtoken` para sesiones |
| `OPENROUTER_API_KEY` | Tu clave de OpenRouter, para que `asistente.js` pueda consultar la IA |

También incluyo **`.env.example`**, que es una copia sin los valores reales — ese sí se sube
a GitHub, para que cualquiera que clone el repo sepa qué variables tiene que completar.

## Archivos que no incluí

- `tareas.js` (con rutas `/tareas` estilo REST con JWT) y `codigo_para_usar.txt`: ninguno de
  los dos está importado desde `index.js`, así que no forman parte del programa que realmente
  corre — parecen borradores o código de otra versión. No los subí para no confundir, pero si
  los necesitás avisame y te los dejo en el zip igual.

## Cómo correrlo local

1. Tené MySQL corriendo (XAMPP, por ejemplo) y ejecutá `schema.sql` en phpMyAdmin.
2. `npm install`
3. `npm start` (o `npm run dev` para que reinicie solo con cada cambio)
4. Se levanta en `http://localhost:4000`
