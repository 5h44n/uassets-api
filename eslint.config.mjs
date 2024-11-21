import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
        ...globals.jest,
      },
    },
  },
  {
    ignores: ['node_modules', 'dist', 'build', 'coverage'],
  },
  pluginJs.configs.recommended,
];
