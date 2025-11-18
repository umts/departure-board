import GtfsRealtimeBindings from 'gtfs-realtime-bindings'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import 'vitest-browser-react'
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

function locateDeparture (parent, ...texts) {
  return texts.reduce((locator, text) => locator.filter({ hasText: text }), parent.getByRole('listitem'))
}

describe('App', () => {
  const currentUnixTime = 43200 // 12 pm

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(currentUnixTime * 1000))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.resetAllMocks()
  })

  it('renders nothing when no data has been fetched', async () => {
    gtfsReactHooksMocks.useGtfsSchedule.mockImplementation(() => undefined)
    gtfsReactHooksMocks.useGtfsRealtime.mockImplementation(() => undefined)

    configureApp({ stopIds: 'MY_STOP' })
    await page.render(<App />)
    await expect.element(page.getByRole('article')).not.toBeInTheDocument()
  })

  it('renders departures when data has been fetched', async () => {
    gtfsReactHooksMocks.useGtfsSchedule.mockImplementation(() => ({
      routes: [{ routeId: 'MY_ROUTE', routeShortName: 'MR', routeColor: '111111' }],
      trips: [{ tripId: 'MY_TRIP', routeId: 'MY_ROUTE', shapeId: 'MY_SHAPE', tripHeadsign: 'My trip' }],
      stops: [{ stopId: 'MY_STOP', stopName: 'My stop' }],
      stopTimes: [{ tripId: 'MY_TRIP', stopId: 'LAST_STOP', stopSequence: '2' }]
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
    await page.render(<App />)

    const stop = locateStop('My stop')
    await expect.element(stop).toBeVisible()
    await expect.element(locateDeparture(stop, 'MR', 'My trip', '12:05 pm')).toBeVisible()
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
      stopTimes: [{ tripId: 'MY_TRIP', stopId: 'LAST_STOP', stopSequence: '4' }]
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
    await page.render(<App />)

    await expect.element(locateStop('Stop one')).not.toBeInTheDocument()
    await expect.element(locateDeparture(page, 'MR', 'My trip', '12:05 pm')).not.toBeInTheDocument()

    const stopTwo = locateStop('Stop two')
    await expect.element(stopTwo).toBeVisible()
    await expect.element(locateDeparture(stopTwo, 'MR', 'My trip', '12:10 pm')).toBeVisible()

    const stopThree = locateStop('Stop three')
    await expect.element(stopThree).toBeVisible()
    await expect.element(locateDeparture(stopThree, 'MR', 'My trip', '12:15 pm')).toBeVisible()
  })

  it('only renders scheduled departures', async () => {
    gtfsReactHooksMocks.useGtfsSchedule.mockImplementation(() => ({
      routes: [{ routeId: 'MY_ROUTE', routeShortName: 'MR', routeColor: '111111' }],
      trips: [{ tripId: 'MY_TRIP', routeId: 'MY_ROUTE', shapeId: 'MY_SHAPE', tripHeadsign: 'My trip' }],
      stops: [
        { stopId: 'STOP_ONE', stopName: 'Stop one' },
        { stopId: 'STOP_TWO', stopName: 'Stop two' },
      ],
      stopTimes: [{ tripId: 'MY_TRIP', stopId: 'LAST_STOP', stopSequence: '3' }],
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
    await page.render(<App />)

    const stopOne = locateStop('Stop one')
    await expect.element(stopOne).toBeVisible()
    await expect.element(locateDeparture(page, 'MR', 'My trip', '12:01 pm')).not.toBeInTheDocument()
    await expect.element(locateDeparture(page, 'MR', 'My trip', '12:02 pm')).not.toBeInTheDocument()
    await expect.element(locateDeparture(page, 'MR', 'My trip', '12:03 pm')).not.toBeInTheDocument()
    await expect.element(locateDeparture(stopOne, 'MR', 'My trip', '12:04 pm')).toBeVisible()

    const stopTwo = locateStop('Stop two')
    await expect.element(stopTwo).toBeVisible()
    await expect.element(locateDeparture(page, 'MR', 'My trip', '12:05 pm')).not.toBeInTheDocument()
    await expect.element(locateDeparture(page, 'MR', 'My trip', '12:06 pm')).not.toBeInTheDocument()
    await expect.element(locateDeparture(page, 'MR', 'My trip', '12:07 pm')).not.toBeInTheDocument()
    await expect.element(locateDeparture(stopTwo, 'MR', 'My trip', '12:08 pm')).toBeVisible()
  })

  it('only renders departures in the future', async () => {
    gtfsReactHooksMocks.useGtfsSchedule.mockImplementation(() => ({
      routes: [{ routeId: 'MY_ROUTE', routeShortName: 'MR', routeColor: '111111' }],
      trips: [{ tripId: 'MY_TRIP', routeId: 'MY_ROUTE', shapeId: 'MY_SHAPE', tripHeadsign: 'My trip' }],
      stops: [
        { stopId: 'STOP_ONE', stopName: 'Stop one' },
        { stopId: 'STOP_TWO', stopName: 'Stop two' },
      ],
      stopTimes: [{ tripId: 'MY_TRIP', stopId: 'LAST_STOP', stopSequence: '3' }],
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
    await page.render(<App />)

    const stopOne = locateStop('Stop one')
    await expect.element(stopOne).toBeVisible()
    await expect.element(locateDeparture(page, 'MR', 'My trip', '11:58 am')).not.toBeInTheDocument()
    await expect.element(locateDeparture(stopOne, 'MR', 'My trip', '12:00 pm')).toBeVisible()

    const stopTwo = locateStop('Stop two')
    await expect.element(stopTwo).toBeVisible()
    await expect.element(locateDeparture(page, 'MR', 'My trip', '11:59 am')).not.toBeInTheDocument()
    await expect.element(locateDeparture(stopTwo, 'MR', 'My trip', '12:01 pm')).toBeVisible()
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
      stopTimes: [
        { tripId: 'TRIP_ONE', stopId: 'LAST_STOP', stopSequence: '3' },
        { tripId: 'TRIP_ONE', stopId: 'SECOND_TO_LAST_STOP', stopSequence: '2' },
        { tripId: 'TRIP_TWO', stopId: 'LAST_STOP', stopSequence: '3' },
        { tripId: 'TRIP_TWO', stopId: 'SECOND_TO_LAST_STOP', stopSequence: '2' },
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
              {
                stopId: 'STOP_ONE',
                scheduleRelationship: ScheduleRelationship.SCHEDULED,
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
    await page.render(<App />)

    const stopOne = locateStop('Stop one')
    await expect.element(stopOne).toBeVisible()
    await expect.element(locateDeparture(stopOne, 'MR', 'Trip one', '12:01 pm')).toBeVisible()
    await expect.element(locateDeparture(page, 'MR', 'Trip one', '12:03 pm')).not.toBeInTheDocument()
    await expect.element(locateDeparture(stopOne, 'MR', 'Trip two', '12:05 pm')).toBeVisible()

    const stopTwo = locateStop('Stop two')
    await expect.element(stopTwo).toBeVisible()
    await expect.element(locateDeparture(stopTwo, 'MR', 'Trip one', '12:02 pm')).toBeVisible()
    await expect.element(locateDeparture(page, 'MR', 'Trip one', '12:04 am')).not.toBeInTheDocument()
    await expect.element(locateDeparture(stopTwo, 'MR', 'Trip two', '12:06 pm')).toBeVisible()
  })

  it('gracefully ignores incomplete data', async () => {
    gtfsReactHooksMocks.useGtfsSchedule.mockImplementation(() => ({
      routes: [{ routeId: 'MY_ROUTE', routeShortName: 'MR', routeColor: '111111' }],
      trips: [
        { tripId: 'MY_TRIP', routeId: 'MY_ROUTE', shapeId: 'MY_SHAPE', tripHeadsign: 'My trip' },
        { tripId: 'NO_ROUTE_TRIP', routeId: 'NO_ROUTE', shapeId: 'MY_SHAPE', tripHeadsign: 'No route trip' },
        { tripId: 'NO_SHAPE_TRIP', routeId: 'NO_ROUTE', tripHeadsign: 'No shape trip' },
        { tripId: 'DUPLICATE_TRIP', routeId: 'MY_ROUTE', shapeId: 'MY_SHAPE', tripHeadsign: 'Duplicate trip' },
        { tripId: 'DUPLICATE_TRIP', routeId: 'MY_ROUTE', shapeId: 'MY_SHAPE', tripHeadsign: 'Duplicate trip' },
      ],
      stops: [{ stopId: 'MY_STOP', stopName: 'My stop' }],
      stopTimes: [],
    }))
    gtfsReactHooksMocks.useGtfsRealtime.mockImplementation(() => ({
      entity: [
        {
          tripUpdate: {
            trip: { tripId: 'NO_TRIP' },
            stopTimeUpdate: [
              {
                stopId: 'MY_STOP',
                scheduleRelationship: ScheduleRelationship.SCHEDULED,
                departure: { time: currentUnixTime + (60 * 5) }
              }
            ]
          }
        },
        {
          tripUpdate: {
            trip: { tripId: 'NO_ROUTE_TRIP' },
            stopTimeUpdate: [
              {
                stopId: 'MY_STOP',
                scheduleRelationship: ScheduleRelationship.SCHEDULED,
                departure: { time: currentUnixTime + (60 * 5) }
              }
            ]
          }
        },
        {
          tripUpdate: {
            trip: { tripId: 'NO_SHAPE_TRIP' },
            stopTimeUpdate: [
              {
                stopId: 'MY_STOP',
                scheduleRelationship: ScheduleRelationship.SCHEDULED,
                departure: { time: currentUnixTime + (60 * 5) }
              }
            ]
          }
        },
        {
          tripUpdate: {
            trip: { tripId: 'MY_TRIP' },
            stopTimeUpdate: [
              {
                stopId: 'NO_STOP',
                scheduleRelationship: ScheduleRelationship.SCHEDULED,
                departure: { time: currentUnixTime + (60 * 5) }
              }
            ]
          }
        },
      ]
    }))

    configureApp({ stopIds: 'MY_STOP,NO_STOP' })
    await page.render(<App />)

    await expect.element(locateStop('My stop')).toBeVisible()
    await expect.element(locateDeparture(page, '12:05 pm')).not.toBeInTheDocument()
  })

  it('prefers departure times but falls back to arrival times', async () => {
    gtfsReactHooksMocks.useGtfsSchedule.mockImplementation(() => ({
      routes: [{ routeId: 'MY_ROUTE', routeShortName: 'MR', routeColor: '111111' }],
      trips: [
        { tripId: 'TRIP_ONE', routeId: 'MY_ROUTE', shapeId: 'SHAPE_ONE', tripHeadsign: 'Trip one' },
        { tripId: 'TRIP_TWO', routeId: 'MY_ROUTE', shapeId: 'SHAPE_TWO', tripHeadsign: 'Trip two' },
        { tripId: 'TRIP_THREE', routeId: 'MY_ROUTE', shapeId: 'SHAPE_THREE', tripHeadsign: 'Trip three' }
      ],
      stops: [{ stopId: 'MY_STOP', stopName: 'My stop' }],
      stopTimes: [
        { tripId: 'TRIP_ONE', stopId: 'LAST_STOP', stopSequence: '2' },
        { tripId: 'TRIP_TWO', stopId: 'LAST_STOP', stopSequence: '2' },
        { tripId: 'TRIP_THREE', stopId: 'LAST_STOP', stopSequence: '2' },
      ],
    }))
    gtfsReactHooksMocks.useGtfsRealtime.mockImplementation(() => ({
      entity: [
        {
          tripUpdate: {
            trip: { tripId: 'TRIP_ONE' },
            stopTimeUpdate: [
              {
                stopId: 'MY_STOP',
                scheduleRelationship: ScheduleRelationship.SCHEDULED,
                departure: { time: currentUnixTime + (60 * 5) }
              }
            ]
          }
        },
        {
          tripUpdate: {
            trip: { tripId: 'TRIP_TWO' },
            stopTimeUpdate: [
              {
                stopId: 'MY_STOP',
                scheduleRelationship: ScheduleRelationship.SCHEDULED,
                arrival: { time: currentUnixTime + (60 * 7) },
                departure: { time: currentUnixTime + (60 * 6) },
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
                scheduleRelationship: ScheduleRelationship.SCHEDULED,
                arrival: { time: currentUnixTime + (60 * 8) },
              }
            ]
          }
        },
      ]
    }))

    configureApp({ stopIds: 'MY_STOP' })
    await page.render(<App />)

    const stop = locateStop('My stop')
    await expect.element(stop).toBeVisible()
    await expect.element(locateDeparture(stop, 'MR', 'Trip one', '12:05 pm')).toBeVisible()
    await expect.element(locateDeparture(stop, 'MR', 'Trip two', '12:06 pm')).toBeVisible()
    await expect.element(locateDeparture(stop, 'MR', 'Trip three', '12:08 pm')).toBeVisible()
  })

  it('sorts departures by time', async () => {
    // TODO: Implement.
  })

  it('alternates between absolute and relative time', async () => {
    gtfsReactHooksMocks.useGtfsSchedule.mockImplementation(() => ({
      routes: [{ routeId: 'MY_ROUTE', routeShortName: 'MR', routeColor: '111111' }],
      trips: [{ tripId: 'MY_TRIP', routeId: 'MY_ROUTE', shapeId: 'MY_SHAPE', tripHeadsign: 'My trip' }],
      stops: [{ stopId: 'MY_STOP', stopName: 'My stop' }],
      stopTimes: [{ tripId: 'MY_TRIP', stopId: 'LAST_STOP', stopSequence: '2' }],
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
    await page.render(<App />)

    const stop = locateStop('My stop')
    await expect.element(stop).toBeVisible()
    await expect.element(locateDeparture(stop, 'MR', 'My trip', '12:05 pm')).toBeVisible()
    await vi.advanceTimersByTime(5000)
    await expect.element(locateDeparture(stop, 'MR', 'My trip', '5 minutes')).toBeVisible()
    await vi.advanceTimersByTime(5000)
    await expect.element(locateDeparture(stop, 'MR', 'My trip', '12:05 pm')).toBeVisible()
  })

  it('uses route colors for each departure', async () => {
    // TODO: Implement.
  })

  it('handles resize events without error', async () => {
    gtfsReactHooksMocks.useGtfsSchedule.mockImplementation(() => ({
      routes: [{ routeId: 'MY_ROUTE', routeShortName: 'MR', routeColor: '111111' }],
      trips: [{ tripId: 'MY_TRIP', routeId: 'MY_ROUTE', shapeId: 'MY_SHAPE', tripHeadsign: 'My trip' }],
      stops: [
        { stopId: 'STOP_ONE', stopName: 'Stop one' },
        { stopId: 'STOP_TWO', stopName: 'Stop two' },
      ],
      stopTimes: [{ tripId: 'MY_TRIP', stopId: 'LAST_STOP', stopSequence: '2' }],
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
            ]
          }
        },
      ]
    }))

    configureApp({ stopIds: 'STOP_ONE,STOP_TWO' })
    await page.render(<App />)

    const stopOne = locateStop('Stop one')
    const stopTwo = locateStop('Stop two')

    await page.viewport(1280, 720)
    await expect.element(stopOne).toBeVisible()
    await expect.element(locateDeparture(stopOne, 'MR', 'My trip', '12:05 pm')).toBeVisible()
    await expect.element(stopTwo).toBeVisible()
    await expect.element(locateDeparture(stopTwo, 'MR', 'My trip', '12:10 pm')).toBeVisible()

    await page.viewport(720, 1280)
    await expect.element(stopOne).toBeVisible()
    await expect.element(locateDeparture(stopOne, 'MR', 'My trip', '12:05 pm')).toBeVisible()
    await expect.element(stopTwo).toBeVisible()
    await expect.element(locateDeparture(stopTwo, 'MR', 'My trip', '12:10 pm')).toBeVisible()
  })
})
