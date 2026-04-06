import GtfsRealtimeBindings from 'gtfs-realtime-bindings'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import 'vitest-browser-react'
import App from '../src/App.jsx'

const ScheduleRelationship = GtfsRealtimeBindings.transit_realtime.TripUpdate.StopTimeUpdate.ScheduleRelationship

const gtfsReactHooksMocks = vi.hoisted(() => ({
  useGtfsSchedule: vi.fn((data) => data),
  useGtfsRealtime: vi.fn((data) => data),
  useFetchResolver: vi.fn((resolver) => undefined),
}))

vi.mock('gtfs-react-hooks', () => ({
  useGtfsSchedule: gtfsReactHooksMocks.useGtfsSchedule,
  useGtfsRealtime: gtfsReactHooksMocks.useGtfsRealtime,
  useFetchResolver: gtfsReactHooksMocks.useFetchResolver,
}))

function mockGtfs ({ schedule, tripUpdates, alerts }) {
  gtfsReactHooksMocks.useFetchResolver.mockImplementation((resolver) => {
    if (resolver === 'schedule') {
      return schedule
    } else if (resolver === 'trip-updates') {
      return tripUpdates
    } else if (resolver === 'alerts') {
      return alerts
    }
  })
}

function clearSearchParams () {
  history.replaceState({}, '', location.pathname)
}

function setSearchParams (options) {
  const url = new URL(location)
  const search = new URLSearchParams(url.search)
  Object.entries(options).forEach(([key, val]) => { search.set(key, val) })
  url.search = search
  history.pushState({}, '', url)
}

function locateStop (name) {
  return page.getByRole('article').filter({ has: page.getByRole('heading', { name }) })
}

function locateDeparture (parent, ...texts) {
  return texts.reduce((locator, text) => locator.filter({ hasText: text }), parent.getByRole('listitem'))
}

function locateAlert (...texts) {
  return texts.reduce((locator, text) => locator.filter({ hasText: text }), page.getByRole('alert'))
}

describe('App', () => {
  const currentUnixTime = 43200 // 12 pm

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(currentUnixTime * 1000))
    setSearchParams({
      gtfsScheduleUrl: 'schedule',
      gtfsRealtimeTripUpdatesUrl: 'trip-updates',
      gtfsRealtimeAlertsUrl: 'alerts'
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.resetAllMocks()
    clearSearchParams()
  })

  it('renders nothing when no stop has been configured', async () => {
    await page.render(<App />)
    await expect.element(page.getByRole('article')).not.toBeInTheDocument()
  })

  it('renders nothing when no data has been fetched', async () => {
    setSearchParams({ stopIds: 'MY_STOP' })
    await page.render(<App />)
    await expect.element(page.getByRole('article')).not.toBeInTheDocument()
  })

  it('renders departures when data has been fetched', async () => {
    mockGtfs({
      schedule: {
        routes: [{ routeId: 'MY_ROUTE', routeShortName: 'MR', routeColor: '111111' }],
        trips: [{ tripId: 'MY_TRIP', routeId: 'MY_ROUTE', tripHeadsign: 'My trip' }],
        stops: [{ stopId: 'MY_STOP', stopName: 'My stop' }],
        stopTimes: [{ tripId: 'MY_TRIP', stopId: 'LAST_STOP', stopSequence: '2' }]
      },
      tripUpdates: {
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
      },
      alerts: { entity: [] },
    })

    setSearchParams({ stopIds: 'MY_STOP' })
    await page.render(<App />)

    const stop = locateStop('My stop')
    await expect.element(stop).toBeVisible()
    await expect.element(locateDeparture(stop, 'MR', 'My trip', '12:05 pm')).toBeVisible()
  })

  it('only renders departures for configured stops', async () => {
    mockGtfs({
      schedule: {
        routes: [{ routeId: 'MY_ROUTE', routeShortName: 'MR', routeColor: '111111' }],
        trips: [{ tripId: 'MY_TRIP', routeId: 'MY_ROUTE', tripHeadsign: 'My trip' }],
        stops: [
          { stopId: 'STOP_ONE', stopName: 'Stop one' },
          { stopId: 'STOP_TWO', stopName: 'Stop two' },
          { stopId: 'STOP_THREE', stopName: 'Stop three' },
        ],
        stopTimes: [{ tripId: 'MY_TRIP', stopId: 'LAST_STOP', stopSequence: '4' }]
      },
      tripUpdates: {
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
      },
      alerts: { entity: [] },
    })

    setSearchParams({ stopIds: 'STOP_TWO,STOP_THREE' })
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

  it('only renders departures for configured routes when provided', async () => {
    mockGtfs({
      schedule: {
        routes: [
          { routeId: 'ROUTE_ONE', routeShortName: 'R1', routeColor: '111111' },
          { routeId: 'ROUTE_TWO', routeShortName: 'R2', routeColor: '111111' },
          { routeId: 'ROUTE_THREE', routeShortName: 'R3', routeColor: '111111' },
        ],
        trips: [
          { tripId: 'TRIP_ONE', routeId: 'ROUTE_ONE', tripHeadsign: 'Trip one' },
          { tripId: 'TRIP_TWO', routeId: 'ROUTE_TWO', tripHeadsign: 'Trip two' },
          { tripId: 'TRIP_THREE', routeId: 'ROUTE_THREE', tripHeadsign: 'Trip three' },
        ],
        stops: [{ stopId: 'MY_STOP', stopName: 'My stop' }],
        stopTimes: [
          { tripId: 'TRIP_ONE', stopId: 'LAST_STOP', stopSequence: '4' },
          { tripId: 'TRIP_TWO', stopId: 'LAST_STOP', stopSequence: '4' },
          { tripId: 'TRIP_THREE', stopId: 'LAST_STOP', stopSequence: '4' },
        ]
      },
      tripUpdates: {
        entity: [
          {
            tripUpdate: {
              trip: { tripId: 'TRIP_ONE' },
              stopTimeUpdate: [
                {
                  stopId: 'MY_STOP',
                  scheduleRelationship: ScheduleRelationship.SCHEDULED,
                  departure: { time: currentUnixTime + (60 * 5) }
                },
              ],
            },
          },
          {
            tripUpdate: {
              trip: { tripId: 'TRIP_TWO' },
              stopTimeUpdate: [
                {
                  stopId: 'MY_STOP',
                  scheduleRelationship: ScheduleRelationship.SCHEDULED,
                  departure: { time: currentUnixTime + (60 * 10) }
                },
              ],
            },
          },
          {
            tripUpdate: {
              trip: { tripId: 'TRIP_THREE' },
              stopTimeUpdate: [
                {
                  stopId: 'MY_STOP',
                  scheduleRelationship: ScheduleRelationship.SCHEDULED,
                  departure: { time: currentUnixTime + (60 * 15) }
                },
              ],
            },
          },
        ]
      },
      alerts: { entity: [] },
    })

    setSearchParams({ stopIds: 'MY_STOP', routeIds: 'ROUTE_TWO,ROUTE_THREE' })
    await page.render(<App />)

    const stop = locateStop('My stop')
    await expect.element(stop).toBeVisible()
    await expect.element(locateDeparture(page, 'R1', 'Trip one', '12:05 pm')).not.toBeInTheDocument()
    await expect.element(locateDeparture(stop, 'R2', 'Trip two', '12:10 pm')).toBeVisible()
    await expect.element(locateDeparture(stop, 'R3', 'Trip three', '12:15 pm')).toBeVisible()
  })

  it('only renders scheduled departures', async () => {
    mockGtfs({
      schedule: {
        routes: [{ routeId: 'MY_ROUTE', routeShortName: 'MR', routeColor: '111111' }],
        trips: [{ tripId: 'MY_TRIP', routeId: 'MY_ROUTE', tripHeadsign: 'My trip' }],
        stops: [
          { stopId: 'STOP_ONE', stopName: 'Stop one' },
          { stopId: 'STOP_TWO', stopName: 'Stop two' },
        ],
        stopTimes: [{ tripId: 'MY_TRIP', stopId: 'LAST_STOP', stopSequence: '3' }],
      },
      tripUpdates: {
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
      },
      alerts: { entity: [] },
    })

    setSearchParams({ stopIds: 'STOP_ONE,STOP_TWO' })
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
    mockGtfs({
      schedule: {
        routes: [{ routeId: 'MY_ROUTE', routeShortName: 'MR', routeColor: '111111' }],
        trips: [{ tripId: 'MY_TRIP', routeId: 'MY_ROUTE', tripHeadsign: 'My trip' }],
        stops: [
          { stopId: 'STOP_ONE', stopName: 'Stop one' },
          { stopId: 'STOP_TWO', stopName: 'Stop two' },
        ],
        stopTimes: [{ tripId: 'MY_TRIP', stopId: 'LAST_STOP', stopSequence: '3' }],
      },
      tripUpdates: {
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
      },
      alerts: { entity: [] },
    })

    setSearchParams({ stopIds: 'STOP_ONE,STOP_TWO' })
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

  it('only renders the earliest departures for any given route and headsign', async () => {
    mockGtfs({
      schedule: {
        routes: [{ routeId: 'MY_ROUTE', routeShortName: 'MR', routeColor: '111111' }],
        trips: [
          { tripId: 'TRIP_ONE', routeId: 'MY_ROUTE', tripHeadsign: 'Trip one' },
          { tripId: 'TRIP_TWO', routeId: 'MY_ROUTE', tripHeadsign: 'Trip two' }
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
      },
      tripUpdates: {
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
      },
      alerts: { entity: [] },
    })

    setSearchParams({ stopIds: 'STOP_ONE,STOP_TWO' })
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

  it('does not render the last stop in each trip', async () => {
    mockGtfs({
      schedule: {
        routes: [{ routeId: 'MY_ROUTE', routeShortName: 'MR', routeColor: '111111' }],
        trips: [
          { tripId: 'TRIP_ONE', routeId: 'MY_ROUTE', tripHeadsign: 'Trip one' },
          { tripId: 'TRIP_TWO', routeId: 'MY_ROUTE', tripHeadsign: 'Trip two' },
        ],
        stops: [
          { stopId: 'STOP_ONE', stopName: 'Stop one' },
          { stopId: 'STOP_TWO', stopName: 'Stop two' },
          { stopId: 'STOP_THREE', stopName: 'Stop three' },
        ],
        stopTimes: [
          { tripId: 'TRIP_ONE', stopId: 'STOP_ONE', stopSequence: '1' },
          { tripId: 'TRIP_ONE', stopId: 'STOP_TWO', stopSequence: '2' },
          { tripId: 'TRIP_TWO', stopId: 'STOP_ONE', stopSequence: '1' },
          { tripId: 'TRIP_TWO', stopId: 'STOP_TWO', stopSequence: '2' },
          { tripId: 'TRIP_TWO', stopId: 'STOP_THREE', stopSequence: '3' },
        ],
      },
      tripUpdates: {
        entity: [
          {
            tripUpdate: {
              trip: { tripId: 'TRIP_ONE' },
              stopTimeUpdate: [
                {
                  stopId: 'STOP_ONE',
                  scheduleRelationship: ScheduleRelationship.SCHEDULED,
                  departure: { time: currentUnixTime + (60 * 4) }
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
                  departure: { time: currentUnixTime + (60 * 4) }
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
      },
      alerts: { entity: [] },
    })

    setSearchParams({ stopIds: 'STOP_ONE,STOP_TWO' })
    await page.render(<App />)

    const stopOne = locateStop('Stop one')
    await expect.element(stopOne).toBeVisible()
    await expect.element(locateDeparture(stopOne, 'MR', 'Trip one', '12:04 pm')).toBeVisible()
    await expect.element(locateDeparture(stopOne, 'MR', 'Trip two', '12:04 pm')).toBeVisible()

    const stopTwo = locateStop('Stop two')
    await expect.element(stopTwo).toBeVisible()
    await expect.element(locateDeparture(stopTwo, 'MR', 'Trip one', '12:08 pm')).not.toBeInTheDocument()
    await expect.element(locateDeparture(stopTwo, 'MR', 'Trip two', '12:08 pm')).toBeVisible()
  })

  it('gracefully ignores incomplete data', async () => {
    mockGtfs({
      schedule: {
        routes: [{ routeId: 'MY_ROUTE', routeShortName: 'MR', routeColor: '111111' }],
        trips: [
          { tripId: 'MY_TRIP', routeId: 'MY_ROUTE', tripHeadsign: 'My trip' },
          { tripId: 'NO_ROUTE_TRIP', routeId: 'NO_ROUTE', tripHeadsign: 'No route trip' },
          { tripId: 'DUPLICATE_TRIP', routeId: 'MY_ROUTE', tripHeadsign: 'Duplicate trip' },
          { tripId: 'DUPLICATE_TRIP', routeId: 'MY_ROUTE', tripHeadsign: 'Duplicate trip' },
        ],
        stops: [{ stopId: 'MY_STOP', stopName: 'My stop' }],
        stopTimes: [],
      },
      tripUpdates: {
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
      },
      alerts: { entity: [] },
    })

    setSearchParams({ stopIds: 'MY_STOP,NO_STOP' })
    await page.render(<App />)

    await expect.element(locateStop('My stop')).toBeVisible()
    await expect.element(locateDeparture(page, '12:05 pm')).not.toBeInTheDocument()
  })

  it('prefers departure times but falls back to arrival times', async () => {
    mockGtfs({
      schedule: {
        routes: [{ routeId: 'MY_ROUTE', routeShortName: 'MR', routeColor: '111111' }],
        trips: [
          { tripId: 'TRIP_ONE', routeId: 'MY_ROUTE', tripHeadsign: 'Trip one' },
          { tripId: 'TRIP_TWO', routeId: 'MY_ROUTE', tripHeadsign: 'Trip two' },
          { tripId: 'TRIP_THREE', routeId: 'MY_ROUTE', tripHeadsign: 'Trip three' }
        ],
        stops: [{ stopId: 'MY_STOP', stopName: 'My stop' }],
        stopTimes: [
          { tripId: 'TRIP_ONE', stopId: 'LAST_STOP', stopSequence: '2' },
          { tripId: 'TRIP_TWO', stopId: 'LAST_STOP', stopSequence: '2' },
          { tripId: 'TRIP_THREE', stopId: 'LAST_STOP', stopSequence: '2' },
        ],
      },
      tripUpdates: {
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
      },
      alerts: { entity: [] },
    })

    setSearchParams({ stopIds: 'MY_STOP' })
    await page.render(<App />)

    const stop = locateStop('My stop')
    await expect.element(stop).toBeVisible()
    await expect.element(locateDeparture(stop, 'MR', 'Trip one', '12:05 pm')).toBeVisible()
    await expect.element(locateDeparture(stop, 'MR', 'Trip two', '12:06 pm')).toBeVisible()
    await expect.element(locateDeparture(stop, 'MR', 'Trip three', '12:08 pm')).toBeVisible()
  })

  it('alternates between absolute and relative time', async () => {
    mockGtfs({
      schedule: {
        routes: [{ routeId: 'MY_ROUTE', routeShortName: 'MR', routeColor: '111111' }],
        trips: [{ tripId: 'MY_TRIP', routeId: 'MY_ROUTE', tripHeadsign: 'My trip' }],
        stops: [{ stopId: 'MY_STOP', stopName: 'My stop' }],
        stopTimes: [{ tripId: 'MY_TRIP', stopId: 'LAST_STOP', stopSequence: '2' }],
      },
      tripUpdates: {
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
      },
      alerts: { entity: [] },
    })

    setSearchParams({ stopIds: 'MY_STOP' })
    await page.render(<App />)

    const stop = locateStop('My stop')
    await expect.element(stop).toBeVisible()
    await expect.element(locateDeparture(stop, 'MR', 'My trip', '12:05 pm')).toBeVisible()
    await vi.advanceTimersByTime(5000)
    await expect.element(locateDeparture(stop, 'MR', 'My trip', '5 minutes')).toBeVisible()
    await vi.advanceTimersByTime(5000)
    await expect.element(locateDeparture(stop, 'MR', 'My trip', '12:05 pm')).toBeVisible()
  })

  it('handles resize events without error', async () => {
    mockGtfs({
      schedule: {
        routes: [{ routeId: 'MY_ROUTE', routeShortName: 'MR', routeColor: '111111' }],
        trips: [{ tripId: 'MY_TRIP', routeId: 'MY_ROUTE', tripHeadsign: 'My trip' }],
        stops: [
          { stopId: 'STOP_ONE', stopName: 'Stop one' },
          { stopId: 'STOP_TWO', stopName: 'Stop two' },
        ],
        stopTimes: [{ tripId: 'MY_TRIP', stopId: 'LAST_STOP', stopSequence: '2' }],
      },
      tripUpdates: {
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
      },
      alerts: { entity: [] },
    })

    setSearchParams({ stopIds: 'STOP_ONE,STOP_TWO' })
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

  it('renders agency wide alerts', async () => {
    mockGtfs({
      schedule: {
        routes: [{ routeId: 'MY_ROUTE', routeShortName: 'MR', routeColor: '111111' }],
        trips: [{ tripId: 'MY_TRIP', routeId: 'MY_ROUTE', tripHeadsign: 'My trip' }],
        stops: [{ stopId: 'MY_STOP', stopName: 'My stop' }],
        stopTimes: [{ tripId: 'MY_TRIP', stopId: 'MY_STOP', stopSequence: '1' }]
      },
      tripUpdates: { entity: [] },
      alerts: {
        entity: [
          {
            alert: {
              informedEntity: [{ agencyId: 'some-agency' }],
              headerText: { translation: [{ text: 'My header' }] },
              descriptionText: { translation: [{ text: 'My description' }] },
            }
          },
        ]
      },
    })
    setSearchParams({ stopIds: 'MY_STOP' })
    await page.render(<App />)
    await expect.element(locateAlert('My header', 'My description')).toBeVisible()
  })

  it('renders alerts for configured stops', async () => {
    mockGtfs({
      schedule: {
        routes: [
          { routeId: 'MY_ROUTE', routeShortName: 'MR', routeColor: '111111' },
          { routeId: 'OTHER_ROUTE', routeShortName: 'OR', routeColor: '222222' },
        ],
        trips: [{ tripId: 'MY_TRIP', routeId: 'MY_ROUTE', tripHeadsign: 'My trip' }],
        stops: [{ stopId: 'MY_STOP', stopName: 'My stop' }],
        stopTimes: []
      },
      tripUpdates: { entity: [] },
      alerts: {
        entity: [
          {
            alert: {
              informedEntity: [{ stopId: 'MY_STOP', routeId: 'MY_ROUTE' }, { routeId: 'OTHER_ROUTE' }],
              headerText: { translation: [{ text: 'My header' }] },
              descriptionText: { translation: [{ text: 'My description' }] },
            }
          },
        ]
      },
    })
    setSearchParams({ stopIds: 'MY_STOP' })
    await page.render(<App />)
    await expect.element(locateAlert('My header', 'My description', 'MR', 'OR')).toBeVisible()
  })

  it('renders alerts for routes that visit configured stops', async () => {
    mockGtfs({
      schedule: {
        routes: [
          { routeId: 'MY_ROUTE', routeShortName: 'MR', routeColor: '111111' },
          { routeId: 'OTHER_ROUTE', routeShortName: 'OR', routeColor: '222222' },
        ],
        trips: [{ tripId: 'MY_TRIP', routeId: 'MY_ROUTE', tripHeadsign: 'My trip' }],
        stops: [{ stopId: 'MY_STOP', stopName: 'My stop' }],
        stopTimes: [{ tripId: 'MY_TRIP', stopId: 'MY_STOP', stopSequence: '1' }]
      },
      tripUpdates: { entity: [] },
      alerts: {
        entity: [
          {
            alert: {
              informedEntity: [{ routeId: 'MY_ROUTE' }, { routeId: 'OTHER_ROUTE' }],
              headerText: { translation: [{ text: 'My header' }] },
              descriptionText: { translation: [{ text: 'My description' }] },
            }
          },
        ]
      },
    })
    setSearchParams({ stopIds: 'MY_STOP' })
    await page.render(<App />)
    await expect.element(locateAlert('My header', 'My description', 'MR', 'OR')).toBeVisible()
  })

  it('only renders alerts that are currently active', async () => {
    mockGtfs({
      schedule: {
        routes: [{ routeId: 'MY_ROUTE', routeShortName: 'MR', routeColor: '111111' }],
        trips: [{ tripId: 'MY_TRIP', routeId: 'MY_ROUTE', tripHeadsign: 'My trip' }],
        stops: [{ stopId: 'MY_STOP', stopName: 'My stop' }],
        stopTimes: [{ tripId: 'MY_TRIP', stopId: 'MY_STOP', stopSequence: '1' }]
      },
      tripUpdates: { entity: [] },
      alerts: {
        entity: [
          {
            alert: {
              informedEntity: [{ routeId: 'MY_ROUTE' }],
              headerText: { translation: [{ text: 'No active period' }] },
              descriptionText: { translation: [{ text: 'My description' }] },
            },
          },
          {
            alert: {
              activePeriod: [{ start: 0, end: 0 }],
              informedEntity: [{ routeId: 'MY_ROUTE' }],
              headerText: { translation: [{ text: 'Zero active period' }] },
              descriptionText: { translation: [{ text: 'My description' }] },
            },
          },
          {
            alert: {
              activePeriod: [{ start: currentUnixTime - 1000, end: currentUnixTime + 1000 }],
              informedEntity: [{ routeId: 'MY_ROUTE' }],
              headerText: { translation: [{ text: 'Covered active period' }] },
              descriptionText: { translation: [{ text: 'My description' }] },
            },
          },
          {
            alert: {
              activePeriod: [{ start: 0, end: currentUnixTime - 1000 }],
              informedEntity: [{ routeId: 'MY_ROUTE' }],
              headerText: { translation: [{ text: 'Past' }] },
              descriptionText: { translation: [{ text: 'My description' }] },
            },
          },
          {
            alert: {
              activePeriod: [{ start: currentUnixTime + 1000, end: 0 }],
              informedEntity: [{ routeId: 'MY_ROUTE' }],
              headerText: { translation: [{ text: 'Future' }] },
              descriptionText: { translation: [{ text: 'My description' }] },
            },
          },
        ]
      },
    })
    setSearchParams({ stopIds: 'MY_STOP' })
    await page.render(<App />)
    await expect.element(locateAlert('No active period', '1/3')).toBeVisible()
    await vi.advanceTimersByTime(20000)
    await expect.element(locateAlert('Zero active period', '2/3')).toBeVisible()
    await vi.advanceTimersByTime(20000)
    await expect.element(locateAlert('Covered active period', '3/3')).toBeVisible()
    await vi.advanceTimersByTime(20000)
  })

  it('only renders alerts for configured routes when provided', async () => {
    mockGtfs({
      schedule: {
        routes: [
          { routeId: 'MY_ROUTE', routeShortName: 'MR', routeColor: '111111' },
          { routeId: 'OTHER_ROUTE', routeShortName: 'OR', routeColor: '222222' },
        ],
        trips: [
          { tripId: 'MY_TRIP', routeId: 'MY_ROUTE', tripHeadsign: 'My trip' },
          { tripId: 'OTHER_TRIP', routeId: 'OTHER_ROUTE', tripHeadsign: 'Other trip' },
        ],
        stops: [{ stopId: 'MY_STOP', stopName: 'My stop' }],
        stopTimes: [
          { tripId: 'MY_TRIP', stopId: 'MY_STOP', stopSequence: '1' },
          { tripId: 'OTHER_TRIP', stopId: 'MY_STOP', stopSequence: '1' },
        ]
      },
      tripUpdates: { entity: [] },
      alerts: {
        entity: [
          {
            alert: {
              informedEntity: [{ routeId: 'MY_ROUTE' }],
              headerText: { translation: [{ text: 'My header' }] },
              descriptionText: { translation: [{ text: 'My description' }] },
            }
          },
          {
            alert: {
              informedEntity: [{ routeId: 'OTHER_ROUTE' }],
              headerText: { translation: [{ text: 'Other header' }] },
              descriptionText: { translation: [{ text: 'Other description' }] },
            }
          },
        ]
      },
    })
    setSearchParams({ stopIds: 'MY_STOP', routeIds: 'MY_ROUTE' })
    await page.render(<App />)
    await expect.element(locateAlert('My header', 'My description', 'MR')).toBeVisible()
    await expect.element(locateAlert('OR')).not.toBeInTheDocument()
  })

  it('sorts departures by route sort order and headsign', async () => {
    mockGtfs({
      schedule: {
        routes: [
          { routeId: 'SECOND_ROUTE', routeShortName: 'SR', routeColor: '111111', routeSortOrder: 2 },
          { routeId: 'FIRST_ROUTE', routeShortName: 'FR', routeColor: '111111', routeSortOrder: 1 },
        ],
        trips: [
          { tripId: 'THIRD_TRIP', routeId: 'SECOND_ROUTE', tripHeadsign: 'AAA' },
          { tripId: 'SECOND_TRIP', routeId: 'FIRST_ROUTE', tripHeadsign: 'BBB' },
          { tripId: 'FIRST_TRIP', routeId: 'FIRST_ROUTE', tripHeadsign: 'AAA' },
        ],
        stops: [{ stopId: 'MY_STOP', stopName: 'My stop' }],
        stopTimes: [
          { tripId: 'THIRD_TRIP', stopId: 'LAST_STOP', stopSequence: '2' },
          { tripId: 'SECOND_TRIP', stopId: 'LAST_STOP', stopSequence: '2' },
          { tripId: 'FIRST_TRIP', stopId: 'LAST_STOP', stopSequence: '2' },
        ]
      },
      tripUpdates: {
        entity: [
          {
            tripUpdate: {
              trip: { tripId: 'THIRD_TRIP' },
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
              trip: { tripId: 'SECOND_TRIP' },
              stopTimeUpdate: [
                {
                  stopId: 'MY_STOP',
                  scheduleRelationship: ScheduleRelationship.SCHEDULED,
                  departure: { time: currentUnixTime + (60 * 10) }
                }
              ]
            }
          },
          {
            tripUpdate: {
              trip: { tripId: 'FIRST_TRIP' },
              stopTimeUpdate: [
                {
                  stopId: 'MY_STOP',
                  scheduleRelationship: ScheduleRelationship.SCHEDULED,
                  departure: { time: currentUnixTime + (60 * 15) }
                }
              ]
            }
          },
        ]
      },
      alerts: { entity: [] },
    })

    setSearchParams({ stopIds: 'MY_STOP' })
    await page.render(<App />)

    const firstDeparture = await locateDeparture(page, 'FR', 'AAA').element()
    const secondDeparture = await locateDeparture(page, 'FR', 'BBB').element()
    const thirdDeparture = await locateDeparture(page, 'SR', 'AAA').element()

    expect(firstDeparture).toBeVisible()
    expect(secondDeparture).toBeVisible()
    expect(thirdDeparture).toBeVisible()
    expect(firstDeparture.compareDocumentPosition(secondDeparture) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(secondDeparture.compareDocumentPosition(thirdDeparture) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
