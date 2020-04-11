"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web3_1 = require("web3");
class Blocks {
    constructor(provider) {
        this.eth = new web3_1.default(provider).eth;
        this.checkedBlocks = {};
        this.savedBlocks = {};
        this.maxRequests = 0;
        this.requests = 0;
    }
    async fillBlockTime() {
        const first = await this.getBlockWrapper(1);
        const latest = await this.getBlockWrapper('latest');
        this.blockTime =
            (latest.timestamp - first.timestamp) / Number(latest.number) - 1;
        this.firstTimestamp = first.timestamp;
    }
    async getDate(date, after = true, maxRequest = 50) {
        this.maxRequests = maxRequest;
        this.requests = 0;
        try {
            const now = Date.now();
            const dateAsNumber = Number(date);
            const dateAsDate = Date.parse(date);
            let normalizedDate;
            if (!isNaN(dateAsNumber)) {
                // timestamp
                normalizedDate = dateAsNumber;
            }
            else if (!isNaN(dateAsDate)) {
                // date
                normalizedDate = dateAsDate / 1000;
            }
            if (typeof this.firstTimestamp === 'undefined' ||
                typeof this.blockTime === 'undefined') {
                await this.fillBlockTime();
            }
            if (date === 'first' || (normalizedDate && normalizedDate < this.firstTimestamp)) {
                return {
                    block: 1,
                    timestamp: this.firstTimestamp
                };
            }
            if (date === 'latest' ||
                (normalizedDate && (normalizedDate >= now ||
                    normalizedDate > this.savedBlocks['latest'].timestamp))) {
                return {
                    block: await this.eth.getBlockNumber(),
                    timestamp: this.savedBlocks['latest'].timestamp
                };
            }
            if (!normalizedDate) {
                return null;
            }
            this.checkedBlocks[normalizedDate] = [];
            let predictedBlock = await this.getBlockWrapper(Math.ceil((normalizedDate - this.firstTimestamp / this.blockTime)));
            const block = await this.findBetter(normalizedDate, predictedBlock, after);
            return {
                timestamp: normalizedDate,
                block
            };
        }
        catch (e) {
            throw e;
        }
    }
    async findBetter(date, predictedBlock, after, blockTime = this.blockTime) {
        if (await this.isBetterBlock(date, predictedBlock, after)) {
            return predictedBlock.number;
        }
        if (this.requests >= this.maxRequests) {
            throw new Error('Max requests limit reached');
        }
        const difference = date - predictedBlock.timestamp;
        let skip = Math.ceil(difference / blockTime);
        if (skip === 0) {
            skip = difference < 0 ? -1 : 1;
        }
        const nextPredictedBlock = await this.getBlockWrapper(this.getNextBlock(date, predictedBlock.number, skip));
        blockTime = Math.abs((predictedBlock.timestamp - nextPredictedBlock.timestamp) /
            (predictedBlock.number - nextPredictedBlock.number));
        return this.findBetter(date, nextPredictedBlock, after, blockTime);
    }
    async isBetterBlock(date, predictedBlock, after) {
        const blockTime = predictedBlock.timestamp;
        if (after) {
            if (blockTime < date) {
                return false;
            }
            let previousBlock = await this.getBlockWrapper(predictedBlock.number - 1);
            if (blockTime >= date && previousBlock.timestamp < date) {
                return true;
            }
        }
        else {
            if (blockTime >= date) {
                return false;
            }
            let nextBlock = await this.getBlockWrapper(predictedBlock.number + 1);
            if (blockTime < date && nextBlock.timestamp >= date) {
                return true;
            }
        }
        return false;
    }
    getNextBlock(date, currentBlock, skip) {
        let nextBlock = currentBlock + skip;
        if (this.checkedBlocks[date].includes(nextBlock)) {
            do {
                nextBlock = nextBlock + skip;
            } while (this.checkedBlocks[date].includes(nextBlock));
            return this.getNextBlock(date, nextBlock - skip, skip);
        }
        this.checkedBlocks[date].push(nextBlock);
        return nextBlock;
    }
    async getBlockWrapper(block) {
        if (this.savedBlocks[block.toString()]) {
            return this.savedBlocks[block];
        }
        if (typeof block === 'number' &&
            this.savedBlocks['1'] &&
            this.savedBlocks['1'].number >= block) {
            return this.savedBlocks['1'];
        }
        if (typeof block === 'number' &&
            this.savedBlocks['latest'] &&
            this.savedBlocks['latest'].number <= block) {
            return this.savedBlocks['latest'];
        }
        let { timestamp } = await this.eth.getBlock(block);
        this.savedBlocks[block.toString()] = {
            number: block === 'latest' ? await this.eth.getBlockNumber() : Number(block),
            timestamp: Number(timestamp)
        };
        this.requests++;
        return this.savedBlocks[block.toString()];
    }
}
exports.default = Blocks;
//# sourceMappingURL=blocks.js.map