import { GoogleGenAI } from '@google/genai';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  maxDuration: 60,
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY || '';
    const { topic = 'Carbocation Rearrangements', accuracy = 42, language = 'english' } = req.body || {};

    const fallbackResponse = {
      title: topic,
      breakdown: [
        'Step 1: Always check if the leaving group generates a secondary carbocation adjacent to a tertiary or quaternary carbon.',
        'Step 2: Look for 1,2-hydride shift or 1,2-methyl shift to gain greater hyperconjugation and tertiary stability.',
        'Step 3: Remember that tertiary allylic or benzylic carbocations are even more stable due to resonance.',
      ],
      analogy: 'Think of carbocations like someone in a cramped bus seat spotting an empty luxury armchair one row over — if a simple 1-step hop creates a much more comfortable state, they will hop instantly!',
      romanUrduTip: 'Carbocation hamesha stable hona chahta hai. Agar 2° carbocation ke barabar mein 3° carbon par Hydrogen hai, toh wo shift ho kar zyada stable 3° carbocation banayega.',
      practiceDrill: [
        {
          question: 'When 2-chloro-3-methylbutane is treated with ethanol/heat, which major product forms after rearrangement?',
          options: ['2-methyl-2-butene (rearranged)', '3-methyl-1-butene (unrearranged)', '2-methyl-1-butene', 'No reaction occurs'],
          answer: '2-methyl-2-butene (rearranged)',
          explanation: 'A 1,2-hydride shift converts the initial secondary carbocation into a more stable tertiary carbocation, followed by Zaitsev elimination to give the most substituted alkene.',
        },
      ],
    };

    if (!apiKey) {
      return res.status(200).json(fallbackResponse);
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `The student is struggling with "${topic}" (current accuracy: ${accuracy}%).
Provide an empathetic, ultra-clear diagnostic masterclass in ${language}.
Format as JSON:
- "title": Topic title
- "breakdown": 3 sequential steps explaining where students usually trip up
- "analogy": A memorable real-world analogy
- "romanUrduTip": A helpful Roman Urdu explanation
- "practiceDrill": 2 targeted multiple choice drill questions with explanation and answers.`;

    const candidateModels = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });
        const parsed = JSON.parse(response.text || '{}');
        if (parsed.title && parsed.breakdown) {
          return res.status(200).json(parsed);
        }
      } catch (err: any) {
        console.warn(`[explain-topic] ${model} failed:`, err?.message || err);
      }
    }

    return res.status(200).json(fallbackResponse);
  } catch (err: any) {
    console.error('Topic explain error:', err);
    return res.status(200).json({
      title: req.body?.topic || 'Topic Explanation',
      breakdown: [
        'Review the foundational rules and definitions for this concept.',
        'Break down the complex process into smaller consecutive stages.',
        'Apply the principles to practice questions to reinforce understanding.',
      ],
      analogy: 'Think of this concept like a structured assembly line where each step relies on the successful completion of the preceding step.',
      romanUrduTip: 'Har step ko alag alag samajh kar practice karein taake concept achi tarah yaad ho jaye.',
      practiceDrill: [],
    });
  }
}

