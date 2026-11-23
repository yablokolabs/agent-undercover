import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';

// Navy paper, amber case-file marks and teal system accents. The footage is
// the light workbench; the video frame is deliberately darker so the actual
// UI remains the brightest object on screen.
export const C = {
  bg: '#071521',
  bg2: '#0b2233',
  navy: '#0c2232',
  ink: '#f7f3e9',
  muted: '#9fb0bd',
  faint: '#5a7180',
  line: 'rgba(255,255,255,0.11)',
  glass: 'linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.025))',
  coral: '#e9a23b',
  coralSoft: '#ffc66d',
  cyan: '#6fd6c8',
  green: '#5dd6a4',
  red: '#ff6b72',
};

export const F = {
  display: '"Plus Jakarta Sans", Inter, sans-serif',
  body: 'Inter, sans-serif',
  mono: '"JetBrains Mono", monospace',
};

export const FONT_FACES = [
  '800 40px "Plus Jakarta Sans"',
  '700 40px "Plus Jakarta Sans"',
  '600 40px "Plus Jakarta Sans"',
  '400 20px Inter',
  '500 20px Inter',
  '600 20px Inter',
  '700 20px Inter',
  '500 20px "JetBrains Mono"',
  '700 20px "JetBrains Mono"',
];
