/**
 * One dove, drawn once and shared by the SVG scenes and the peace canvas.
 * Side view facing +x, body centred on 0,0, about 42 × 26 units.
 * The wing is drawn raised; flapping squashes it through the shoulder
 * (WING_PIVOT) from scaleY 1 (up) to -0.6 (below the belly).
 */
export const DOVE = {
  body: "M15.5 -4.2 C 15.2 -7.6 11 -8.8 8.6 -6.6 C 6.4 -4.6 3 -3.6 -2 -3.4 C -8 -3.2 -12 -2 -16 0 L -23 -2.6 C -24 -0.6 -24 1.6 -23 3.4 L -15.5 2.6 C -11 5.6 -3 7 4 5.8 C 9 5 12.6 2.6 14.4 -0.4 C 15.2 -1.6 15.6 -2.8 15.5 -4.2 Z",
  belly: "M-15.5 2.6 C -11 5.6 -3 7 4 5.8 C 9 5 12.6 2.6 14.4 -0.4 C 10 2.4 2 3.6 -6 3.2 C -10 3 -13 2.4 -15.5 2.6 Z",
  beak: "M15.2 -4.8 L 18.6 -3.7 L 15.1 -2.7 Z",
  tail: "M-16.4 0.4 L -22.4 0.3 M-16 1.6 L -22 2.4",
  wing: "M5 -2.4 C 2.6 -8.4 -2.6 -14.4 -10.6 -19.2 C -12.8 -20.4 -15 -19.8 -14.6 -17.8 C -15.9 -16.8 -15.6 -15 -14 -14.5 C -14.9 -13 -14 -11.5 -12.4 -11.4 C -12.7 -9.8 -11.4 -8.7 -9.8 -9 C -7.6 -5.8 -3.8 -3 0.6 -1.4 Z",
  wingLines: "M-1 -4.6 C -4 -7.6 -7.4 -11 -10.6 -15.2 M-4.4 -3.6 C -7.4 -6 -10 -8.6 -12.4 -11.4",
  eye: { cx: 12.2, cy: -5, r: 0.9 },
} as const;

export const WING_PIVOT = { x: 3, y: -2.4 } as const;

export const DOVE_TONES = {
  feather: "#fbfaf6", shade: "#e7e1d4", farWing: "#ddd6c7", line: "#8f8878", beak: "#c98f3e", eye: "#2b2f26",
} as const;
