// Preload script — runs in a privileged context before the renderer process.
// Use contextBridge to safely expose Node.js APIs to your web app if needed.
// For a fully offline notepad, we don't need to expose anything special.

window.addEventListener('DOMContentLoaded', () => {
  // You can expose app version info to the renderer here if you want
  // e.g. document.title = `LofiPad v${process.env.npm_package_version}`;
});
