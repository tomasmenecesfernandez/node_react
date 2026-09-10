// Datos de conexión a MySQL, leídos desde variables de entorno (.env).
// No se usa en el resto del proyecto todavía (base_de_datos/base_datos.js abre su propia
// conexión), pero lo dejo disponible por si en algún momento se arma un pool centralizado.
const configuracion = {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    user: process.env.DB_USER,
    port: process.env.DB_PORT || 3306,
};

export default configuracion;
