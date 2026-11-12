# SafePill Web — integración de Gemini

## Qué se modificó

- Safi ahora envía las preguntas a un servidor Node.js.
- El servidor utiliza el SDK oficial `@google/genai` para consultar Gemini.
- La clave API se lee desde `.env` en el servidor; **no está escrita en `script.js` ni en `index.html`**.
- El chat conserva una pequeña parte del contexto de la conversación mientras la página está abierta.
- Se añadió una respuesta de seguridad que intercepta preguntas sobre medicamentos, dosis, síntomas y tratamientos antes de llamar a Gemini.
- El carrito, los precios ilustrativos, el formulario y las demás secciones del sitio se conservaron.

## Requisitos

- Node.js 22 o posterior.
- Una clave de Gemini API creada por una persona adulta responsable del equipo o con su supervisión.
- Conexión a internet para que el servidor consulte Gemini.

Documentación oficial del SDK: https://googleapis.github.io/js-genai/

## Configuración inicial

1. Descomprime la carpeta del proyecto.
2. Abre esa carpeta en Visual Studio Code.
3. Abre la terminal integrada en Visual Studio Code.
4. Comprueba que Node está instalado:

   ```bash
   node -v
   ```

5. Instala las dependencias:

   ```bash
   npm install
   ```

6. Copia `.env.example` y crea un archivo nuevo llamado `.env` en la misma carpeta que `server.js`.
7. Abre `.env` y sustituye `PEGA_AQUI_TU_CLAVE_PRIVADA` por la clave API de Gemini. No agregues comillas.
8. Guarda `.env`. **No compartas ese archivo, no lo subas a GitHub y no pegues la clave en el chat.** Está incluido en `.gitignore` para evitar subirlo por accidente.
9. Inicia el servidor:

   ```bash
   npm start
   ```

10. Abre en el navegador: http://localhost:3000

No abras `index.html` con doble clic (`file://`). El chat necesita que la página se abra desde el servidor local.

## Comprobar la conexión

Con el servidor encendido, abre http://localhost:3000/api/health

- `"ok": true` indica que el servidor está funcionando.
- `"geminiConfigured": true` indica que el servidor detectó una clave en `.env`.
- Esto confirma que la clave está configurada, pero no garantiza por sí solo que Gemini haya respondido correctamente. Para probarlo, vuelve al sitio y pregunta: **¿Qué es SafePill?**

Si falla:
- `Falta configurar GEMINI_API_KEY`: revisa que el archivo se llame exactamente `.env`, esté junto a `server.js` y contenga la clave.
- Error de API o autenticación: revisa que la clave sea válida y que el acceso a Gemini API esté habilitado para esa clave.
- Si modificas `.env`, detén el servidor con `Ctrl + C` y vuelve a ejecutar `npm start`.

## Publicar el sitio

Esta versión usa un backend. Por eso no basta con subir solamente `index.html` a un hosting estático. Para publicarlo, hay que desplegar **toda la aplicación Node.js** en un servicio que permita ejecutar Node y configurar `GEMINI_API_KEY` como variable de entorno/secret del servicio. No subas `.env`.

La dirección `http://localhost:3000` solo funciona en la computadora donde se está ejecutando el servidor; no es un enlace público para los jueces.

## Seguridad y límites de Safi

- Safi informa sobre el proyecto y ayuda a explorar la página; no es un profesional de salud.
- No diagnostica, recomienda medicamentos ni sugiere dosis o cambios de tratamiento.
- Las preguntas que coinciden con temas médicos reciben una respuesta fija de seguridad antes de llamar a Gemini.
- No escribas datos personales, recetas ni información médica en el chat.
- La API key se mantiene en el servidor. No la coloques en archivos públicos del sitio.
- Gemini puede equivocarse. La información del proyecto debe verificarse y el asistente no debe presentarse como una fuente médica.
- Los modelos y precios de la tienda siguen siendo ilustrativos; no son productos ni precios comerciales.

## Archivos importantes

- `index.html`: estructura del sitio.
- `styles.css`: diseño visual.
- `script.js`: interfaz del chat y funciones de la página.
- `server.js`: backend y conexión segura con Gemini.
- `package.json`: dependencias y comandos.
- `.env.example`: plantilla para configurar la clave.
- `.gitignore`: evita incluir `.env` y `node_modules` al compartir el proyecto.
