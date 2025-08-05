import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import App from '../src/App.jsx'
import gtfsSchedule from './fixtures/schedule.json'
import gtfsTripUpdates from './fixtures/trip-updates.json'

const gtfsReactHooksMocks = vi.hoisted(() => ({
  useGtfsSchedule: vi.fn(),
  useGtfsRealtime: vi.fn(),
  useFetchResolver: vi.fn(() => undefined),
}))

vi.mock('gtfs-react-hooks', () => ({
  useGtfsSchedule: gtfsReactHooksMocks.useGtfsSchedule,
  useGtfsRealtime: gtfsReactHooksMocks.useGtfsRealtime,
  useFetchResolver: gtfsReactHooksMocks.useFetchResolver,
}))

describe('App', () => {
  it('renders nothing when no data has been fetched', async () => {
    gtfsReactHooksMocks.useGtfsSchedule.mockImplementation(() => undefined)
    gtfsReactHooksMocks.useGtfsRealtime.mockImplementation(() => undefined)
    const url = new URL(location)
    url.searchParams.set('stopIds', '116')
    history.pushState({}, '', url)

    const { container } = render(<App />)
    await expect(container).toBeEmptyDOMElement()
  })

  it('renders departures when data has been fetched', async () => {
    const currentTime = new Date(2025, 5, 27, 16, 20)
    vi.setSystemTime(currentTime)

    gtfsReactHooksMocks.useGtfsSchedule.mockImplementation(() => gtfsSchedule)
    gtfsReactHooksMocks.useGtfsRealtime.mockImplementation(() => gtfsTripUpdates)
    const url = new URL(location)
    url.searchParams.set('stopIds', '116')
    history.pushState({}, '', url)

    const { getByText } = render(<App />)
    await expect.element(getByText('Amherst College')).toBeVisible()
    await expect.element(getByText('B43')).toBeVisible()
    await expect.element(getByText('Northampton via Hampshire Mall')).toBeVisible()
    await expect.element(getByText('4:23 pm')).toBeVisible()

    vi.advanceTimersByTime(5000)
    await expect.element(getByText('3 minutes')).toBeVisible()

    vi.advanceTimersByTime(5000)
    await expect.element(getByText('4:23 pm')).toBeVisible()

    // TODO: Actually test.
    window.dispatchEvent(new Event('resize'))
  })
})
