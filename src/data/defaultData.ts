import { StudyDocument, ChatMessage, QuizAssessment, Flashcard, StudyStats } from '../types';

export const STUDENT_AVATAR = '/src/assets/images/student_avatar_1793266992590.jpg';
export const STUDY_COVER = '/src/assets/images/study_document_cover_1793266994175.jpg';

export const DEFAULT_DOCUMENTS: StudyDocument[] = [
  {
    id: 'doc-org-chem-ch4',
    name: 'Organic_Chemistry_Ch4_Reaction_Mechanisms.pdf',
    pages: 34,
    subject: 'Organic Chemistry',
    coverImage: STUDY_COVER,
    content: `Chapter 4: Nucleophilic Substitution & Elimination Mechanisms

Section 4.1: Nucleophiles, Electrophiles & Leaving Groups (Page 8)
A nucleophile is an electron-rich species donating a lone pair or pi bond to an electrophilic center. Strong nucleophiles include RS-, I-, CN-, OH-, and RO-. Weak nucleophiles include H2O and ROH. Leaving group ability correlates inversely with basicity: weak bases (conjugate bases of strong acids like I-, Br-, Cl-, and OTs-) are superior leaving groups.

Section 4.2: Steric Hindrance & Substrate Topography (Page 10)
Crowding around the electrophilic carbon profoundly dictates the reaction trajectory. For SN2 backside attacks, primary halides experience negligible steric repulsion (Rate = 1200 relative units), secondary halides encounter moderate repulsion (Rate = 16), and tertiary halides create insurmountable steric strain (Rate ~ 0).

Section 4.3: Bimolecular Nucleophilic Substitution (SN2) & Walden Inversion (Page 12-13)
The SN2 mechanism is concerted—bond-making and bond-breaking occur simultaneously in a single transition state. The nucleophile attacks 180° away from the leaving group (backside attack). This forces the three non-reacting groups through a planar sp2 transition state, resulting in complete inversion of configuration (Walden Inversion), analogous to an umbrella blown inside-out. The kinetic rate law is Rate = k[Substrate][Nucleophile].

Section 4.4: Solvent Architecture: Polar Protic vs Polar Aprotic (Page 14-15)
Polar protic solvents (H2O, CH3OH, EtOH) possess labile protons forming strong hydrogen bonds with nucleophiles, encasing them in a solvent cage and lowering their ground state energy (diminishing SN2 rate). Polar aprotic solvents (DMSO, DMF, Acetone, Acetonitrile) solvate metal cations (Na+, K+) via exposed dipoles while leaving anionic nucleophiles desolvated and 'naked', increasing SN2 velocity up to 10,000-fold.

Section 4.5: Unimolecular Nucleophilic Substitution (SN1) (Page 16-17)
The SN1 pathway is a stepwise process. The rate-determining step is heterolytic cleavage of the carbon-leaving group bond, producing a planar sp2 carbocation intermediate and a free leaving group. The rate law is Rate = k[Substrate]. Attack by the nucleophile can occur from either face of the planar cation with equal probability, leading to racemization.

Section 4.7: Carbocation Rearrangements: Hydride & Alkyl Shifts (Page 18)
Whenever an sp2 carbocation forms, thermodynamic driving forces favor rearrangement if a more stable carbocation can be generated. A 1,2-hydride shift transfers a hydrogen atom with its pair of electrons from an adjacent carbon. A 1,2-methyl (alkyl) shift occurs when a quaternary carbon is adjacent to a secondary cation (e.g. neopentyl rearrangement).

Section 4.8: Hyperconjugation & Stability Rankings (Page 19)
Carbocation stability follows: 3° > 2° >> 1° > methyl. Tertiary allylic and benzylic carbocations are further stabilized by resonance delocalization into adjacent pi systems.

Section 4.10: Elimination (E1 vs E2) Competition & Temperature Influence (Page 22)
Elimination reactions produce alkenes. E2 requires anti-periplanar geometry and strong bases. High reaction temperature favors elimination over substitution because elimination increases the number of product particles (delta S > 0), rendering the -T(delta S) free energy contribution overwhelmingly negative.`,
    sections: [
      {
        title: 'Nucleophiles, Electrophiles & Leaving Groups',
        page: 8,
        section: 'Section 4.1',
        summary: 'Electron density donors, leaving group pKa correlation, conjugate base stability.',
      },
      {
        title: 'Substrate Steric Hindrance',
        page: 10,
        section: 'Section 4.2',
        summary: 'Backside trajectory clearance: Methyl > 1° > 2° >> 3°.',
      },
      {
        title: 'Bimolecular Nucleophilic Substitution (SN2)',
        page: 12,
        section: 'Section 4.3',
        summary: 'Single-step concerted attack, Rate = k[Sub][Nu], Walden stereochemical inversion.',
      },
      {
        title: 'Solvent Effects (Polar Protic vs Aprotic)',
        page: 14,
        section: 'Section 4.4',
        summary: 'Protic solvent cages vs aprotic desolvation naked nucleophiles.',
      },
      {
        title: 'Unimolecular Substitution (SN1)',
        page: 16,
        section: 'Section 4.5',
        summary: 'Two-step ionization, planar carbocation, rate law, racemization.',
      },
      {
        title: 'Carbocation Rearrangements',
        page: 18,
        section: 'Section 4.7',
        summary: '1,2-hydride and 1,2-alkyl shifts driving secondary to tertiary transformation.',
      },
      {
        title: 'Elimination Competition & Heat',
        page: 22,
        section: 'Section 4.10',
        summary: 'Entropy amplification at high temperatures favoring E2/E1 over SN2/SN1.',
      },
    ],
  },
  {
    id: 'doc-bio-cell-resp',
    name: 'Cellular_Respiration_Krebs_Cycle.pdf',
    pages: 28,
    subject: 'Biochemistry',
    content: `Cellular Respiration Chapter 7: Metabolic Oxidation & Electron Transport Chain.
Section 7.1: Glycolysis in the Cytoplasm. Glucose (6C) is cleaved into 2 Pyruvate (3C), yielding net 2 ATP and 2 NADH.
Section 7.2: Pyruvate Dehydrogenase Complex. Oxidation of Pyruvate to Acetyl-CoA with release of CO2.
Section 7.3: The Citric Acid Cycle (Krebs Cycle). Condensation of Acetyl-CoA with Oxaloacetate to produce Citrate.
Section 7.4: Oxidative Phosphorylation. Chemiosmotic proton gradient across the inner mitochondrial membrane driving ATP synthase.`,
    sections: [
      { title: 'Glycolysis Net Yield', page: 4, section: 'Section 7.1', summary: 'Net 2 ATP, 2 NADH substrate phosphorylation.' },
      { title: 'Citric Acid Cycle', page: 12, section: 'Section 7.3', summary: 'Acetyl-CoA condensation and electron carrier reduction.' },
    ],
  },
];

export const DEFAULT_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome',
    role: 'assistant',
    timestamp: 'Just now',
    text: `Hello! I'm your AI Study Buddy. How can I help you with your studies today?

I can answer any questions across all your subjects, explain complex topics step-by-step with real-world analogies, generate customized quizzes, build flashcards for spaced repetition, and review your notes or syllabus.

Ask me anything about your current study material, exam preparation, or any academic concept!`,
    language: 'english',
    tldr: 'Your personal AI study buddy is ready to assist with any academic subject, notes, quizzes, or exam prep.',
    mnemonic: '💡 Tip: You can switch between English, Roman Urdu, and Urdu anytime, or upload custom study notes for document grounding.',
    followUps: [
      'Explain a difficult concept with an analogy',
      'Can you help me prepare for an upcoming exam?',
      'Explain SN1 vs SN2 reaction mechanisms from Chapter 4',
      'Generate a 5-question quick practice drill',
    ],
  },
];


export const DEFAULT_QUIZZES: QuizAssessment[] = [
  {
    id: 'quiz-cached-1',
    title: 'Reaction Mechanisms & Stereochemistry',
    topic: 'Organic Chemistry',
    difficulty: 'Medium',
    totalQuestions: 5,
    score: 4,
    masteryPercentage: 80,
    dateCreated: 'Yesterday, 4:20 PM',
    dateCompleted: 'Yesterday, 4:32 PM',
    retryCount: 2,
    questions: [
      {
        id: 'q1',
        question: 'Which substrate undergoes SN2 substitution at the fastest rate?',
        type: 'mcq',
        options: ['1-bromobutane', '2-bromobutane', '2-bromo-2-methylpropane', 'Neopentyl bromide'],
        correctAnswer: '1-bromobutane',
        userAnswer: '1-bromobutane',
        isCorrect: true,
        explanation: 'Primary unhindered halides allow the incoming nucleophile direct access without steric collision.',
        citation: 'Source: Page 10, Section 4.2',
        subtopic: 'Steric Effects',
      },
      {
        id: 'q2',
        question: 'What is the stereochemical outcome of an SN1 reaction on an enantiomerically pure chiral secondary halide?',
        type: 'mcq',
        options: ['Complete inversion', 'Complete retention', 'Racemization (loss of optical activity)', 'Formation of a meso diastereomer'],
        correctAnswer: 'Racemization (loss of optical activity)',
        userAnswer: 'Racemization (loss of optical activity)',
        isCorrect: true,
        explanation: 'The ionization step produces an achiral planar sp2 carbocation open to top-face and bottom-face attack.',
        citation: 'Source: Page 16, Section 4.5',
        subtopic: 'Stereochemistry',
      },
      {
        id: 'q3',
        question: 'Which solvent maximizes nucleophile reactivity in an SN2 reaction?',
        type: 'mcq',
        options: ['Water', 'Ethanol', 'Dimethyl sulfoxide (DMSO)', 'Methanol'],
        correctAnswer: 'Dimethyl sulfoxide (DMSO)',
        userAnswer: 'Dimethyl sulfoxide (DMSO)',
        isCorrect: true,
        explanation: 'DMSO is polar aprotic. It does not form hydrogen bonds around the anion, keeping the nucleophile unshielded.',
        citation: 'Source: Page 14, Section 4.4',
        subtopic: 'Solvent Effects',
      },
      {
        id: 'q4',
        question: 'What drives a 1,2-hydride shift in carbocation rearrangements?',
        type: 'mcq',
        options: [
          'Decreasing thermodynamic entropy',
          'Conversion of secondary cation to more stable tertiary cation',
          'Elimination of the alpha hydrogen',
          'Steric hindrance of the solvent cage',
        ],
        correctAnswer: 'Conversion of secondary cation to more stable tertiary cation',
        userAnswer: 'Decreasing thermodynamic entropy',
        isCorrect: false,
        explanation: 'The shift is driven by thermodynamic stability—tertiary carbocations have superior hyperconjugation.',
        citation: 'Source: Page 18, Section 4.7',
        subtopic: 'Carbocation Rearrangements',
      },
      {
        id: 'q5',
        question: 'True or False: Increasing temperature generally favors Elimination (E2/E1) over Substitution (SN2/SN1).',
        type: 'boolean',
        options: ['True', 'False'],
        correctAnswer: 'True',
        userAnswer: 'True',
        isCorrect: true,
        explanation: 'Elimination yields more moles of product (alkene + conjugate acid + halide), making delta S positive so high temperatures amplify -T*deltaS.',
        citation: 'Source: Page 22, Section 4.10',
        subtopic: 'Elimination Competition',
      },
    ],
  },
  {
    id: 'quiz-cached-2',
    title: 'Carbocation Rearrangements & Hydride Shifts',
    topic: 'Organic Chemistry',
    difficulty: 'Exam Hard',
    totalQuestions: 5,
    score: 2,
    masteryPercentage: 40,
    dateCreated: 'Oct 27, 2026',
    dateCompleted: 'Oct 27, 2026',
    retryCount: 1,
    questions: [
      {
        id: 'cq1',
        question: 'When 3,3-dimethyl-2-butanol undergoes acid-catalyzed dehydration, what rearrangement occurs?',
        type: 'mcq',
        options: ['1,2-hydride shift', '1,2-methyl shift', 'Ring contraction', 'No rearrangement'],
        correctAnswer: '1,2-methyl shift',
        userAnswer: '1,2-hydride shift',
        isCorrect: false,
        explanation: 'The secondary carbocation is adjacent to a quaternary carbon possessing only methyl groups, forcing a 1,2-methyl shift.',
        citation: 'Source: Page 18, Section 4.7',
        subtopic: 'Carbocation Rearrangements',
      },
      {
        id: 'cq2',
        question: 'Which of the following is more stable: a secondary allylic carbocation or a simple tertiary carbocation?',
        type: 'mcq',
        options: ['Secondary allylic carbocation', 'Simple tertiary carbocation', 'They have identical stability', 'Primary benzylic is higher'],
        correctAnswer: 'Secondary allylic carbocation',
        userAnswer: 'Simple tertiary carbocation',
        isCorrect: false,
        explanation: 'Resonance delocalization across a pi system in an allylic cation typically provides greater electronic stabilization than hyperconjugation alone.',
        citation: 'Source: Page 19, Section 4.8',
        subtopic: 'Carbocation Rearrangements',
      },
      {
        id: 'cq3',
        question: 'True or False: Concerted SN2 reactions never experience carbocation rearrangement.',
        type: 'boolean',
        options: ['True', 'False'],
        correctAnswer: 'True',
        userAnswer: 'True',
        isCorrect: true,
        explanation: 'Because no discrete carbocation intermediate is formed, rearrangement cannot take place.',
        citation: 'Source: Page 12, Section 4.3',
        subtopic: 'SN2 Mechanism',
      },
      {
        id: 'cq4',
        question: 'What is the driving force behind a pinacol rearrangement?',
        type: 'mcq',
        options: ['Formation of a stable resonance-stabilized oxonium ion', 'Release of ring strain', 'Steric repulsion of adjacent diols', 'Solvation entropy'],
        correctAnswer: 'Formation of a stable resonance-stabilized oxonium ion',
        userAnswer: 'Release of ring strain',
        isCorrect: false,
        explanation: 'The 1,2-alkyl shift produces a cation directly adjacent to an oxygen lone pair, yielding a resonance-stabilized carbonyl product.',
        citation: 'Source: Page 20, Section 4.9',
        subtopic: 'Carbocation Rearrangements',
      },
      {
        id: 'cq5',
        question: 'Which base favors Zaitsev product in E2 elimination of 2-bromobutane?',
        type: 'mcq',
        options: ['Sodium ethoxide (NaOEt)', 'Potassium tert-butoxide (t-BuOK)', 'Lithium diisopropylamide (LDA)', 'Triethylamine'],
        correctAnswer: 'Sodium ethoxide (NaOEt)',
        userAnswer: 'Sodium ethoxide (NaOEt)',
        isCorrect: true,
        explanation: 'Small unhindered bases like ethoxide preferentially abstract the internal proton to form the thermodynamically more substituted alkene (2-butene).',
        citation: 'Source: Page 22, Section 4.10',
        subtopic: 'E2 Regioselectivity',
      },
    ],
  },
];

export const DEFAULT_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    deckId: 'deck-org-chem',
    front: 'What is the kinetic rate law of an SN2 reaction and what does it reveal about the transition state?',
    back: 'Rate = k[Substrate][Nucleophile]. It is second-order overall, indicating that both the substrate and nucleophile are simultaneously involved in the single rate-limiting step.',
    hint: 'Think about bimolecular collision.',
    romanUrdu: 'Rate law dono par munhasir hai (Substrate aur Nucleophile). Dono aik hi waqt mein judtay hain (single step).',
    topic: 'SN2 Kinetics',
    citation: 'Source: Page 12, Section 4.3',
    intervalDays: 4,
    easeFactor: 2.5,
    repetitions: 3,
    nextReviewDate: 'Tomorrow',
    masteryLevel: 'mastered',
  },
  {
    id: 'fc-2',
    deckId: 'deck-org-chem',
    front: 'Why do polar aprotic solvents (e.g. DMSO, DMF, Acetone) accelerate SN2 reactions by orders of magnitude?',
    back: 'Polar aprotic solvents solvate metal cations (e.g. Na+) via dipoles but cannot hydrogen-bond to nucleophilic anions, leaving the anions unshielded ("naked") with high ground-state energy.',
    hint: 'Absence of hydrogen bonding to anions.',
    romanUrdu: 'Aprotic solvent nucleophile ke ird gird H-bond ka jaal nahi banata, is liye nucleophile khula aur bohot tez rehta hai.',
    topic: 'Solvent Effects',
    citation: 'Source: Page 14, Section 4.4',
    intervalDays: 2,
    easeFactor: 2.4,
    repetitions: 2,
    nextReviewDate: 'In 2 days',
    masteryLevel: 'review',
  },
  {
    id: 'fc-3',
    deckId: 'deck-org-chem',
    front: 'What is the primary thermodynamic driving force for a 1,2-hydride shift in a carbocation?',
    back: 'Converting an energetically less stable secondary (2°) carbocation into a more stable tertiary (3°) carbocation stabilized by 9 alpha-hydrogens and hyperconjugation.',
    hint: 'Stability rank: 3° > 2° > 1°.',
    romanUrdu: 'Carbocation 2° se zyada stable 3° mein tabdeel hone ke liye barabar wale carbon se Hydrogen apni taraf kheench leta hai.',
    topic: 'Carbocation Rearrangements',
    citation: 'Source: Page 18, Section 4.7',
    intervalDays: 0,
    easeFactor: 2.0,
    repetitions: 0,
    nextReviewDate: 'Review Now (5 mins)',
    masteryLevel: 'learning',
  },
  {
    id: 'fc-4',
    deckId: 'deck-org-chem',
    front: 'Why does high temperature favor Elimination (E1/E2) over Substitution (SN1/SN2)?',
    back: 'Elimination reactions split one substrate molecule into two or three distinct product species (delta S > 0). Because delta G = delta H - T(delta S), high T magnifies the entropy benefit.',
    hint: 'Look at the Gibbs free energy entropy term: -T*deltaS.',
    romanUrdu: 'Zyada garmi mein molecules azaad hona chahte hain (entropy barhti hai), is liye double bond (alkene) banna asaan ho jata hai.',
    topic: 'Elimination Competition',
    citation: 'Source: Page 22, Section 4.10',
    intervalDays: 4,
    easeFactor: 2.6,
    repetitions: 3,
    nextReviewDate: 'In 4 days',
    masteryLevel: 'mastered',
  },
  {
    id: 'fc-5',
    deckId: 'deck-org-chem',
    front: 'What is Walden Inversion and why is it mandatory in SN2 reactions?',
    back: 'Walden Inversion is the inversion of stereochemical configuration at a chiral center caused by backside nucleophilic attack 180° away from the departing leaving group.',
    hint: 'Like an umbrella flipping inside-out.',
    romanUrdu: 'Jab nucleophile bilkul peechay se attack karta hai to molecule ka rukh ulat jata hai, jaise hawa mein chhatri ulti ho jaye.',
    topic: 'Walden Inversion',
    citation: 'Source: Page 13, Section 4.3',
    intervalDays: 5,
    easeFactor: 2.7,
    repetitions: 4,
    nextReviewDate: 'In 5 days',
    masteryLevel: 'mastered',
  },
];

export const DEFAULT_STATS: StudyStats = {
  streakDays: 4,
  totalStudyMinutes: 870, // 14.5 hours
  quizzesCompleted: 12,
  averageAccuracy: 82,
  masteredCardsCount: 38,
  totalCardsCount: 52,
  lastStudyDate: new Date().toISOString(),
  weeklyMinutes: [
    { day: 'Mon', minutes: 45 },
    { day: 'Tue', minutes: 60 },
    { day: 'Wed', minutes: 35 },
    { day: 'Thu', minutes: 90 },
    { day: 'Fri', minutes: 75 },
    { day: 'Sat', minutes: 110 },
    { day: 'Sun', minutes: 50 },
  ],
  weakTopics: [
    {
      id: 'wt-1',
      name: 'Carbocation Rearrangements',
      accuracy: 42,
      quizzesTaken: 4,
      recommendation: 'Targeted drill on 1,2-hydride vs 1,2-methyl shifts & hyperconjugation stability.',
    },
    {
      id: 'wt-2',
      name: 'E2 Regioselectivity (Zaitsev vs Hofmann)',
      accuracy: 55,
      quizzesTaken: 3,
      recommendation: 'Review bulky bases (t-BuOK, LDA) vs unhindered bases (NaOEt).',
    },
    {
      id: 'wt-3',
      name: 'Solvent Dielectric & Enthalpy Effects',
      accuracy: 64,
      quizzesTaken: 3,
      recommendation: 'Practice differentiating polar protic cage effects from polar aprotic nucleophile activation.',
    },
  ],
};
