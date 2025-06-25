import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import App from '../src/App.jsx'

describe('App', () => {
  it('renders a hello world message', async () => {
    const { getByRole } = render(<App />)
    await expect.element(getByRole('heading', { name: 'Hello, World!' })).toBeVisible()
  })
})
