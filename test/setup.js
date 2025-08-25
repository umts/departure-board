import { afterEach, beforeEach, vi } from 'vitest'
import 'vitest-browser-react'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.clearAllMocks()
})
