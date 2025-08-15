module.exports = {
  root: true,
  plugins: ['unused-imports', 'react', 'react-native', '@typescript-eslint', 'simple-import-sort'],
  parser: '@typescript-eslint/parser',
  extends: [
    'universe/native',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:i18next/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    project: true,
  },
  rules: {
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': 'error',
    'react-native/no-unused-styles': 'error',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
    '@typescript-eslint/consistent-type-imports': 'error',
    'import/order': 'off',
    'react-hooks/exhaustive-deps': 'error',
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'date-fns',
            importNames: ['format', 'formatRelative'],
            message: 'Please use format from @/utils/date.format instead.',
          },
        ],
      },
    ],
  },
};
