import { assertConsumerCloseEventResult } from './browser-assertions-close-events.mjs';
import { assertConsumerDocsResult } from './browser-assertions-docs.mjs';
import { assertConsumerOverlayResult } from './browser-assertions-overlays.mjs';

export function assertConsumerOverlaysDocsResult(value) {
  assertConsumerOverlayResult(value);
  assertConsumerDocsResult(value);
  assertConsumerCloseEventResult(value);
}
