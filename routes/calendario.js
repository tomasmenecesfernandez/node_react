import express from "express";
const route_calendario = express.Router();
import calendario from "../base_de_datos/calendario.js";

route_calendario.get("/:id", async (req, res) => {
    const respuesta = await calendario.leer_tareas(req.params.id);
    console.log(respuesta);
    res.json(respuesta);
});
route_calendario.post("/:id", async (req, res) => {
    try {
        const body = req.body;
        const datos = await JSON.parse(body.datos);
        const id = req.params.id;
        let respuesta = null;

        if (datos) {
            for (let i = 0; i < datos.length; i++) {
                respuesta += await calendario.actualizar_tarea_calendario(
                    datos[i],
                    id,
                );
            }
        }

        console.log(`se actualizo el calendario con exito para el id: ${id}`);

        if (respuesta != null) {
            return res.send(respuesta);
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ ok: false, error: error.message });
    }
});
export default route_calendario;
