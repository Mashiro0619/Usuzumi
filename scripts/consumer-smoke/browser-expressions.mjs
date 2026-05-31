import { browserExpressionInteractions } from './browser-expression-interactions.mjs';
import { browserExpressionReducedMotion } from './browser-expression-reduced-motion.mjs';
import { browserExpressionResult } from './browser-expression-result.mjs';
import { browserExpressionSetup } from './browser-expression-setup.mjs';

export const consumerBrowserExpression = [
  '(async () => {',
  browserExpressionSetup,
  browserExpressionInteractions,
  browserExpressionResult,
  '})()'
].join('\n');

export const reducedMotionExpression = [
  '(() => {',
  browserExpressionReducedMotion,
  '})()'
].join('\n');
