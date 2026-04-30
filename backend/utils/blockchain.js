const CryptoJS = require('crypto-js');
const BlockModel = require('../models/Block');

class Blockchain {
    constructor() {
        this.initializeChain();
    }

    async initializeChain() {
        const count = await BlockModel.countDocuments();
        if (count === 0) {
            await this.createGenesisBlock();
        }
    }

    calculateHash(index, previousHash, timestamp, data, nonce) {
        return CryptoJS.SHA256(index + previousHash + timestamp + JSON.stringify(data) + nonce).toString();
    }

    async createGenesisBlock() {
        const genesisBlock = new BlockModel({
            index: 0,
            timestamp: new Date(),
            data: { message: "Genesis Block" },
            previousHash: "0",
            hash: this.calculateHash(0, "0", new Date().toISOString(), { message: "Genesis Block" }, 0),
            nonce: 0
        });
        await genesisBlock.save();
    }

    async getLatestBlock() {
        return await BlockModel.findOne().sort({ index: -1 });
    }

    async addBlock(data) {
        let previousBlock = await this.getLatestBlock();
        if (!previousBlock) {
            await this.createGenesisBlock();
            previousBlock = await this.getLatestBlock();
        }
        const newIndex = previousBlock.index + 1;
        const timestamp = new Date();
        const previousHash = previousBlock.hash;

        let nonce = 0;
        let hash = this.calculateHash(newIndex, previousHash, timestamp.toISOString(), data, nonce);

        // Simple Proof of Work (difficulty 2)
        const difficulty = 2;
        while (hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            nonce++;
            hash = this.calculateHash(newIndex, previousHash, timestamp.toISOString(), data, nonce);
        }

        const newBlock = new BlockModel({
            index: newIndex,
            timestamp: timestamp,
            data: data,
            previousHash: previousHash,
            hash: hash,
            nonce: nonce
        });

        await newBlock.save();
        return newBlock;
    }

    async isChainValid() {
        const blocks = await BlockModel.find().sort({ index: 1 });
        for (let i = 1; i < blocks.length; i++) {
            const currentBlock = blocks[i];
            const previousBlock = blocks[i - 1];

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }

            const recalculatedHash = this.calculateHash(
                currentBlock.index,
                currentBlock.previousHash,
                currentBlock.timestamp.toISOString(),
                currentBlock.data,
                currentBlock.nonce
            );

            if (currentBlock.hash !== recalculatedHash) {
                return false;
            }
        }
        return true;
    }
}

module.exports = new Blockchain();
