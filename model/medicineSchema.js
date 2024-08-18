// model/medicineSchema.js
const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    programName: { type: String, required: true },
    duration: { type: String, required: true },
    time: { type: String, required: true },
});

const Medicine = mongoose.model('Medicine', medicineSchema);

module.exports = Medicine;
