import { page } from '@vitest/browser/context'
import GtfsRealtimeBindings from 'gtfs-realtime-bindings'
import { beforeEach, describe, expect, it, vi } from 'vitest'
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
    const { container } = page.render(<App />)
    await expect(container).toBeEmptyDOMElement()
  })

  it('renders departures when data has been fetched', async () => {
    gtfsReactHooksMocks.useGtfsSchedule.mockImplementation(() => ({
      routes: [{ routeId: 'MY_ROUTE', routeShortName: 'MR', routeColor: '111111' }],
      trips: [{ tripId: 'MY_TRIP', routeId: 'MY_ROUTE', shapeId: 'MY_SHAPE', tripHeadsign: 'My trip' }],
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
    page.render(<App />)

    const stop = page.getByRole('article').filter({ has: page.getByRole('heading', { name: 'My stop' }) })
    await expect(stop).toBeVisible()
    await expect(
      stop.getByRole('listitem')
        .filter({ hasText: 'MR' }).filter({ hasText: 'My trip' }).filter({ hasText: '12:05 pm' })
    ).toBeVisible()
  })

  it('only renders departures for configured stops', async () => {
    gtfsReactHooksMocks.useGtfsSchedule.mockImplementation(() => ({
      routes: [{ routeId: 'MY_ROUTE', routeShortName: 'MR', routeColor: '111111' }],
      trips: [{ tripId: 'MY_TRIP', routeId: 'MY_ROUTE', shapeId: 'MY_SHAPE', tripHeadsign: 'My trip' }],
      stops: [
        { stopId: 'STOP_ONE', stopName: 'Stop one' },
        { stopId: 'STOP_TWO', stopName: 'Stop two' },
        { stopId: 'STOP_THREE', stopName: 'Stop three' },
      ],
    }))
    gtfsReactHooksMocks.useGtfsRealtime.mockImplementation(() => ({
      entity: [
        {
          tripUpdate: {
            trip: { tripId: 'MY_TRIP' },
            stopTimeUpdate: [
              {
                stopId: 'STOP_ONE',
                scheduleRelationship: ScheduleRelationship.SCHEDULED,
                departure: { time: currentUnixTime + (60 * 5) }
              },
              {
                stopId: 'STOP_TWO',
                scheduleRelationship: ScheduleRelationship.SCHEDULED,
                departure: { time: currentUnixTime + (60 * 10) }
              },
              {
                stopId: 'STOP_THREE',
                scheduleRelationship: ScheduleRelationship.SCHEDULED,
                departure: { time: currentUnixTime + (60 * 15) }
              }
            ]
          }
        },
      ]
    }))

    configureApp({ stopIds: 'STOP_TWO,STOP_THREE' })
    page.render(<App />)

    await expect(
      page.getByRole('article').filter({ has: page.getByRole('heading', { name: 'Stop one' }) }).query()
    ).toBeNull()
    await expect(
      page.getByRole('listitem')
        .filter({ hasText: 'MR' }).filter({ hasText: 'My trip' }).filter({ hasText: '12:05 pm' }).query()
    ).toBeNull()

    const stopTwo = page.getByRole('article').filter({ has: page.getByRole('heading', { name: 'Stop two' }) })
    await expect(stopTwo).toBeVisible()
    await expect(
      stopTwo.getByRole('listitem')
        .filter({ hasText: 'MR' }).filter({ hasText: 'My trip' }).filter({ hasText: '12:10 pm' })
    ).toBeVisible()

    const stopThree = page.getByRole('article').filter({ has: page.getByRole('heading', { name: 'Stop three' }) })
    await expect(stopThree).toBeVisible()
    await expect(
      stopThree.getByRole('listitem')
        .filter({ hasText: 'MR' }).filter({ hasText: 'My trip' }).filter({ hasText: '12:15 pm' })
    ).toBeVisible()
  })

  it('only renders scheduled departures', async () => {})

  it('only renders departures in the future', async () => {})

  it('only renders the earliest departures for any given route and shape', async () => {})

  it('gracefully ignores incomplete data', async () => {})

  it('prefers departure times but falls back to arrival times', async () => {})

  it('sorts departures by time', async () => {})

  it('alternates between absolute and relative time', async () => {})

  it('uses route colors for each departure', async () => {})

  it('handles resize events without error', async () => {})
})
