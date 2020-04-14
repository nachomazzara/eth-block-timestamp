import Web3 from 'web3'
import { provider } from 'web3-core'

import { Eth } from 'web3-eth'

export type SavedBlock = {
  number: number
  timestamp: number
}

export type BlockResponse = {
  block: number
  timestamp: number
}

export default class Blocks {
  eth: Eth
  checkedBlocks: { [key: string]: number[] }
  savedBlocks: { [key: string]: SavedBlock }
  blockTime?: number
  firstTimestamp?: number
  maxRequests: number
  requests: number

  constructor(provider: provider) {
    this.eth = new Web3(provider).eth
    this.checkedBlocks = {}
    this.savedBlocks = {}
    this.maxRequests = 0
    this.requests = 0
  }

  async fillBlockTime() {
    const first = await this.getBlockWrapper(1)
    const latest = await this.getBlockWrapper('latest')

    this.blockTime =
      (latest.timestamp - first.timestamp) / Number(latest.number) - 1

    this.firstTimestamp = first.timestamp
  }

  async getDate(date: string, after: boolean = true, maxRequest: number = 50): Promise<BlockResponse | null> {
    this.maxRequests = maxRequest
    this.requests = 0

    try {
      const now = Date.now()
      const dateAsNumber = Number(date)
      const dateAsDate = Date.parse(date)

      let normalizedDate

      if (!isNaN(dateAsNumber)) {
        // timestamp
        normalizedDate = dateAsNumber
      } else if (!isNaN(dateAsDate)) {
        // date
        normalizedDate = dateAsDate / 1000
      }


      if (
        typeof this.firstTimestamp === 'undefined' ||
        typeof this.blockTime === 'undefined'
      ) {
        await this.fillBlockTime()
      }

      if (date === 'first' || (normalizedDate && normalizedDate < this.firstTimestamp!)) {
        return {
          block: 1,
          timestamp: this.firstTimestamp!
        }
      }

      if (
        date === 'latest' ||
        (normalizedDate && (normalizedDate >= now ||
          normalizedDate > this.savedBlocks['latest'].timestamp))
      ) {
        return {
          block: await this.eth.getBlockNumber(),
          timestamp: this.savedBlocks['latest'].timestamp
        }
      }

      if (!normalizedDate) {
        return null
      }

      this.checkedBlocks[normalizedDate] = []

      let predictedBlock = await this.getBlockWrapper(
        Math.ceil((normalizedDate - this.firstTimestamp! / this.blockTime!))
      )

      const block = await this.findBetter(normalizedDate, predictedBlock, after)

      return {
        timestamp: normalizedDate,
        block
      }
    } catch (e) {
      throw e
    }
  }

  async findBetter(
    date: number,
    predictedBlock: SavedBlock,
    after: boolean,
    blockTime: number = this.blockTime!
  ): Promise<number> {
    if (await this.isBetterBlock(date, predictedBlock, after)) {
      return predictedBlock.number
    }

    if (this.requests >= this.maxRequests) {
      throw new Error('Max requests limit reached')
    }

    const difference = date - predictedBlock.timestamp
    let skip = Math.ceil(difference / blockTime)

    if (skip === 0) {
      skip = difference < 0 ? -1 : 1
    }

    const nextPredictedBlock = await this.getBlockWrapper(
      this.getNextBlock(date, predictedBlock.number, skip)
    )

    blockTime = Math.abs(
      (predictedBlock.timestamp - nextPredictedBlock.timestamp) /
      (predictedBlock.number - nextPredictedBlock.number)
    )

    return this.findBetter(date, nextPredictedBlock, after, blockTime)
  }

  async isBetterBlock(
    date: number,
    predictedBlock: SavedBlock,
    after: boolean
  ) {
    const blockTime = predictedBlock.timestamp

    if (after) {
      if (blockTime < date) {
        return false
      }

      let previousBlock = await this.getBlockWrapper(predictedBlock.number - 1)

      if (blockTime >= date && previousBlock.timestamp < date) {
        return true
      }
    } else {
      if (blockTime >= date) {
        return false
      }

      let nextBlock = await this.getBlockWrapper(predictedBlock.number + 1)
      if (blockTime < date && nextBlock.timestamp >= date) {
        return true
      }
    }

    return false
  }

  getNextBlock(date: number, currentBlock: number, skip: number): number {
    let nextBlock = currentBlock + skip

    if (this.checkedBlocks[date].includes(nextBlock)) {
      do {
        nextBlock = nextBlock + skip
      } while (this.checkedBlocks[date].includes(nextBlock))

      return this.getNextBlock(date, nextBlock - skip, skip)
    }

    this.checkedBlocks[date].push(nextBlock)

    return nextBlock
  }

  async getBlockWrapper(block: number | string): Promise<SavedBlock> {
    if (this.savedBlocks[block.toString()]) {
      return this.savedBlocks[block]
    }

    if (
      typeof block === 'number' &&
      this.savedBlocks['1'] &&
      this.savedBlocks['1'].number >= block
    ) {
      return this.savedBlocks['1']
    }

    if (
      typeof block === 'number' &&
      this.savedBlocks['latest'] &&
      this.savedBlocks['latest'].number <= block
    ) {
      return this.savedBlocks['latest']
    }

    let { timestamp } = await this.eth.getBlock(block)

    this.savedBlocks[block.toString()] = {
      number:
        block === 'latest' ? await this.eth.getBlockNumber() : Number(block),
      timestamp: Number(timestamp)
    }

    this.requests++

    return this.savedBlocks[block.toString()]
  }
}