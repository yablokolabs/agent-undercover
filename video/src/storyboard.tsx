import React from 'react';
import {Approval} from './scenes/Approval';
import {Case} from './scenes/Case';
import {Compare} from './scenes/Compare';
import {Consent} from './scenes/Consent';
import {Hook} from './scenes/Hook';
import {Outro} from './scenes/Outro';
import {Problem} from './scenes/Problem';
import {Published} from './scenes/Published';
import {Setup} from './scenes/Setup';

export type SceneDef = {
  id: string;
  start: number;
  end: number;
  label: string;
  component: React.FC;
  chapter?: boolean;
  hue?: number;
  push?: number;
};

export const SCENES: SceneDef[] = [
  {id: 'hook', start: 0, end: 5.5, label: 'Intro', component: Hook, hue: 0},
  {id: 'problem', start: 5.5, end: 13.5, label: 'The problem', component: Problem, chapter: true, hue: 0.1},
  {id: 'setup', start: 13.5, end: 19.5, label: 'Mission setup', component: Setup, chapter: true, hue: 0.35},
  {id: 'consent', start: 19.5, end: 25.5, label: 'Consent', component: Consent, chapter: true, hue: 0.65},
  {id: 'case', start: 25.5, end: 33.5, label: 'Observed result', component: Case, chapter: true, hue: 0},
  {id: 'compare', start: 33.5, end: 43.5, label: 'Repair', component: Compare, chapter: true, hue: 0.65},
  {id: 'approval', start: 43.5, end: 52.5, label: 'Host consent', component: Approval, chapter: true, hue: 0.1},
  {id: 'published', start: 52.5, end: 58.5, label: 'Public network', component: Published, chapter: true, hue: 0.65},
  {id: 'outro', start: 58.5, end: 66.5, label: 'Close', component: Outro, hue: 0},
];

export const TOTAL_SECONDS = SCENES[SCENES.length - 1].end;
