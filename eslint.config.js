import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // server/ and mobile/ are independent packages with their own eslint
  // config and node_modules (see CLAUDE.md) — explicitly excluded here
  // rather than relying on ESLint's nested-config auto-discovery, so this
  // config (and any CI job that only installs root's deps) never depends
  // on those other packages' node_modules being present.
  globalIgnores(['dist', 'server', 'mobile']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
])
