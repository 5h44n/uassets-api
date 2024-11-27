# uAssets Trading API

REST API for trading uAssets on chain using UniswapX as the settlement layer

## Development

### Install deps

```bash
npm install
```

### Make db file for SQLite

```bash
mkdir data/ && touch data/database.sqlite
```

### Copy .env file and set values

See Universal Protocol [docs](https://docs.universalassets.xyz/universal-protocol/developers/contract-addresses) for contract addresses

```bash
cp .env.example .env
```

### Start server

```bash
npm run dev
```

See docs @ [localhost:3000/docs](http://localhost:3000/docs/)

## Tests

```bash
npm run test
```

## Spec

### Stack

ExpressJS + SQLite + Swagger (docs)

CI: Pre-commit hooks with Prettier and ESLint via Husky
