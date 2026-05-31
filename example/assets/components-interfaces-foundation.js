window.UsuzumiComponentDocs = window.UsuzumiComponentDocs || {};
window.UsuzumiComponentDocs.componentInterfaces = Object.assign(
  window.UsuzumiComponentDocs.componentInterfaces || {},
{
  "colors": {
    "variables": [
      "--uzu-bg",
      "--uzu-surface",
      "--uzu-border",
      "--uzu-success",
      "--uzu-warning",
      "--uzu-danger",
      "--uzu-info"
    ],
    "scope": [
      ":root",
      ".uzu-app",
      ".uzu-scope",
      "local wrapper"
    ]
  },
  "typography": {
    "variables": [
      "--uzu-font-serif",
      "--uzu-font-signature",
      "--uzu-font-mono"
    ],
    "files": [
      "ui/usuzumi.css",
      "ui/usuzumi-signature.css"
    ]
  },
  "motion": {
    "variables": [
      "--uzu-motion-quick",
      "--uzu-motion-base",
      "--uzu-motion-slow",
      "--uzu-ease-standard"
    ]
  }
}
);
