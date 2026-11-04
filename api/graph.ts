import { GoogleGenAI } from '@google/genai';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  maxDuration: 60,
};

function getFallbackGraph(prompt: string) {
  return {
    id: `graph-fallback-${Date.now()}`,
    title: 'Kinetic Reaction Coordinate & Free Energy Diagram',
    subject: 'Physical & Organic Chemistry',
    description: 'Reaction coordinate profile contrasting uncatalyzed vs catalyzed activation barriers (ΔG‡) and overall thermodynamic spontaneity (ΔG°).',
    curves: [
      {
        id: 'uncatalyzed',
        name: 'Uncatalyzed Pathway (High Ea)',
        formula: '4 * exp(-0.5 * (x - 2)^2) + 0.2 * (x - 1)',
        color: '#ef4444',
      },
      {
        id: 'catalyzed',
        name: 'Enzyme/Catalyzed Pathway (Lower Ea)',
        formula: '2.2 * exp(-0.8 * (x - 2)^2) + 0.2 * (x - 1)',
        color: '#10b981',
      },
    ],
    xLabel: 'Reaction Coordinate (Progress)',
    yLabel: 'Gibbs Free Energy (G)',
    xRange: [-1, 5],
    yRange: [-1, 6],
    keyPoints: [
      { x: 0, y: 0.2, label: 'Reactants (Ground State)', type: 'intercept' },
      { x: 2, y: 4.2, label: 'Uncatalyzed TS‡', type: 'vertex' },
      { x: 2, y: 2.4, label: 'Catalyzed TS‡', type: 'vertex' },
      { x: 4, y: 0.8, label: 'Products (Exergonic)', type: 'root' },
    ],
    insights: [
      'Catalysts accelerate reaction rates by stabilizing transition states and lowering activation energy (ΔG‡).',
      'The net thermodynamic free energy change (ΔG°) between reactants and products remains completely unchanged.',
    ],
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY || '';
    const { prompt = 'Plot a quadratic parabola with roots at -2 and 2', subject = 'Mathematics' } = req.body || {};

    if (!apiKey) {
      return res.status(200).json(getFallbackGraph(prompt));
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemPrompt = `You are a STEM mathematical & scientific graphing assistant for students.
Given a student request for a graph in Math, Physics, Chemistry, Biology, Economics, or Statistics, produce an interactive graph configuration.
Formulas MUST be standard Javascript mathematical expressions using 'x' as the independent variable (e.g. "x^2 - 4", "sin(x)", "exp(-0.5*x)", "100/(5+x)").
Specify realistic xRange [min, max] and yRange [min, max], key critical points (roots, vertex, equilibrium, intercepts), and 2 clear pedagogical insights.`;

    const userPrompt = `Student Graph Request: "${prompt}"
Subject Area: ${subject}

Return a valid JSON object matching:
{
  "id": "graph-ai-${Date.now()}",
  "title": "Title of the graph",
  "subject": "${subject}",
  "description": "Short explanation of the curve",
  "curves": [
    {
      "id": "c1",
      "name": "f(x) = ...",
      "formula": "x^2 - 4",
      "color": "#4f46e5"
    }
  ],
  "xLabel": "x",
  "yLabel": "y",
  "xRange": [-5, 5],
  "yRange": [-5, 20],
  "keyPoints": [
    { "x": 0, "y": -4, "label": "Vertex / Y-intercept (0, -4)", "type": "vertex" }
  ],
  "insights": [
    "Key mathematical or physical takeaway 1",
    "Key exam or conceptual insight 2"
  ]
}`;

    const candidateModels = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
          },
        });
        const parsed = JSON.parse(response.text || '{}');
        if (parsed.title && parsed.curves) {
          return res.status(200).json(parsed);
        }
      } catch (err: any) {
        console.warn(`[graph] ${model} failed:`, err?.message || err);
      }
    }

    return res.status(200).json(getFallbackGraph(prompt));
  } catch (err: any) {
    console.error('Graph generation error:', err);
    return res.status(200).json(getFallbackGraph(req.body?.prompt || ''));
  }
}

