import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

export async function hacer_consulta_ia(texto) {
    try {
        const ahora = new Date();
        const offset = ahora.getTimezoneOffset() * 60000;
        const fechaActualISO = new Date(ahora.getTime() - offset)
            .toISOString()
            .slice(0, 19);

        const completion = await openai.chat.completions.create({
            model: "openrouter/free",
            messages: [
                {
                    role: "system",
                    content: `Sos un asistente que interpreta órdenes en español para un calendario.
    Fecha y hora actual: ${fechaActualISO} (formato ISO, zona horaria local del usuario).

    Analiza el siguiente pedido del usuario y devolvé SOLO una lista con un JSON o conjunto de JSONS( si te mencionan mas de una actividad) (sin markdown, sin texto adicional) con esta forma exacta, ahora te paso la plantilla pero vos podes agregarle los json que te pida el cliente no hay limite:

    [ {
    "accion": "crear" | "borrar" | "desconocido",
    "titulo": "string o null",
    "descripcion": "string o null",
    "fecha_inicio": "YYYY-MM-DDTHH:mm:ss o null",
    "fecha_final": "YYYY-MM-DDTHH:mm:ss o null"
                    } ]

    Reglas:
    - interpreta los conectores o cuando te mencionan mas de una orden en una misma peticion("tambien","ademas", "igual en ese dia","y",etc), y agrega la cantidad de jsons necesarios en tu respuesta adentro del array
    -siempre mandar uno o mas jsons pero enserados en unos [] para manejarlos como un array
    - no inventar datos de fecha_inicio si no te lo mencionan o te dan una indicacion no se realiza esa tarea
    - para borrar tenes que tener el fecha_inicio y la accion borrar, lo demas no hace falta
    - para agregar rellena como minimo accion, titulo y fecha_inicio, fecha_final. la descripcion es opcional, si no te la dan pone null o lo que diga el titulo
    - la estructura del JSON debe ser EXACTA, con las mismas claves y tipos de datos.
    - en accion nunca podes poner algo distinto a crear, modificar, borrar o desconocido.
    - Si no da hora de fin, poné una hora después del inicio.
    - Si el pedido no tiene que ver con crear, editar o borrar una tarea/evento, usá accion "desconocido".
    - Interpretá fechas relativas ("mañana", "el viernes que viene", "en dos horas") en base a la fecha actual dada.
    - Nunca agregues explicaciones, solo el JSON.
    - para hacer una modificacion crea dos plantillas una de borrar(borra tarea que quiere modificar) y otra de crear(nueva tarea con la cosa que cambio), si te dicen modificar o cambiame o algo parecido, interpreta bastantes sinominos
    

    Pedido del usuario: "${texto}"`,
                },
                { role: "user", content: texto },
            ],
        });

        const respuestaIA = completion?.choices?.[0]?.message?.content;
        if (!respuestaIA) {
            throw new Error("La IA no devolvió ninguna respuesta");
        }

        return respuestaIA.replace(/```json|```/g, "").trim();
    } catch (error) {
        console.error("Error al consultar OpenRouter:", error);
        return JSON.stringify({ error: true, detalle: error.message });
    }
}