// eslint.config.mjs

import js from '@eslint/js';
import react from 'eslint-plugin-react';
import prettier from 'eslint-plugin-prettier';
import next from 'eslint-plugin-next';

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