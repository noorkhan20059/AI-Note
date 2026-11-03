import React, { useState } from 'react';
import {
  Flame,
  Clock,
  Target,
  Layers,
  HardDrive,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { StudyStats, WeakTopic } from '../types';
import { StorageService } from '../services/storage';

interface AnalyticsTabProps {
  stats: StudyStats;
  onPracticeWeakTopic: (topic: WeakTopic) => void;
  onRefreshData: () => void;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  stats,
  onPracticeWeakTopic,
  onRefreshData,
}) => {
  const [storageUsage, setStorageUsage] = useState(StorageService.getStorageUsage());
  const [importSuccess, setImportSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const hoursLogged = (stats.totalStudyMinutes / 60).toFixed(1);

  // Maximum minutes for bar chart scale
  const maxWeeklyMinutes = Math.max(...stats.weeklyMinutes.map((w) => w.minutes), 120);

  const handleExportJSON = () => {
    const jsonStr = StorageService.exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai_study_buddy_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = StorageService.importDataJSON(content);
      if (success) {
        setImportSuccess(true);
        setStorageUsage(StorageService.getStorageUsage());
        onRefreshData();
        setTimeout(() => setImportSuccess(false), 3000);
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    StorageService.resetAll();
    setShowResetConfirm(false);
    setStorageUsage(StorageService.getStorageUsage());
    onRefreshData();
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-5 space-y-6 pb-20 md:pb-6">
      {/* 4 Learner Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Fire Streak */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Study Streak
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5 flex-wrap mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                {stats.streakDays}
              </span>
              <span className="text-xs text-amber-600 font-bold">Days Fire 🔥</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
            <span>Keep studying today</span>
            <button
              onClick={() => {
                StorageService.logStudyMinutes(30);
                onRefreshData();
              }}
              className="text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
            >
              + Log 30m Session
            </button>
          </div>
        </div>

        {/* Metric 2: Hours Logged */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Hours Logged
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5 flex-wrap mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                {hoursLogged}
              </span>
              <span className="text-xs text-slate-500">Hours</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-emerald-600 font-medium pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +2.4 hrs vs last week
            </span>
            <button
              onClick={() => {
                StorageService.logStudyMinutes(60);
                onRefreshData();
              }}
              className="text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
            >
              + Log 1h
            </button>
          </div>
        </div>

        {/* Metric 3: Quiz Accuracy */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Quiz Accuracy
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {stats.averageAccuracy}%
            </span>
            <span className="text-xs text-emerald-700 font-semibold">Mastery</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-500">
            <span>Across {stats.quizzesCompleted} assessments</span>
          </div>
        </div>

        {/* Metric 4: Mastered Cards */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Mastered Cards
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {stats.masteredCardsCount}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ {stats.totalCardsCount}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <span>Spaced repetition active</span>
          </div>
        </div>
      </div>

      {/* Target Weak Topics (Struggling Areas) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                AI Weak Topic Detections & Targeted Practice
              </h3>
              <p className="text-xs text-slate-500">
                Automated diagnostics based on quiz incorrect options and flashcard difficulty ratings.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full hidden sm:inline-block">
            {stats.weakTopics.length} Focus Areas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {stats.weakTopics.map((topic) => (
            <div
              key={topic.id}
              className="p-4 rounded-xl border border-slate-200 hover:border-amber-300 bg-slate-50/50 hover:bg-white transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900 truncate pr-1">
                    {topic.name}
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 shrink-0">
                    {topic.accuracy}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {topic.recommendation}
                </p>
              </div>

              <button
                onClick={() => onPracticeWeakTopic(topic)}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <span>Practice Weak Topic Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Study Rhythm Visual Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Weekly Study Rhythm</h3>
            <p className="text-xs text-slate-500">Daily focus minutes over the last 7 days</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
            Total: {stats.totalStudyMinutes} mins
          </span>
        </div>

        {/* Visual Bar Chart */}
        <div className="pt-6 pb-2">
          <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-40 border-b border-slate-200 pb-2">
            {stats.weeklyMinutes.map((item, idx) => {
              const heightPercent = Math.min(100, Math.round((item.minutes / maxWeeklyMinutes) * 100));
              const isToday = idx === 6; // Sunday/Today

              return (
                <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-mono text-slate-400 group-hover:text-indigo-600 transition-colors">
                    {item.minutes}m
                  </span>
                  <div className="w-full max-w-[40px] bg-slate-100 rounded-t-lg overflow-hidden flex items-end h-full">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 group-hover:opacity-90 ${
                        isToday ? 'bg-indigo-600' : 'bg-indigo-400'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className={`text-xs font-semibold ${isToday ? 'text-indigo-700 font-bold' : 'text-slate-600'}`}>
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Local Browser Storage & Data Privacy Management */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Local-First Data & Privacy Management
              </h3>
              <p className="text-xs text-slate-500">
                All textbook chapters, chat histories, quizzes, and spaced repetition cards live in your browser.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
            Zero Data Lock-in
          </span>
        </div>

        {/* Storage Meter Bar */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-indigo-600" />
              Browser Local Storage Footprint
            </span>
            <span className="font-mono text-slate-600 font-semibold tabular-nums">
              {storageUsage.usedMB} MB / {storageUsage.totalMB} MB ({storageUsage.percentage}%)
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${storageUsage.percentage}%` }}
            />
          </div>
        </div>

        {/* JSON Export, Import & Reset Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Export Full Backup (JSON)</span>
            </button>

            <label className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs">
              <Upload className="w-3.5 h-3.5 text-indigo-600" />
              <span>Restore from JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>

            {importSuccess && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold">
                <Check className="w-4 h-4" /> Backup restored!
              </span>
            )}
          </div>

          <div>
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-3 py-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 text-xs font-medium rounded-xl transition-colors"
              >
                Reset Demo Cache
              </button>
            ) : (
              <div className="flex items-center gap-2 animate-fade-in">
                <span className="text-xs text-slate-600">Reset to initial state?</span>
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2 py-1.5 text-slate-500 hover:text-slate-800 text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
