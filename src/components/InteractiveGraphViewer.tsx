import React, { useState, useRef, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Info,
  Download,
  Target,
} from 'lucide-react';
import { StudyGraphData, KeyGraphPoint } from '../types';
import { compileFormula, generateCurvePoints, numericalDerivative } from '../utils/mathEvaluator';

interface InteractiveGraphViewerProps {
  data: StudyGraphData;
  height?: number;
  showControls?: boolean;
}

export const InteractiveGraphViewer: React.FC<InteractiveGraphViewerProps> = ({
  data,
  height = 360,
  showControls = true,
}) => {
  const [xMin, setXMin] = useState(data.xRange[0]);
  const [xMax, setXMax] = useState(data.xRange[1]);
  const [yMin, setYMin] = useState(data.yRange[0]);
  const [yMax, setYMax] = useState(data.yRange[1]);

  const [hoverPos, setHoverPos] = useState<{ x: number; y: number; px: number; py: number; slope: number | null } | null>(null);
  const [activeCurves, setActiveCurves] = useState<Record<string, boolean>>(
    data.curves.reduce((acc, c) => ({ ...acc, [c.id]: true }), {})
  );
  const [isFullscreen, setIsFullscreen] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);

  // SVG coordinate transformation
  const width = 640;
  const graphHeight = isFullscreen ? 500 : height;
  const padding = { top: 28, right: 32, bottom: 44, left: 52 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = graphHeight - padding.top - padding.bottom;

  const toPxX = (x: number) => padding.left + ((x - xMin) / (xMax - xMin)) * plotWidth;
  const toPxY = (y: number) => padding.top + plotHeight - ((y - yMin) / (yMax - yMin)) * plotHeight;
  const toMathX = (px: number) => xMin + ((px - padding.left) / plotWidth) * (xMax - xMin);
  const toMathY = (py: number) => yMin + ((padding.top + plotHeight - py) / plotHeight) * (yMax - yMin);

  // Generate curves paths
  const compiledCurves = useMemo(() => {
    return data.curves.map((curve) => {
      let points = curve.points;
      let fn: ((x: number) => number | null) | null = null;

      if (!points || points.length === 0) {
        fn = compileFormula(curve.formula);
        points = generateCurvePoints(fn, xMin, xMax, 250);
      } else {
        // filter points inside current view
        points = points.filter((p) => p.x >= xMin && p.x <= xMax);
      }

      // Convert points to SVG path string, breaking on discontinuous gaps
      let pathStr = '';
      let isDrawing = false;

      points.forEach((pt) => {
        if (pt.y < yMin - (yMax - yMin) * 2 || pt.y > yMax + (yMax - yMin) * 2) {
          isDrawing = false;
          return;
        }

        const px = toPxX(pt.x);
        const py = toPxY(pt.y);

        if (!isDrawing) {
          pathStr += ` M ${px.toFixed(1)} ${py.toFixed(1)}`;
          isDrawing = true;
        } else {
          pathStr += ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
        }
      });

      return {
        ...curve,
        points,
        pathStr,
        fn,
      };
    });
  }, [data.curves, xMin, xMax, yMin, yMax, plotWidth, plotHeight]);

  // Generate Grid lines & Ticks
  const xTicks = useMemo(() => {
    const count = 7;
    const step = (xMax - xMin) / count;
    const ticks: number[] = [];
    for (let i = 0; i <= count; i++) {
      ticks.push(Number((xMin + i * step).toFixed(2)));
    }
    return ticks;
  }, [xMin, xMax]);

  const yTicks = useMemo(() => {
    const count = 6;
    const step = (yMax - yMin) / count;
    const ticks: number[] = [];
    for (let i = 0; i <= count; i++) {
      ticks.push(Number((yMin + i * step).toFixed(2)));
    }
    return ticks;
  }, [yMin, yMax]);

  // Zoom handlers
  const handleZoom = (factor: number) => {
    const xMid = (xMin + xMax) / 2;
    const yMid = (yMin + yMax) / 2;
    const xHalf = ((xMax - xMin) * factor) / 2;
    const yHalf = ((yMax - yMin) * factor) / 2;
    setXMin(Number((xMid - xHalf).toFixed(2)));
    setXMax(Number((xMid + xHalf).toFixed(2)));
    setYMin(Number((yMid - yHalf).toFixed(2)));
    setYMax(Number((yMid + yHalf).toFixed(2)));
  };

  const handleReset = () => {
    setXMin(data.xRange[0]);
    setXMax(data.xRange[1]);
    setYMin(data.yRange[0]);
    setYMax(data.yRange[1]);
    setHoverPos(null);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = graphHeight / rect.height;

    const mousePx = (e.clientX - rect.left) * scaleX;
    const mousePy = (e.clientY - rect.top) * scaleY;

    if (
      mousePx >= padding.left &&
      mousePx <= width - padding.right &&
      mousePy >= padding.top &&
      mousePy <= graphHeight - padding.bottom
    ) {
      const mathX = Number(toMathX(mousePx).toFixed(2));
      const firstActive = compiledCurves.find((c) => activeCurves[c.id]);
      let mathY = Number(toMathY(mousePy).toFixed(2));
      let slope: number | null = null;

      if (firstActive?.fn) {
        const calculated = firstActive.fn(mathX);
        if (calculated !== null) {
          mathY = Number(calculated.toFixed(2));
          slope = numericalDerivative(firstActive.fn, mathX);
        }
      }

      setHoverPos({
        x: mathX,
        y: mathY,
        px: toPxX(mathX),
        py: toPxY(mathY),
        slope: slope !== null ? Number(slope.toFixed(3)) : null,
      });
    } else {
      setHoverPos(null);
    }
  };

  const handleDownloadSVG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.title.toLowerCase().replace(/\s+/g, '_')}_graph.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs ${
      isFullscreen ? 'fixed inset-4 z-50 flex flex-col justify-between max-h-[92vh] max-w-4xl mx-auto shadow-2xl' : ''
    }`}>
      {/* Graph Header */}
      <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              {data.subject}
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">{data.title}</h4>
          </div>
          {data.description && (
            <p className="text-[11px] text-slate-500 mt-0.5">{data.description}</p>
          )}
        </div>

        {showControls && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleZoom(0.8)}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleZoom(1.25)}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDownloadSVG}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Download Graph (SVG)"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* Main Coordinate SVG Canvas */}
      <div className="relative bg-white select-none overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${graphHeight}`}
          className="w-full h-auto cursor-crosshair block"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverPos(null)}
        >
          <defs>
            <clipPath id="plot-area">
              <rect x={padding.left} y={padding.top} width={plotWidth} height={plotHeight} />
            </clipPath>
          </defs>

          {/* Background Grid Lines */}
          {xTicks.map((xt, i) => {
            const px = toPxX(xt);
            return (
              <g key={`x-grid-${i}`}>
                <line
                  x1={px}
                  y1={padding.top}
                  x2={px}
                  y2={graphHeight - padding.bottom}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text
                  x={px}
                  y={graphHeight - padding.bottom + 16}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-400 font-mono"
                >
                  {xt}
                </text>
              </g>
            );
          })}

          {yTicks.map((yt, i) => {
            const py = toPxY(yt);
            return (
              <g key={`y-grid-${i}`}>
                <line
                  x1={padding.left}
                  y1={py}
                  x2={width - padding.right}
                  y2={py}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={py + 3}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-mono"
                >
                  {yt}
                </text>
              </g>
            );
          })}

          {/* Primary X-Axis (y=0) */}
          {yMin <= 0 && yMax >= 0 && (
            <line
              x1={padding.left}
              y1={toPxY(0)}
              x2={width - padding.right}
              y2={toPxY(0)}
              stroke="#64748b"
              strokeWidth="1.5"
            />
          )}

          {/* Primary Y-Axis (x=0) */}
          {xMin <= 0 && xMax >= 0 && (
            <line
              x1={toPxX(0)}
              y1={padding.top}
              x2={toPxX(0)}
              y2={graphHeight - padding.bottom}
              stroke="#64748b"
              strokeWidth="1.5"
            />
          )}

          {/* Plotting Curves (clipped to graph area) */}
          <g clipPath="url(#plot-area)">
            {compiledCurves.map((curve) => {
              if (!activeCurves[curve.id]) return null;
              return (
                <path
                  key={curve.id}
                  d={curve.pathStr}
                  fill="none"
                  stroke={curve.color || '#4f46e5'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })}

            {/* Key Marked Points (Roots, Vertex, Intercepts, Equilibrium) */}
            {data.keyPoints?.map((kp, idx) => {
              if (kp.x < xMin || kp.x > xMax || kp.y < yMin || kp.y > yMax) return null;
              const px = toPxX(kp.x);
              const py = toPxY(kp.y);

              return (
                <g key={`kp-${idx}`} className="group cursor-pointer">
                  <circle cx={px} cy={py} r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                  <circle cx={px} cy={py} r="9" fill="none" stroke="#f59e0b" strokeWidth="1" opacity="0.4" />
                  <text
                    x={px}
                    y={py - 10}
                    textAnchor="middle"
                    className="text-[10px] font-bold fill-slate-800 font-mono bg-white"
                  >
                    {kp.label}
                  </text>
                </g>
              );
            })}

            {/* Hover Cursor Crosshair & Point */}
            {hoverPos && (
              <g>
                <line
                  x1={hoverPos.px}
                  y1={padding.top}
                  x2={hoverPos.px}
                  y2={graphHeight - padding.bottom}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={hoverPos.px}
                  cy={hoverPos.py}
                  r="5"
                  fill="#4f46e5"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </g>
            )}
          </g>

          {/* Axis Labels */}
          <text
            x={width - padding.right}
            y={graphHeight - 8}
            textAnchor="end"
            className="text-xs font-semibold fill-slate-700"
          >
            {data.xLabel || 'x'}
          </text>
          <text
            x={padding.left}
            y={16}
            textAnchor="start"
            className="text-xs font-semibold fill-slate-700"
          >
            {data.yLabel || 'f(x)'}
          </text>
        </svg>

        {/* Live Coordinate Inspector Overlay */}
        {hoverPos && (
          <div className="absolute top-2 right-3 pointer-events-none bg-slate-900/90 text-white px-2.5 py-1.5 rounded-lg text-xs font-mono shadow-md backdrop-blur-xs flex items-center gap-3">
            <div>
              <span className="text-slate-400">x: </span>
              <span className="font-bold text-amber-300">{hoverPos.x}</span>
            </div>
            <div>
              <span className="text-slate-400">y: </span>
              <span className="font-bold text-emerald-300">{hoverPos.y}</span>
            </div>
            {hoverPos.slope !== null && (
              <div>
                <span className="text-slate-400">dy/dx: </span>
                <span className="font-bold text-indigo-300">{hoverPos.slope}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Curves Legend & Checkboxes */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {data.curves.map((curve) => (
            <label
              key={curve.id}
              className="flex items-center gap-2 cursor-pointer font-medium text-slate-700"
            >
              <input
                type="checkbox"
                checked={activeCurves[curve.id] ?? true}
                onChange={(e) =>
                  setActiveCurves({ ...activeCurves, [curve.id]: e.target.checked })
                }
                className="w-3.5 h-3.5 rounded accent-indigo-600 cursor-pointer"
              />
              <span
                className="w-3 h-1 rounded-full inline-block"
                style={{ backgroundColor: curve.color || '#4f46e5' }}
              />
              <span className="font-mono text-xs">{curve.formula || curve.name}</span>
            </label>
          ))}
        </div>

        {/* Key Point Indicator Tag */}
        {data.keyPoints && data.keyPoints.length > 0 && (
          <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
            <Target className="w-3.5 h-3.5 text-amber-500" />
            <span>{data.keyPoints.length} Key Critical Points</span>
          </div>
        )}
      </div>

      {/* Educational Insights Box */}
      {data.insights && data.insights.length > 0 && (
        <div className="px-4 py-2.5 bg-indigo-50/50 border-t border-indigo-100/60 text-xs text-indigo-950 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            {data.insights.map((insight, i) => (
              <p key={i} className="leading-relaxed">
                {insight}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
