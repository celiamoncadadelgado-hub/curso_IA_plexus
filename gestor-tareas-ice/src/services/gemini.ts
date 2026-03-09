import type { GeminiAnalysis } from '../types';

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const analyzeTask = async (description: string): Promise<GeminiAnalysis> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

  // Fallback seguro si no hay API key configurada
  if (!apiKey) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      impact: 7,
      confidence: 7,
      ease: 5,
      explanation: `Análisis simulado (sin API key) para: ${description}`,
    };
  }

  const prompt = `Eres un asistente especializado en productividad y priorización.
Tu tarea es analizar descripciones de tareas y asignar valores ICE.

Tarea: "${description}"

Responde SOLO en JSON (sin markdown, sin explicaciones adicionales):
{
  "impact": <número 0-10>,
  "confidence": <número 0-10>,
  "ease": <número 1-10>,
  "explanation": "Breve explicación del razonamiento"
}`;

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 200,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Error en la API de Gemini: ${response.status}`);
  }

  const data = await response.json();
  const content: string | undefined = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) {
    throw new Error('Respuesta vacía de Gemini');
  }

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No se encontró JSON en la respuesta de Gemini');
  }

  const parsed = JSON.parse(jsonMatch[0]) as GeminiAnalysis;

  return parsed;
};

export default { analyzeTask };