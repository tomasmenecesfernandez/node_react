import express from "express";
import hacer_consulta from "../base_de_datos/base_datos.js";

const router_usuario = express.Router();

router_usuario.get("/", async (req, res) => {
    try {
        res.send(await hacer_consulta("select * from usuarios"));
    } catch (error) {
        res.send(error.message);
    }
});
router_usuario.post("/registro", async (req, res) => {
    const datos = await req.body;
    try {
        await hacer_consulta(
            `insert into usuarios (nombre_completo,contraseña,email)values('${datos.nombre_completo}','${datos.contraseña}','${datos.email}')`,
        );
        res.send(await hacer_consulta("select * from usuarios"));
    } catch (error) {
        res.send(error.message);
    }
});

router_usuario.post("/login", async (req, res) => {
    const datos = await req.body;
    try {
        const usuario_ingresado = await hacer_consulta(
            `select * from usuarios where email='${datos.email}' and contraseña='${datos.contraseña}'`,
        );
        if (usuario_ingresado.length > 0) {
            return res.json({
                respuesta: "valido",
                usuario_ingresado: usuario_ingresado,
            });
        } else {
            return res.json({ respuesta: "invalido" });
        }
    } catch (error) {
        res.send(error.message);
    }
});

export default router_usuario;
