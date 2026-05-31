import { visualExpressionDataLayoutChecks } from './expression-checks-data-layout.mjs';
import { visualExpressionEditorChecks } from './expression-checks-editors.mjs';
import { visualExpressionFormsFeedbackChecks } from './expression-checks-forms-feedback.mjs';
import { visualExpressionFoundationChecks } from './expression-checks-foundation.mjs';
import { visualExpressionLayoutMetricChecks } from './expression-checks-layout-metrics.mjs';
import { visualExpressionNavigationFeedbackChecks } from './expression-checks-navigation-feedback.mjs';

export const visualExpressionChecks = [
  visualExpressionFoundationChecks,
  visualExpressionFormsFeedbackChecks,
  visualExpressionDataLayoutChecks,
  visualExpressionEditorChecks,
  visualExpressionNavigationFeedbackChecks,
  visualExpressionLayoutMetricChecks
].join('\n');
