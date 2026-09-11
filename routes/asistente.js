import { GoogleGenAI } from "@google/generative-ai";
import OpenAI from "openai";

// 1. Configuramos el proveedor principal: Google Gemini
const aiGoogle = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 2. Configuramos el proveedor de auxilio: OpenRouter (usará tus $5.80)
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

export async function hacer_consulta_ia(texto) {
    // Calculamos la hora exacta restando las 3 horas de desfase para tu sistema
    const ahora = new Date();
    const tresHoras = 3 * 60 * 60 * 1000; 
    const fechaActualISO = new Date(ahora.getTime() - tresHoras).toISOString().slice(0, 19);

    // Este es tu prompt exacto del sistema
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

    // INTENTO 1: Probamos con Google Gemini de forma 100% gratuita
    try {
        // Usamos el modelo rápido y potente Gemini 2.5 Flash
        const respuestaGoogle = await aiGoogle.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                { role: "user", parts: [{ text: `${promptSistema}\n\nPedido del usuario: ${texto}` }] }
            ],
            // Forzamos a Gemini a responder puramente en formato JSON
            config: { responseMimeType: "application/json" }
        });

        const respuestaIA = respuestaGoogle.response?.text;
        if (!respuestaIA) throw new Error("Gemini no devolvió texto");

        return respuestaIA.trim();

    } catch (errorGoogle) {
        console.warn("Gemini falló o alcanzó límite por minuto. Saltando a OpenRouter de auxilio...", errorGoogle.message);

        // INTENTO 2: Si Gemini falla, tu saldo de OpenRouter te rescata
        try {
            const completion = await openai.chat.completions.create({
                // Cambié Nemotron Free por DeepSeek Chat (usa tus créditos, cuesta casi $0 y no se traba)
                model: "deepseek/deepseek-chat",
                messages: [
                    { role: "system", content: promptSistema },
                    { role: "user", content: texto },
                ],
            });

            const respuestaIA = completion?.choices?.[0]?.message?.content;
            if (!respuestaIA) throw new Error("OpenRouter no devolvió respuesta");

            return respuestaIA.replace(/```json|```/g, "").trim();

        } catch (errorOpenRouter) {
            console.error("Ambos proveedores fallaron:", errorOpenRouter);
            return JSON.stringify({ error: true, detalle: "Todos los servicios de IA están caídos", hora: fechaActualISO });
        }
    }
}