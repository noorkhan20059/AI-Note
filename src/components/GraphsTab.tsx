import React, { useState } from 'react';
import {
  LineChart,
  Sparkles,
  Play,
  RotateCcw,
  Sliders,
  Table,
  Plus,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import { StudyGraphData, GraphCurve } from '../types';
import { STUDY_GRAPH_PRESETS } from '../data/defaultGraphs';
import { InteractiveGraphViewer } from './InteractiveGraphViewer';

export const GraphsTab: React.FC = () => {
  const [currentGraph, setCurrentGraph] = useState<StudyGraphData>(STUDY_GRAPH_PRESETS[0]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Manual Editor State
  const [mode, setMode] = useState<'presets' | 'custom' | 'table'>('presets');
  const [customTitle, setCustomTitle] = useState('My Custom Function');
  const [customFormula1, setCustomFormula1] = useState('x^2 - 4');
  const [customFormula2, setCustomFormula2] = useState('');
  const [xMin, setXMin] = useState(-5);
  const [xMax, setXMax] = useState(5);
  const [yMin, setYMin] = useState(-6);
  const [yMax, setYMax] = useState(15);
  const [xLabel, setXLabel] = useState('x');
  const [yLabel, setYLabel] = useState('f(x)');

  // Table Data Points for lab reports
  const [tablePointsStr, setTablePointsStr] = useState(
    '0, 0\n1, 2.4\n2, 5.1\n3, 8.8\n4, 14.2\n5, 21.0'
  );

  // AI Graph Generation
  const handleGenerateAiGraph = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || isAiLoading) return;

    setIsAiLoading(true);
    try {
      const res = await fetch('/api/gemini/graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          subject: 'Study Graph',
        }),
      });
      const data = await res.json();
      if (data && data.curves && data.curves.length > 0) {
        setCurrentGraph(data);
      }
    } catch (err) {
      console.error('Failed to generate graph:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Apply custom function
  const handleApplyCustomFunction = (e: React.FormEvent) => {
    e.preventDefault();
    const curves: GraphCurve[] = [
      {
        id: 'cust-1',
        name: `f(x) = ${customFormula1}`,
        formula: customFormula1,
        color: '#4f46e5',
      },
    ];

    if (customFormula2.trim()) {
      curves.push({
        id: 'cust-2',
        name: `g(x) = ${customFormula2}`,
        formula: customFormula2,
        color: '#10b981',
      });
    }

    const newGraph: StudyGraphData = {
      id: `graph-custom-${Date.now()}`,
      title: customTitle || 'Custom Graph',
      subject: 'Mathematics',
      description: `Plot of ${customFormula1}${customFormula2 ? ` and ${customFormula2}` : ''}`,
      curves,
      xLabel: xLabel || 'x',
      yLabel: yLabel || 'y',
      xRange: [Number(xMin), Number(xMax)],
      yRange: [Number(yMin), Number(yMax)],
      insights: [
        'Hover across the curve to inspect instantaneous coordinates and numerical slope dy/dx.',
      ],
    };

    setCurrentGraph(newGraph);
  };

  // Apply Table Data Points (Scatter / Lab Line)
  const handleApplyTableData = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = tablePointsStr.trim().split('\n');
    const points: { x: number; y: number }[] = [];

    lines.forEach((line) => {
      const parts = line.split(/[,\s]+/).map((p) => parseFloat(p.trim())).filter((n) => !isNaN(n));
      if (parts.length >= 2) {
        points.push({ x: parts[0], y: parts[1] });
      }
    });

    if (points.length === 0) return;

    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const minX = Math.floor(Math.min(...xs) - 1);
    const maxX = Math.ceil(Math.max(...xs) + 1);
    const minY = Math.floor(Math.min(...ys) - 1);
    const maxY = Math.ceil(Math.max(...ys) + 2);

    const newGraph: StudyGraphData = {
      id: `graph-table-${Date.now()}`,
      title: 'Lab Experiment: Data Series Plot',
      subject: 'Science Lab Data',
      description: `Scatter plot of ${points.length} observed experimental data points.`,
      curves: [
        {
          id: 'lab-data',
          name: 'Experimental Data',
          formula: '',
          color: '#f59e0b',
          points,
        },
      ],
      xLabel: 'Independent Variable (x)',
      yLabel: 'Dependent Variable (y)',
      xRange: [minX, maxX],
      yRange: [minY, maxY],
      insights: [
        `Rendered ${points.length} discrete data coordinates with linear interpolation.`,
      ],
    };

    setCurrentGraph(newGraph);
  };

  const insertFormulaSnippet = (snippet: string) => {
    setCustomFormula1((prev) => `${prev}${snippet}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-5 space-y-6 pb-20 md:pb-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <LineChart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Study Graph Studio & Math Plotter
              </h2>
              <p className="text-xs text-slate-500">
                Interactive coordinate plane for Mathematics, Physics kinematics, Chemistry kinetics, and Economics
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setMode('presets')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                mode === 'presets' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Curated Presets
            </button>
            <button
              onClick={() => setMode('custom')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                mode === 'custom' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Function Plotter
            </button>
            <button
              onClick={() => setMode('table')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                mode === 'table' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lab Data Table
            </button>
          </div>
        </div>

        {/* AI Prompt Input Bar */}
        <form onSubmit={handleGenerateAiGraph} className="pt-2">
          <div className="relative flex items-center">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ask AI to plot anything: e.g. 'Plot projectile trajectory at 45 degrees' or 'Graph cubic polynomial x^3 - 3x'..."
              className="w-full pl-4 pr-28 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isAiLoading || !aiPrompt.trim()}
              className="absolute right-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              {isAiLoading ? (
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>{isAiLoading ? 'Plotting...' : 'AI Plot'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Preset Selector Bar */}
      {mode === 'presets' && (
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Select Subject Curriculum Preset:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {STUDY_GRAPH_PRESETS.map((preset) => {
              const isSelected = currentGraph.id === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => setCurrentGraph(preset)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/60 shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 font-mono">
                    {preset.subject}
                  </span>
                  <span className="text-xs font-bold text-slate-900 truncate mt-1">
                    {preset.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom Function Plotter Form */}
      {mode === 'custom' && (
        <form onSubmit={handleApplyCustomFunction} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4 animate-fade-in shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Function f(x)
              </label>
              <input
                type="text"
                value={customFormula1}
                onChange={(e) => setCustomFormula1(e.target.value)}
                placeholder="e.g. x^2 - 4*x + 3"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              {/* Quick Math Shortcuts */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {['x^2', 'x^3', 'sin(x)', 'cos(x)', 'sqrt(x)', 'exp(x)', '1/x'].map((snip) => (
                  <button
                    key={snip}
                    type="button"
                    onClick={() => insertFormulaSnippet(snip)}
                    className="px-2 py-0.5 text-[10px] font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                  >
                    +{snip}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Secondary Function g(x) (Optional)
              </label>
              <input
                type="text"
                value={customFormula2}
                onChange={(e) => setCustomFormula2(e.target.value)}
                placeholder="e.g. 2*x - 4 or cos(x)"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Compare two functions or plot derivative
              </span>
            </div>
          </div>

          {/* Coordinate Ranges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">X-Min</label>
              <input
                type="number"
                value={xMin}
                onChange={(e) => setXMin(parseFloat(e.target.value))}
                className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">X-Max</label>
              <input
                type="number"
                value={xMax}
                onChange={(e) => setXMax(parseFloat(e.target.value))}
                className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Y-Min</label>
              <input
                type="number"
                value={yMin}
                onChange={(e) => setYMin(parseFloat(e.target.value))}
                className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Y-Max</label>
              <input
                type="number"
                value={yMax}
                onChange={(e) => setYMax(parseFloat(e.target.value))}
                className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Plot Functions on Coordinate Plane</span>
          </button>
        </form>
      )}

      {/* Lab Data Table Mode */}
      {mode === 'table' && (
        <form onSubmit={handleApplyTableData} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3 animate-fade-in shadow-2xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Enter or Paste Data Coordinates (x, y)
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              One coordinate pair per line. Perfect for science lab measurements, chemistry reaction times, and statistics.
            </p>
            <textarea
              rows={5}
              value={tablePointsStr}
              onChange={(e) => setTablePointsStr(e.target.value)}
              placeholder="0, 0&#10;1, 2.5&#10;2, 5.0"
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
          >
            <Table className="w-3.5 h-3.5" />
            <span>Plot Experimental Data Series</span>
          </button>
        </form>
      )}

      {/* Interactive Coordinate Plane Viewer */}
      <InteractiveGraphViewer data={currentGraph} height={380} />
    </div>
  );
};
