export type Language = 'english' | 'urdu' | 'roman_urdu';

export interface StudyDocument {
  id: string;
  name: string;
  pages: number;
  subject: string;
  coverImage?: string;
  content: string;
  pagesData?: { page: number; text: string }[];
  sections: {
    title: string;
    page: number;
    section: string;
    summary: string;
  }[];
}

export interface GraphCurve {
  id: string;
  name: string;
  formula: string;
  color: string;
  points?: { x: number; y: number }[];
}

export interface KeyGraphPoint {
  x: number;
  y: number;
  label: string;
  type: 'root' | 'vertex' | 'intercept' | 'inflection' | 'equilibrium' | 'custom';
}

export interface StudyGraphData {
  id: string;
  title: string;
  subject: string;
  description: string;
  curves: GraphCurve[];
  xLabel: string;
  yLabel: string;
  xRange: [number, number];
  yRange: [number, number];
  keyPoints?: KeyGraphPoint[];
  insights?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  timestamp: string;
  text: string;
  imageUrl?: string;
  language?: Language;
  documentCitation?: string;
  tldr?: string;
  matrix?: string;
  mnemonic?: string;
  citations?: string[];
  followUps?: string[];
  graphData?: StudyGraphData;
  drillQuestion?: {
    question: string;
    options: string[];
    answer: string;
    explanation: string;
    userAnswer?: string;
    isCorrect?: boolean;
  };
}

export type QuestionType = 'mcq' | 'boolean' | 'short';

export interface QuizQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  citation?: string;
  subtopic: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface QuizAssessment {
  id: string;
  title: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Exam Hard';
  questions: QuizQuestion[];
  score?: number;
  totalQuestions: number;
  masteryPercentage?: number;
  dateCreated: string;
  dateCompleted?: string;
  retryCount: number;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  hint: string;
  romanUrdu: string;
  topic: string;
  citation?: string;
  // Spaced repetition fields (SM-2 simplified)
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  lastReviewed?: string;
  nextReviewDate: string;
  masteryLevel: 'learning' | 'review' | 'mastered';
}

export interface StudyNotes {
  id: string;
  topic: string;
  subject: string;
  summary: string;
  keyPoints: string[];
  formulasOrDefinitions: { label: string; detail: string }[];
  practicePrompt: string;
  dateCreated: string;
  graphData?: StudyGraphData;
}

export interface WeakTopic {
  id: string;
  name: string;
  accuracy: number; // e.g. 42%
  quizzesTaken: number;
  recommendation: string;
}

export interface StudyStats {
  streakDays: number;
  totalStudyMinutes: number;
  quizzesCompleted: number;
  averageAccuracy: number;
  masteredCardsCount: number;
  totalCardsCount: number;
  weeklyMinutes: { day: string; minutes: number }[];
  weakTopics: WeakTopic[];
  lastStudyDate: string;
}

export type NoteGenerationMode = 'detailed' | 'simple' | 'quick';

export interface DocumentOutlineTopic {
  id: string;
  chapter?: string;
  topicName: string;
  subtopics: string[];
  pageRange?: string;
  contentSnippet?: string;
}

export interface DocumentOutline {
  documentTitle: string;
  subject: string;
  totalDetectedPages: number;
  topics: DocumentOutlineTopic[];
}


export type TopicCoverageStatus = 'pending' | 'processing' | 'complete' | 'incomplete' | 'failed';

export interface SubtopicExplanation {
  subtopicTitle: string;
  conceptExplanation: string;
  keyPoints: string[];
  practicalScenarioOrExample?: string;
  technicalDetails?: string;
}

export interface DetailedTopicNote {
  id: string;
  chapter?: string;
  topicName: string;
  subtopics: string[];
  pageRange?: string;
  status: TopicCoverageStatus;
  coverageScore?: number;
  verifiedInDepth?: boolean;
  missingDetails?: string[];
  sourcePageNumbers?: number[];
  introduction: {
    concept: string;
    importance: string;
    overview: string;
  };
  subtopicBreakdown?: SubtopicExplanation[];
  detailedExplanation: {
    heading: string;
    points: string[];
  }[];
  importantDefinitions: {
    term: string;
    definition: string;
    simpleExplanation?: string;
  }[];
  examples: {
    title: string;
    scenario: string;
    explanation: string;
  }[];
  formulasAndCalculations: {
    formula: string;
    purpose: string;
    variables: string;
    exampleCalculation?: string;
  }[];
  importantPoints: string[];
  advantagesDisadvantages?: {
    advantages: string[];
    disadvantages: string[];
    applications: string[];
  };
  comparisons?: {
    conceptA: string;
    conceptB: string;
    keyDifferences: string[];
  }[];
  examPreparation: {
    highYieldConcepts: string[];
    sampleQuestions: {
      question: string;
      answer: string;
    }[];
  };
  topicSummary?: string;
}

export interface TopicCoverageTracker {
  totalTopics: number;
  completedTopics: number;
  incompleteTopics: number;
  pendingTopics: number;
  coveragePercentage: number;
  totalSubtopics: number;
  completedSubtopics: number;
}

export interface ComprehensiveDocumentNotes {
  id: string;
  documentId: string;
  documentName: string;
  subject: string;
  mode: NoteGenerationMode;
  generatedAt: string;
  executiveSummary: string;
  overallSummary: string;
  topics: DetailedTopicNote[];
  totalTopicsCount: number;
  coverageTracker?: TopicCoverageTracker;
  allOutlineTopics?: DocumentOutlineTopic[];
}



