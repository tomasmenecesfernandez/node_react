import hacer_consulta from "./base_datos.js";

const actualizar_tarea_calendario = async (plantilla, usuario_id) => {
    try {
        if (plantilla.accion == "crear") {
            return await agregar_tarea(plantilla, usuario_id);
        } else if (plantilla.accion == "borrar") {
            return await borrar_tarea(plantilla, usuario_id);
        } else if (plantilla.accion == "modificar") {
            return await modificar_tarea(plantilla, usuario_id);
        } else {
            return "falla";
        }
    } catch (error) {
        console.log(error.message);
    }
};
async function agregar_tarea(plantilla, usuario_id) {
    hacer_consulta(
        `insert into tareas (usuario_id, titulo, descripcion, fecha_inicio, fecha_final,completada) 
                   values (${usuario_id}, '${plantilla.titulo}', '${plantilla.descripcion}', '${plantilla.fecha_inicio}', '${plantilla.fecha_final}',false)`,
    );
    return "accion crear";
}
const modificar_tarea = (plantilla, usuario_id) => {
    hacer_consulta(
        `update tareas set  titulo='${plantilla.titulo}', descripcion='${plantilla.descripcion}', fecha_inicio='${plantilla.fecha_inicio}', fecha_final='${plantilla.fecha_final}' where usuario_id=${usuario_id} 
                 and fecha_inicio = STR_TO_DATE(LEFT(REPLACE('${plantilla.fecha_inicio}', 'T', ' '), 19), '%Y-%m-%d %H:%i:%s')`,
    );
    return "accion modificar";
};
const borrar_tarea = async (plantilla, usuario_id) => {
    const resultado = await hacer_consulta(
        `delete from tareas 
                 where usuario_id=${usuario_id} 
                 and fecha_inicio = STR_TO_DATE(LEFT(REPLACE('${plantilla.fecha_inicio}', 'T', ' '), 19), '%Y-%m-%d %H:%i:%s')`,
    );

    if (resultado && resultado.affectedRows > 0) {
        return "accion borrar";
    } else {
        return "no existe tarea";
    }
};
async function leer_tareas(id_usuario) {
    const respuesta = await hacer_consulta(
        `select id, titulo, descripcion, 
        DATE_FORMAT(fecha_inicio, '%Y-%m-%d %H:%i:%s') as fecha_inicio, 
        DATE_FORMAT(fecha_final, '%Y-%m-%d %H:%i:%s') as fecha_final, completada 
 from tareas where usuario_id=${id_usuario}`,
    );
    if (respuesta) {
        return respuesta;
    }
}
export default { actualizar_tarea_calendario, leer_tareas };
