const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');
const blockchain = require('../utils/blockchain');

// @desc    Add a product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    try {
        const { serialId, name, dateOfManufacture, origin, expiryDate, sellerInfo } = req.body;

        const existing = await Product.findOne({ serialId });
        if (existing) {
            return res.status(400).json({ message: 'Product with this Serial ID already exists.' });
        }

        const productData = {
            serialId, name, dateOfManufacture, origin, expiryDate, sellerInfo,
            addedBy: req.user._id.toString()
        };

        // Add to blockchain
        const newBlock = await blockchain.addBlock(productData);

        const product = await Product.create({
            ...productData,
            blockHash: newBlock.hash
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all products
// @route   GET /api/products
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
    try {
        const products = await Product.find({}).populate('addedBy', 'name email');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get product by serialID (Barcode Scan)
// @route   GET /api/products/:serialId
// @access  Private
router.get('/:serialId', protect, async (req, res) => {
    try {
        const product = await Product.findOne({ serialId: req.params.serialId });

        if (product) {
            // Verify blockchain integrity for this product
            const blocks = await require('../models/Block').find(); // Alternatively fetch via blockchain util if a specific query exists
            const block = blocks.find(b => b.hash === product.blockHash);

            if (block && JSON.stringify(block.data.serialId) === JSON.stringify(product.serialId)) {
                return res.json({ product, authentic: true });
            } else {
                return res.json({ product, authentic: false, message: 'Data tampering detected in blockchain!' });
            }
        } else {
            res.status(404).json({ message: 'Product not found. It might be fake!' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            await Product.deleteOne({ _id: product._id });
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
