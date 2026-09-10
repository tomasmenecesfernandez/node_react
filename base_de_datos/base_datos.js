import pg from 'pg';

const hacer_consulta = async (consulta, valores = []) => {
    let cliente;
    try {
        // Creamos la conexión compatible con PostgreSQL y Neon
        cliente = new pg.Client({
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            user: process.env.DB_USER,
            port: process.env.DB_PORT || 5432,
            ssl: {
                rejectUnauthorized: false // Obligatorio para la seguridad de Neon
            }
        });
        
        await cliente.connect();
        
        // Ejecutamos la consulta pasándole los valores de forma segura
        const respuesta = await cliente.query(consulta, valores);
        
        // En PostgreSQL los resultados de las filas vienen dentro de la propiedad '.rows'
        return respuesta.rows;
        
    } catch (error) {
        console.error("Error en la consulta a la base de datos:", error.message);
        throw error; // Lanzamos el error para que el endpoint de Express lo cachee correctamente
    } finally {
        if (cliente) await cliente.end();
    }
};


export default hacer_consulta;
