import { beforeEach, describe, expect, it, vi } from 'vitest'
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
  const currentUnixTime = 43200 // 12 pm

  beforeEach(() => {
    vi.setSystemTime(new Date(currentUnixTime * 1000))
  })

  it('renders nothing when no data has been fetched', async () => {
    gtfsReactHooksMocks.useGtfsSchedule.mockImplementation(() => undefined)
    gtfsReactHooksMocks.useGtfsRealtime.mockImplementation(() => undefined)

    const { container } = render(<App />)
    await expect(container).toBeEmptyDOMElement()
  })

  it('renders departures', async () => {
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

    await expect(getByText('My stop')).toBeVisible()
    await expect(getByText('My routeMy trip12:05 pm', { exact: true })).toBeVisible()
  })

  it('only renders departures for configured stops', async () => {
    gtfsReactHooksMocks.useGtfsSchedule.mockImplementation(() => ({
      routes: [{ routeId: 'MY_ROUTE', routeShortName: 'My route', routeColor: '111111' }],
      trips: [{ tripId: 'MY_TRIP', routeId: 'MY_ROUTE', tripHeadsign: 'My trip' }],
      stops: [{ stopId: 'STOP_ONE', stopName: 'Stop one' }]
    }))
    gtfsReactHooksMocks.useGtfsRealtime.mockImplementation(() => ({
      entity: [
        {
          tripUpdate: {
            trip: { tripId: 'MY_TRIP' },
            stopTimeUpdate: [
              {
                stopId: 'STOP_ONE',
                scheduleRelationship: 'SCHEDULED',
                departure: { time: currentUnixTime + (60 * 5) }
              },
              {
                stopId: 'STOP_TWO',
                scheduleRelationship: 'SCHEDULED',
                departure: { time: currentUnixTime + (60 * 6) }
              }
            ]
          }
        },
      ]
    }))
    configureApp({ stopIds: 'STOP_ONE' })
    const { getByText } = render(<App />)

    await expect(getByText('My routeMy trip12:05 pm', { exact: true })).toBeVisible()
    await expect(getByText('My routeMy trip12:06 pm', { exact: true }).query()).toBeNull()
  })

  it('prefers departure times but falls back to arrival times', async () => {
    gtfsReactHooksMocks.useGtfsSchedule.mockImplementation(() => ({
      routes: [{ routeId: 'MY_ROUTE', routeShortName: 'My route', routeColor: '111111' }],
      trips: [
        { tripId: 'TRIP_ONE', routeId: 'MY_ROUTE', tripHeadsign: 'Trip one' },
        { tripId: 'TRIP_TWO', routeId: 'MY_ROUTE', tripHeadsign: 'Trip two' },
        { tripId: 'TRIP_THREE', routeId: 'MY_ROUTE', tripHeadsign: 'Trip three' },
      ],
      stops: [{ stopId: 'MY_STOP', stopName: 'My stop' }]
    }))
    gtfsReactHooksMocks.useGtfsRealtime.mockImplementation(() => ({
      entity: [
        {
          tripUpdate: {
            trip: { tripId: 'TRIP_ONE' },
            stopTimeUpdate: [
              {
                stopId: 'MY_STOP',
                scheduleRelationship: 'SCHEDULED',
                departure: { time: currentUnixTime + (60 * 5) }
              }
            ]
          }
        },
        {
          tripUpdate: {
            trip: { tripId: 'TRIP_THREE' },
            stopTimeUpdate: [
              {
                stopId: 'MY_STOP',
                scheduleRelationship: 'SCHEDULED',
                arrival: { time: currentUnixTime + (60 * 6) },
                departure: { time: currentUnixTime + (60 * 7) }
              }
            ]
          }
        },
        {
          tripUpdate: {
            trip: { tripId: 'TRIP_THREE' },
            stopTimeUpdate: [
              {
                stopId: 'MY_STOP',
                scheduleRelationship: 'SCHEDULED',
                arrival: { time: currentUnixTime + (60 * 8) }
              }
            ]
          }
        }
      ]
    }))
    configureApp({ stopIds: 'MY_STOP' })
    const { getByText } = render(<App />)

    await expect(getByText('My routeMy trip12:05 pm', { exact: true })).toBeVisible()
    await expect(getByText('My routeMy trip12:07 pm', { exact: true })).toBeVisible()
    await expect(getByText('My routeMy trip12:08 pm', { exact: true })).toBeVisible()
  })

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
