import hacer_consulta from "./base_datos.js";

const actualizar_tarea_calendario = async (plantilla, usuario_id) => {
    try {
        if (plantilla.accion === "crear") {
            return await agregar_tarea(plantilla, usuario_id);
        } else if (plantilla.accion === "borrar") {
            return await borrar_tarea(plantilla, usuario_id);
        } else if (plantilla.accion === "modificar") {
            return await modificar_tarea(plantilla, usuario_id);
        } else {
            return "falla";
        }
    } catch (error) {
        console.error("Error en actualizar_tarea_calendario:", error.message);
        return "error";
    }
};

async function agregar_tarea(plantilla, usuario_id) {
    const query = `
        INSERT INTO tareas (usuario_id, titulo, descripcion, fecha_inicio, fecha_final, completada) 
        VALUES ($1, $2, $3, $4, $5, false)
    `;
    // Enviamos los valores de forma parametrizada y segura
    await hacer_consulta(query, [
        usuario_id, 
        plantilla.titulo, 
        plantilla.descripcion, 
        plantilla.fecha_inicio, 
        plantilla.fecha_final
    ]);
    return "accion crear";
}

const modificar_tarea = async (plantilla, usuario_id) => {
    // En Postgres no se necesita STR_TO_DATE, la conversión de los strings 'YYYY-MM-DDTHH:mm:ss' es automática
    const query = `
        UPDATE tareas 
        SET titulo = $1, descripcion = $2, fecha_inicio = $3, fecha_final = $4 
        WHERE usuario_id = $5 AND fecha_inicio = $6
    `;
    await hacer_consulta(query, [
        plantilla.titulo, 
        plantilla.descripcion, 
        plantilla.fecha_inicio, 
        plantilla.fecha_final, 
        usuario_id, 
        plantilla.fecha_inicio
    ]);
    return "accion modificar";
};

const borrar_tarea = async (plantilla, usuario_id) => {
    const query = `
        DELETE FROM tareas 
        WHERE usuario_id = $1 AND fecha_inicio = $2
    `;
    // En PostgreSQL/pg no existe '.affectedRows', las consultas DELETE/UPDATE devuelven las filas directamente si usas RETURNING,
    // pero para mantenerlo simple ejecutamos el query de forma directa.
    await hacer_consulta(query, [usuario_id, plantilla.fecha_inicio]);
    return "accion borrar";
};

async function leer_tareas(id_usuario) {
    // En Postgres usamos TO_CHAR en lugar de DATE_FORMAT. 
    // Usamos el formato 'YYYY-MM-DD"T"HH24:MI:SS' para que a React le vuelva exactamente igual que antes.
    const query = `
        SELECT id, titulo, descripcion, 
               TO_CHAR(fecha_inicio, 'YYYY-MM-DD"T"HH24:MI:SS') AS fecha_inicio, 
               TO_CHAR(fecha_final, 'YYYY-MM-DD"T"HH24:MI:SS') AS fecha_final, 
               completada 
        FROM tareas 
        WHERE usuario_id = $1
    `;
    
    const respuesta = await hacer_consulta(query, [id_usuario]);
    return respuesta || [];
}

export default { actualizar_tarea_calendario, leer_tareas };
