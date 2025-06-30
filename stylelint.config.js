export default {
  extends: 'stylelint-config-standard',
  overrides: [{
    files: ['**/*.scss'],
    extends: 'stylelint-config-standard-scss'
  }],
  ignoreFiles: [
    'coverage/**/*',
    'dist/**/*',
    'node_modules/**/*'
  ]
}
