import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  FileText,
  Volume2,
  HelpCircle,
  Layers,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Table,
  Bookmark,
  ExternalLink,
  LineChart,
  Camera,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { ChatMessage, Language, StudyDocument } from '../types';
import { InteractiveGraphViewer } from './InteractiveGraphViewer';

interface ChatTabProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, imageUrl?: string) => Promise<void>;
  isLoading: boolean;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  activeDocument: StudyDocument;
  onOpenDocumentModal: () => void;
  onNavigateToQuiz: (topic: string) => void;
  onNavigateToFlashcards: (topic: string) => void;
  onNavigateToGraphs?: () => void;
  onDrillAnswer: (msgId: string, selectedOption: string) => void;
}

export const ChatTab: React.FC<ChatTabProps> = ({
  messages,
  onSendMessage,
  isLoading,
  language,
  onLanguageChange,
  activeDocument,
  onOpenDocumentModal,
  onNavigateToQuiz,
  onNavigateToFlashcards,
  onNavigateToGraphs,
  onDrillAnswer,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedImage) || isLoading) return;
    const text = inputText;
    const img = selectedImage;
    setInputText('');
    setSelectedImage(null);
    onSendMessage(text, img || undefined);
  };

  const handleSpeak = (msgId: string, text: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking === msgId) {
        window.speechSynthesis.cancel();
        setIsSpeaking(null);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.slice(0, 300));
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(null);
      utterance.onerror = () => setIsSpeaking(null);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(msgId);
    }
  };

  const QUICK_PROMPTS = [
    { label: 'Plot Math Graph', prompt: 'Plot the quadratic function f(x) = x^2 - 4x + 3 and show its roots and vertex.' },
    { label: 'How Can You Help Me?', prompt: 'How can you help me with my studies, exam preparation, and homework?' },
    { label: 'Explain with an Analogy', prompt: 'Can you explain a complex concept using a simple, relatable real-world analogy?' },
    { label: 'SN1 vs SN2 Comparison', prompt: 'Explain the difference between SN1 and SN2 mechanisms with a comparison matrix.' },
    { label: 'Roman Urdu Explanation', prompt: 'Mujhe difficult topics Roman Urdu mein aasan misalon ke sath samjhayein.' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem-4rem)] md:h-[calc(100vh-4rem)] max-w-4xl mx-auto w-full px-3 sm:px-6 py-4">
      {/* Top Document Chip & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-2 border-b border-slate-200">
        <button
          onClick={onOpenDocumentModal}
          className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 shadow-2xs transition-all text-xs text-left"
        >
          <div className="w-5 h-5 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-800 max-w-[200px] sm:max-w-[260px] truncate">
            {activeDocument.name}
          </span>
          <span className="hidden sm:inline-block text-[11px] text-emerald-600 font-medium">
            (Grounding Active)
          </span>
          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 hidden sm:inline">Explanation Style:</span>
          <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200">
            <button
              onClick={() => onLanguageChange('english')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                language === 'english' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
              }`}
            >
              English
            </button>
            <button
              onClick={() => onLanguageChange('roman_urdu')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                language === 'roman_urdu' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
              }`}
            >
              Roman Urdu
            </button>
            <button
              onClick={() => onLanguageChange('urdu')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors font-urdu ${
                language === 'urdu' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              اردو
            </button>
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-1 pb-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isUrduMsg = msg.language === 'urdu' || language === 'urdu';

          if (isUser) {
            return (
              <div key={msg.id} className="flex justify-end animate-fade-in">
                <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-xs bg-indigo-600 text-white px-4 py-3 shadow-sm space-y-2">
                  {msg.imageUrl && (
                    <img
                      src={msg.imageUrl}
                      alt="User Query Image"
                      className="rounded-lg max-h-52 w-full object-cover border border-indigo-400/50"
                    />
                  )}
                  {msg.text && <p className="text-sm font-normal leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                  <span className="block text-[10px] text-indigo-200 text-right mt-1 font-mono">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className="flex gap-3 items-start animate-fade-in">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <Sparkles className="w-4 h-4 text-indigo-600" />
              </div>

              <div className="flex-1 space-y-3 min-w-0">
                {/* Main Response Box */}
                <div className="bg-white rounded-2xl rounded-tl-xs border border-slate-200/90 p-4 sm:p-5 shadow-2xs">
                  {/* Verified Citations Ribbon */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mb-3 pb-2.5 border-b border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Verified Sources:
                      </span>
                      {msg.citations.map((cite, i) => (
                        <button
                          key={i}
                          onClick={onOpenDocumentModal}
                          className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 px-2 py-0.5 rounded-md border border-indigo-200/60 transition-colors"
                        >
                          <Bookmark className="w-3 h-3 text-indigo-500" />
                          {cite}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Body Text */}
                  <div
                    className={`text-sm text-slate-800 leading-relaxed space-y-2 whitespace-pre-line ${
                      isUrduMsg ? 'font-urdu text-base' : ''
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Structured Card: TL;DR Summary */}
                  {msg.tldr && (
                    <div className="mt-3.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
                        <span className="text-amber-600">📌</span>
                        <span>TL;DR Key Takeaway</span>
                      </div>
                      <p className="text-xs text-amber-900/90 leading-relaxed">{msg.tldr}</p>
                    </div>
                  )}

                  {/* Structured Card: Key Difference Matrix */}
                  {msg.matrix && (
                    <div className="mt-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 overflow-x-auto">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
                        <Table className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Mechanism Comparison Matrix</span>
                      </div>
                      <div className="text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed">
                        {msg.matrix}
                      </div>
                    </div>
                  )}

                  {/* Structured Card: Memory Mnemonic */}
                  {msg.mnemonic && (
                    <div className="mt-3.5 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 mb-1">
                        <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Memory Mnemonic / Mental Hook</span>
                      </div>
                      <p className="text-xs text-emerald-950 leading-relaxed font-medium">
                        {msg.mnemonic}
                      </p>
                    </div>
                  )}

                  {/* In-Chat Active Recall Drill */}
                  {msg.drillQuestion && (
                    <div className="mt-4 p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                          Quick Active-Recall Check
                        </span>
                        {msg.drillQuestion.userAnswer && (
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                              msg.drillQuestion.isCorrect
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {msg.drillQuestion.isCorrect ? '✓ Correct!' : '✗ Review Answer'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-900 mb-2.5">
                        {msg.drillQuestion.question}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {msg.drillQuestion.options.map((opt, oIdx) => {
                          const isSelected = msg.drillQuestion?.userAnswer === opt;
                          const isCorrect = opt === msg.drillQuestion?.answer;
                          const hasAnswered = !!msg.drillQuestion?.userAnswer;

                          let btnStyle = 'bg-white border-slate-200 hover:border-indigo-300 text-slate-700';
                          if (hasAnswered) {
                            if (isCorrect) {
                              btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold';
                            } else if (isSelected) {
                              btnStyle = 'bg-rose-50 border-rose-400 text-rose-900 line-through';
                            } else {
                              btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                            }
                          }

                          return (
                            <button
                              key={oIdx}
                              disabled={hasAnswered}
                              onClick={() => onDrillAnswer(msg.id, opt)}
                              className={`p-2 rounded-lg border text-xs text-left transition-all flex items-center justify-between ${btnStyle}`}
                            >
                              <span className="truncate pr-1">{opt}</span>
                              {hasAnswered && isCorrect && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              )}
                              {hasAnswered && isSelected && !isCorrect && (
                                <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {msg.drillQuestion.userAnswer && (
                        <p className="text-[11px] text-slate-600 mt-2 bg-white/80 p-2 rounded border border-indigo-100">
                          <strong className="text-slate-800">Explanation: </strong>
                          {msg.drillQuestion.explanation}
                        </p>
                      )}
                    </div>
                  )}

                  {/* In-Chat Interactive Study Graph Card */}
                  {msg.graphData && (
                    <div className="mt-4">
                      <InteractiveGraphViewer data={msg.graphData} height={280} showControls={true} />
                    </div>
                  )}

                  {/* 1-Click Action Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => handleSpeak(msg.id, msg.text)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                          isSpeaking === msg.id
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                        title="Listen to pronunciation & explanation"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{isSpeaking === msg.id ? 'Stop' : 'Listen'}</span>
                      </button>

                      {onNavigateToGraphs && (
                        <button
                          onClick={onNavigateToGraphs}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-700 transition-colors"
                        >
                          <LineChart className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Graph Studio</span>
                        </button>
                      )}

                      <button
                        onClick={() => onNavigateToQuiz(activeDocument.subject)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-700 transition-colors"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Make Quiz</span>
                      </button>

                      <button
                        onClick={() => onNavigateToFlashcards(activeDocument.subject)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-700 transition-colors"
                      >
                        <Layers className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Add Flashcards</span>
                      </button>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>

                {/* Follow-up Prompts */}
                {msg.followUps && msg.followUps.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Explore Next:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.followUps.map((fu, idx) => (
                        <button
                          key={idx}
                          onClick={() => onSendMessage(fu)}
                          className="text-xs text-slate-700 bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 px-3 py-1 rounded-full border border-slate-200 transition-all text-left flex items-center gap-1"
                        >
                          <span>{fu}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 items-center text-slate-500 animate-pulse text-xs bg-white border border-slate-200 p-3.5 rounded-2xl w-fit">
            <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
            <span>AI Study Buddy is analyzing document grounding & crafting explanation...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="py-2 overflow-x-auto flex items-center gap-1.5 no-scrollbar shrink-0">
        {QUICK_PROMPTS.map((qp, i) => (
          <button
            key={i}
            onClick={() => onSendMessage(qp.prompt)}
            className="text-[11px] font-medium text-slate-600 hover:text-indigo-700 hover:border-indigo-300 bg-white px-2.5 py-1 rounded-lg border border-slate-200 transition-colors whitespace-nowrap shrink-0"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="pt-2 shrink-0 space-y-2">
        {selectedImage && (
          <div className="relative inline-block bg-white p-2 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
            <img src={selectedImage} alt="Attachment Preview" className="h-20 w-20 object-cover rounded-lg" />
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-rose-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-rose-700 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="relative flex items-center">
          {/* Camera & Picture buttons */}
          <div className="absolute left-2.5 flex items-center gap-1 z-10">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Snap photo with camera"
            >
              <Camera className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Upload picture from device"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
          </div>

          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={cameraInputRef}
            onChange={handleImageSelect}
            className="hidden"
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageSelect}
            className="hidden"
          />

          <input
            type="text"
            placeholder={
              language === 'urdu'
                ? 'پڑھائی سے متعلق سوال پوچھیں یا تصویر اپ لوڈ کریں...'
                : language === 'roman_urdu'
                ? 'Ask a question or attach photo / snap from camera...'
                : 'Ask any study question or attach a photo / snap from camera...'
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            className="w-full pl-22 pr-12 py-3 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-sm transition-all"
          />
          <button
            type="submit"
            disabled={(!inputText.trim() && !selectedImage) || isLoading}
            className="absolute right-2 w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
