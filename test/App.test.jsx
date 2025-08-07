import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import App from '../src/App.jsx'

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

function configureApp ({ stopIds }) {
  const url = new URL(location)
  url.searchParams.set('stopIds', stopIds)
  history.pushState({}, '', url)
}

describe('App', () => {
  it('renders nothing when no data has been fetched', async () => {
    gtfsReactHooksMocks.useGtfsSchedule.mockImplementation(() => undefined)
    gtfsReactHooksMocks.useGtfsRealtime.mockImplementation(() => undefined)

    const { container } = render(<App />)
    await expect(container).toBeEmptyDOMElement()
  })

  it('renders departures', async () => {
    const currentUnixTime = 43200 // 12 pm
    vi.setSystemTime(new Date(currentUnixTime * 1000))

    gtfsReactHooksMocks.useGtfsSchedule.mockImplementation(() => ({
      routes: [{ routeId: 'MY_ROUTE', routeShortName: 'My route', routeColor: '111111' }],
      trips: [{ tripId: 'MY_TRIP', routeId: 'MY_ROUTE', tripHeadsign: 'My trip' }],
      stops: [{ stopId: 'MY_STOP', stopName: 'My stop' }]
    }))

    gtfsReactHooksMocks.useGtfsRealtime.mockImplementation(() => ({
      entity: [
        {
          tripUpdate: {
            trip: { tripId: 'MY_TRIP' },
            stopTimeUpdate: [
              {
                stopId: 'MY_STOP',
                scheduleRelationship: 'SCHEDULED',
                departure: { time: currentUnixTime + (60 * 5) }
              }
            ]
          }
        }
      ]
    }))

    configureApp({ stopIds: 'MY_STOP' })

    const { getByText } = render(<App />)

    await expect.element(getByText('My stop')).toBeVisible()
    await expect.element(getByText('My routeMy trip12:05 pm', { exact: true })).toBeVisible()
  })

  it('prefers departure times')

  it('only renders departures for configured stops')

  it('only renders scheduled departures')

  it('only renders departures in the future')

  it('only renders the earliest departures for any given route and shape')

  it('renders departures for multiple stops', async () => {
  })

  it('alternates between absolute and relative time', async () => {
    /*
      vi.advanceTimersByTime(5000)
      await expect.element(getByText('3 minutes')).toBeVisible()

      vi.advanceTimersByTime(5000)
      await expect.element(getByText('4:23 pm')).toBeVisible()
     */
  })

  it('handles resize events without error', async () => {
    /*
    window.dispatchEvent(new Event('resize'))
    */
  })
})
