import { StudyGraphData } from '../types';

export const STUDY_GRAPH_PRESETS: StudyGraphData[] = [
  {
    id: 'graph-math-quadratic',
    title: 'Quadratic Polynomial & Critical Points',
    subject: 'Mathematics',
    description: 'Parabolic curve analyzing roots, vertex extremum, and y-intercept.',
    curves: [
      {
        id: 'c1',
        name: 'f(x) = x² - 4x + 3',
        formula: 'x^2 - 4*x + 3',
        color: '#4f46e5',
      },
      {
        id: 'c2',
        name: "f'(x) = 2x - 4 (Derivative)",
        formula: '2*x - 4',
        color: '#06b6d4',
      },
    ],
    xLabel: 'x (input)',
    yLabel: 'y / f(x)',
    xRange: [-1, 5],
    yRange: [-3, 8],
    keyPoints: [
      { x: 1, y: 0, label: 'Root 1 (1, 0)', type: 'root' },
      { x: 3, y: 0, label: 'Root 2 (3, 0)', type: 'root' },
      { x: 2, y: -1, label: 'Vertex Min (2, -1)', type: 'vertex' },
      { x: 0, y: 3, label: 'Y-Intercept (0, 3)', type: 'intercept' },
    ],
    insights: [
      'The vertex (2, -1) occurs where the derivative f\'(x) = 0.',
      'Roots at x = 1 and x = 3 satisfy the quadratic formula x = (-b ± √(b² - 4ac)) / (2a).',
    ],
  },
  {
    id: 'graph-calc-trig',
    title: 'Trigonometric Waveforms: Sine & Cosine',
    subject: 'Calculus & Physics',
    description: 'Harmonic oscillation demonstrating phase shift and derivative relationships.',
    curves: [
      {
        id: 'trig1',
        name: 'f(x) = sin(x)',
        formula: 'sin(x)',
        color: '#4f46e5',
      },
      {
        id: 'trig2',
        name: 'g(x) = cos(x)',
        formula: 'cos(x)',
        color: '#10b981',
      },
    ],
    xLabel: 'x (radians)',
    yLabel: 'Amplitude',
    xRange: [-3.5, 6.5],
    yRange: [-1.5, 1.5],
    keyPoints: [
      { x: 0, y: 0, label: 'Origin (0, 0)', type: 'intercept' },
      { x: 1.57, y: 1, label: 'Peak (π/2, 1)', type: 'vertex' },
      { x: 3.14, y: 0, label: 'Zero (π, 0)', type: 'root' },
      { x: 4.71, y: -1, label: 'Trough (3π/2, -1)', type: 'vertex' },
    ],
    insights: [
      'Notice that the derivative of sin(x) is cos(x): when sin(x) reaches its peak, cos(x) crosses zero.',
      'Phase difference between sin(x) and cos(x) is exactly π/2 radians (90°).',
    ],
  },
  {
    id: 'graph-physics-kinematics',
    title: 'Projectile Motion: Height vs Time',
    subject: 'Physics',
    description: 'Kinematics trajectory of a projectile with initial velocity v₀ = 20 m/s.',
    curves: [
      {
        id: 'kin1',
        name: 'y(t) = 20t - 4.9t²',
        formula: '20*x - 4.9*x^2',
        color: '#f59e0b',
      },
    ],
    xLabel: 'Time t (seconds)',
    yLabel: 'Height y (meters)',
    xRange: [0, 4.5],
    yRange: [0, 24],
    keyPoints: [
      { x: 0, y: 0, label: 'Launch (t=0s)', type: 'intercept' },
      { x: 2.04, y: 20.41, label: 'Peak (2.04s, 20.4m)', type: 'vertex' },
      { x: 4.08, y: 0, label: 'Impact (4.08s, 0m)', type: 'root' },
    ],
    insights: [
      'At peak height t = 2.04s, vertical velocity v_y = 0 m/s.',
      'Symmetry: time to reach maximum height equals time to descend back to ground.',
    ],
  },
  {
    id: 'graph-chem-michaelis',
    title: 'Enzyme Kinetics: Michaelis-Menten Curve',
    subject: 'Biochemistry',
    description: 'Reaction velocity V vs Substrate concentration [S] showing saturation.',
    curves: [
      {
        id: 'mm1',
        name: 'V = (Vmax · [S]) / (Km + [S])',
        formula: '(100 * x) / (5 + x)',
        color: '#10b981',
      },
    ],
    xLabel: 'Substrate [S] (mM)',
    yLabel: 'Velocity V (μmol/min)',
    xRange: [0, 50],
    yRange: [0, 110],
    keyPoints: [
      { x: 5, y: 50, label: 'Km = 5 mM (Vmax/2)', type: 'equilibrium' },
      { x: 45, y: 90, label: 'Saturation Plateau', type: 'custom' },
    ],
    insights: [
      'Km is the substrate concentration at which reaction rate is exactly half of Vmax.',
      'At high [S], all enzyme active sites are occupied, causing the curve to asymptote toward Vmax = 100.',
    ],
  },
  {
    id: 'graph-econ-equilibrium',
    title: 'Market Equilibrium: Supply & Demand',
    subject: 'Economics',
    description: 'Demand curve downward slope vs Supply curve upward slope.',
    curves: [
      {
        id: 'dem1',
        name: 'Demand: P = 100 - 2Q',
        formula: '100 - 2*x',
        color: '#e11d48',
      },
      {
        id: 'sup1',
        name: 'Supply: P = 20 + 3Q',
        formula: '20 + 3*x',
        color: '#4f46e5',
      },
    ],
    xLabel: 'Quantity Q (units)',
    yLabel: 'Price P ($)',
    xRange: [0, 40],
    yRange: [0, 110],
    keyPoints: [
      { x: 16, y: 68, label: 'Equilibrium (Q*=16, P*=$68)', type: 'equilibrium' },
      { x: 0, y: 100, label: 'Max Willingness to Pay ($100)', type: 'intercept' },
    ],
    insights: [
      'Equilibrium occurs where Demand = Supply (100 - 2Q = 20 + 3Q => 5Q = 80 => Q = 16, P = 68).',
      'Prices above $68 produce surplus (excess supply); prices below $68 produce shortage (excess demand).',
    ],
  },
];
