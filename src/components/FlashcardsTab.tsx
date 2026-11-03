import React, { useState } from 'react';
import {
  Layers,
  RotateCw,
  Volume2,
  Lightbulb,
  Sparkles,
  Plus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Bookmark,
  Languages,
} from 'lucide-react';
import { Flashcard, StudyDocument } from '../types';

interface FlashcardsTabProps {
  flashcards: Flashcard[];
  activeDocument: StudyDocument;
  onUpdateFlashcard: (card: Flashcard) => void;
  onAddFlashcard: (card: Flashcard) => void;
  onGenerateDeck: (topic: string) => Promise<void>;
  isGenerating: boolean;
  prefillTopic?: string;
}

export const FlashcardsTab: React.FC<FlashcardsTabProps> = ({
  flashcards,
  activeDocument,
  onUpdateFlashcard,
  onAddFlashcard,
  onGenerateDeck,
  isGenerating,
  prefillTopic,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showRomanUrdu, setShowRomanUrdu] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [onlyWeakTopics, setOnlyWeakTopics] = useState(false);

  // New Card Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newHint, setNewHint] = useState('');
  const [newRomanUrdu, setNewRomanUrdu] = useState('');
  const [newTopic, setNewTopic] = useState(prefillTopic || 'Organic Chemistry');

  // Filter cards
  const filteredCards = flashcards.filter((card) => {
    if (onlyWeakTopics && card.masteryLevel === 'mastered') return false;
    if (selectedTopic !== 'All' && card.topic !== selectedTopic) return false;
    return true;
  });

  const currentCard = filteredCards[currentIndex] || filteredCards[0];
  const totalCards = filteredCards.length;

  const topics = ['All', ...Array.from(new Set(flashcards.map((c) => c.topic)))];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      setShowHint(false);
      setShowRomanUrdu(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
      setShowHint(false);
      setShowRomanUrdu(false);
    }
  };

  const handleRateRetention = (rating: 'hard' | 'good' | 'easy') => {
    if (!currentCard) return;

    let updatedCard: Flashcard;
    if (rating === 'hard') {
      updatedCard = {
        ...currentCard,
        intervalDays: 0,
        repetitions: 0,
        nextReviewDate: 'In 5 mins',
        masteryLevel: 'learning',
        lastReviewed: new Date().toISOString(),
      };
    } else if (rating === 'good') {
      updatedCard = {
        ...currentCard,
        intervalDays: Math.max(1, currentCard.intervalDays + 1),
        repetitions: currentCard.repetitions + 1,
        nextReviewDate: 'Tomorrow',
        masteryLevel: 'review',
        lastReviewed: new Date().toISOString(),
      };
    } else {
      updatedCard = {
        ...currentCard,
        intervalDays: Math.max(4, currentCard.intervalDays * 2),
        repetitions: currentCard.repetitions + 1,
        nextReviewDate: 'In 4 days',
        masteryLevel: 'mastered',
        lastReviewed: new Date().toISOString(),
      };
    }

    onUpdateFlashcard(updatedCard);
    handleNext();
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCreateCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    const newCard: Flashcard = {
      id: `fc-${Date.now()}`,
      deckId: 'deck-user',
      front: newFront,
      back: newBack,
      hint: newHint || 'Recall the essential mechanism and kinetic order.',
      romanUrdu: newRomanUrdu || 'Is concept ko achi tarah samajh kar yaad karein.',
      topic: newTopic || 'General',
      intervalDays: 1,
      easeFactor: 2.5,
      repetitions: 0,
      nextReviewDate: 'Tomorrow',
      masteryLevel: 'learning',
    };

    onAddFlashcard(newCard);
    setNewFront('');
    setNewBack('');
    setNewHint('');
    setNewRomanUrdu('');
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-5 space-y-6 pb-20 md:pb-6">
      {/* Top Deck Tools & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Spaced Repetition Deck</h2>
            <p className="text-[11px] text-slate-500 font-mono tabular-nums">
              {flashcards.filter((c) => c.masteryLevel === 'mastered').length} / {flashcards.length} cards mastered
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Deck topic filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedTopic}
              onChange={(e) => {
                setSelectedTopic(e.target.value);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer"
            >
              {topics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Weak topic filter toggle */}
          <button
            onClick={() => {
              setOnlyWeakTopics(!onlyWeakTopics);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
              onlyWeakTopics
                ? 'bg-amber-50 border-amber-300 text-amber-800 font-semibold'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Weak Only
          </button>

          {/* Auto-generate deck */}
          <button
            onClick={() => onGenerateDeck(activeDocument.subject)}
            disabled={isGenerating}
            className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGenerating ? 'Generating...' : 'AI Auto-Generate'}</span>
          </button>

          {/* Add custom card */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Card</span>
          </button>
        </div>
      </div>

      {/* Main Flashcard Card */}
      {filteredCards.length > 0 && currentCard ? (
        <div className="space-y-4">
          {/* Card Counter & Topic */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 font-mono tabular-nums">
                Card {currentIndex + 1} of {totalCards}
              </span>
              <span className="text-slate-300">·</span>
              <span className="font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium">
                {currentCard.topic}
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Next Review: {currentCard.nextReviewDate}
            </span>
          </div>

          {/* 3D Tactile Card Container */}
          <div
            onClick={handleFlip}
            className="relative min-h-[300px] sm:min-h-[340px] w-full rounded-2xl bg-white border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-300 transition-all p-6 sm:p-8 flex flex-col justify-between select-none"
          >
            {/* Top Bar on Card */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-indigo-500" />
                {isFlipped ? 'Concept Solution (Back)' : 'Question Prompt (Front)'}
              </span>

              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handleSpeak(isFlipped ? currentCard.back : currentCard.front)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                  title="Pronounce"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowRomanUrdu(!showRomanUrdu)}
                  className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                    showRomanUrdu
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                  title="Roman Urdu Concept Translation"
                >
                  <Languages className="w-4 h-4" />
                  <span className="text-[11px]">Roman Urdu</span>
                </button>
              </div>
            </div>

            {/* Middle Question / Answer Content */}
            <div className="py-6 sm:py-8 flex-1 flex flex-col justify-center">
              {!isFlipped ? (
                <div>
                  <h3 className="text-base sm:text-xl font-bold text-slate-900 leading-snug">
                    {currentCard.front}
                  </h3>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-normal">
                    {currentCard.back}
                  </p>
                  {currentCard.citation && (
                    <div className="pt-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-700 font-medium bg-indigo-50 px-2 py-0.5 rounded">
                        <Bookmark className="w-3 h-3 text-indigo-500" />
                        {currentCard.citation}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Clues & Flip Hint */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div onClick={(e) => e.stopPropagation()}>
                {!isFlipped && currentCard.hint && (
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>{showHint ? 'Hide Hint' : 'Show Hint Drawer'}</span>
                  </button>
                )}
              </div>

              <span className="text-[11px] text-slate-400">
                Tap card to {isFlipped ? 'flip back' : 'reveal answer'}
              </span>
            </div>

            {/* Hint Drawer Popout */}
            {showHint && !isFlipped && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="mt-3 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 animate-fade-in"
              >
                <div className="flex items-center gap-1 font-bold mb-0.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                  <span>Subtle Clue:</span>
                </div>
                <p>{currentCard.hint}</p>
              </div>
            )}

            {/* Roman Urdu Drawer */}
            {showRomanUrdu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="mt-3 p-3 rounded-xl bg-indigo-50/80 border border-indigo-200/80 text-xs text-indigo-950 animate-fade-in"
              >
                <div className="flex items-center gap-1 font-bold mb-0.5 text-indigo-800">
                  <Languages className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Roman Urdu Concept:</span>
                </div>
                <p className="leading-relaxed">{currentCard.romanUrdu}</p>
              </div>
            )}
          </div>

          {/* Spaced Repetition Feedback Buttons */}
          <div className="space-y-2">
            <span className="block text-center text-xs font-semibold text-slate-500">
              Spaced Repetition Feedback (Rate Recall Difficulty)
            </span>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <button
                onClick={() => handleRateRetention('hard')}
                className="py-3 px-2 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 hover:border-rose-300 text-rose-700 transition-all flex flex-col items-center justify-center min-h-[52px]"
              >
                <span className="text-xs font-bold">Hard</span>
                <span className="text-[10px] text-rose-500">Review in 5 mins</span>
              </button>

              <button
                onClick={() => handleRateRetention('good')}
                className="py-3 px-2 rounded-xl bg-white border border-amber-200 hover:bg-amber-50 hover:border-amber-300 text-amber-800 transition-all flex flex-col items-center justify-center min-h-[52px]"
              >
                <span className="text-xs font-bold">Good</span>
                <span className="text-[10px] text-amber-600">Review Tomorrow</span>
              </button>

              <button
                onClick={() => handleRateRetention('easy')}
                className="py-3 px-2 rounded-xl bg-white border border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 text-emerald-800 transition-all flex flex-col items-center justify-center min-h-[52px]"
              >
                <span className="text-xs font-bold">Easy</span>
                <span className="text-[10px] text-emerald-600">Review in 4 days</span>
              </button>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-4 py-2 text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 rounded-xl transition-colors flex items-center gap-1 min-h-[44px]"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleFlip}
              className="px-4 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors min-h-[44px] flex items-center gap-1"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Flip Card</span>
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === totalCards - 1}
              className="px-4 py-2 text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 rounded-xl transition-colors flex items-center gap-1 min-h-[44px]"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <p className="text-xs text-slate-500">No flashcards found matching the selected filter.</p>
          <button
            onClick={() => {
              setSelectedTopic('All');
              setOnlyWeakTopics(false);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Modal: Create Card */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Create New Study Flashcard</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateCardSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Question Prompt (Front)
                </label>
                <textarea
                  rows={2}
                  required
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  placeholder="e.g. What is the stereochemical consequence of an SN2 attack?"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Core Solution (Back)
                </label>
                <textarea
                  rows={2}
                  required
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  placeholder="e.g. 100% Walden inversion due to mandatory backside attack."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hint Drawer (Optional)
                </label>
                <input
                  type="text"
                  value={newHint}
                  onChange={(e) => setNewHint(e.target.value)}
                  placeholder="e.g. Think about an umbrella turning inside-out."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Roman Urdu Concept (Optional)
                </label>
                <input
                  type="text"
                  value={newRomanUrdu}
                  onChange={(e) => setNewRomanUrdu(e.target.value)}
                  placeholder="e.g. Backside attack ki wajah se configuration ulti ho jati hai."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Topic Tag
                </label>
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="e.g. Stereochemistry"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-2xs"
                >
                  Save Card to Deck
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
