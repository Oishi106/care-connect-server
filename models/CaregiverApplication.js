const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name:        { type: String, required: true },
    email:       { type: String, required: true },
    phone:       { type: String, required: true },
    specialty:   { type: String, required: true },
    experience:  { type: String },
    about:       { type: String },
    status:      { type: String, default: 'pending' }, // pending | approved | rejected
}, { timestamps: true });

module.exports = mongoose.model('CaregiverApplication', schema);