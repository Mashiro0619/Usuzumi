import { consumerDataEditorsHtml } from './browser-html-data-editors.mjs';
import { consumerDialogsHtml } from './browser-html-dialogs.mjs';
import { consumerFormsFeedbackHtml } from './browser-html-forms-feedback.mjs';
import { consumerFoundationHtml } from './browser-html-foundation.mjs';
import { consumerInteractionsHtml } from './browser-html-interactions.mjs';

const consumerBodyHtml = [
  consumerFoundationHtml,
  consumerFormsFeedbackHtml,
  consumerDataEditorsHtml,
  consumerInteractionsHtml,
  consumerDialogsHtml
].join('\n');

export const consumerBrowserHtml = `<!doctype html>
<html class="uzu-root" lang="zh-CN" data-theme="light" data-language="zh" data-uzu-lang="zh">
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="./node_modules/usuzumi/ui/usuzumi.css">
  <script src="./node_modules/usuzumi/ui/usuzumi.js" defer></script>
  <script>try { localStorage.setItem('consumer-theme', 'dark'); } catch (_) {}</script>
</head>
<body class="uzu-app">
  <main class="uzu-page">
${consumerBodyHtml}
  </main>
</body>
</html>
`;
