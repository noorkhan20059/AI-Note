import { GoogleGenAI } from '@google/genai';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  maxDuration: 60,
};

function getFallbackNotes(topic: string, subject: string, subtopics: string) {
  return {
    id: `notes-${Date.now()}`,
    topic,
    subject,
    summary: `${topic} is a cornerstone concept in ${subject}. Understanding its foundational mechanisms, kinetic pathways, and governing thermodynamic principles is critical for academic mastery.`,
    keyPoints: [
      `Core Principle: ${topic} operates via standardized sequential transformations and conservation laws.`,
      `Governing Factor: External parameters directly determine system selectivity and process velocity.`,
      `Exam Insight: Frequently evaluated in comparison problems and multi-step reaction mechanism questions.`,
      `Practical Takeaway: Always trace the highest-energy transition state to predict the rate-determining step.`,
    ],
    formulasOrDefinitions: [
      {
        label: `${topic} Standard Definition`,
        detail: `The precise academic and theoretical framework establishing how ${topic} functions within ${subject}.`,
      },
      {
        label: 'Rate Law Expression',
        detail: 'Rate = k [Substrate]^m [Reagent]^n, where overall order equals m + n.',
      },
    ],
    practicePrompt: `Compare and contrast the kinetic and thermodynamic outcomes of ${topic} under high versus low temperature conditions.`,
    dateCreated: 'Just now',
    graphData: {
      id: `graph-notes-${Date.now()}`,
      title: `${topic} Energy Coordinate Profile`,
      subject,
      description: 'Reaction coordinate highlighting ground state, transition state barrier, and products.',
      curves: [
        {
          id: 'c1',
          name: 'Free Energy Pathway',
          formula: '3.5 * exp(-0.6 * (x - 2)^2) + 0.3 * (x - 1)',
          color: '#4f46e5',
        },
      ],
      xLabel: 'Reaction Progress',
      yLabel: 'Free Energy (G)',
      xRange: [-1, 5],
      yRange: [-1, 5],
      keyPoints: [
        { x: 0, y: 0.3, label: 'Reactants', type: 'intercept' },
        { x: 2, y: 3.8, label: 'Transition State ‡', type: 'vertex' },
        { x: 4, y: 0.9, label: 'Products', type: 'root' },
      ],
      insights: [
        'The height of the activation barrier determines the overall reaction rate.',
        'Exergonic formation of products provides the thermodynamic driving force.',
      ],
    },
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY || '';
    const {
      topic = 'Reaction Mechanisms',
      subtopics = '',
      subject = 'Organic Chemistry',
      documentContext = '',
    } = req.body || {};

    if (!apiKey) {
      return res.status(200).json(getFallbackNotes(topic, subject, subtopics));
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemPrompt = `You are an expert academic note-taking assistant.
Generate clean, highly structured, comprehensive study notes for the given topic and subtopics in ${subject}.
If document context is provided, ground the notes in the text.
Structure the response as a JSON object with:
- "id": "notes-" + timestamp
- "topic": Topic name
- "subject": Subject name
- "summary": Executive summary paragraph (2-3 sentences)
- "keyPoints": Array of 4-6 bullet point statements capturing core concepts
- "formulasOrDefinitions": Array of objects with {"label": "Term/Formula", "detail": "Definition or explanation"}
- "practicePrompt": A challenging review prompt for active recall
- "dateCreated": "Just now"
- "graphData": A visual graph or conceptual curve object with { id, title, subject, description, curves: [{ id: "c1", name: "Curve", formula: "x^2 - 4*x + 3", color: "#4f46e5" }], xLabel: "x", yLabel: "y", xRange: [-2, 6], yRange: [-2, 10], keyPoints: [{ x: 2, y: -1, label: "Vertex / Equilibrium", type: "vertex" }], insights: ["Visual takeaway 1"] } to provide a diagram for easy learning.`;

    const userPrompt = `Topic: "${topic}"
Subtopics to cover: "${subtopics || 'General overview of subtopics'}"
Subject: "${subject}"
Document Context: "${documentContext ? documentContext.slice(0, 6000) : 'General Study Mode'}"

Return valid JSON matching the requested structure.`;

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
        if (parsed.topic && parsed.summary) {
          return res.status(200).json(parsed);
        }
      } catch (err: any) {
        console.warn(`[notes] ${model} failed:`, err?.message || err);
      }
    }

    return res.status(200).json(getFallbackNotes(topic, subject, subtopics));
  } catch (err: any) {
    console.error('Notes generation error:', err);
    return res.status(200).json(
      getFallbackNotes(
        req.body?.topic || 'General Topic',
        req.body?.subject || 'General Study',
        req.body?.subtopics || ''
      )
    );
  }
}

