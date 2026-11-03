import React, { useState } from 'react';
import {
  HelpCircle,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Sparkles,
  Bookmark,
  Award,
  ChevronRight,
  Sliders,
  Clock,
  History,
} from 'lucide-react';
import { QuizAssessment, QuizQuestion, StudyDocument } from '../types';

interface QuizTabProps {
  quizzes: QuizAssessment[];
  activeDocument: StudyDocument;
  onGenerateQuiz: (params: {
    topic: string;
    difficulty: 'Easy' | 'Medium' | 'Exam Hard';
    count: number;
    questionType: string;
  }) => Promise<void>;
  onSaveQuizResult: (quiz: QuizAssessment) => void;
  isGenerating: boolean;
  prefillTopic?: string;
}

export const QuizTab: React.FC<QuizTabProps> = ({
  quizzes,
  activeDocument,
  onGenerateQuiz,
  onSaveQuizResult,
  isGenerating,
  prefillTopic,
}) => {
  // Builder state
  const [topic, setTopic] = useState(prefillTopic || activeDocument.subject);
  const [source, setSource] = useState<'document' | 'subject' | 'notes'>('document');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Exam Hard'>('Medium');
  const [count, setCount] = useState<number>(5);
  const [questionType, setQuestionType] = useState<string>('mixed');

  // Active quiz runner state
  const [activeQuiz, setActiveQuiz] = useState<QuizAssessment | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Start new assessment builder trigger
  const handleStartGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGenerateQuiz({
      topic,
      difficulty,
      count,
      questionType,
    });
  };

  // Launch existing cached quiz or freshly generated quiz
  const handleLaunchQuiz = (quiz: QuizAssessment) => {
    setActiveQuiz(quiz);
    setCurrentQIndex(0);
    setUserAnswers({});
    setIsCompleted(false);
    setShowExplanation(false);
  };

  // Retake an existing quiz
  const handleRetakeQuiz = (quiz: QuizAssessment) => {
    const updatedQuiz: QuizAssessment = {
      ...quiz,
      retryCount: (quiz.retryCount || 0) + 1,
      score: undefined,
      masteryPercentage: undefined,
      dateCompleted: undefined,
      questions: quiz.questions.map((q) => ({
        ...q,
        userAnswer: undefined,
        isCorrect: undefined,
      })),
    };
    setActiveQuiz(updatedQuiz);
    setCurrentQIndex(0);
    setUserAnswers({});
    setIsCompleted(false);
    setShowExplanation(false);
  };

  const handleSelectOption = (questionId: string, option: string) => {
    if (isCompleted || showExplanation) return;
    setUserAnswers((prev) => ({ ...prev, [questionId]: option }));
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (!activeQuiz) return;
    if (currentQIndex < activeQuiz.questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setShowExplanation(!!userAnswers[activeQuiz.questions[currentQIndex + 1]?.id]);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    if (!activeQuiz) return;

    let score = 0;
    const evaluatedQuestions = activeQuiz.questions.map((q) => {
      const userAns = userAnswers[q.id];
      const isCorrect = userAns === q.correctAnswer;
      if (isCorrect) score += 1;
      return {
        ...q,
        userAnswer: userAns,
        isCorrect,
      };
    });

    const masteryPercentage = Math.round((score / activeQuiz.questions.length) * 100);

    const finishedQuiz: QuizAssessment = {
      ...activeQuiz,
      questions: evaluatedQuestions,
      score,
      totalQuestions: activeQuiz.questions.length,
      masteryPercentage,
      dateCompleted: 'Just now',
    };

    setActiveQuiz(finishedQuiz);
    setIsCompleted(true);
    onSaveQuizResult(finishedQuiz);
  };

  // If a quiz is active and being taken
  if (activeQuiz) {
    const currentQuestion = activeQuiz.questions[currentQIndex];
    const totalQuestions = activeQuiz.questions.length;
    const progressPercent = ((currentQIndex + 1) / totalQuestions) * 100;
    const selectedAnswer = userAnswers[currentQuestion.id];
    const isAnswered = !!selectedAnswer;

    if (isCompleted) {
      const score = activeQuiz.score || 0;
      const mastery = activeQuiz.masteryPercentage || 0;
      const isMastered = mastery >= 75;

      return (
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 animate-fade-in pb-20 md:pb-6">
          {/* Results Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 text-center shadow-xs">
            <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 ${
              isMastered ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
            }`}>
              <Award className="w-8 h-8" />
            </div>

            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Assessment Summary
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 mb-2">
              {activeQuiz.title}
            </h2>

            {/* Score & Mastery Badges */}
            <div className="flex items-center justify-center gap-3 my-4">
              <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                  {score}/{totalQuestions}
                </span>
                <span className="block text-[11px] text-slate-500">Correct Answers</span>
              </div>

              <div className={`px-4 py-2 rounded-xl border ${
                isMastered
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                <span className="text-2xl font-bold font-mono tabular-nums">
                  {mastery}%
                </span>
                <span className="block text-[11px] font-semibold">
                  {isMastered ? 'Mastered' : 'Needs Practice'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 max-w-md mx-auto mb-6">
              {isMastered
                ? 'Excellent mastery of mechanisms and solvent kinetics. Weak topic detections updated in your analytics dashboard.'
                : 'Review the detailed citations below to reinforce carbocation stability and inversion principles.'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => handleRetakeQuiz(activeQuiz)}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium flex items-center gap-2 transition-colors shadow-2xs"
              >
                <RotateCcw className="w-4 h-4" />
                Retake Quiz (Attempt #{activeQuiz.retryCount + 1})
              </button>
              <button
                onClick={() => setActiveQuiz(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors"
              >
                Return to Assessment Hub
              </button>
            </div>
          </div>

          {/* Question Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Question-by-Question Breakdown
            </h3>
            {activeQuiz.questions.map((q, idx) => (
              <div
                key={q.id}
                className={`p-4 rounded-xl border bg-white text-left space-y-2.5 ${
                  q.isCorrect ? 'border-emerald-200' : 'border-rose-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    Question {idx + 1}: {q.question}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded shrink-0 ${
                    q.isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {q.isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <p className="text-slate-600">
                    <strong className="text-slate-800">Your Answer: </strong>
                    <span className={q.isCorrect ? 'text-emerald-700 font-medium' : 'text-rose-700 font-medium'}>
                      {q.userAnswer || 'Not answered'}
                    </span>
                  </p>
                  {!q.isCorrect && (
                    <p className="text-slate-600">
                      <strong className="text-slate-800">Correct Answer: </strong>
                      <span className="text-emerald-700 font-medium">{q.correctAnswer}</span>
                    </p>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 leading-relaxed border border-slate-100">
                  <p className="mb-1">{q.explanation}</p>
                  {q.citation && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-700 font-medium">
                      <Bookmark className="w-3 h-3 text-indigo-500" />
                      {q.citation}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Question taking view
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5 animate-fade-in pb-24 md:pb-6">
        {/* Top Progress & Quit */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">
              Question {currentQIndex + 1} of {totalQuestions}
            </span>
            <span className="text-slate-300">·</span>
            <span className="font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium">
              {currentQuestion.subtopic}
            </span>
          </div>
          <button
            onClick={() => setActiveQuiz(null)}
            className="hover:text-slate-800 transition-colors text-xs"
          >
            Exit Quiz
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-2xs space-y-5">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {currentQuestion.question}
          </h3>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQuestion.options?.map((opt, oIdx) => {
              const isSelected = selectedAnswer === opt;
              const isCorrect = opt === currentQuestion.correctAnswer;

              let btnStyle = 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-slate-50 text-slate-800';
              if (showExplanation) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-50 border-rose-400 text-rose-900 line-through';
                } else {
                  btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={oIdx}
                  onClick={() => handleSelectOption(currentQuestion.id, opt)}
                  disabled={showExplanation}
                  className={`w-full p-3.5 rounded-xl border text-xs sm:text-sm text-left transition-all flex items-center justify-between min-h-[48px] ${btnStyle}`}
                >
                  <span className="pr-2">{opt}</span>
                  {showExplanation && isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  {showExplanation && isSelected && !isCorrect && (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Inline Feedback & Citation */}
          {showExplanation && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs animate-fade-in">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                <span>Mechanistic Explanation:</span>
              </div>
              <p className="text-slate-700 leading-relaxed">{currentQuestion.explanation}</p>
              {currentQuestion.citation && (
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-700 font-medium bg-indigo-50 px-2 py-0.5 rounded">
                    <Bookmark className="w-3 h-3 text-indigo-500" />
                    {currentQuestion.citation}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            onClick={handleNextQuestion}
            disabled={!isAnswered}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-2xs min-h-[48px]"
          >
            <span>{currentQIndex === totalQuestions - 1 ? 'Finish Assessment' : 'Next Question'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Assessment Builder & Cached Quizzes Hub
  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-5 space-y-8 pb-20 md:pb-8">
      {/* Hero / Builder Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-2xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Gemini-Powered Assessment Builder
          </span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">
          Generate Instant Practice Quizzes
        </h2>
        <p className="text-xs text-slate-500 mb-5">
          Active recall questions grounded directly in your syllabus and textbook chapters.
        </p>

        <form onSubmit={handleStartGeneration} className="space-y-4">
          {/* Source Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Knowledge Source
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSource('document');
                  setTopic(activeDocument.subject);
                }}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  source === 'document'
                    ? 'border-indigo-600 bg-indigo-50/60 font-semibold text-indigo-900'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="block font-bold">Current Document</span>
                <span className="text-[11px] text-slate-500 truncate block mt-0.5">
                  {activeDocument.name}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSource('subject');
                  setTopic('Carbocation Rearrangements');
                }}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  source === 'subject'
                    ? 'border-indigo-600 bg-indigo-50/60 font-semibold text-indigo-900'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="block font-bold">Target Weak Topic</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Carbocation Rearrangements (42%)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSource('notes')}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  source === 'notes'
                    ? 'border-indigo-600 bg-indigo-50/60 font-semibold text-indigo-900'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="block font-bold">Custom Topic</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Type any custom concept
                </span>
              </button>
            </div>
          </div>

          {source === 'notes' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Custom Topic / Mechanism
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., E1 vs E2 Elimination, Solvolysis, Stereochemistry"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          )}

          {/* Difficulty & Volume Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            {/* Difficulty */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Difficulty
              </label>
              <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200">
                {(['Easy', 'Medium', 'Exam Hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      difficulty === diff
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Volume */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Questions
              </label>
              <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200">
                {[5, 10, 15].map((vol) => (
                  <button
                    key={vol}
                    type="button"
                    onClick={() => setCount(vol)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      count === vol
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {vol} Qs
                  </button>
                ))}
              </div>
            </div>

            {/* Question Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Question Style
              </label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
                className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="mixed">Mixed (MCQ + True/False)</option>
                <option value="mcq">Multiple Choice Only</option>
                <option value="boolean">True / False</option>
              </select>
            </div>
          </div>

          {/* Trigger Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isGenerating || !topic.trim()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-2xs min-h-[48px]"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-white" />
                  <span>Synthesizing Questions with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white text-white" />
                  <span>Build & Start Assessment ({count} Questions)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Cached Practice Quizzes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900">
              Cached Practice Quizzes & Mastery History
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            {quizzes.length} stored assessments
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quizzes.map((quiz) => {
            const mastery = quiz.masteryPercentage || 0;
            const isMastered = mastery >= 75;

            return (
              <div
                key={quiz.id}
                className="bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-300 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-mono text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
                      {quiz.difficulty}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {quiz.dateCompleted || quiz.dateCreated}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {quiz.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span>{quiz.totalQuestions} Questions</span>
                    <span>·</span>
                    <span>Retry Count: {quiz.retryCount}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  {/* Mastery Badge */}
                  <div>
                    {quiz.score !== undefined ? (
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          isMastered
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {mastery}% {isMastered ? 'Mastered' : 'Needs Practice'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Not attempted yet</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLaunchQuiz(quiz)}
                      className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <Play className="w-3 h-3 fill-white text-white" />
                      Take Quiz
                    </button>
                    <button
                      onClick={() => handleRetakeQuiz(quiz)}
                      className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Retake
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
