import OpenAI from "openai";

// Configuramos OpenRouter con tu API Key
const openai = new OpenAI({
    baseURL: "https://openrouter.ai",
    apiKey: process.env.OPENROUTER_API_KEY,
});

export async function hacer_consulta_ia(texto) {
    // Calculamos la hora exacta restando las 3 horas de desfase para tu sistema
    const ahora = new Date();
    const tresHoras = 3 * 60 * 60 * 1000; 
    const fechaActualISO = new Date(ahora.getTime() - tresHoras).toISOString().slice(0, 19);

    // Tu prompt exacto del sistema
    const promptSistema = `Sos un asistente que interpreta órdenes en español para un calendario.
    Fecha y hora actual: ${fechaActualISO} (formato ISO, zona horaria GMT-3).

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
    
    Pedido del usuario: "${texto}"`;

    // INTENTO 1: Usamos el modelo GRATUITO de Nvidia en OpenRouter (Baja latencia)
    try {
        const completion = await openai.chat.completions.create({
            model: "nvidia/llama-3.1-nemotron-70b-instruct:free", // El gratis de Nvidia ultra rápido
            messages: [
                { role: "system", content: promptSistema },
                { role: "user", content: texto },
            ],
        });

        const respuestaIA = completion?.choices?.[0]?.message?.content;
        if (!respuestaIA) throw new Error("El modelo gratuito no devolvió respuesta");

        return respuestaIA.replace(/```json|```/g, "").trim();

    } catch (errorFree) {
        console.warn("Modelo gratuito de Nvidia agotado o limitado. Usando tus créditos de auxilio...", errorFree.message);

        // INTENTO 2: Si el gratis falla, te salvan tus $5.80 usando DeepSeek Chat (cuesta casi $0)
        try {
            const completionAux = await openai.chat.completions.create({
                model: "deepseek/deepseek-chat", // Modelo de pago ultra barato para no trabar tu app
                messages: [
                    { role: "system", content: promptSistema },
                    { role: "user", content: texto },
                ],
            });

            const respuestaIAAux = completionAux?.choices?.[0]?.message?.content;
            if (!respuestaIAAux) throw new Error("El modelo de auxilio no devolvió respuesta");

            return respuestaIAAux.replace(/```json|```/g, "").trim();

        } catch (errorAux) {
            console.error("Ambos modelos de OpenRouter fallaron:", errorAux);
            return JSON.stringify({ error: true, detalle: "Todos los servicios de OpenRouter están caídos", hora: fechaActualISO });
        }
    }
}