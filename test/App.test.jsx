import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import App from '../src/App.jsx'

describe('App', () => {
  it('renders the app name', async () => {
    const { getByRole } = render(<App />)
    await expect.element(getByRole('heading', { name: 'departure-board' })).toBeVisible()
  })
})
