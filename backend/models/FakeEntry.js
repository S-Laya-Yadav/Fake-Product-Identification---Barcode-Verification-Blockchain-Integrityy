const mongoose = require('mongoose');

const fakeEntrySchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    details: { type: String, required: true },
    photoUrl: { type: String, required: false }, // Could be base64 or a link
    reportedAt: { type: Date, default: Date.now },
});

const FakeEntry = mongoose.model('FakeEntry', fakeEntrySchema);
module.exports = FakeEntry;
