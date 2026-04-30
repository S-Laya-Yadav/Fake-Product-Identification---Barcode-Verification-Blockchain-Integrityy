const mongoose = require('mongoose');

const blockSchema = mongoose.Schema({
    index: { type: Number, required: true },
    timestamp: { type: Date, required: true, default: Date.now },
    data: { type: Object, required: true },
    previousHash: { type: String, required: true },
    hash: { type: String, required: true },
    nonce: { type: Number, required: true, default: 0 }
});

const Block = mongoose.model('Block', blockSchema);
module.exports = Block;
