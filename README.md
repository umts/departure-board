# Departure Board

Display stop departures parsed from GTFS and GTFS-Realtime data sources.

## Usage

Visit [https://pvta-departures.admin.umass.edu](https://pvta-departures.admin.umass.edu) and configure your instance
using url search parameters.

### Configuration

Configuration options are passed using url search parameters (query strings) as outlined below.

- `stopIds=1,2,3` (required) a list of stops that you wish to display departures for.
- `routeIds=1,2,3` (optional) a list of routes that you wish to display departures for (defaults to all).
- `gtfsScheduleUrl=https://your-domain.com/path` (optional) a url that serves your agency's gtfs schedule file (defaults
   to the PVTA's).
- `gtfsRealtimeTripUpdatesUrl=https://your-domain.com/path` (optional) a url that serves your agency's gtfs
   realtime trip updates (defaults to the PVTA's).

A fully configured url to display 34/35 departures at the Integrative Learning Center would look like:

```
https://pvta-departures.admin.umass.edu/?stopIds=64&routeIds=34,35
```

## Development

This application uses [`react`][react] as a framework and is bundled using [`vite`][vite]
through [`node.js`][nodejs] + [`npm`][npm]. It is recommended that you use
[`nodenv`][nodenv] to manage local node installations.

It is entirely clientside and data is fetched remotely from GTFS feeds.

Vite will set any environment variables provided in a `.env` or `.env.local` file when launching the development server.
We recommend setting some stops in `.env.local` using `VITE_STOP_IDS` when developing
to monitor your changes (and so you don't have to memorize these stop IDs).
Here are a few interesting PVTA stop IDs to look at:

- `64` - UMass Integrative Learning Center generally always has multiple busses stopping at it
- `116` - Amherst College's stop is an end of the B43
- `1620` - Memorial / Heywood sits right before the R14 branches into several routes with different destinations

### Requirements

- `node.js`/`npm` matching the version in the `.node-version` file (just run `nodenv install` if using nodenv)

### Setup

```sh
npm install # bundle dependencies
```

### Scripts

```sh
npm run build    # builds a production bundle.
npm run dev      # starts a local development server.
npm run lint     # runs the js linter.
npm run lint:css # runs the css linter.
npm run preview  # serves a previously built production bundle.
```

## Contributing

Bug reports and pull requests are welcome on [GitHub][github].

## License

The application is available as open source under the terms of the [MIT License](license).

[github]: https://github.com/umts/departure-board
[license]: https://opensource.org/licenses/MIT
[nodejs]: https://nodejs.org
[nodenv]: https://github.com/nodenv/nodenv
[npm]: https://www.npmjs.com
[react]: https://react.dev
[vite]: https://vitejs.dev
