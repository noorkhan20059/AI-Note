// Safe mathematical formula parser & numerical utilities for study graphs

export function compileFormula(rawFormula: string): (x: number) => number | null {
  // Pre-process formula string
  let expr = rawFormula
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    // Replace standard constants
    .replace(/\bpi\b/g, `(${Math.PI})`)
    .replace(/\be\b/g, `(${Math.E})`)
    // Fix implicit multiplications like 4x, 2sin, (x+1)(x-1)
    .replace(/(\d)([a-z\(])/g, '$1*$2')
    .replace(/(\))(\()/g, '$1*$2')
    .replace(/(\))([a-z\d])/g, '$1*$2')
    .replace(/(x)(\()/g, '$1*$2');

  // Replace powers: e.g. base^exp with Math.pow
  // We can convert expressions like term^exponent
  // A cleaner approach for standard formulas is a safe evaluator function
  return (x: number): number | null => {
    try {
      // Build safe scope
      const scope = {
        x,
        sin: Math.sin,
        cos: Math.cos,
        tan: Math.tan,
        sqrt: Math.sqrt,
        abs: Math.abs,
        exp: Math.exp,
        log: Math.log, // natural log
        ln: Math.log,
        log10: Math.log10,
        pow: Math.pow,
        pi: Math.PI,
        e: Math.E,
      };

      // Substitute common operators
      let evalStr = expr
        // Replace x^y with Math.pow(x, y) where possible or handle simple patterns
        .replace(/([a-z\d\.\)]+)\^([a-z\d\.\)]+)/g, 'pow($1,$2)');

      // If there are nested powers, do a second pass
      if (evalStr.includes('^')) {
        evalStr = evalStr.replace(/([a-z\d\.\)]+)\^([a-z\d\.\)]+)/g, 'pow($1,$2)');
      }

      // Safe evaluation using Function with isolated Math functions
      const fn = new Function(
        'x',
        'sin',
        'cos',
        'tan',
        'sqrt',
        'abs',
        'exp',
        'log',
        'ln',
        'log10',
        'pow',
        'pi',
        'e',
        `"use strict"; return (${evalStr});`
      );

      const val = fn(
        x,
        scope.sin,
        scope.cos,
        scope.tan,
        scope.sqrt,
        scope.abs,
        scope.exp,
        scope.log,
        scope.ln,
        scope.log10,
        scope.pow,
        scope.pi,
        scope.e
      );

      if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) {
        return null;
      }
      // Bound extreme asymptotic spikes
      if (Math.abs(val) > 1e6) return null;
      return val;
    } catch {
      return null;
    }
  };
}

// Numerical derivative for slope
export function numericalDerivative(fn: (x: number) => number | null, x: number, h = 0.0001): number | null {
  const y1 = fn(x + h);
  const y0 = fn(x - h);
  if (y1 === null || y0 === null) return null;
  return (y1 - y0) / (2 * h);
}

// Generate points for SVG path
export function generateCurvePoints(
  fn: (x: number) => number | null,
  xMin: number,
  xMax: number,
  stepCount = 200
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const dx = (xMax - xMin) / stepCount;

  for (let i = 0; i <= stepCount; i++) {
    const x = xMin + i * dx;
    const y = fn(x);
    if (y !== null) {
      points.push({ x: Number(x.toFixed(4)), y: Number(y.toFixed(4)) });
    }
  }

  return points;
}
