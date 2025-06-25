import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import neostandard from 'neostandard'

export default defineConfig([
  globalIgnores(['dist']),
  ...neostandard({ env: ['browser'] }),
  { extends: [reactHooks.configs['recommended-latest'], reactRefresh.configs.vite] },
])
