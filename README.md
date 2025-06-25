# Departure Board

TODO: Describe.

## Usage

TODO: Describe.

## Development

This application uses [`react`][react] as a framework and is bundled using [`vite`][vite]
through [`node.js`][nodejs] + [`npm`][npm]. It is recommended that you use
[`nodenv`][nodenv] to manage local node installations.

It is entirely clientside and data is fetched remotely from GTFS feeds.

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
