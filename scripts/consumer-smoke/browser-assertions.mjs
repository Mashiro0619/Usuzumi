import { assertConsumerFormsLayoutResult } from './browser-assertions-forms-layout.mjs';
import { assertConsumerFoundationResult } from './browser-assertions-foundation.mjs';
import { assertConsumerNavigationFeedbackResult } from './browser-assertions-navigation-feedback.mjs';
import { assertConsumerOverlaysDocsResult } from './browser-assertions-overlays-docs.mjs';
export { assertReducedMotionResult } from './browser-assertions-reduced-motion.mjs';

export function assertConsumerBrowserResult(value) {
  assertConsumerFoundationResult(value);
  assertConsumerFormsLayoutResult(value);
  assertConsumerNavigationFeedbackResult(value);
  assertConsumerOverlaysDocsResult(value);
}
