// eslint.config.cjs

const js = require('@eslint/js');
const react = require('eslint-plugin-react');
const prettier = require('eslint-plugin-prettier');
const next = require('eslint-plugin-next');

export default [
  js.configs.recommended,
  next.configs['core-web-vitals'],
  react.configs.recommended,
  prettier.configs.recommended,
  {
    plugins: {
      react,
      prettier,
    },
    rules: {
      'prettier/prettier': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'error', // Enable PropTypes linting
      'no-unused-vars': 'warn',
      'no-undef': 'error',
    },
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
    },
    env: {
      browser: true,
      node: true,
      es6: true,
    },
    ignores: [
      'node_modules/',
      '.next/',
      'public/',
      'dist/',
      'logs/',
      '*.log',
      '.env',
      '.env.local',
      '.env.development',
      '.env.production',
      'archive/',
    ],
  },
];
