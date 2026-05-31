export { editorIntegrationExpression } from './expression-editor-integration.mjs';

import { visualExpressionChecks } from './expression-checks.mjs';
import { visualExpressionResult } from './expression-result.mjs';
import { visualExpressionSetup } from './expression-setup.mjs';

export const visualExpression = [
  '(async () => {',
  visualExpressionSetup,
  visualExpressionChecks,
  visualExpressionResult,
  '})()'
].join('\n');
