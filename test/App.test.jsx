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

function locateStop (name) {
  return page.getByRole('article').filter({ has: page.getByRole('heading', { name }) })
}

function locateDeparture (parent, route, headsign, time) {
  return parent
    .getByRole('listitem')
    .filter({ hasText: route })
    .filter({ hasText: headsign })
    .filter({ hasText: time })
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

    const stop = locateStop('My stop')
    await expect(stop).toBeVisible()
    await expect(locateDeparture(stop, 'MR', 'My trip', '12:05 pm')).toBeVisible()
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

    await expect(locateStop('Stop one').query()).toBeNull()
    await expect(locateDeparture(page, 'MR', 'My trip', '12:05 pm').query()).toBeNull()

    const stopTwo = locateStop('Stop two')
    await expect(stopTwo).toBeVisible()
    await expect(locateDeparture(stopTwo, 'MR', 'My trip', '12:10 pm')).toBeVisible()

    const stopThree = locateStop('Stop three')
    await expect(stopThree).toBeVisible()
    await expect(locateDeparture(stopThree, 'MR', 'My trip', '12:15 pm')).toBeVisible()
  })

  it('only renders scheduled departures', async () => {
    gtfsReactHooksMocks.useGtfsSchedule.mockImplementation(() => ({
      routes: [{ routeId: 'MY_ROUTE', routeShortName: 'MR', routeColor: '111111' }],
      trips: [{ tripId: 'MY_TRIP', routeId: 'MY_ROUTE', shapeId: 'MY_SHAPE', tripHeadsign: 'My trip' }],
      stops: [
        { stopId: 'STOP_ONE', stopName: 'Stop one' },
        { stopId: 'STOP_TWO', stopName: 'Stop two' },
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
                scheduleRelationship: ScheduleRelationship.SKIPPED,
                departure: { time: currentUnixTime + (60 * 1) }
              },
              {
                stopId: 'STOP_ONE',
                scheduleRelationship: ScheduleRelationship.NO_DATA,
                departure: { time: currentUnixTime + (60 * 2) }
              },
              {
                stopId: 'STOP_ONE',
                scheduleRelationship: ScheduleRelationship.UNSCHEDULED,
                departure: { time: currentUnixTime + (60 * 3) }
              },
              {
                stopId: 'STOP_ONE',
                scheduleRelationship: ScheduleRelationship.SCHEDULED,
                departure: { time: currentUnixTime + (60 * 4) }
              },
              {
                stopId: 'STOP_TWO',
                scheduleRelationship: ScheduleRelationship.SKIPPED,
                departure: { time: currentUnixTime + (60 * 5) }
              },
              {
                stopId: 'STOP_TWO',
                scheduleRelationship: ScheduleRelationship.NO_DATA,
                departure: { time: currentUnixTime + (60 * 6) }
              },
              {
                stopId: 'STOP_TWO',
                scheduleRelationship: ScheduleRelationship.UNSCHEDULED,
                departure: { time: currentUnixTime + (60 * 7) }
              },
              {
                stopId: 'STOP_TWO',
                scheduleRelationship: ScheduleRelationship.SCHEDULED,
                departure: { time: currentUnixTime + (60 * 8) }
              },
            ]
          }
        },
      ]
    }))

    configureApp({ stopIds: 'STOP_ONE,STOP_TWO' })
    page.render(<App />)

    const stopOne = locateStop('Stop one')
    await expect(stopOne).toBeVisible()
    await expect(locateDeparture(page, 'MR', 'My trip', '12:01 pm').query()).toBeNull()
    await expect(locateDeparture(page, 'MR', 'My trip', '12:02 pm').query()).toBeNull()
    await expect(locateDeparture(page, 'MR', 'My trip', '12:03 pm').query()).toBeNull()
    await expect(locateDeparture(stopOne, 'MR', 'My trip', '12:04 pm')).toBeVisible()

    const stopTwo = locateStop('Stop two')
    await expect(stopTwo).toBeVisible()
    await expect(locateDeparture(page, 'MR', 'My trip', '12:05 pm').query()).toBeNull()
    await expect(locateDeparture(page, 'MR', 'My trip', '12:06 pm').query()).toBeNull()
    await expect(locateDeparture(page, 'MR', 'My trip', '12:07 pm').query()).toBeNull()
    await expect(locateDeparture(stopTwo, 'MR', 'My trip', '12:08 pm')).toBeVisible()
  })

  it('only renders departures in the future', async () => {
    gtfsReactHooksMocks.useGtfsSchedule.mockImplementation(() => ({
      routes: [{ routeId: 'MY_ROUTE', routeShortName: 'MR', routeColor: '111111' }],
      trips: [{ tripId: 'MY_TRIP', routeId: 'MY_ROUTE', shapeId: 'MY_SHAPE', tripHeadsign: 'My trip' }],
      stops: [
        { stopId: 'STOP_ONE', stopName: 'Stop one' },
        { stopId: 'STOP_TWO', stopName: 'Stop two' },
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
                departure: { time: currentUnixTime - (60 * 2) }
              },
              {
                stopId: 'STOP_ONE',
                scheduleRelationship: ScheduleRelationship.SCHEDULED,
                departure: { time: currentUnixTime }
              },
              {
                stopId: 'STOP_TWO',
                scheduleRelationship: ScheduleRelationship.SCHEDULED,
                departure: { time: currentUnixTime - (60 * 1) }
              },
              {
                stopId: 'STOP_TWO',
                scheduleRelationship: ScheduleRelationship.SCHEDULED,
                departure: { time: currentUnixTime + (60 * 1) }
              },
            ]
          }
        },
      ]
    }))

    configureApp({ stopIds: 'STOP_ONE,STOP_TWO' })
    page.render(<App />)

    const stopOne = locateStop('Stop one')
    await expect(stopOne).toBeVisible()
    await expect(locateDeparture(page, 'MR', 'My trip', '11:58 am').query()).toBeNull()
    await expect(locateDeparture(stopOne, 'MR', 'My trip', '12:00 pm')).toBeVisible()

    const stopTwo = locateStop('Stop two')
    await expect(stopTwo).toBeVisible()
    await expect(locateDeparture(page, 'MR', 'My trip', '11:59 am').query()).toBeNull()
    await expect(locateDeparture(stopTwo, 'MR', 'My trip', '12:01 pm')).toBeVisible()
  })

  it('only renders the earliest departures for any given route and shape', async () => {
    gtfsReactHooksMocks.useGtfsSchedule.mockImplementation(() => ({
      routes: [{ routeId: 'MY_ROUTE', routeShortName: 'MR', routeColor: '111111' }],
      trips: [
        { tripId: 'TRIP_ONE', routeId: 'MY_ROUTE', shapeId: 'SHAPE_ONE', tripHeadsign: 'Trip one' },
        { tripId: 'TRIP_TWO', routeId: 'MY_ROUTE', shapeId: 'SHAPE_TWO', tripHeadsign: 'Trip two' }
      ],
      stops: [
        { stopId: 'STOP_ONE', stopName: 'Stop one' },
        { stopId: 'STOP_TWO', stopName: 'Stop two' },
      ],
    }))
    gtfsReactHooksMocks.useGtfsRealtime.mockImplementation(() => ({
      entity: [
        {
          tripUpdate: {
            trip: { tripId: 'TRIP_ONE' },
            stopTimeUpdate: [
              {
                stopId: 'STOP_ONE',
                scheduleRelationship: ScheduleRelationship.SCHEDULED,
                departure: { time: currentUnixTime + (60 * 3) }
              },
              {
                stopId: 'STOP_TWO',
                scheduleRelationship: ScheduleRelationship.SCHEDULED,
                departure: { time: currentUnixTime + (60 * 4) }
              },
              {
                stopId: 'STOP_ONE',
                scheduleRelationship: ScheduleRelationship.SCHEDULED,
                departure: { time: currentUnixTime + (60 * 1) }
              },
              {
                stopId: 'STOP_TWO',
                scheduleRelationship: ScheduleRelationship.SCHEDULED,
                departure: { time: currentUnixTime + (60 * 2) }
              },
            ]
          }
        },
        {
          tripUpdate: {
            trip: { tripId: 'TRIP_TWO' },
            stopTimeUpdate: [
              {
                stopId: 'STOP_ONE',
                scheduleRelationship: ScheduleRelationship.SCHEDULED,
                departure: { time: currentUnixTime + (60 * 5) }
              },
              {
                stopId: 'STOP_TWO',
                scheduleRelationship: ScheduleRelationship.SCHEDULED,
                departure: { time: currentUnixTime + (60 * 6) }
              },
            ]
          }
        },
      ]
    }))

    configureApp({ stopIds: 'STOP_ONE,STOP_TWO' })
    page.render(<App />)

    const stopOne = locateStop('Stop one')
    await expect(stopOne).toBeVisible()
    await expect(locateDeparture(stopOne, 'MR', 'Trip one', '12:01 pm')).toBeVisible()
    await expect(locateDeparture(page, 'MR', 'Trip one', '12:03 pm').query()).toBeNull()
    await expect(locateDeparture(stopOne, 'MR', 'Trip two', '12:05 pm')).toBeVisible()

    const stopTwo = locateStop('Stop two')
    await expect(stopTwo).toBeVisible()
    await expect(locateDeparture(stopTwo, 'MR', 'Trip one', '12:02 pm')).toBeVisible()
    await expect(locateDeparture(page, 'MR', 'Trip one', '12:04 am').query()).toBeNull()
    await expect(locateDeparture(stopTwo, 'MR', 'Trip two', '12:06 pm')).toBeVisible()
  })

  it('gracefully ignores incomplete data', async () => {})

  it('prefers departure times but falls back to arrival times', async () => {})

  it('sorts departures by time', async () => {})

  it('alternates between absolute and relative time', async () => {})

  it('uses route colors for each departure', async () => {})

  it('handles resize events without error', async () => {})
})
