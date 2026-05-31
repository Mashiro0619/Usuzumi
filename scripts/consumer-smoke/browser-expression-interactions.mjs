import { browserExpressionDataEditorInteractions } from './browser-expression-interactions-data-editors.mjs';
import { browserExpressionDocsLanguageInteractions } from './browser-expression-interactions-docs-language.mjs';
import { browserExpressionFormsNavigationInteractions } from './browser-expression-interactions-forms-navigation.mjs';
import { browserExpressionFoundationInteractions } from './browser-expression-interactions-foundation.mjs';
import { browserExpressionMetricInteractions } from './browser-expression-interactions-metrics.mjs';
import { browserExpressionOverlayInteractions } from './browser-expression-interactions-overlays.mjs';

export const browserExpressionInteractions = [
  browserExpressionFoundationInteractions,
  browserExpressionDataEditorInteractions,
  browserExpressionFormsNavigationInteractions,
  browserExpressionMetricInteractions,
  browserExpressionDocsLanguageInteractions,
  browserExpressionOverlayInteractions
].join('\n');
