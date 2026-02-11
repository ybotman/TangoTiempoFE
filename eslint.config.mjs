import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';

export default [
  // Base configuration for all JavaScript/JSX files
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        process: 'readonly',
        Buffer: 'readonly',
      },
      parserOptions: {
        ecmaFeatures: { jsx: true }, // Explicitly enable JSX parsing
      },
    },
    settings: {
      react: {
        version: 'detect', // Automatically detects React version
      },
    },
    plugins: {
      react: pluginReact, // Register the React plugin
      'react-hooks': pluginReactHooks, // Register React Hooks plugin
    },
    rules: {
      ...pluginReact.configs.recommended.rules, // Load recommended React rules directly
      ...pluginReactHooks.configs.recommended.rules, // Load recommended React Hooks rules
      'react/react-in-jsx-scope': 'off', // Override JSX scope rule
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }], // Allow underscore-prefixed unused vars
    },
  },
  
  // Configuration specifically for Cypress test files
  {
    files: ['cypress/**/*.{js,jsx,cy.js}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        cy: 'readonly',
        Cypress: 'readonly',
        describe: 'readonly',
        context: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        assert: 'readonly',
      },
    },
  },
  
  // Configuration specifically for Jest test files
  {
    files: ['**/*.test.{js,jsx}', '**/*.spec.{js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.jest,
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        jest: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
  },
  
  // Configuration for Node.js files (scripts and server-side code)
  {
    files: ['scripts/**/*.js', 'src/app/scripts/**/*.js', '**/analyze-*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        __dirname: 'readonly',
        __filename: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
      },
    },
  },
  
  // Include recommended JS configurations
  pluginJs.configs.recommended,
  
  // Ignore patterns
  {
    ignores: [
      'node_modules/',
      '.next/',
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