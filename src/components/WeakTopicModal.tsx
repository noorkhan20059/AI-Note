import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2, XCircle, ArrowRight, Lightbulb, Languages, Target } from 'lucide-react';
import { WeakTopic } from '../types';

interface WeakTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: WeakTopic | null;
  onDrillPassed: (topicId: string) => void;
}

export const WeakTopicModal: React.FC<WeakTopicModalProps> = ({
  isOpen,
  onClose,
  topic,
  onDrillPassed,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    title: string;
    breakdown: string[];
    analogy: string;
    romanUrduTip: string;
    practiceDrill: {
      question: string;
      options: string[];
      answer: string;
      explanation: string;
    }[];
  } | null>(null);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen || !topic) return;

    setLoading(true);
    setSelectedAnswers({});
    setHasSubmitted(false);

    fetch('/api/gemini/explain-topic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: topic.name,
        accuracy: topic.accuracy,
      }),
    })
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load weak topic breakdown:', err);
        setLoading(false);
      });
  }, [isOpen, topic]);

  if (!isOpen || !topic) return null;

  const handleSelectDrill = (qIdx: number, opt: string) => {
    if (hasSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: opt }));
  };

  const handleCheckDrill = () => {
    setHasSubmitted(true);
    // If all correct, boost score
    if (data?.practiceDrill) {
      const allCorrect = data.practiceDrill.every(
        (q, idx) => selectedAnswers[idx] === q.answer
      );
      if (allCorrect) {
        onDrillPassed(topic.id);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Targeted Weak Topic Masterclass
                </h2>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  {topic.accuracy}% Accuracy
                </span>
              </div>
              <p className="text-xs text-slate-500">{topic.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <Sparkles className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500">
                AI Study Buddy is analyzing your past errors and constructing diagnostic steps...
              </p>
            </div>
          ) : data ? (
            <>
              {/* Sequential Diagnostic Steps */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Diagnostic Step-by-Step Breakdown
                </h4>
                <div className="space-y-2">
                  {data.breakdown?.map((step, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed"
                    >
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              {/* Analogy */}
              {data.analogy && (
                <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                    <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Intuitive Mental Analogy:</span>
                  </div>
                  <p className="text-indigo-950 leading-relaxed">{data.analogy}</p>
                </div>
              )}

              {/* Roman Urdu Tip */}
              {data.romanUrduTip && (
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                    <Languages className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Roman Urdu Concept Tip:</span>
                  </div>
                  <p className="text-emerald-950 leading-relaxed font-medium">{data.romanUrduTip}</p>
                </div>
              )}

              {/* Practice Drill */}
              {data.practiceDrill && data.practiceDrill.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Rapid Targeted Drill (2 Questions)
                    </h4>
                    {hasSubmitted && (
                      <span className="text-[11px] font-bold text-indigo-700">
                        Accuracy score updated!
                      </span>
                    )}
                  </div>

                  {data.practiceDrill.map((drill, qIdx) => {
                    const selected = selectedAnswers[qIdx];
                    return (
                      <div
                        key={qIdx}
                        className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5"
                      >
                        <p className="text-xs font-bold text-slate-900">
                          {qIdx + 1}. {drill.question}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {drill.options.map((opt, optIdx) => {
                            const isSelected = selected === opt;
                            const isCorrect = opt === drill.answer;

                            let optClass = 'bg-white border-slate-200 hover:border-indigo-400 text-slate-700';
                            if (hasSubmitted) {
                              if (isCorrect) {
                                optClass = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold';
                              } else if (isSelected) {
                                optClass = 'bg-rose-50 border-rose-400 text-rose-900 line-through';
                              } else {
                                optClass = 'bg-slate-50 border-slate-200 text-slate-400';
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                disabled={hasSubmitted}
                                onClick={() => handleSelectDrill(qIdx, opt)}
                                className={`p-2.5 rounded-lg border text-xs text-left transition-all flex items-center justify-between ${optClass}`}
                              >
                                <span className="truncate pr-1">{opt}</span>
                                {hasSubmitted && isCorrect && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                )}
                                {hasSubmitted && isSelected && !isCorrect && (
                                  <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {hasSubmitted && (
                          <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                            <strong>Rationale: </strong> {drill.explanation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium"
          >
            Close
          </button>
          {!hasSubmitted && data?.practiceDrill ? (
            <button
              onClick={handleCheckDrill}
              disabled={Object.keys(selectedAnswers).length === 0}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <span>Submit Practice Answers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-medium hover:bg-slate-800 transition-colors"
            >
              Done & Return
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
