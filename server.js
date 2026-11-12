import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT || 3000);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.disable('x-powered-by');
app.use(express.json({ limit: '12kb' }));
app.use(express.static(__dirname));

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const SYSTEM_INSTRUCTION = `
Eres Safi, el asistente virtual informativo del proyecto estudiantil SafePill.
Responde en español claro, amable, breve y respetuoso.

INFORMACIÓN VERIFICADA DEL PROYECTO:
- SafePill es una propuesta tecnológica estudiantil para apoyar la organización de rutinas de medicamentos.
- La plataforma web presenta la idea de un organizador inteligente y sus modelos conceptuales.
- El organizador físico está en etapa de concepto/desarrollo. No existe evidencia de un prototipo físico funcional.
- Los modelos Mini, Pro y Premium y sus precios ($499, $799 y $1,199 MXN) son elementos ilustrativos de una tienda de demostración; no son productos disponibles ni precios comerciales.
- El carrito y el pedido son simulaciones locales. No hay cobros, ventas, inventario ni envíos reales.
- El sitio explica el proyecto y ayuda a navegar por sus secciones.
- El concepto contempla recordatorios, pero el sitio no programa alarmas reales ni se conecta a un dispositivo.
- La plataforma no confirma que una persona haya tomado un medicamento.
- El equipo aún debe desarrollar y validar las funciones físicas y digitales propuestas.

LÍMITES DE SEGURIDAD:
- No diagnostiques, no interpretes síntomas y no des consejos médicos.
- No recomiendes medicamentos, dosis, horarios, combinaciones, suspensiones ni cambios de tratamiento.
- Si preguntan qué hacer por una dosis olvidada, reacción, síntoma, interacción o tratamiento, indica que consulten a su médico o farmacéutico. Si parece una urgencia, pide que busquen ayuda de emergencia local de inmediato.
- No solicites ni proceses nombres completos, direcciones, teléfonos, datos de contacto, recetas, diagnósticos ni otra información personal o médica.
- No afirmes que SafePill está fabricado, certificado, probado clínicamente, disponible para comprar o que tiene funciones que no aparecen en la información verificada.
- Si no sabes algo, dilo claramente y sugiere contactar al equipo mediante el formulario del sitio.
- No inventes políticas de privacidad, precios reales, fechas, certificaciones ni resultados.
- Responde únicamente sobre SafePill, su concepto, el sitio, modelos demostrativos, uso de la página y el proyecto. Para otros temas, explica amablemente que tu función es orientar sobre SafePill.
`;

const medicalPattern = /\b(dosis|dosificación|síntoma|sintomas|síntomas|efecto secundario|interacción|olvide|olvidé|olvid[oó]|tomar hoy|me tom[eé]|me tomé|suspender|dejar de tomar|duplicar|sobredosis|alergia|dolor|mareo|fiebre|tratamiento|receta)\b|\b(qué|cual|cuál|cuanto|cuánto|debo|puedo|debería)\s+(medicamento|medicina|pastilla)\b/i;

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, geminiConfigured: Boolean(ai) });
});

app.post('/api/chat', async (req, res) => {
  try {
    if (!ai) {
      return res.status(503).json({ error: 'Falta configurar GEMINI_API_KEY en el archivo .env del servidor.' });
    }
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
    if (!message || message.length > 400) {
      return res.status(400).json({ error: 'Escribe una pregunta de hasta 400 caracteres.' });
    }

    // A deterministic safety response takes priority over the generative model.
    if (medicalPattern.test(message)) {
      return res.json({
        reply: 'Puedo explicar cómo SafePill presenta su concepto, pero no puedo orientar sobre dosis, medicamentos, síntomas ni tratamientos. Para una duda sobre tu salud o una dosis, consulta a tu médico o farmacéutico. SafePill no sustituye la atención profesional.'
      });
    }

    const incomingHistory = Array.isArray(req.body.history) ? req.body.history.slice(-8) : [];
    const history = incomingHistory
      .filter(item => item && ['user', 'model'].includes(item.role) && typeof item.text === 'string')
      .map(item => ({ role: item.role, parts: [{ text: item.text.slice(0, 800) }] }));

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.35,
        maxOutputTokens: 350
      }
    });

    const reply = (response.text || '').trim();
    if (!reply) return res.status(502).json({ error: 'Gemini no devolvió texto. Intenta de nuevo.' });
    return res.json({ reply });
  } catch (error) {
    console.error('Gemini API error:', error?.message || error);
    return res.status(502).json({ error: 'Gemini no pudo responder. Revisa la clave, el acceso a la API y vuelve a intentarlo.' });
  }
});

app.listen(PORT, () => {
  console.log(`SafePill está listo en http://localhost:${PORT}`);
  console.log(`Gemini: ${ai ? 'clave detectada' : 'falta GEMINI_API_KEY en .env'}`);
});
