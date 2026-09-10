import "dotenv/config";
import express from "express";
import cors from "cors";
import { hacer_consulta_ia } from "./routes/asistente.js";
import router_usuario from "./routes/usuarios.js";
import route_calendario from "./routes/calendario.js";

const app = express();
app.use(express.json());
app.use(cors());

app.use("/usuario", router_usuario);
app.use("/calendario/tareas", route_calendario);
app.get("/", async (req, res) => {
    res.send("funciona");
});

app.get("/asistente", async (req, res) => {
    try {
        const respuesta = await hacer_consulta_ia(
            "bueno chat quiero que para mañana me pongas una tarea que sea ir al cine a las 11 de la mañana",
        );
        res.send(respuesta);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post("/asistente", async (req, res) => {
    try {
        const datos = req.body;
        const respuesta = await hacer_consulta_ia(datos.prompt);
        res.json({ status: "success", respuesta: respuesta });
    } catch (error) {
        res.status(500).json({ status: "error", detalle: error.message });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
