module.exports = {
  testTimeout: 30000,
  displayName: "sandbox",
  testMatch: ["**/complete.test.js"],
  testURL: "http://localhost",
  setupFiles: ["jest-canvas-mock"],
}
