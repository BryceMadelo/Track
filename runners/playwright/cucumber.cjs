module.exports = {
  // Original login tests — uses specific step definitions only
  default: {
    require: ['./features/step-definitions/login.steps.js'],
    format: ['progress'],
    paths: ['./features/login.feature'],
  },
  // Visual builder tests — uses catch-all step definitions only
  visual: {
    require: ['./features/step-definitions/visual.steps.js'],
    format: ['progress', 'json:reports/cucumber-report.json'],
    paths: ['./features/visual_test.feature'],
  },
};