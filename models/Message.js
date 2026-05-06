const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    bookingId:     { type: String, required: true },
    senderEmail:   { type: String, required: true },
    senderName:    { type: String },
    receiverEmail: { type: String, required: true },
    receiverName:  { type: String },
    text:          { type: String, required: true },
    read:          { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);