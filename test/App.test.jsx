import GtfsRealtimeBindings from 'gtfs-realtime-bindings'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import App from '../src/App.jsx'

const ScheduleRelationship = GtfsRealtimeBindings.transit_realtime.TripUpdate.StopTimeUpdate.ScheduleRelationship

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

    configureApp({ stopIds: 'MY_STOP' })
    const { container } = render(<App />)

    await expect(container).toBeEmptyDOMElement()
  })

  it('renders departures when data has been fetched', async () => {
    gtfsReactHooksMocks.useGtfsSchedule.mockImplementation(() => ({
      routes: [{ routeId: 'MY_ROUTE', routeShortName: 'MR', routeColor: '111111' }],
      trips: [{ tripId: 'MY_TRIP', routeId: 'MY_ROUTE', tripHeadsign: 'My trip' }],
      stops: [{ stopId: 'MY_STOP', stopName: 'My stop' }],
    }))
    gtfsReactHooksMocks.useGtfsRealtime.mockImplementation(() => ({
      entity: [
        {
          tripUpdate: {
            trip: { tripId: 'MY_TRIP' },
            stopTimeUpdate: [
              {
                stopId: 'MY_STOP',
                scheduleRelationship: ScheduleRelationship.SCHEDULED,
                departure: { time: currentUnixTime + (60 * 5) }
              }
            ]
          }
        },
      ]
    }))

    configureApp({ stopIds: 'MY_STOP' })
    const { getByRole } = render(<App />)

    const departure = getByRole('listitem').filter({ hasText: 'MRMy trip12:05 pm' })
    await expect(departure).toBeVisible()
  })
})
