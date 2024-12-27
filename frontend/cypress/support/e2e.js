import "./commands";

// Prevent uncaught exceptions from failing tests
Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});

// Disable webpack overlay before tests
Cypress.on("window:before:load", (win) => {
  const originalConsoleError = win.console.error;
  win.console.error = (...args) => {
    if (args[0]?.includes("webpack-dev-server")) {
      return;
    }
    originalConsoleError.apply(win.console, args);
  };
  if (win.webpack && win.webpack.hot) {
    win.webpack.hot.removeStatusHandler();
  }
});

Cypress.Commands.add("removeOverlay", () => {
  Cypress.$("#webpack-dev-server-client-overlay").remove();
});
