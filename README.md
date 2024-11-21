# Alongside Interview: uAssets Trading API

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

See Universal Protocol [docs](https://docs.universalassets.xyz/universal-protocol/developers/contract-addresses) for contract address

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

### Models

Tenant:

- id
- apiKey
- apiSecret

User:

- id
- tenantId
- walletAddress

Quote:

- id
- userId
- type: "BUY" | "SELL"
- token
- tokenAmount
- pairToken
- pairTokenAmount
- relayerNonce

Order:

- id
- quoteId
- userId
- transactionHash
- status: "PENDING" | "FAILED" | "CONFIRMED"

### API

- See docs @ [localhost:3000/docs](http://localhost:3000/docs/) when app is running
- All endpoints have robust validations and error handling (i.e. check queried User belongs to the Tenant, TokenAmount must be defined for sell Orders)
- Auth is handled with an apiKey and apiSecret in the request header. If valid, the associated Tenant object is put onto the `req` object for use in the endpoints. See `src/middleware/authMiddleware.js`

### Services

- `quoteService` - 99% complete, getting an issue with signerOrProvider being invalid
- `orderService` - Didn't have time to fully implement this, but would call the `ExecutiveDutchOrderReactor.execute()` smart contract function with the serialized order and user signature and then return the transaction hash
