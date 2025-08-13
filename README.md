# Departure Board

TODO: Describe.

## Usage

You can provide the desired stop IDs to display either with the `stopIds` query parameter in the url...
```
localhost:5173/?stopIds=64,117
```
...or by setting the `VITE_STOP_IDS` environment variable when running the development server.
```sh
VITE_STOP_IDS=64,117 npm run dev
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
