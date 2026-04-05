export default async function handler(req, res) {
  // 1. Cabeceras de seguridad y permisos (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Si el navegador pregunta si puede conectarse, le decimos que sí
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Solo se permiten peticiones POST' });
  }

  // 2. Comprobar tu llave secreta en Vercel
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Falta la variable GEMINI_API_KEY en Vercel");
    return res.status(500).json({ error: 'Llave de API no configurada en Vercel' });
  }

  // 3. Usamos la versión correcta del modelo Gemini que funcionaba desde el principio
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  try {
    // 4. Preparar los datos tal y como los manda tu página HTML
    const bodyString = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    // 5. Enviar a Google Gemini
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyString
    });
    
    const data = await response.json();

    // 6. Si Google rechaza la petición, mostrar el error exacto
    if (!response.ok) {
        console.error("Error de Google:", data);
        return res.status(response.status).json(data);
    }

    // 7. Si todo va bien, devolver el texto al HTML
    return res.status(200).json(data);
    
  } catch (error) {
    console.error("Error interno:", error);
    return res.status(500).json({ error: 'Fallo interno del servidor' });
  }
}
