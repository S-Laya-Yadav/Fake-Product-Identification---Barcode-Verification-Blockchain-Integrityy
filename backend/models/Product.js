const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    serialId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    dateOfManufacture: { type: Date, required: true },
    origin: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    sellerInfo: { type: String, required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    blockHash: { type: String, required: true } // Maps to the blockchain entry
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
