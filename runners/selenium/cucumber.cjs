module.exports = {
  default: {
    require: ['./features/step-definitions/**/*.js'],
    format: ['progress', 'json:reports/cucumber-report.json'],
    paths: ['./features/**/*.feature'],
  },
};