import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginReact from 'eslint-plugin-react';


export default [
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
    },
    rules: {
      ...pluginReact.configs.recommended.rules, // Load recommended React rules directly
      'react/react-in-jsx-scope': 'off', // Override JSX scope rule
    },
  },
  pluginJs.configs.recommended,
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
