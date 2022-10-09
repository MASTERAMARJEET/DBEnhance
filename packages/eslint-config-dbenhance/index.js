module.exports = {
  env: {
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:solid/typescript',
    'prettier',
  ],
  plugins: ['@typescript-eslint', 'solid'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest',
  },
  rules: {
    '@typescript-eslint/no-non-null-assertion': 'off',
  },
  ignorePatterns: [
    '**/dist',
    '*.scss',
    '*.svg',
    '*.css',
    '**/.solid',
    '**/.turbo',
    '**/.vercel',
    '**/node_modules',
  ],
}
