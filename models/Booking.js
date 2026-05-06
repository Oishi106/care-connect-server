const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userEmail:      { type: String, required: true },
    userName:       { type: String },
    serviceId:      { type: String },
    serviceTitle:   { type: String, required: true },
    caregiverId:    { type: Number },
    caregiverName:  { type: String },
    date:           { type: String },
    time:           { type: String },
    hours:          { type: Number },
    notes:          { type: String },
    totalPrice:     { type: Number },
    status:         { type: String, default: 'Pending' },
    paymentStatus:  { type: String, default: 'unpaid' },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);