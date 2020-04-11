# Block by time

> Get a block number by its date

[![NPM version](https://badge.fury.io/js/eth-block-timestamp.svg)](https://npmjs.org/package/eth-block-timestamp@latest)
[![Install Size](https://packagephobia.now.sh/badge?p=eth-block-timestamp@latest)](https://packagephobia.now.sh/result?p=eth-block-timestamp@latest)

## Demo -> https://blockbytime.com

## Install

```bash
npm i eth-block-timestamp
```

### Usage

```typescript
const blocks = new Blocks(
  (window as any).ethereum || 'https://mainnet.infura.io/v3/{API_KEY}'
)

// Get first block info
const { block, timestamp } = await blocks.getDate('first')

// Get latest block info
const { block, timestamp } = await blocks.getDate('latest')

// Get block info at 03/20/2020
const { block, timestamp } = await blocks.getDate('03/20/2020')

// Get block info at 03/20/2020 03:10:00 AM
const { block, timestamp } = await blocks.getDate('03/20/2020 03:10:00 AM')

// Get block info at 1586618608 (Unix Timestamp)
const { block, timestamp } = await blocks.getDate('1586618608')
```
