import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      // or for warning only:
      // "@typescript-eslint/no-unused-vars": "warn"
    },
  }
)
