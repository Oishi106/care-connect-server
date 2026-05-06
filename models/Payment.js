const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userEmail:       { type: String, required: true },
    bookingId:       { type: String },
    stripeSessionId: { type: String },
    amount:          { type: Number, required: true },
    status:          { type: String, default: 'paid' },
    serviceTitle:    { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);