import { provider } from 'web3-core';
import { Eth } from 'web3-eth';
export declare type SavedBlock = {
    number: number;
    timestamp: number;
};
export declare type BlockResponse = {
    block: number;
    timestamp: number;
};
export default class Blocks {
    eth: Eth;
    checkedBlocks: {
        [key: string]: number[];
    };
    savedBlocks: {
        [key: string]: SavedBlock;
    };
    blockTime?: number;
    firstTimestamp?: number;
    maxRequests: number;
    requests: number;
    constructor(provider: provider);
    fillBlockTime(): Promise<void>;
    getDate(date: string, after?: boolean, maxRequest?: number): Promise<BlockResponse | null>;
    findBetter(date: number, predictedBlock: SavedBlock, after: boolean, blockTime?: number): Promise<number>;
    isBetterBlock(date: number, predictedBlock: SavedBlock, after: boolean): Promise<boolean>;
    getNextBlock(date: number, currentBlock: number, skip: number): number;
    getBlockWrapper(block: number | string): Promise<SavedBlock>;
}
