const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

const connectDB = async () => {
    try {
        console.log('Attempting to connect to local MongoDB (mongodb://127.0.0.1:27017/fakeproducts)...');
        await mongoose.connect('mongodb://127.0.0.1:27017/fakeproducts');
        console.log(`MongoDB Connected (Local): ${mongoose.connection.host}`);
    } catch (localError) {
        console.warn(`Local MongoDB connection failed: ${localError.message}`);
        console.log('Falling back to In-Memory MongoDB...');
        try {
            mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();

            await mongoose.connect(uri);
            console.log(`MongoDB Connected (In-Memory GUARANTEED): ${mongoose.connection.host}`);
        } catch (error) {
            console.error(`Error: ${error.message}`);
            process.exit(1);
        }
    }
};

module.exports = connectDB;