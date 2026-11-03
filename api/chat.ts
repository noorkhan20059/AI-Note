import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY || '';
    const {
      message = '',
      history = [],
      documentContext = '',
      language = 'english',
      imageUrl = '',
    } = req.body || {};

    const cleanMsg = typeof message === 'string' ? message.trim().slice(0, 2000) : '';
    if (!cleanMsg && !imageUrl) {
      return res.status(400).json({ error: 'Valid study question is required.' });
    }

    const langInstruction =
      language === 'urdu'
        ? 'Respond primarily in fluent, academic Urdu (اردو script) while keeping technical and scientific terms clear.'
        : language === 'roman_urdu'
        ? 'Respond in clear, friendly Roman Urdu (Urdu written in Latin alphabet, e.g., "Yeh topic parhai mein bohot ahem hai...").'
        : 'Respond in clear, encouraging, pedagogical English with precise terminology.';

    const systemPrompt = `You are "AI Study Buddy", an elite universal personal tutor and smart learning assistant.
Your mission is to guide students and answer ALL questions related to studies across ANY subject.
Always be welcoming, patient, articulate, encouraging, and pedagogical.
${langInstruction}

When answering:
1. Answer ANY question related to studies thoroughly, intuitively, and with high academic clarity.
2. If the user question relates to the attached study document, ground your explanation in that text and cite page numbers.
3. Structure your response into valid JSON:
{
  "reply": "The main conversational, clear explanation broken into clean paragraphs.",
  "tldr": "A crisp 1-2 sentence core takeaway.",
  "matrix": "Optional markdown comparison table or null if not comparing concepts.",
  "mnemonic": "A memorable mental hook, acronym, or real-life analogy.",
  "citations": ["Source: Page 12, Section 4.3"],
  "followUps": ["Next question 1?", "Next question 2?", "Next question 3?"],
  "drillQuestion": {
    "question": "Quick check question...",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "answer": "A) ...",
    "explanation": "Why this is correct..."
  }
}`;

    const userPrompt = `Attached Document Context:
${documentContext ? documentContext.slice(0, 8000) : 'General Study Mode: Universal Academic Assistant'}

Conversation History:
${(Array.isArray(history) ? history : [])
  .slice(-4)
  .map((h: any) => `${h.role || 'user'}: ${h.text || h.content || ''}`)
  .join('\n')}

Student Question: "${cleanMsg}"

Return your response in valid JSON matching the requested structure.`;

    if (!apiKey) {
      return res.status(200).json(generateFallbackChat(cleanMsg, language));
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const imageParts = imageUrl
      ? [
          {
            inlineData: {
              data: imageUrl.includes('base64,') ? imageUrl.split('base64,')[1] : imageUrl,
              mimeType: 'image/jpeg',
            },
          },
        ]
      : [];

    const candidateModels = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
    let rawText = '';
    let lastErr: any = null;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [...imageParts, { text: userPrompt }],
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        });
        rawText = response.text || '{}';
        if (rawText && rawText.length > 5) break;
      } catch (err: any) {
        lastErr = err;
        console.warn(`[chat] Model ${model} failed:`, err?.message || err);
      }
    }

    if (!rawText) {
      console.warn('[chat] All AI models failed, using fallback chat');
      return res.status(200).json(generateFallbackChat(cleanMsg, language));
    }

    let parsed: any;
    try {
      let cleaned = rawText.trim();
      if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        reply: rawText,
        tldr: 'Key takeaway from the lesson.',
        citations: ['Source: Course Syllabus'],
        followUps: ['Review related chapter notes', 'Practice flashcards', 'Take a quiz'],
      };
    }

    return res.status(200).json(parsed);
  } catch (err: any) {
    console.error('[chat] Unexpected error:', err);
    return res.status(200).json(generateFallbackChat(req.body?.message || '', req.body?.language || 'english'));
  }
}

function generateFallbackChat(message: string, language: string): any {
  const isUrdu = language === 'urdu';
  const isRoman = language === 'roman_urdu';

  if (isRoman) {
    return {
      reply: `Aap ke sawal "${message || 'Study Question'}" ka jawab yeh hai:\n\nParhai mein behtareen tareeqa Active Recall aur Spaced Repetition hai. Jab aap kisi concept ko samajhte hain, to usay choti choti misalon mein toor kar yaad karein.\n\nAap kisi bhi subject (Computer Science, Chemistry, Physics, Math, ya Exam Preparation) ke baray mein sawal pooch sakte hain. Main har concept ko simple tareeqay se samjhaunga.`,
      tldr: 'Kamyab study ke liye active recall aur practical questions solve karna sab se mufeed hai.',
      mnemonic: '💡 Tip: Parhai ko ratta lagane ke bajaye "Kyun aur Kaise" par focus karein.',
      citations: ['Source: Course Material'],
      followUps: ['Is concept par practice quiz generate karein', 'Spaced repetition flashcards banayein', 'Ek aasan real-life analogy se samjhayein'],
      drillQuestion: {
        question: 'Active recall ka sab se bara faida kya hai?',
        options: ['Dimagh mein memory trace mazboot hoti hai', 'Sirf waqti tor par yaad rehta hai', 'Time zaya hota hai', 'Kitab parhnay ki zaroorat nahi parti'],
        answer: 'Dimagh mein memory trace mazboot hoti hai',
        explanation: 'Active recall dimagh ke neural pathways ko activate karta hai jis se long-term memory banti hai.',
      },
    };
  }

  if (isUrdu) {
    return {
      reply: `آپ کے سوال "${message || 'تعلیمی سوال'}" کا تفصیلی جواب:\n\nکسی بھی تعلیمی موضوع کو یاد رکھنے کا بہترین طریقہ ایکٹیو ریکال (Active Recall) اور تصوراتی تفہیم ہے۔\n\nآپ مجھ سے سائنس، ریاضی، کمپیوٹر سائنس، تاریخ یا امتحانی تیاری کے بارے میں کوئی بھی سوال پوچھ سکتے ہیں۔ میں ہر موضوع کو آسان انداز میں سمجھانے کے لیے تیار ہوں۔`,
      tldr: 'مفہوم کو سمجھ کر اپنے الفاظ میں دہرانا دیرپا یادداشت کا راز ہے۔',
      mnemonic: '💡 یاد دہانی: رٹا لگانے کے بجائے بنیادی اصولوں کو سمجھیں۔',
      citations: ['Source: نصاب'],
      followUps: ['اس موضوع پر کوئز بنائیں', 'فلیش کارڈز تیار کریں', 'ایک سادہ مثال کے ساتھ سمجھائیں'],
      drillQuestion: {
        question: 'سب سے موثر امتحانی تیاری کا طریقہ کون سا ہے؟',
        options: ['ایکٹیو ریکال اور خود ٹیسٹ لینا', 'صرف کتاب کو بار بار پڑھنا', 'آخری رات جاگنا', 'نوٹس کو ہائی لائٹ کرنا'],
        answer: 'ایکٹیو ریکال اور خود ٹیسٹ لینا',
        explanation: 'خود ٹیسٹ لینے سے معلومات ذہن میں پختہ ہوتی ہیں۔',
      },
    };
  }

  return {
    reply: `Here is the comprehensive academic study guidance regarding "${message || 'your query'}":\n\nWhen studying this concept, break the subject down into first principles. First, identify the core definitions and governing rules. Next, examine how the components interact under different conditions or protocols.\n\nWhether you are preparing for exams in Computer Science, Sciences, Mathematics, or Engineering, active testing and structured breakdowns ensure long-term mastery. Feel free to ask follow-up questions or explore the Notes Maker tab for chapter-by-chapter coverage!`,
    tldr: 'Break down complex academic topics into first principles, then test recall with active practice.',
    mnemonic: '💡 First-Principles Thinking: Strip the problem down to fundamental truths, then reason upward.',
    citations: ['Source: Course Syllabus & Lecture Handouts'],
    followUps: ['Generate a practice quiz on this topic', 'Explain with a real-world analogy', 'Review chapter-by-chapter study notes'],
    drillQuestion: {
      question: 'Which learning technique produces the highest retention according to cognitive science?',
      options: ['Active recall and self-testing', 'Passive re-reading of textbooks', 'Highlighting with multiple colors', 'Cramming the night before'],
      answer: 'Active recall and self-testing',
      explanation: 'Retrieving information from memory creates stronger synaptic pathways and flags weak topics for review.',
    },
  };
}
