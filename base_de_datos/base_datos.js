import mysql2 from "mysql2/promise";

const hacer_consulta = async (consulta) => {
    let conexion;
    try {
        conexion = await mysql2.createConnection({
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            user: process.env.DB_USER,
            port: process.env.DB_PORT || 3306,
        });
        const [respuesta] = await conexion.query(consulta);
        return respuesta;
    } catch (error) {
        console.error("Error en la consulta a la base de datos:", error.message);
    } finally {
        if (conexion) await conexion.end();
    }
};

export default hacer_consulta;
